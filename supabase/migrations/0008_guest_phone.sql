-- ============================================================================
-- Phase 10 — guest phone numbers (admin-entered)
-- Optional per-guest phone so the admin can send the group's invite link
-- directly to that person on WhatsApp (a pre-addressed wa.me link). This is
-- data the admin types in — NOT anything WhatsApp reports back.
-- ============================================================================

alter table public.guests add column if not exists phone text;
