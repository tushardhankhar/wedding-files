-- ============================================================================
-- BOOTSTRAP A NEW SUPABASE PROJECT — run this once, top to bottom.
--
-- GENERATED from supabase/migrations/0001…0022 concatenated in order. It is a
-- convenience for standing up a fresh project (e.g. production); the migration
-- files remain the source of truth. Regenerate after adding a migration —
-- do NOT hand-edit this file.
--
-- RUN THIS ONCE, AGAINST AN EMPTY DATABASE.
--
-- It is a faithful replay of the migration history, which means it contains
-- history: 0001 creates weddings.owner_id (plus an index and four RLS policies
-- on it) and 0002 renames that column to created_by. So running this against a
-- database that is ALREADY migrated fails on the 0001 index — by design, and
-- harmlessly. The whole file is one transaction, so a failure applies nothing
-- and leaves an existing database exactly as it was. Verified: a second run
-- errors and rolls back with all 14 tables and their data untouched.
--
-- Differences from a literal replay, both deliberate:
--   1. The three column RENAMEs (0002, 0010) are wrapped in existence checks.
--      Belt-and-braces for anyone pasting sections in by hand rather than
--      running the file whole; with the transaction they are otherwise no-ops.
--   2. The admins seed in 0002 is tushardhankhar98@gmail.com instead of the
--      original tdhankhar@viamedia.ai. See the note at that section.
--
-- ⚠️ THIS DOES NOT CREATE YOUR LOGIN. `admins` is only an email allowlist.
--    After running this, go to Authentication → Users → Add user and create
--    tushardhankhar98@gmail.com, or the magic link will silently send nothing
--    (the login action passes shouldCreateUser: false).
-- ============================================================================

begin;

-- ============================================================================
-- ▼ 0001_weddings.sql
-- ============================================================================

-- ============================================================================
-- Phase 1 — weddings
-- The root multi-tenant entity. Every wedding-owned row in later phases will
-- reference a wedding, and admin isolation is anchored on weddings.owner_id.
-- ============================================================================

-- Shared trigger to keep updated_at fresh. Reused by later migrations.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.weddings (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users (id) on delete cascade,
  -- Public URL segment: /w/[slug]. Globally unique across all tenants.
  slug              text not null unique,
  title             text not null,
  partner_one_name  text,
  partner_two_name  text,
  event_date        date,
  -- Config-driven website content (sections/data). Shape validated in app code.
  config            jsonb not null default '{}'::jsonb,
  -- Predefined theme identifier (tokens live in app code, not the DB).
  theme_id          text not null default 'classic',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists weddings_owner_id_idx on public.weddings (owner_id);

drop trigger if exists weddings_set_updated_at on public.weddings;
create trigger weddings_set_updated_at
  before update on public.weddings
  for each row execute function public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Admin trust domain only: a wedding is visible/editable solely by its owner.
-- (Guests never touch this table via RLS — they go through the app-layer
--  guest-access module using the service-role client.)
alter table public.weddings enable row level security;

drop policy if exists "weddings_select_own" on public.weddings;
create policy "weddings_select_own"
  on public.weddings for select
  using (owner_id = (select auth.uid()));

drop policy if exists "weddings_insert_own" on public.weddings;
create policy "weddings_insert_own"
  on public.weddings for insert
  with check (owner_id = (select auth.uid()));

drop policy if exists "weddings_update_own" on public.weddings;
create policy "weddings_update_own"
  on public.weddings for update
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "weddings_delete_own" on public.weddings;
create policy "weddings_delete_own"
  on public.weddings for delete
  using (owner_id = (select auth.uid()));


-- ============================================================================
-- ▼ 0002_roles_and_client_onboarding.sql
-- ============================================================================

-- ============================================================================
-- Phase 1.5 — Roles & client onboarding
--
-- Three roles: platform ADMIN (Viamedia), CLIENT (couple's side), GUEST (later).
--   * Admins are listed in `admins` (by email) and can see/edit ALL weddings.
--   * A wedding is created by an admin (created_by) and handed to a client
--     (client_id) via a one-time invite link. Clients manage only their wedding
--     and cannot change its name/URL.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ── Admin allowlist ─────────────────────────────────────────────────────────
create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- Seed the platform owner. Add more rows later to add admins.
--
-- [bootstrap] This is the ONLY behavioural change from the migrations: the
-- original 0002 seeds 'tdhankhar@viamedia.ai'. An admin sees and can edit every
-- wedding in the project, so this file seeds exactly one address and no more.
-- To also keep the original owner, uncomment the second value below.
insert into public.admins (email)
values
  ('tushardhankhar98@gmail.com')
  -- , ('tdhankhar@viamedia.ai')
on conflict (email) do nothing;

-- True when the current request's user is a platform admin. SECURITY DEFINER so
-- it can read `admins` regardless of that table's RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.admins a
    where a.email = (auth.jwt() ->> 'email')
  );
$$;

-- Admins can read the allowlist; nobody else needs to.
alter table public.admins enable row level security;
drop policy if exists "admins_select" on public.admins;
create policy "admins_select" on public.admins
  for select using (public.is_admin());

-- ── weddings: repurpose ownership for the admin/client split ────────────────
-- [bootstrap] guarded so a re-run after a partial failure is safe.
do $bootstrap$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'weddings'
      and column_name = 'owner_id'
  ) then
    alter table public.weddings rename column owner_id to created_by;
  end if;
