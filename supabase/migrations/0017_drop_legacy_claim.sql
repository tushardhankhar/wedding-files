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
