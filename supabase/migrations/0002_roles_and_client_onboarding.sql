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
insert into public.admins (email)
values ('tdhankhar@viamedia.ai')
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
alter table public.weddings rename column owner_id to created_by;

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
