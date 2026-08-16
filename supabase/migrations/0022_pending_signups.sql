-- ============================================================================
-- Self-serve signup — the draft a visitor fills in BEFORE paying.
--
-- Until now the only way to become a Client was for an admin to create the
-- `weddings` row and email a claim link (0002). This adds a second path:
-- visitor signs up, picks a theme, enters their details, pays, and only THEN
-- does a real `weddings` row come into existence.
--
-- Why a separate table rather than a half-built `weddings` row: an abandoned
-- checkout must not leave a live, unpaid invitation site behind — nor an
-- orphaned row that shows up in the planner's dashboard as a real engagement.
-- Nothing here is billable, public, or visible to a guest.
--
-- ── The trust split this table encodes ─────────────────────────────────────
-- The buyer owns the CONTENT columns; the server owns the MONEY columns. That
-- is enforced with column-level GRANTs, not just policies, because RLS cannot
-- restrict *which columns* a role may write. So even a hand-crafted PostgREST
-- call carrying a valid user JWT cannot set its own `status`, attach a
-- `wedding_id`, or claim someone else's `razorpay_order_id`. Payment state is
-- written exclusively by the service-role client (which bypasses both), behind
-- the signature checks in `modules/self-serve/server/`.
-- ============================================================================

create table if not exists public.pending_signups (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,

  -- ── Buyer-owned: the wizard's answers ──────────────────────────────────
  -- Name and phone are mandatory (email is already verified on auth.users, so
  -- the three required contact details are covered between the two tables).
  contact_name  text not null,
  contact_phone text not null,
  theme_id      text not null,
  title         text not null,       -- becomes weddings.title, and the slug
  name1         text,
  name2         text,
  event_date    date,
  event_time    text,                -- "HH:MM"; rides in weddings.config

  -- ── Server-owned: payment state ────────────────────────────────────────
  -- amount_paise records what was actually charged. It is deliberately NOT the
  -- input to the charge: the order is always created from the PRICE_PAISE
  -- constant in app code, so this column can never influence the price.
  amount_paise       integer,
  razorpay_order_id  text unique,
  razorpay_payment_id text,
  status text not null default 'draft'
    check (status in ('draft', 'paid', 'expired')),
  -- Set once the payment activates the signup. Also the idempotency answer:
  -- "this order already produced that invitation."
  wedding_id uuid references public.weddings (id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pending_signups_user_id_idx
  on public.pending_signups (user_id);

-- One live draft per person, so the wizard updates a single row instead of
-- littering the table on every revisit. Paid/expired rows are kept forever as
-- the order record, hence the partial predicate.
create unique index if not exists pending_signups_one_draft_per_user
  on public.pending_signups (user_id)
  where status = 'draft';

drop trigger if exists pending_signups_set_updated_at on public.pending_signups;
create trigger pending_signups_set_updated_at
  before update on public.pending_signups
  for each row execute function public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.pending_signups enable row level security;

-- Owner reads their own row; admins read all, so abandoned carts are visible
-- to the planner without a separate reporting path.
drop policy if exists "pending_signups_select" on public.pending_signups;
create policy "pending_signups_select" on public.pending_signups
  for select using (
    user_id = (select auth.uid()) or public.is_admin()
  );

drop policy if exists "pending_signups_insert" on public.pending_signups;
create policy "pending_signups_insert" on public.pending_signups
  for insert with check (user_id = (select auth.uid()));

-- Editable only while it is still a draft: once payment is in flight the
-- answers are frozen, so what was bought matches what gets built.
drop policy if exists "pending_signups_update" on public.pending_signups;
create policy "pending_signups_update" on public.pending_signups
  for update
  using (user_id = (select auth.uid()) and status = 'draft')
  with check (user_id = (select auth.uid()));

-- No delete policy: an abandoned draft is a record of a lost sale.

-- ── Column-level privileges (the half RLS cannot express) ──────────────────
revoke all on public.pending_signups from anon, authenticated;

-- Reading the whole row is fine — it is the buyer's own, and they need to see
-- `status`/`wedding_id` to know the payment landed.
grant select on public.pending_signups to authenticated;

grant insert (
  user_id, contact_name, contact_phone, theme_id, title,
  name1, name2, event_date, event_time
) on public.pending_signups to authenticated;

grant update (
  contact_name, contact_phone, theme_id, title,
  name1, name2, event_date, event_time
) on public.pending_signups to authenticated;

-- `anon` keeps nothing: a signup draft always belongs to a signed-in user.