end
$bootstrap$;

alter table public.weddings
  add column if not exists client_id uuid references auth.users (id) on delete set null;

create index if not exists weddings_client_id_idx on public.weddings (client_id);

-- Replace the owner-only RLS with role-aware policies.
drop policy if exists "weddings_select_own" on public.weddings;
drop policy if exists "weddings_insert_own" on public.weddings;
drop policy if exists "weddings_update_own" on public.weddings;
drop policy if exists "weddings_delete_own" on public.weddings;

-- Admins see everything; a client sees only the wedding assigned to them.
create policy "weddings_select" on public.weddings
  for select using (
    public.is_admin() or client_id = (select auth.uid())
  );

-- Only admins create weddings, and only for themselves as creator.
create policy "weddings_insert" on public.weddings
  for insert with check (
    public.is_admin() and created_by = (select auth.uid())
  );

-- Admins may edit any wedding; a client may edit their own (name lock enforced
-- by the trigger below).
create policy "weddings_update" on public.weddings
  for update using (
    public.is_admin() or client_id = (select auth.uid())
  ) with check (
    public.is_admin() or client_id = (select auth.uid())
  );

-- Only admins delete weddings.
create policy "weddings_delete" on public.weddings
  for delete using (public.is_admin());

-- Defense-in-depth: block name/URL changes by non-admins even if app code slips.
create or replace function public.enforce_wedding_name_lock()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.title is distinct from old.title and not public.is_admin() then
    raise exception 'Only an admin can change the wedding name';
  end if;
  if new.slug is distinct from old.slug and not public.is_admin() then
    raise exception 'Only an admin can change the wedding URL';
  end if;
  return new;
end;
$$;

drop trigger if exists weddings_name_lock on public.weddings;
create trigger weddings_name_lock
  before update on public.weddings
  for each row execute function public.enforce_wedding_name_lock();

