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
