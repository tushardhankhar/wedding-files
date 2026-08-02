-- ============================================================================
-- Phase 13 — guest link durability
--
-- Two changes that together stop a live invitation link from ever becoming
-- collateral damage of a later product change.
--
-- 1. PERSIST THE GROUP INVITE PLAINTEXT (this migration)
--
--    Personal group invites previously stored only `invite_token_hash`, so the
--    admin panel could not re-display a link once the page was reloaded — the
--    only way back was "Regenerate", which mints a DIFFERENT token and silently
--    kills the link the family already has in WhatsApp. With one group per
--    family and a hundred-plus families per wedding, that is not a rare edge
--    case; it is a guaranteed recurring support incident with no audit trail of
--    who was broken.
--
--    Keeping the plaintext also makes every future URL-shape change RECOVERABLE:
--    the link can be re-rendered in a new format and re-sent, instead of being
--    unrecoverable. That is the whole point.
--
--    This is the same deliberate trade-off already taken for broadcast links in
--    0011, and it is honest about the cost: a database dump now exposes live
--    guest links. Those links gate read-only celebration details plus an RSVP —
--    not payments, not identity. `token_hash` stays as the indexed lookup, so
--    the read path is unchanged; the plaintext is write-once, admin-read-only
--    (RLS on guest_groups already restricts it to the wedding's managers).
--
--    Rows created before this migration have no recoverable plaintext and stay
--    NULL — the UI keeps the "Regenerate to reveal" fallback for them.
--
-- 2. SLUG DECOUPLING (application layer, no schema change)
--
--    Token lookup no longer requires the URL's slug to match. Both
--    `guest_groups.invite_token_hash` and `share_links.token_hash` already carry
--    GLOBALLY UNIQUE indexes (0006, 0009), so the token alone identifies exactly
--    one group / one link across every tenant — the slug never contributed any
--    authorization, only coupling. Renaming a wedding's URL used to kill every
--    invitation ever sent; now the token resolves and the guest is redirected to
--    the current slug. See modules/guest-access/server/{invite,share}.ts.
-- ============================================================================

alter table public.guest_groups
  add column if not exists invite_token text;

comment on column public.guest_groups.invite_token is
  'Plaintext invite token, kept so the admin can re-display and re-share the '
  'SAME link instead of regenerating (which would break the family''s existing '
  'link). Lookup still goes through invite_token_hash. NULL for groups created '
  'before 0021. See supabase/migrations/0021_guest_link_durability.sql.';

comment on column public.guest_groups.invite_token_hash is
  'SHA-256 of invite_token. THE lookup key for /w/[slug]/invite/[token] and a '
  'one-way door: changing the hash algorithm invalidates every live invitation '
  'across every wedding. If it ever must change, add a column and dual-read.';
