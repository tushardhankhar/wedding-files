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
