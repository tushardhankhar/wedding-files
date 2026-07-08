-- ============================================================================
-- Phase 8 — RSVPs (per guest, per event)
-- Guests (unauthenticated) submit via the service-role client behind session
-- checks; admins/clients read via RLS. A trigger enforces that an RSVP is only
-- for an event the guest's group is actually invited to.
-- ============================================================================

create table if not exists public.rsvps (
  id         uuid primary key default gen_random_uuid(),
  guest_id   uuid not null references public.guests (id) on delete cascade,
  event_id   uuid not null references public.events (id) on delete cascade,
  status     text not null check (status in ('attending', 'declined')),
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guest_id, event_id)
);
create index if not exists rsvps_event_id_idx on public.rsvps (event_id);
create index if not exists rsvps_guest_id_idx on public.rsvps (guest_id);

drop trigger if exists rsvps_set_updated_at on public.rsvps;
create trigger rsvps_set_updated_at
  before update on public.rsvps
  for each row execute function public.set_updated_at();

-- Manager access predicate for event-owned rows.
create or replace function public.can_manage_event(e_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.events e
    where e.id = e_id and public.can_manage_wedding(e.wedding_id)
  );
$$;

-- Integrity: an RSVP's guest and event must belong to the same wedding AND the
-- guest's group must be invited to that event.
create or replace function public.enforce_rsvp_valid()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_group   uuid;
  v_g_wed   uuid;
  v_e_wed   uuid;
begin
  select group_id into v_group from public.guests where id = new.guest_id;
  select wedding_id into v_g_wed from public.guest_groups where id = v_group;
  select wedding_id into v_e_wed from public.events where id = new.event_id;

  if v_g_wed is distinct from v_e_wed then
    raise exception 'RSVP guest and event belong to different weddings';
  end if;

  if not exists (
    select 1 from public.group_event_invites gei
    where gei.group_id = v_group and gei.event_id = new.event_id
  ) then
    raise exception 'This group is not invited to this event';
  end if;

  return new;
end;
$$;

drop trigger if exists rsvps_valid on public.rsvps;
create trigger rsvps_valid
  before insert or update on public.rsvps
  for each row execute function public.enforce_rsvp_valid();

-- ── RLS (managers only; guests go through the service-role client) ──────────
alter table public.rsvps enable row level security;

drop policy if exists "rsvps_manage" on public.rsvps;
create policy "rsvps_manage" on public.rsvps
  for all using (public.can_manage_event(event_id))
  with check (public.can_manage_event(event_id));
