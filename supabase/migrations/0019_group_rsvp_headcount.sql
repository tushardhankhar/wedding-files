-- ============================================================================
-- Group RSVP by headcount (per group, per event) — no per-individual names.
--
-- A guest GROUP is now identified by its family/surname `name`. Instead of one
-- attending/declined row per named guest, the family submits a HEADCOUNT per
-- invited event. Everyone who opens the group's invite link shares the same
-- session `group_id`, so this record is naturally shared: the first family
-- member to answer creates it, everyone else edits the same one.
--
-- UNIQUE (group_id, event_id) makes the write idempotent (upsert), so re-opens,
-- double-submits and retries can never create duplicates. Individual `guests`
-- rows remain (optional contacts for WhatsApp) but no longer drive RSVP.
-- ============================================================================

create table if not exists public.group_rsvps (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.guest_groups (id) on delete cascade,
  event_id   uuid not null references public.events (id) on delete cascade,
  attending  boolean not null default true,
  party_size integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, event_id),
  -- Coming → 1..50 heads; not coming → 0. Keeps the two fields consistent.
  constraint group_rsvps_headcount_ck check (
    (attending and party_size between 1 and 50)
    or (not attending and party_size = 0)
  )
);
create index if not exists group_rsvps_event_id_idx on public.group_rsvps (event_id);
create index if not exists group_rsvps_group_id_idx on public.group_rsvps (group_id);

drop trigger if exists group_rsvps_set_updated_at on public.group_rsvps;
create trigger group_rsvps_set_updated_at
  before update on public.group_rsvps
  for each row execute function public.set_updated_at();

-- Integrity: the group must actually be invited to the event it RSVPs to
-- (which also guarantees group and event share a wedding).
create or replace function public.enforce_group_rsvp_valid()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (
    select 1 from public.group_event_invites gei
    where gei.group_id = new.group_id and gei.event_id = new.event_id
  ) then
    raise exception 'This group is not invited to this event';
  end if;
  return new;
end;
$$;

drop trigger if exists group_rsvps_valid on public.group_rsvps;
create trigger group_rsvps_valid
  before insert or update on public.group_rsvps
  for each row execute function public.enforce_group_rsvp_valid();

-- ── RLS (managers only; guests write through the service-role client) ───────
alter table public.group_rsvps enable row level security;

drop policy if exists "group_rsvps_manage" on public.group_rsvps;
create policy "group_rsvps_manage" on public.group_rsvps
  for all using (public.can_manage_group(group_id))
  with check (public.can_manage_group(group_id));
