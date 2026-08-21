# Self-Serve Signup + Payment — Onboarding a Client Without an Admin Invite

_Status: BUILT (2026-08-15). Owner: Tushar. Pending: migration `0022` applied to
the live database, Razorpay account + env vars, one end-to-end test payment._

**Progress:** Phases 1–5 complete in code. See "Before it can take money" below.

## 1. Why this doc

A wedding site used to be creatable only by a platform admin, who then sent the
couple a one-time invite link to claim it (`ARCHITECTURE.md` decisions #4/#5).
Every sale therefore routed through the WhatsApp "Book Now" button and manual
onboarding. This closes that gap: **visitor → sign up → pick a theme → enter
details → pay → live editor**, with no admin in the loop.

Self-serve is an **additional** way to become a Client, alongside admin-invite —
not a replacement. Nothing about the guest trust domain, the guest link
contract, or the existing RLS changed.

## 2. Decisions

Confirmed 2026-08-15, superseding the 2026-08-05 proposal where they differ.

| Decision | Choice |
|---|---|
| Price | **₹299**, a single introductory offer. No plan/SKU concept — the landing page's Save the Date and bundle plans stay WhatsApp-booked. |
| Provider | **Razorpay**, direct REST + webhook. Not on the Vercel Marketplace (only Stripe is), but Stripe India's UPI support is weaker and UPI is how most buyers at this price pay. |
| Auth | **Magic link + OTP only.** No Google OAuth, no passwords — reuses `modules/auth` as-is. |
| Sequencing | **Draft-until-paid.** Answers live in `pending_signups`; the `weddings` row exists only after payment verifies. No unpaid ghost sites. |
| Post-pay edits | **Everything stays locked.** Theme, title, slug and phone remain planner-only, exactly as before. `enforce_wedding_name_lock` is untouched. |
| Landing | Self-serve is the primary CTA; WhatsApp "Book Now" is the secondary "prefer we set it up?" path. |

### The two facts that let "keep everything locked" work

1. `weddings_name_lock` is a **BEFORE UPDATE** trigger (`0002`/`0020`).
   Activation *inserts* the row with title/slug/theme/phone already set, so the
   lock is never tripped — while every later edit by the buyer is still refused.
2. `weddings_insert` RLS requires `is_admin()`. Activation runs on the
   **service-role client**, which bypasses RLS. The buyer never gains insert
   rights, so the admin-only invariant survives.

### Known trade-off

A buyer who picks the wrong theme cannot switch it and must contact us. Mitigated
in the wizard: every theme card links to its live `/demo/[id]`, and the review
step names the chosen theme before payment.

## 3. Architecture

```
Visitor → /start  (public, in the (marketing) group so the funnel is measurable)
   │
   ├─ 1. Sign up: magic link / OTP, shouldCreateUser: true
   │      modules/self-serve/server/auth-actions.ts
   │      (the login page keeps shouldCreateUser: false — this is the one
   │       surface allowed to mint a user)
   │
   ├─ 2. Wizard: occasion → theme → details → review
   │      app/(marketing)/start/wizard.tsx → saveDraftAction
   │      → a `pending_signups` row. Nothing live, nothing billable.
   │
   ├─ 3. Checkout: createOrderAction → Razorpay order at the SERVER-SET price
   │      → app/(marketing)/start/pay-button.tsx opens Razorpay's browser sheet
   │
   └─ 4. Activation — two paths into ONE idempotent function:
          fast:     verifyPaymentAction  (checkout signature, while on-page)
          backstop: /api/razorpay/webhook (webhook signature, tab closed)
          → activateSignup() claims the row atomically, inserts `weddings`
            (created_by = client_id = buyer), links the two
          → redirect to /weddings/[id] — the existing editor, unchanged
```

### DB surface

`pending_signups` (migration `0022`) — and nothing else. No change to
`weddings`, `client_invites`, or any guest-facing table.

The table encodes a trust split: the **buyer owns the content columns**, the
**server owns the money columns**, enforced with column-level `GRANT`s rather
than policies alone, because RLS cannot restrict *which columns* a role writes.
A hand-crafted PostgREST call with a valid user JWT still cannot set its own
`status`, attach a `wedding_id`, or claim another buyer's `razorpay_order_id`.

## 4. Where the money safety lives

- The charged amount is `PRICE_PAISE` in `modules/self-serve/pricing.ts`, read
  **server-side only**. It is never a parameter to `createOrder` and never
  travels inbound. A checkout that accepts an amount from its caller is one
  crafted request away from selling a ₹299 product for ₹1.
- Both activation paths verify an HMAC before touching the database
  (`hmacSha256Hex` + `timingSafeEqualHex`, already in `lib/crypto.ts`). The
  webhook hashes the **raw** body — re-serialized JSON would never match.
- `activateSignup` claims via one conditional UPDATE, so a webhook racing the
  browser produces one invitation, not two.
- The service-role client appears in exactly two new places, both inside
  `modules/self-serve/server/`, both behind an explicit check — the same
  "authorization is the code around it" rule as `guest-access`.

## 5. Before it can take money

1. **Apply `supabase/migrations/0022_pending_signups.sql`** to the live database
   (SQL editor). Nothing self-serve works until this exists.
2. **Razorpay account** → API keys + a `payment.captured` webhook pointed at
   `/api/razorpay/webhook`. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`,
   `RAZORPAY_WEBHOOK_SECRET` (see `.env.example` for the full walkthrough).
   Until they are set, `/start` still works and the pay step says so politely.
3. **One test-mode payment** end to end with `success@razorpay`.
## 6. Pricing copy

`PRICE` (`components/landing/data.ts`) is ₹299 and `PRICE_WAS` is ₹1,599, shown
struck through beside it. ₹1,599 now appears in exactly one visible place on the
landing page — that strike-through.

**Two constants, one number.** `PRICE` is the source of truth for the *page*;
`PRICE_LABEL` in `modules/self-serve/pricing.ts` is the source of truth for the
*charge*. They are separate so marketing copy can never reprice a payment, which
means they must be changed together. Page metadata (`app/layout.tsx`,
`app/(marketing)/page.tsx`) carries the price too — it is what shows in search
results and WhatsApp link previews.

While the offer runs, the pricing section shows **one card**. Save the Date
(₹1,099) and the bundle (₹2,199) are parked in `PARKED_PLANS`, not deleted: they
don't describe a choice next to a ₹299 full invitation. To end the offer, restore
them, set the flagship back to `PRICE_WAS`, drop its `was`, and reset both price
constants.

## 7. Deliberately not done

- **No receipt email.** Razorpay sends its own payment receipt.
- **No abandoned-draft cleanup job.** Drafts are kept as a record of lost sales;
  the `expired` status exists for when that changes.
- **No self-serve theme change.** Deliberate — see the trade-off in §2.
