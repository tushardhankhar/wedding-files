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
