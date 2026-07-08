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
