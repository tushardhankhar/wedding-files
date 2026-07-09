# Wedding Platform — Architecture

A multi-tenant wedding website platform. Wedding clients/admins create and manage
personalized, config-driven wedding websites; invited guests view only the events
they are authorized to see and RSVP to them — without creating accounts.

## Stack

- **Next.js (App Router) + TypeScript** — single modular-monolith application on Vercel
- **Tailwind CSS + shadcn/ui** — UI
- **Supabase Postgres + Auth + RLS** — data, admin auth, admin-side isolation
- **Cloudflare R2** — wedding photos via presigned direct uploads (later phase)

## Roles & trust domains

Two trust domains at the security layer (Supabase-authenticated vs guest), with
**three roles**:

| Role | Who | Auth | Powers |
|---|---|---|---|
| **Platform Admin** | Viamedia (listed in `admins`) | Supabase Auth | Create weddings, set the **name + theme**, generate client links, monitor + edit **any** wedding |
| **Client** | the couple's side | Supabase Auth (account claimed via admin invite link) | Manage **their** wedding's content, events, guests, invites — but **cannot** change the name/URL or theme |
| **Guest** | invited families | invitation token → signed HTTP-only session cookie | View only invited events; RSVP. No account |

DB access: Admin & Client use the **user-scoped client → RLS enforced** (admins
see all weddings, clients see only their assigned one). Guests use the
**service-role client → app-layer authorization** (see below).

### ⚠️ RLS does not protect guests

Guests are intentionally not Supabase-authenticated users (they don't create
accounts). Supabase RLS keys off `auth.uid()`, so it cannot see a guest session.
**Guest authorization is enforced in application code**, in the `guest-access`
module, using the service-role client *behind* an explicit invite check. RLS is
our defense-in-depth for the admin domain only.

## Data model (core)

```
users (Supabase Auth)
admins              (email)                            -- platform-admin allowlist
weddings            (id, created_by → users, client_id → users, slug, title,
                     config jsonb, theme_id, event_date, …)
client_invites      (id, wedding_id, token_hash, expires_at, accepted_at, accepted_by)
events              (id, wedding_id, name, starts_at, venue, maps_url, details jsonb, sort_order)
guest_groups        (id, wedding_id, name, invite_token_hash, invite_token_lookup)
guests              (id, group_id, name, is_primary)
group_event_invites (group_id, event_id)              -- the authorization edge
rsvps               (id, guest_id, event_id, status, note)  -- unique(guest_id, event_id)
```

`group_event_invites` **is** the guest authorization model: "which events can this
guest see?" = "the events joined to this guest's group." Everything else derives
from it. `is_admin()` (checks `admins` by email) drives admin-vs-client RLS.

### Decided defaults

1. Guest authz is **application-layer**, not RLS.
2. **One invitation token per guest group**; **RSVP per guest, per event**.
3. Guest session is a **stateless signed cookie** (HMAC of group_id + issued/expiry)
   for v1 — no session table, no Redis. Add a revocation table only if needed.
4. **Admins are invite-only** (no public signup); seeded via the `admins` table.
5. **Clients onboard via a one-time admin link** → claim (set password) → bound to
   one wedding by the SECURITY DEFINER `claim_client_invite()`.
6. **Wedding name/URL and theme are admin-only** — enforced in the UI *and* by a DB
   trigger that rejects `title`/`slug`/`theme_id` changes from non-admins.
7. **One rendering engine** serves both the owner Preview and the live guest site —
   fed owner content (Preview) or a guest's authorized content (live).

## Folder structure

```
src/
├── app/                        # routing & composition only (no DB queries inline)
│   ├── (admin)/                # Supabase-Auth-guarded area
│   ├── (guest)/w/[slug]/       # guest website + /invite/[token] landing
│   └── api/                    # route handlers (R2 signing, webhooks)
├── modules/                    # DOMAIN — business logic lives here
│   ├── auth/                   # admin identity: getCurrentUser, requireUser
│   ├── weddings/               # wedding entity, ownership, website config, theme
│   ├── events/                 # custom (non-hardcoded) events, timeline, venue
│   ├── guests/                 # groups, guests, invitation token lifecycle, wa.me
│   ├── guest-access/  ⭐        # guest session + authorized-only data reads
│   ├── rsvp/                   # RSVP capture (guest) + aggregation (admin)
│   ├── website/                # config schema, section components, theme tokens
│   └── media/                  # R2 presigned uploads (later)
├── components/ui/              # shadcn/ui + shared dumb UI
└── lib/
    ├── supabase/server.ts      # user-scoped client (RLS)
    ├── supabase/service.ts     # service-role client (server-only, guarded)
    ├── supabase/middleware.ts  # session refresh
    ├── env.ts / env.server.ts  # validated env (public vs server-only)
    ├── crypto.ts               # token gen, hashing, constant-time compare
    └── errors.ts               # typed AppError hierarchy
```

**Conventions (enforced):**

- Components never import `lib/supabase/service.ts` or `lib/env.server.ts`
  (ESLint import-boundary rule + `server-only`).
- All DB access goes through a module's `server/` folder — no inline queries in pages.
- `guest-access` is the *only* module that serves data to guests.

## Request flows

- **Admin/client auth** — login (Server Action) → Supabase Auth cookies → session
  proxy refresh → `(admin)` layout `requireUser()` → DB access RLS-scoped by role
  (`is_admin()`: admins see all, clients see their assigned wedding).
- **Wedding creation** — admin-only Server Action inserts `weddings` with
  `created_by = auth.uid()`; RLS `with check (is_admin())`.
