# Self-Serve Signup + Payment — Onboarding a Client Without an Admin Invite

_Status: PROPOSED. Owner: TBD. Last updated: 2026-08-05._

**Progress:** Phases 0–3 not started.

## 1. Why this doc

Today a wedding site can only be created by a platform admin, who then sends the
couple a one-time invite link to claim it (`ARCHITECTURE.md` decisions #4/#5).
There is no way for a visitor to land on the marketing site and create their own
site directly. The landing page already sells a self-serve ₹1,599 DIY product
(see `landing-positioning` — "Self-serve signup still isn't built; onboarding is
manual for now"), so this closes that gap: **visitor → sign up → pick a theme →
enter names/dates → pay → live editor**, with no admin in the loop.

This doc maps the current state, the decisions already made for this feature,
and the phase-by-phase build plan.

## 2. Current state (as-is)

- **Auth** is fully passwordless (magic-link/OTP only — passwords were
  deliberately removed 2026-07-19). `modules/auth/server/{actions,user,throttle}.ts`,
  routes at `src/app/auth/{callback,confirm}/route.ts`.
- **Client onboarding** is admin-invite-only: an admin creates the `weddings` row
  (sets title/theme), generates a `client_invites` token, the couple claims it via
  magic-link/OTP and gets bound as `client_id` on that row. See
  `ARCHITECTURE.md` §"Decided defaults" #4–#6.
- **No payment provider** is integrated anywhere in the codebase.
- **Theme registry** already exists (`weddings.theme_id`), so a theme-picker step
  has a real set of ids to select from (see `FLOWS.md` for the registry model).
- **Landing page** (`src/components/landing/`) currently has no self-serve CTA —
  primary CTA is "See a live demo".

## 3. Decisions made for this feature

Made 2026-08-05, superseding nothing in `ARCHITECTURE.md` — this is an
**additional** path onto the existing Client role, not a replacement for the
admin-invite path.

1. **Auth method: Google OAuth + magic-link only.** No email/password. Keeps the
   self-serve path consistent with the passwordless hardening already shipped;
   avoids reintroducing password storage/reset flows for a second time.
2. **Payment sequencing: draft-until-paid.** Wizard answers (theme, names, date)
   are held in a new `pending_signups` row, *not* in `weddings`. The real
   `weddings` row (and its `client_id`, slug, live site) is only created once a
   payment webhook confirms success. Avoids unpaid ghost sites and orphaned rows
   from abandoned checkouts.
3. **Payment provider: Razorpay.** Chosen for INR one-time charges + UPI support
   in India. Integration path (Marketplace vs. direct API) to be confirmed at
   Phase 3 build time.

## 4. Architecture

```
Visitor → /start (public, no invite)
   │
   ├─ 1. Sign up: Google OAuth or magic-link (Supabase Auth, no password)
   │
   ├─ 2. Onboarding wizard: theme picker + names + date(s)
   │      → saved to a new `pending_signups` row (owned by auth.uid(), draft only)
   │      → NOT a real `weddings` row yet — nothing live/billable until paid
   │
   ├─ 3. Razorpay checkout for ₹1,599 (order created server-side, tied to the
   │      pending_signup id)
   │
   └─ 4. Razorpay webhook (signature-verified, service-role client — same
        app-layer-trust pattern already used for guest-access) confirms payment →
        creates the real `weddings` row (client_id = auth.uid(), theme_id, names,
        date, slug) → marks pending_signup consumed → redirect to client dashboard
```

This reuses the existing two-trust-domain model exactly: self-serve is a
**second way to become a Client**, alongside admin-invite. No change to the RLS
that protects wedding editing today — the only new surface is *how a `weddings`
row gets its first `client_id`*.

### New DB surface

- `pending_signups` table: `id`, `user_id` (→ auth.uid()), `theme_id`, `name1`,
  `name2`, `event_date`, `razorpay_order_id`, `status` (`draft`/`paid`/`expired`),
  `created_at`. RLS: owner (`user_id = auth.uid()`) can read/write their own row
  only; the webhook handler uses the service-role client to finalize.
- No changes to `weddings`, `client_invites`, or any guest-facing tables.

## 5. Phases

1. **Public signup entry** — Google OAuth enabled in Supabase dashboard + a
   `/start` route reusing existing `modules/auth` patterns. No wedding creation
   yet, just an authenticated user with nothing assigned.
2. **Draft wizard** — theme/name/date UI + `pending_signups` table + migration
   (RLS: owner-only read/write).
3. **Razorpay integration** — checkout order creation + webhook route that
   activates the wedding on payment success. Confirm cleanest wiring (Marketplace
   integration vs. direct API) before writing code.
4. **Activation + redirect** — success/failure handling, orphaned-draft cleanup,
   landing page CTA updated to point here alongside "See a live demo".

Each phase = its own migration (if any) + module code + minimal UI, independently
deployable and validated (tsc + lint + build) before moving to the next, per the
existing project workflow.
