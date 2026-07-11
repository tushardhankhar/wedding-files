-- ── Generalize the subject-name columns beyond weddings ─────────────────────
-- The platform now hosts non-wedding invitations (birthdays, baby showers,
-- housewarmings, parties…) where the subject is a child, a family, or a single
-- guest of honour — not a couple. Rename the couple-shaped columns to generic
-- name1/name2 so the schema matches the product. Greenfield: no data to migrate.

alter table public.weddings rename column partner_one_name to name1;
alter table public.weddings rename column partner_two_name to name2;