-- ── client_invites: one-time links that bind a client to a wedding ──────────
create table if not exists public.client_invites (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings (id) on delete cascade,
  token_hash  text not null unique,           -- sha256 hex of the raw token
  expires_at  timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists client_invites_wedding_id_idx
  on public.client_invites (wedding_id);

-- Only admins manage invites. Clients never read this table directly — they go
-- through claim_client_invite() below.
alter table public.client_invites enable row level security;
drop policy if exists "client_invites_admin_all" on public.client_invites;
create policy "client_invites_admin_all" on public.client_invites
  for all using (public.is_admin()) with check (public.is_admin());

-- Claim flow: a freshly signed-up client calls this with their raw token. Runs
-- as definer so it can bind the wedding despite the caller not yet owning it.
create or replace function public.claim_client_invite(p_token text)
returns table (wedding_id uuid, slug text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash   text := encode(digest(p_token, 'sha256'), 'hex');
  v_invite public.client_invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_invite
  from public.client_invites
  where token_hash = v_hash
    and accepted_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'This invite link is invalid or has expired';
  end if;

  update public.weddings
  set client_id = auth.uid()
  where id = v_invite.wedding_id and client_id is null;

  update public.client_invites
  set accepted_at = now(), accepted_by = auth.uid()
  where id = v_invite.id;

  return query
  select w.id, w.slug from public.weddings w where w.id = v_invite.wedding_id;
end;
$$;


-- ============================================================================
-- ▼ 0003_events.sql
-- ============================================================================

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


-- ============================================================================
-- ▼ 0004_events_bilingual.sql
-- ============================================================================

-- ============================================================================
-- Phase 4 — bilingual events
-- Optional Hindi counterparts for the guest-visible event text. English stays
-- required; Hindi falls back to English on the site when absent.
-- ============================================================================

alter table public.events add column if not exists name_hi text;
alter table public.events add column if not exists description_hi text;


-- ============================================================================
-- ▼ 0005_guests.sql
-- ============================================================================

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


-- ============================================================================
-- ▼ 0006_group_invites.sql
-- ============================================================================

-- ============================================================================
-- Phase 6 — invitation tokens
-- Each guest group gets one invitation token. Only its SHA-256 hash is stored;
-- the raw token lives only in the shared link. Regenerating overwrites the hash
-- so the old link stops working. Guest sessions are stateless signed cookies —
-- no session table needed.
-- ============================================================================

alter table public.guest_groups
  add column if not exists invite_token_hash text;

-- Unique per hash, but many groups may have no token yet (partial index).
create unique index if not exists guest_groups_invite_token_hash_key
  on public.guest_groups (invite_token_hash)
  where invite_token_hash is not null;


-- ============================================================================
-- ▼ 0007_rsvps.sql
-- ============================================================================

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


-- ============================================================================
-- ▼ 0008_guest_phone.sql
-- ============================================================================

-- ============================================================================
-- Phase 10 — guest phone numbers (admin-entered)
-- Optional per-guest phone so the admin can send the group's invite link
-- directly to that person on WhatsApp (a pre-addressed wa.me link). This is
-- data the admin types in — NOT anything WhatsApp reports back.
-- ============================================================================

alter table public.guests add column if not exists phone text;


-- ============================================================================
-- ▼ 0009_share_links.sql
-- ============================================================================

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


-- ============================================================================
-- ▼ 0010_generic_subject_names.sql
-- ============================================================================

-- ── Generalize the subject-name columns beyond weddings ─────────────────────
-- The platform now hosts non-wedding invitations (birthdays, baby showers,
-- housewarmings, parties…) where the subject is a child, a family, or a single
-- guest of honour — not a couple. Rename the couple-shaped columns to generic
-- name1/name2 so the schema matches the product. Greenfield: no data to migrate.

-- [bootstrap] guarded so a re-run after a partial failure is safe.
do $bootstrap$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'weddings'
      and column_name = 'partner_one_name'
  ) then
    alter table public.weddings rename column partner_one_name to name1;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'weddings'
      and column_name = 'partner_two_name'
  ) then
    alter table public.weddings rename column partner_two_name to name2;
  end if;
end
$bootstrap$;


-- ============================================================================
-- ▼ 0011_share_link_token.sql
-- ============================================================================

-- ============================================================================
-- Phase 12 — persist share-link plaintext for re-display
-- Broadcast/share links are meant to be handed to the majority of guests, so
-- the admin needs to re-view and re-share the same link at any time. We keep
-- `token_hash` (the indexed lookup used by the guest consumption route) and add
-- the plaintext `token` purely so the admin panel can re-render the link after
-- a reload. This is a deliberate, scoped trade-off: a broadcast link is
-- semi-public by design and gates only read-only wedding info + self-RSVP.
-- Personal group invites deliberately keep their one-time-reveal posture.
--
-- Existing rows predate this column, so their plaintext is unrecoverable and
-- stays NULL — those links fall back to "Regenerate to reveal".
-- ============================================================================

alter table public.share_links
  add column if not exists token text;


-- ============================================================================
-- ▼ 0012_event_hosted_by.sql
-- ============================================================================

-- ============================================================================
-- Event "hosted by" — an optional host name per event, shown on the invite
-- only when the couple explicitly enables it.
-- ============================================================================