- **Client onboarding** — admin generates a one-time link (`client_invites`, token
  hashed) → client opens `/client/claim/[token]`, signs up (sets password) →
  `claim_client_invite()` binds `client_id`; the wedding name/theme stay locked.
- **Theme & Preview** — admin selects a theme (locked from client). The renderer
  turns `config + theme` into the site; Preview renders the owner's real content
  without guest auth. The same renderer serves guests in the flows below.
- **Invitation link** — admin generates a 256-bit random token; we store its **hash**
  (+ a lookup index) only, return the raw token once to build
  `/w/[slug]/invite/[token]` and a `wa.me` prefilled message.
- **Guest session** — `/invite/[token]` hashes + constant-time-matches the token,
  binds it to the wedding, then mints a **separate** signed HTTP-only session cookie
  (never reuses the invite token) and redirects to `/w/[slug]`.
- **Guest website load** — `(guest)` layout resolves the session → `group_id`, verifies
  it belongs to the wedding, and loads data only via `authorizedData`.
- **Event-level authz** — one function: `events ⋈ group_event_invites WHERE group_id=$g
  AND wedding_id=$w`. Uninvited events are never selected, so they can't reach the client.
- **RSVP** — Server Action re-resolves the guest context server-side, confirms the
  event is in the group's invited set and the guest belongs to the group, then upserts.

## Security boundaries

1. Admin and guest are separate trust domains — different clients, cookies, code paths.
2. Guest authorization is application-enforced via the single `guest-access` gate.
3. Service-role key never enters the client bundle (`server-only` + lint rule).
4. Invitation tokens: high-entropy, stored hashed, constant-time compared, revocable.
5. Session token ≠ invite token; signed, HTTP-only, Secure, SameSite, expiring.
6. All guest inputs re-authorized server-side — never trust client-supplied IDs.
7. Multi-tenant isolation: every wedding-owned row carries `wedding_id`; RLS ties
   `wedding_id → weddings` (admin sees all via `is_admin()`, client via `client_id`);
   guest reads always bind `group → wedding` first.
8. Name/URL/theme are admin-only, enforced by a DB trigger (not just the UI).
9. Env validated at boot — a missing secret fails loudly.

## Roadmap

- **Phase 0 — Foundation** ✅ scaffold, env validation, both Supabase clients,
  session proxy, crypto/errors, import-boundary lint, folder skeleton.
- **Phase 1 — Admin auth + wedding CRUD** ✅
- **Phase 1.5 — Roles & client onboarding** ✅ `admins` + `is_admin()`, admin/client
  split (`created_by`/`client_id`), `client_invites` + `claim_client_invite()`,
  name-lock trigger, invite-only login.
- **Phase 2 — Events** ✅ client-managed custom events (name, date/time, venue, map
  link, details); not hardcoded; RLS-scoped via `can_manage_wedding()`.
- **Phase 3 — Themes, Renderer & Preview** ✅ token-based theme registry (Royal +
  Ivory Classic over one `.wsite` stylesheet), **admin-only** theme picker, the
  config-driven bilingual **rendering engine** (`modules/website/render`), and a
  full-bleed **owner Preview** at `/preview/[weddingId]`. Reused for guests in Phase 7.
- **Phase 4 — Website content** ✅ bilingual (EN/HI) config authoring at
  `/weddings/[id]/content` (hero, story, gallery, families, FAQ, footer) writing to
  `weddings.config`; events gained Hindi fields (`name_hi`, `description_hi`).
- **Phase 5 — Guest groups & guests + per-group event invites** ✅ `guest_groups`,
  `guests`, `group_event_invites` (the authorization edge) + `can_manage_group()` and
  a same-wedding invite trigger; manager UI at `/weddings/[id]/guests`.
- **Phase 6 — Invitations & guest session** ✅ per-group token (stored hashed) +
  admin generate/regenerate + `wa.me` share; `/w/[slug]/invite/[token]` verifies via
  service-role client → mints a signed HTTP-only guest cookie → `/w/[slug]`. Authorized
  data (`guest-access`) returns only invited events. Needs the real service-role key.
- **Phase 7 — Guest website + event authorization** ✅ `/w/[slug]` renders the themed
  bilingual `WebsiteView` from `loadGuestSite` (session-gated, invited events only);
  no valid session → "A private invitation", site never rendered. `buildSiteProps`
  shared with the owner Preview.
- **Phase 8 — RSVP** ✅ per guest, per event. Guests submit via service-role client
  behind session re-checks (`submitRsvpAction`); DB trigger enforces invited-only.
  Guest site shows per-member Going/No toggles; admins view responses at
  `/weddings/[id]/rsvps`.
- **Phase 9 — Photos / media** (Cloudflare R2 presigned uploads; gallery section).
- **Phase 10 — Polish & hardening** (in progress) — 6 themes shipped (Royal, Ivory
  Classic, Chapel Rose/Christian, Phulkari/Punjabi, Kanjeevaram/South Indian,
  Mewar/Rajasthani) with per-theme display fonts, hero flourish, and scroll-reveal.
  Remaining: SEO/OG, deploy, final security pass. (Phase 9 media deferred.)

- **Phase 11 — Shareable (broadcast) links** ✅ per-wedding `share_links` scoped to all
  or chosen events (`0009`), `/w/[slug]/share/[token]` → share-scoped guest session,
  guest **self-RSVP** (name + headcount) into `share_rsvps`; admin manages links on the
  guests page and sees direct responses in the RSVP dashboard. Coexists with per-group
  personal links (kept, not removed).

Each phase = its own migration(s) + module code + minimal UI, independently deployable.
