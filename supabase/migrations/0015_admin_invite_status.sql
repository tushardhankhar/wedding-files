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