alter table public.events add column if not exists hosted_by text;
alter table public.events add column if not exists hosted_by_enabled boolean not null default false;


-- ============================================================================
-- ▼ 0013_client_invites_email.sql
-- ============================================================================

-- ============================================================================
-- Phase 1 (auth hardening) — email-bound client invites
--
-- Binds each client invite to a specific email address so a claim can only be
-- completed by someone who controls that inbox. Adds:
--   * client_invites.email            — the invited address (lowercased)
--   * mask_email()                    — display helper (j•••@gmail.com)
--   * claim_client_invite_v2()        — claim RPC that enforces the email match
--   * get_invite_public()             — safe, unauthenticated invite lookup for
--                                       the public claim page
--
-- Backward compatible: legacy invites with a NULL email skip the match check,
-- so links issued before this migration keep working. The old
-- claim_client_invite() is left in place and dropped in a later migration once
-- the new claim UI (Phase 2) has shipped.
-- ============================================================================

alter table public.client_invites
  add column if not exists email text;

-- Normalize any values that might already exist (defensive; column is new).
update public.client_invites
  set email = lower(trim(email))
  where email is not null and email <> lower(trim(email));

-- ── Display helper: mask an email for public display ────────────────────────
-- "megha@gmail.com" -> "m•••@gmail.com". Never reveals the full local part, so
-- the public claim page can hint at the invited address without enabling
-- enumeration of the exact address from a guessed token.
create or replace function public.mask_email(p_email text)
returns text
language sql
immutable
as $$
  select case
    when p_email is null then null
    when position('@' in p_email) = 0 then '•••'
    else left(split_part(p_email, '@', 1), 1) || '•••@' ||
         split_part(p_email, '@', 2)
  end;
$$;

