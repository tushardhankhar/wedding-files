-- ============================================================================
-- Event "hosted by" — an optional host name per event, shown on the invite
-- only when the couple explicitly enables it.
-- ============================================================================

alter table public.events add column if not exists hosted_by text;
alter table public.events add column if not exists hosted_by_enabled boolean not null default false;
