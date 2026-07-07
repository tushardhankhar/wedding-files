# Wedding Platform — Architecture

A multi-tenant wedding website platform. Wedding clients/admins create and manage
personalized, config-driven wedding websites; invited guests view only the events
they are authorized to see and RSVP to them — without creating accounts.

## Stack

- **Next.js (App Router) + TypeScript** — single modular-monolith application on Vercel
- **Tailwind CSS + shadcn/ui** — UI
- **Supabase Postgres + Auth + RLS** — data, admin auth, admin-side isolation
- **Cloudflare R2** — wedding photos via presigned direct uploads (later phase)

## Two trust domains

The app serves two audiences through one codebase, separated at routing **and**
authorization:

| Domain | Who | Auth | DB access |
|---|---|---|---|
| **Admin / Client** | wedding owners | Supabase Auth (JWT cookies) | user-scoped client → **RLS enforced** |
| **Guest** | invited families | invitation token → signed HTTP-only session cookie | service-role client → **app-layer authorization** |

### ⚠️ RLS does not protect guests

Guests are intentionally not Supabase-authenticated users (they don't create
accounts). Supabase RLS keys off `auth.uid()`, so it cannot see a guest session.
**Guest authorization is enforced in application code**, in the `guest-access`
module, using the service-role client *behind* an explicit invite check. RLS is
our defense-in-depth for the admin domain only.

## Data model (core)

```
users (Supabase Auth)
weddings            (id, owner_id → users, slug, title, config jsonb, theme_id, event_date, …)
events              (id, wedding_id, name, starts_at, venue, maps_url, details jsonb, sort_order)
guest_groups        (id, wedding_id, name, invite_token_hash, invite_token_lookup)
guests              (id, group_id, name, is_primary)
group_event_invites (group_id, event_id)              -- the authorization edge
rsvps               (id, guest_id, event_id, status, note)  -- unique(guest_id, event_id)
```

`group_event_invites` **is** the authorization model: "which events can this guest
see?" = "the events joined to this guest's group." Everything else derives from it.

### Decided defaults

1. Guest authz is **application-layer**, not RLS. (Approved.)
2. **One invitation token per guest group**; **RSVP per guest, per event**. (Approved.)
3. Guest session is a **stateless signed cookie** (HMAC of group_id + issued/expiry)
   for v1 — no session table, no Redis. Add a revocation table only if needed. (Approved.)

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

- **Admin auth** — login (Server Action) → Supabase Auth cookies → middleware refresh
  → `(admin)` layout `requireUser()` → all admin DB access is RLS-scoped.
- **Wedding creation** — validated Server Action inserts `weddings` with
  `owner_id = auth.uid()`; RLS confirms ownership.
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
7. Multi-tenant isolation: every wedding-owned row carries `wedding_id`; admin RLS ties
   `wedding_id → owner_id`; guest reads always bind `group → wedding` first.
8. Env validated at boot — a missing secret fails loudly.

## Roadmap

- **Phase 0 — Foundation** ✅ scaffold, env validation, both Supabase clients, middleware,
  crypto/errors, import-boundary lint, folder skeleton. *(this commit)*
- **Phase 1 — Admin auth + wedding CRUD**
- **Phase 2 — Events** (custom, non-hardcoded)
- **Phase 3 — Guest groups & guests + per-group event invites**
- **Phase 4 — Invitations & guest session** ⭐ security-critical
- **Phase 5 — Guest website (config-driven) + event authorization** ⭐
- **Phase 6 — RSVP** (per guest, per event; admin aggregation)
- **Phase 7 — Media (Cloudflare R2 presigned uploads)**
- **Phase 8 — Polish** (remaining sections, themes, hardening)

Each phase = its own migration(s) + module code + minimal UI, independently deployable.
