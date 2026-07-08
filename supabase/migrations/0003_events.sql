-- ============================================================================
-- Phase 2 — events
-- Custom, non-hardcoded wedding events (Haldi, Mehendi, Cocktail, …). Each
-- belongs to a wedding and is manageable by whoever can manage that wedding.
-- ============================================================================

-- Reusable access predicate for wedding-owned child tables: admins can manage
-- any wedding; a client can manage the wedding assigned to them. Runs as the
-- caller (invoker), so it naturally respects the weddings RLS visibility.
create or replace function public.can_manage_wedding(w_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.weddings w
    where w.id = w_id
      and (public.is_admin() or w.client_id = (select auth.uid()))
  );
$$;

create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  wedding_id    uuid not null references public.weddings (id) on delete cascade,
  name          text not null,               -- free-form: Haldi, Mehendi, …
  event_date    date,
  start_time    time,
  venue_name    text,
  venue_address text,
  maps_url      text,
  description   text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists events_wedding_id_idx on public.events (wedding_id);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.events enable row level security;

drop policy if exists "events_select" on public.events;
create policy "events_select" on public.events
  for select using (public.can_manage_wedding(wedding_id));

drop policy if exists "events_insert" on public.events;
create policy "events_insert" on public.events
  for insert with check (public.can_manage_wedding(wedding_id));

drop policy if exists "events_update" on public.events;
create policy "events_update" on public.events
  for update using (public.can_manage_wedding(wedding_id))
  with check (public.can_manage_wedding(wedding_id));

drop policy if exists "events_delete" on public.events;
create policy "events_delete" on public.events
  for delete using (public.can_manage_wedding(wedding_id));
