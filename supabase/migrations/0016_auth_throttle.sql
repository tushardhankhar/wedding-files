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
