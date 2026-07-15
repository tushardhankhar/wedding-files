# Join the Utsav — Landing Promises vs. Product Reality

A gap analysis between what the marketing landing page (`/`) states or implies and
what the product actually does today, with a concrete build plan for each gap.

**Verdict:** the core promise is real — personal invite links, event-level privacy,
per-event RSVP, bilingual (EN/हिं), no guest accounts, six themes, WhatsApp share,
countdown, story, gallery, venue, FAQ, admin/client roles. The gaps below are mostly
around the **planner "operating system," monetization, self-serve onboarding, and
media uploads.**

Effort key: **Trivial** · **Small** · **Medium** · **Large**
Last reviewed: 2026-07-09 · See `ARCHITECTURE.md` for the built system & phase log.

---

## Where the product stands today
Built and validated end-to-end (typecheck · lint · build green): **Phase 0** foundation,
**1** admin auth + wedding CRUD, **1.5** roles & client onboarding, **2** events,
**3** themes/renderer/preview, **4** website content, **5** guest groups & guests,
**6** invitations & guest session, **7** guest website + event authorization,
**8** RSVP, **11** shareable/broadcast links + self-RSVP, plus the **landing page**
and **five bespoke theme renderers** (Maharaja, Gulmohar, Anand Karaj, Kalyanam, Vow).
**Deferred:** Phase 9 media/R2 uploads. **Not started:** Phase 10 hardening tail
(SEO/OG, security review, deploy) and everything in the gap list below.

---

## ✅ Already delivered (for reference)
- Personal per-family invite links + per-member RSVP; broadcast/share links + self-RSVP.
- Event-level privacy (a group/link only ever receives its invited events; enforced server-side).
- Bilingual EN/हिं across all themes.
- 6 themes (5 bespoke renderers + Rajputana on the shared renderer).
- WhatsApp share via `wa.me` (no Business API — outbound only, no delivery/read receipts).
- Countdown, story timeline, gallery (via image URLs), venue + maps link, FAQ, hashtag, contacts.
- Admin (planner) + client (couple) roles; owner Preview; public live theme demos.

---

## A. Onboarding & growth — the CTAs lead nowhere real
- **"Create your Utsav" has no self-serve signup.** Model is *admin creates wedding →
  client claims via link*; the CTA lands on `/login`, which has no signup.
  - **Build:** a `/signup` route + onboarding wizard → Supabase `signUp` → SECURITY
    DEFINER fn creating the user + their first wedding in one step → dashboard.
    Needs a product decision (couples self-serve vs. planner-invited). **Medium.**
- **"Book a 15-min demo" / "Join the Planner Pilot" / "Utsav Concierge"** — dead links.
  - **Build:** a `leads` table + a small form (name/email/phone/message) → notify via
    **Resend** (free tier). **Small.**

## B. The planner "operating system" dashboard — biggest gap
The mock shows: 742 invited · 612 responded · 532 attendees · 418 Sangeet · **72
airport pickups · 42 vegetarian · 6 Jain meals · 26 children** · attendance charts ·
household table · invitation status. We only have a per-event attending/declined list.
- **Dietary / logistics / +1s aren't collected at all.**
  - **Build:** add `answers jsonb` (or columns) to `rsvps` / `share_rsvps` (meal, children,
    needs_pickup, dietary); surface those fields in each theme's RSVP UI; aggregate. **Medium.**
- **No aggregate dashboard** (totals, per-event attendance, dietary breakdown, charts).
  - **Build:** `rsvp/server/summary.ts` computing per-wedding rollups + a
    `/weddings/[id]/dashboard` page (CSS bars already in use, or a small chart). **Medium.**
- **No "invitation status" (opened / not opened / responded).**
  - **Build:** `first_opened_at` / `last_seen_at` on `guest_groups` + `share_links`,
    stamped in `loadGuestSite`; status badges + a household table. **Small–Medium.**

## C. Monetization — pricing is entirely cosmetic
Three tiers (₹7,999 / ₹14,999 / ₹29,999); no payments, no plan, no gating.
- **Build:** `plan` column on `weddings`; **Razorpay** (better than Stripe for INR)
  checkout + webhook to set the plan; gate premium features by plan. **Large.**

