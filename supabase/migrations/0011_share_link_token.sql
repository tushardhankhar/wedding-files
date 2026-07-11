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
