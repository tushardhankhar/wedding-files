-- ============================================================================
-- Phase 5 — guest groups, guests, and per-group event invites
--
-- A wedding has guest GROUPS (families). Each group has GUESTS (members) and is
-- invited to a chosen set of EVENTS. `group_event_invites` is THE authorization
-- edge: which events a guest may see = the events joined to their group.
-- (Invitation tokens / guest sessions come in Phase 6.)
-- ============================================================================

create table if not exists public.guest_groups (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists guest_groups_wedding_id_idx on public.guest_groups (wedding_id);

drop trigger if exists guest_groups_set_updated_at on public.guest_groups;
create trigger guest_groups_set_updated_at
  before update on public.guest_groups
  for each row execute function public.set_updated_at();

create table if not exists public.guests (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.guest_groups (id) on delete cascade,
  name       text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists guests_group_id_idx on public.guests (group_id);

create table if not exists public.group_event_invites (
  group_id uuid not null references public.guest_groups (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  primary key (group_id, event_id)
);
create index if not exists group_event_invites_event_id_idx
  on public.group_event_invites (event_id);

-- Access predicate for group-owned rows: can the caller manage the group's
-- wedding? (invoker → respects weddings RLS).
create or replace function public.can_manage_group(g_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.guest_groups g
    where g.id = g_id and public.can_manage_wedding(g.wedding_id)
  );
$$;

-- Defense-in-depth: an invite must link a group and event of the SAME wedding.
create or replace function public.enforce_invite_same_wedding()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if (select wedding_id from public.guest_groups where id = new.group_id)
     is distinct from
     (select wedding_id from public.events where id = new.event_id) then
    raise exception 'Group and event must belong to the same wedding';
  end if;
  return new;
end;
$$;

drop trigger if exists group_event_invites_same_wedding on public.group_event_invites;
create trigger group_event_invites_same_wedding
  before insert or update on public.group_event_invites
  for each row execute function public.enforce_invite_same_wedding();

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.guest_groups enable row level security;
alter table public.guests enable row level security;
alter table public.group_event_invites enable row level security;

drop policy if exists "guest_groups_all" on public.guest_groups;
create policy "guest_groups_all" on public.guest_groups
  for all using (public.can_manage_wedding(wedding_id))
  with check (public.can_manage_wedding(wedding_id));

drop policy if exists "guests_all" on public.guests;
create policy "guests_all" on public.guests
  for all using (public.can_manage_group(group_id))
  with check (public.can_manage_group(group_id));

drop policy if exists "group_event_invites_all" on public.group_event_invites;
create policy "group_event_invites_all" on public.group_event_invites
  for all using (public.can_manage_group(group_id))
  with check (public.can_manage_group(group_id));
