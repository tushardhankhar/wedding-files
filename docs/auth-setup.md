# Auth & client onboarding — Supabase dashboard setup

The client auth/onboarding hardening (email-bound invites, passwordless
magic-link/OTP login, password reset, admin transparency) relies on settings
that live in the **hosted Supabase dashboard**, because this project has no
`supabase/config.toml`. Configure these once per environment (local, staging,
prod). Code changes alone are not enough.

## 1. Custom SMTP = Resend (removes the shared-mailer rate limit)

Supabase's built-in mailer is rate-limited (a few emails/hour) and has weak
deliverability — the scalability bottleneck for a large client base. Point
Supabase at Resend so all native auth emails (OTP, magic link, password reset,
confirmation) send from `jointhejashn.com`.

- **Authentication → Emails → SMTP Settings → Enable custom SMTP**
  - Host: `smtp.resend.com`
  - Port: `465` (or `587`)
  - Username: `resend`
  - Password: your `RESEND_API_KEY`
  - Sender email / name: an address on the verified domain (e.g.
    `hello@jointhejashn.com` / "Join the Jashn")
- Verify `jointhejashn.com` in Resend and add the **SPF, DKIM, and DMARC** DNS
  records it provides. Without these, auth email lands in spam.

## 2. Enable Email OTP + magic link

- **Authentication → Providers → Email**
  - Enable **Email OTP** (6-digit codes) and **magic link**.
  - Keep **"Confirm email" ON** — OTP/magic-link verification doubles as
    confirmation, so this adds no extra friction.

### 2a. REQUIRED: put the code in the email template

The client claim flow (Phase 2) verifies a **6-digit code**, so the email the
client receives MUST contain that code, not only a magic link.

- **Authentication → Emails → Templates → Magic Link** (and **Confirm signup**)
  - Include the token in the body, e.g.:
    ```
    Your Join the Jashn sign-in code is: {{ .Token }}
    ```
  - You can keep the `{{ .ConfirmationURL }}` link too (used by the general
    login magic-link path in Phase 4) — but `{{ .Token }}` is what makes the
    claim page work. Without it, clients get a link but no code to type.

> **Self-serve signup depends on the "Confirm signup" template specifically.**
> `/start` is the only surface that passes `shouldCreateUser: true`, so a
> brand-new buyer receives **Confirm signup**, not **Magic Link**. If only the
> Magic Link template carries `{{ .Token }}`, buyers who read their mail on a
> different device than they typed their address on have no code to enter — and
> that is a lost sale, not just a lost sign-in. Put `{{ .Token }}` in **both**.

## 3. Site URL + redirect allow-list

Every `emailRedirectTo` / `redirectTo` origin must be allow-listed or Supabase
silently drops the redirect. All app-side links are built from
`NEXT_PUBLIC_SITE_URL` via `requireSiteUrl()`, so that env var and the Supabase
config MUST use the same origin as the live deployment.

**Current deployment origin:** `https://wedding-files-tan.vercel.app`
(update everything below if the domain changes, e.g. to a custom domain).

- **On Vercel → Project → Settings → Environment Variables**
  - `NEXT_PUBLIC_SITE_URL = https://wedding-files-tan.vercel.app` (no trailing
    slash). Redeploy after changing — `NEXT_PUBLIC_*` values are inlined at
    build time.
- **Supabase → Authentication → URL Configuration**
  - **Site URL:** `https://wedding-files-tan.vercel.app`
  - **Redirect URLs (add all, plus the localhost variants for dev):**
    - `https://wedding-files-tan.vercel.app/auth/callback`
    - `https://wedding-files-tan.vercel.app/auth/confirm`
    - `https://wedding-files-tan.vercel.app/reset-password`
    - `https://wedding-files-tan.vercel.app/client/claim/*`
    - `http://localhost:3000/auth/callback`
    - `http://localhost:3000/auth/confirm`
    - `http://localhost:3000/reset-password`
    - `http://localhost:3000/client/claim/*`

## 4. Environment variables

Set in each environment (see `.env.example`):

- `NEXT_PUBLIC_SITE_URL` — absolute origin, no trailing slash. Required for auth
  links; `requireSiteUrl()` throws if missing.
- `RESEND_API_KEY` — also used by Supabase custom SMTP above and by the branded
  client-invite email sent from the app.
- `AUTH_FROM_EMAIL` — branded sender for the client-invite email, e.g.
  `Join the Jashn <hello@jointhejashn.com>`.
- `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL` — existing enquiry-form addresses.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — the
  self-serve checkout at `/start`. Optional as a set; unset means the pay step
  says "not set up yet" and everything else runs. Full walkthrough (including
  the `payment.captured` webhook) is in `.env.example`.

## 5. OTP / rate-limit settings (revisited in Phase 6)

- **Authentication → Rate Limits** — review the per-hour OTP/email caps once
  custom SMTP is live (custom SMTP raises the ceiling). App-level cooldowns are
  added in Phase 6 on top of these.
