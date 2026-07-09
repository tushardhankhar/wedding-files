-- ============================================================================
-- Phase 11 — shareable (broadcast) links + self-RSVP
-- A wedding can have named shareable links, each scoped to all events or a
-- chosen subset. Anyone with the link sees those events and self-RSVPs
-- (name + headcount) — no pre-entered guest list. Coexists with group links.
-- ============================================================================

create table if not exists public.share_links (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  label      text not null,
  token_hash text not null,
  all_events boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists share_links_wedding_id_idx on public.share_links (wedding_id);
create unique index if not exists share_links_token_hash_key
  on public.share_links (token_hash);

create table if not exists public.share_link_events (
  share_link_id uuid not null references public.share_links (id) on delete cascade,
  event_id      uuid not null references public.events (id) on delete cascade,
  primary key (share_link_id, event_id)
);

create table if not exists public.share_rsvps (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  event_id   uuid not null references public.events (id) on delete cascade,
  name       text not null,
  party_size integer not null default 1 check (party_size >= 1 and party_size <= 50),
  created_at timestamptz not null default now()
);
create index if not exists share_rsvps_event_id_idx on public.share_rsvps (event_id);

-- Manager access predicate for share-link-owned rows.
create or replace function public.can_manage_share_link(sl_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.share_links s
    where s.id = sl_id and public.can_manage_wedding(s.wedding_id)
  );
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.share_links enable row level security;
alter table public.share_link_events enable row level security;
alter table public.share_rsvps enable row level security;

drop policy if exists "share_links_manage" on public.share_links;
create policy "share_links_manage" on public.share_links
  for all using (public.can_manage_wedding(wedding_id))
  with check (public.can_manage_wedding(wedding_id));

drop policy if exists "share_link_events_manage" on public.share_link_events;
create policy "share_link_events_manage" on public.share_link_events
  for all using (public.can_manage_share_link(share_link_id))
  with check (public.can_manage_share_link(share_link_id));

-- Managers read self-RSVPs; guests insert via the service-role client.
drop policy if exists "share_rsvps_manage" on public.share_rsvps;
create policy "share_rsvps_manage" on public.share_rsvps
  for all using (public.can_manage_event(event_id))
  with check (public.can_manage_event(event_id));
