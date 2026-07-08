-- ============================================================================
-- Phase 4 — bilingual events
-- Optional Hindi counterparts for the guest-visible event text. English stays
-- required; Hindi falls back to English on the site when absent.
-- ============================================================================

alter table public.events add column if not exists name_hi text;
alter table public.events add column if not exists description_hi text;