-- ── Email-bound claim ───────────────────────────────────────────────────────
-- Like claim_client_invite(), but rejects the claim unless the signed-in user's
-- verified email matches the invited email. Raises the stable sentinel
-- 'EMAIL_MISMATCH' (never echoing the invited address) so the app can show
-- tailored copy without leaking who the invite was for.
create or replace function public.claim_client_invite_v2(p_token text)
returns table (wedding_id uuid, slug text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash   text := encode(digest(p_token, 'sha256'), 'hex');
  v_email  text := lower(auth.jwt() ->> 'email');
  v_invite public.client_invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_invite
  from public.client_invites
  where token_hash = v_hash
    and accepted_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'This invite link is invalid or has expired';
  end if;

  -- Email binding. Legacy invites (email is null) are not bound and skip this.
  if v_invite.email is not null and v_invite.email is distinct from v_email then
    raise exception 'EMAIL_MISMATCH';
  end if;

  update public.weddings
  set client_id = auth.uid()
  where id = v_invite.wedding_id and client_id is null;

  update public.client_invites
  set accepted_at = now(), accepted_by = auth.uid()
  where id = v_invite.id;

  return query
  select w.id, w.slug from public.weddings w where w.id = v_invite.wedding_id;
end;
$$;

-- ── Public invite lookup (for the claim page) ───────────────────────────────
-- SECURITY DEFINER so an unauthenticated visitor can render the claim page
-- without direct SELECT access to client_invites (which stays admin-only under
-- RLS). Returns only non-sensitive, masked data. No rows => invalid token.
create or replace function public.get_invite_public(p_token text)
returns table (
  masked_email text,
  expired      boolean,
  accepted     boolean,
  bound        boolean
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash   text := encode(digest(p_token, 'sha256'), 'hex');
  v_invite public.client_invites%rowtype;
begin
  select * into v_invite
  from public.client_invites
  where token_hash = v_hash;

  if not found then
    return;  -- zero rows: caller treats as invalid/unknown
  end if;

  return query select
    public.mask_email(v_invite.email),
    (v_invite.expires_at <= now()),
    (v_invite.accepted_at is not null),
    (v_invite.email is not null);
end;
$$;


-- ============================================================================
-- ▼ 0014_claim_email_helpers.sql
-- ============================================================================

-- ============================================================================
-- Phase 2 (auth hardening) — claim-flow helpers for the email-bound OTP flow
--
-- The claim page no longer asks the visitor to type an email + password.
-- Instead it emails a 6-digit code to the *invited* address and the client
-- proves ownership by entering it. These helpers back that flow:
--
--   * get_claim_state()  — everything the (possibly unauthenticated) claim page
--                          needs to render, without exposing the raw email:
--                          masked email, expired/accepted/bound flags, and
--                          whether the signed-in viewer IS the invited person.
--   * get_invite_email() — the raw invited email for an OPEN invite, used ONLY
--                          server-side by the claim actions to target the OTP.
--                          The token is a 256-bit bearer secret, so returning
--                          the bound address to its holder is acceptable.
--
-- Replaces get_invite_public() from migration 0013.
-- ============================================================================

drop function if exists public.get_invite_public(text);

create or replace function public.get_claim_state(p_token text)
returns table (
  masked_email   text,
  expired        boolean,
  accepted       boolean,
  bound          boolean,
  matches_viewer boolean
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash   text := encode(digest(p_token, 'sha256'), 'hex');
  v_email  text := lower(auth.jwt() ->> 'email');
  v_invite public.client_invites%rowtype;
begin
  select * into v_invite
  from public.client_invites
  where token_hash = v_hash;

  if not found then
    return;  -- zero rows: caller treats as invalid/unknown
  end if;

  return query select
    public.mask_email(v_invite.email),
    (v_invite.expires_at <= now()),
    (v_invite.accepted_at is not null),
    (v_invite.email is not null),
    (v_invite.email is not null and v_invite.email = v_email);
end;
$$;

create or replace function public.get_invite_email(p_token text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash  text := encode(digest(p_token, 'sha256'), 'hex');
  v_email text;
begin
  select email into v_email
  from public.client_invites
  where token_hash = v_hash
    and accepted_at is null
    and expires_at > now();
  return v_email;  -- null when invalid, already used, expired, or legacy(unbound)
end;
$$;


-- ============================================================================
-- ▼ 0015_admin_invite_status.sql
-- ============================================================================

-- ============================================================================
-- Phase 5 (auth hardening) — admin transparency
--
-- Lets an admin see, per wedding: the owning client's email (once claimed), the
-- invited email, and the current invite's status + expiry. Implemented as a
-- SECURITY DEFINER function gated by is_admin() so it can read auth.users and
-- client_invites (both otherwise off-limits to the anon client) WITHOUT using
-- the service-role key. Returns nothing for non-admins.
-- ============================================================================

create or replace function public.admin_invite_status(p_wedding_id uuid default null)
returns table (
  wedding_id        uuid,
  client_email      text,
  invited_email     text,
  invite_status     text,   -- 'active' | 'pending' | 'expired' | 'accepted' | 'none'
  invite_expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return query
  select
    w.id,
    cu.email::text,
    li.email,
    case
      when w.client_id is not null      then 'active'
      when li.id is null                then 'none'
      when li.accepted_at is not null   then 'accepted'
      when li.expires_at <= now()       then 'expired'
      else 'pending'
    end as invite_status,
    li.expires_at
  from public.weddings w
  left join auth.users cu on cu.id = w.client_id
  left join lateral (
    select ci.*
    from public.client_invites ci
    where ci.wedding_id = w.id
    order by ci.created_at desc
    limit 1
  ) li on true
  where p_wedding_id is null or w.id = p_wedding_id;
end;
$$;


-- ============================================================================
-- ▼ 0016_auth_throttle.sql
-- ============================================================================

-- ============================================================================
-- Phase 6 (auth hardening) — lightweight per-email cooldown
--
-- Guards the public, unauthenticated auth endpoints (magic link, password
-- reset, claim-code request) against rapid repeats / email bombing, on top of
-- Supabase's own built-in rate limits. A single SECURITY DEFINER function both
-- checks and records the last attempt per (key, action), returning whether the
-- caller is allowed to proceed.
--
-- Keyed by email (lowercased) rather than IP so shared/NAT'd IPs never block
-- legitimate users. IP-level volume limits stay with Supabase.
-- ============================================================================

create table if not exists public.auth_throttle (
  key     text        not null,
  action  text        not null,
  last_at timestamptz not null default now(),
  primary key (key, action)
);

-- No direct access — only the SECURITY DEFINER function below touches this.
alter table public.auth_throttle enable row level security;

/**
 * Returns TRUE when the caller may proceed (and records the attempt), FALSE
 * when they're still within the cooldown window for this (key, action).
 */
create or replace function public.check_auth_throttle(
  p_key text,
  p_action text,
  p_cooldown_seconds int default 30
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_last timestamptz;
begin
  select last_at into v_last
  from public.auth_throttle
  where key = p_key and action = p_action
  for update;

  if found and v_last > now() - make_interval(secs => p_cooldown_seconds) then
    return false;  -- still cooling down; do not update the timestamp
  end if;

  insert into public.auth_throttle (key, action, last_at)
  values (p_key, p_action, now())
  on conflict (key, action) do update set last_at = now();

  return true;
end;
$$;


-- ============================================================================
-- ▼ 0017_drop_legacy_claim.sql
-- ============================================================================

-- ============================================================================
-- Phase 7 (auth hardening) — retire the legacy claim path
--
-- The password-based claim flow has been replaced by the email-bound OTP flow
-- (claim_client_invite_v2). The old claim_client_invite() is no longer called
-- by any application code, so drop it.
--
-- Legacy token-only invites (email IS NULL) are handled by the new claim page:
-- get_claim_state() reports them as unbound and the UI asks the client to have
-- the invite reissued (an email-bound one). We also expire any such outstanding
-- invites here so a stale link can't linger.
-- ============================================================================

drop function if exists public.claim_client_invite(text);

-- Expire outstanding legacy (unbound, unaccepted) invites.
update public.client_invites
set expires_at = now()
where email is null
  and accepted_at is null
  and expires_at > now();


-- ============================================================================
-- ▼ 0018_share_rsvp_respondent.sql
-- ============================================================================

-- ============================================================================
-- Reliable broadcast self-RSVP — submit once, then edit (never duplicate).
--
-- Before: submitShareRsvpAction did a plain INSERT per event with no per-person
-- identity, so every submit / refresh / retry created fresh duplicate rows and
-- editing was impossible.
--
-- Now: each broadcast respondent carries a stable `respondent_id` (minted into
-- their signed session cookie). A UNIQUE (respondent_id, event_id) makes the
-- write idempotent — double-clicks, refresh-resubmits and network retries can
-- never create duplicates — and lets us load "my RSVP" back to prefill an edit.
-- ============================================================================

alter table public.share_rsvps
  add column if not exists respondent_id uuid not null default gen_random_uuid(),
  add column if not exists share_link_id uuid references public.share_links (id) on delete cascade,
  add column if not exists updated_at timestamptz not null default now();

-- Existing rows each get their own respondent_id via the default above; they
-- stay visible to hosts as historical responses but aren't tied to a live
-- session, so they simply won't be editable (acceptable for pre-existing data).

-- The idempotency guarantee: one row per (respondent, event).
create unique index if not exists share_rsvps_respondent_event_key
  on public.share_rsvps (respondent_id, event_id);

create index if not exists share_rsvps_respondent_id_idx
  on public.share_rsvps (respondent_id);

-- Keep updated_at fresh on edits (reuses the shared trigger fn from 0007).
drop trigger if exists share_rsvps_set_updated_at on public.share_rsvps;
create trigger share_rsvps_set_updated_at
  before update on public.share_rsvps
  for each row execute function public.set_updated_at();

-- RLS is unchanged: hosts read via `can_manage_event(event_id)`; guests write
-- through the service-role client behind the session + scope checks in
-- submitShareRsvpAction. The service role bypasses RLS, so the upsert is fine.


-- ============================================================================
-- ▼ 0019_group_rsvp_headcount.sql
-- ============================================================================

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


-- ============================================================================
-- ▼ 0020_wedding_client_phone.sql
-- ============================================================================

-- ============================================================================
-- Client phone on the wedding row — one place for the planner's client record.
--
-- The client's EMAIL is already bound to the invite (client_invites.email, and
-- auth.users once claimed) because claims are email-verified. The phone has had
-- nowhere to live, so a planner had to keep it outside the product. Parking it
-- on `weddings` makes that row the single client record per engagement:
-- names, date, theme, invite status (via admin_invite_status) and now a phone.
--
-- Admin-only, like the title and URL: it's the planner's CRM data, not content
-- the couple manages. Enforced by the trigger below as well as in app code.
-- ============================================================================

alter table public.weddings add column if not exists client_phone text;

-- Extend the existing column lock (0002) to cover client_phone. Same
-- defense-in-depth intent: block a non-admin write even if app code slips.
create or replace function public.enforce_wedding_name_lock()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.title is distinct from old.title and not public.is_admin() then
    raise exception 'Only an admin can change the wedding name';
  end if;
  if new.slug is distinct from old.slug and not public.is_admin() then
    raise exception 'Only an admin can change the wedding URL';
  end if;
  if new.client_phone is distinct from old.client_phone and not public.is_admin() then
    raise exception 'Only an admin can change the client phone number';
  end if;
  return new;
end;
$$;


-- ============================================================================
-- ▼ 0021_guest_link_durability.sql
-- ============================================================================

-- Persist the group invite plaintext so a link can be re-displayed and
-- re-shared instead of regenerated (regeneration mints a different token and
-- silently breaks the family's existing link). Mirrors the trade-off already
-- taken for broadcast links in 0011. See the migration file for the full
-- rationale, including the slug-decoupling change that ships alongside it in
-- the application layer.

alter table public.guest_groups
  add column if not exists invite_token text;

comment on column public.guest_groups.invite_token is
  'Plaintext invite token, kept so the admin can re-display and re-share the '
  'SAME link instead of regenerating (which would break the family''s existing '
  'link). Lookup still goes through invite_token_hash. NULL for groups created '
  'before 0021. See supabase/migrations/0021_guest_link_durability.sql.';

comment on column public.guest_groups.invite_token_hash is
  'SHA-256 of invite_token. THE lookup key for /w/[slug]/invite/[token] and a '
  'one-way door: changing the hash algorithm invalidates every live invitation '
  'across every wedding. If it ever must change, add a column and dual-read.';


-- ============================================================================
-- ▼ 0022_pending_signups.sql
-- ============================================================================

-- The draft a self-serve visitor fills in BEFORE paying. Nothing here is
-- billable, public or guest-visible; a real `weddings` row is created only once
-- a payment is verified. See the migration file for the full rationale.
--
-- The buyer owns the CONTENT columns and the server owns the MONEY columns,
-- enforced with column-level GRANTs because RLS cannot restrict which columns a
-- role may write.

create table if not exists public.pending_signups (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,

  contact_name  text not null,
  contact_phone text not null,
  theme_id      text not null,
  title         text not null,
  name1         text,
  name2         text,
  event_date    date,
  event_time    text,

  amount_paise       integer,
  razorpay_order_id  text unique,
  razorpay_payment_id text,
  status text not null default 'draft'
    check (status in ('draft', 'paid', 'expired')),
  wedding_id uuid references public.weddings (id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pending_signups_user_id_idx
  on public.pending_signups (user_id);

create unique index if not exists pending_signups_one_draft_per_user
  on public.pending_signups (user_id)
  where status = 'draft';

drop trigger if exists pending_signups_set_updated_at on public.pending_signups;
create trigger pending_signups_set_updated_at
  before update on public.pending_signups
  for each row execute function public.set_updated_at();

alter table public.pending_signups enable row level security;

drop policy if exists "pending_signups_select" on public.pending_signups;
create policy "pending_signups_select" on public.pending_signups
  for select using (
    user_id = (select auth.uid()) or public.is_admin()
  );

drop policy if exists "pending_signups_insert" on public.pending_signups;
create policy "pending_signups_insert" on public.pending_signups
  for insert with check (user_id = (select auth.uid()));

drop policy if exists "pending_signups_update" on public.pending_signups;
create policy "pending_signups_update" on public.pending_signups
  for update
  using (user_id = (select auth.uid()) and status = 'draft')
  with check (user_id = (select auth.uid()));

revoke all on public.pending_signups from anon, authenticated;

grant select on public.pending_signups to authenticated;

grant insert (
  user_id, contact_name, contact_phone, theme_id, title,
  name1, name2, event_date, event_time
) on public.pending_signups to authenticated;

grant update (
  contact_name, contact_phone, theme_id, title,
  name1, name2, event_date, event_time
) on public.pending_signups to authenticated;


commit;
