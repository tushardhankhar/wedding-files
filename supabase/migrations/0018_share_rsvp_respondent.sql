-- ============================================================================
-- Reliable broadcast self-RSVP — submit once, then edit (never duplicate).
--
-- Before: submitShareRsvpAction did a plain INSERT per event with no per-person
-- identity, so every submit / refresh / retry created fresh duplicate rows and
-- editing was impossible.
--
-- Now: each broadcast respondent carries a stable `respondent_id` (minted into
-- their signed session cookie). A UNIQUE (respondent_id, event_id) makes the
-- write idempotent — double-clicks, refresh-resubmits and network retries can
-- never create duplicates — and lets us load "my RSVP" back to prefill an edit.
-- ============================================================================

alter table public.share_rsvps
  add column if not exists respondent_id uuid not null default gen_random_uuid(),
  add column if not exists share_link_id uuid references public.share_links (id) on delete cascade,
  add column if not exists updated_at timestamptz not null default now();

-- Existing rows each get their own respondent_id via the default above; they
-- stay visible to hosts as historical responses but aren't tied to a live
-- session, so they simply won't be editable (acceptable for pre-existing data).

-- The idempotency guarantee: one row per (respondent, event).
create unique index if not exists share_rsvps_respondent_event_key
  on public.share_rsvps (respondent_id, event_id);

create index if not exists share_rsvps_respondent_id_idx
  on public.share_rsvps (respondent_id);

-- Keep updated_at fresh on edits (reuses the shared trigger fn from 0007).
drop trigger if exists share_rsvps_set_updated_at on public.share_rsvps;
create trigger share_rsvps_set_updated_at
  before update on public.share_rsvps
  for each row execute function public.set_updated_at();

-- RLS is unchanged: hosts read via `can_manage_event(event_id)`; guests write
-- through the service-role client behind the session + scope checks in
-- submitShareRsvpAction. The service role bypasses RLS, so the upsert is fine.