## D. Premium features named in pricing but not built
- **Custom domain** (Signature+): `domains` table + Vercel Domains API to attach +
  DNS verify + middleware mapping `hostname → wedding`. **Medium–Large.**
- **Video hero** (Royale): `config.hero.media` (image|video) + R2 video upload +
  `<video>` background in renderers. **Medium** (needs media pipeline first).
- **Custom visual styling / premium motion** (Royale): per-wedding theme overrides
  (accent colour, font) layered on the token/theme system. **Medium.**

## E. Media
- **Photo uploads don't exist** — gallery is **image-URL only** (Phase 9 deferred).
  - **Build:** Cloudflare **R2** presigned direct uploads + a gallery upload UI (the
    originally planned Phase 9). **Medium.**
- **Maps are links, not embeds** (venue mock shows an embedded map).
  - **Build:** Google Static Maps / Mapbox static image (needs API key) or an iframe
    embed. **Small.**

## F. Smaller inconsistencies
- **"Add to Calendar"** exists only in Maharaja, Gulmohar & Vow — missing from the
  shared renderer, Anand Karaj & Kalyanam. Reuse the existing `gcalUrl()` helper. **Trivial.**
- **"Links can be revoked"** — we can *regenerate* (kills the old link) but there's no
  explicit **disable** (revoke without reissuing). Add action setting
  `invite_token_hash = null` / a `revoked` flag. **Trivial.**
- **RSVP deadline + reminders** (implied by a polished planner tool): `rsvp_deadline`
  on wedding + a scheduled Resend reminder (cron). **Medium.**
- **The Rajputana** is shown as bespoke but still runs the **generic token renderer**
  (the other 5 are standalone). Give it its own `RajputanaView`. **Medium.**

---

## Suggested priority
1. **Add-to-Calendar everywhere + link revoke** — Trivial; closes visible inconsistencies.
2. **Invitation open-tracking + planner summary dashboard** — makes "operating system" true; highest planner value.
3. **Photo uploads (R2)** — biggest guest-facing quality jump.
4. **Self-serve signup** — only if couples should onboard without the planner.
5. **Billing + premium features (custom domain / video)** — last, once there's demand.

---

## Sequenced milestones
Each milestone is independently shippable; later ones build on earlier data.

**M1 — Consistency & honesty (≈ trivial/small)**
Add-to-Calendar in every theme (F) · explicit link revoke (F) · lead-capture form
for demo/pilot/concierge (A) · the Rajputana bespoke renderer (F, optional).
→ Makes every landing claim & CTA truthful.

**M2 — The planner operating system (≈ medium)**
Invitation open-tracking (B) · richer RSVP data — dietary/children/pickups/+1s (B) ·
aggregate summary dashboard with charts + CSV export (B).
→ Turns "operating system for Indian weddings" from copy into a real feature.

**M3 — Media & fidelity (≈ medium)**
Photo uploads via Cloudflare R2 (E) · map embeds (E) · RSVP deadline + reminders (F).
→ Biggest jump in guest-facing quality and planner control.

**M4 — Growth & monetization (≈ medium/large; needs product decisions)**
Self-serve signup + onboarding wizard (A) · Razorpay billing + plan gating (C) ·
custom domains (D) · video hero + per-wedding visual overrides (D).
→ Only once there's real demand; each item can wait for its plan tier.

## Prerequisites / notes
- **Production readiness (independent of the above):** apply all migrations to the
  live DB, set the real service-role key + env on Vercel, decide email confirmation,
  run a security review of `guest-access`, and do a real end-to-end browser pass.
- **New external services introduced by this roadmap:** Resend (email), Razorpay
  (payments, INR), Cloudflare R2 (media), Vercel Domains API (custom domains),
  optionally Mapbox/Google Static Maps (map embeds). All have free/low-cost tiers.
- **Data migrations implied:** `leads`, `domains` tables; columns on `rsvps`/
  `share_rsvps` (dietary/logistics), `guest_groups`/`share_links` (open-tracking),
  `weddings` (plan, rsvp_deadline, hero media).
