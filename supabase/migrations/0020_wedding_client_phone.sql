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
