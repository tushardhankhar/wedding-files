# Platform Flows & Theme Playbook

_What's live today, the end-to-end flows, and how to add more themes._
_Last updated: 2026-07-11. Companion to `ARCHITECTURE.md` (deeper security/DB
detail) and `INVITATION-TYPES-PLAN.md` (the beyond-weddings generalization)._

The product is a **multi-event-type digital invitation** builder. An owner creates
an invitation, picks one of **12 themes** across **6 categories** (weddings,
save-the-date, parties, kids' birthdays, baby showers, housewarmings), fills in
theme-aware content, and shares **one private link per guest group** on WhatsApp.
Every family sees only the events they're invited to and RSVPs per event.

---

## 1. Route map (what's running)

| Route | Purpose | Access |
|---|---|---|
| `/` | Marketing landing (hero, how-it-works, themes gallery, pricing, enquiry) | Public |
| `/demo/[themeId]` | Live theme preview on fictional sample data (all 12 themes) | Public, SSG |
| `/login` | Owner/client auth | Public |
| `/dashboard` | Owner's invitations list | Auth |
| `/weddings/new` | Create an invitation | Auth |
| `/weddings/[id]` | Invitation home: core-details form + **theme picker** | Auth |
| `/weddings/[id]/content` | **Content editor** (theme-aware sections + experience fields) | Auth |
| `/weddings/[id]/events` | Events / timeline editor | Auth |
| `/weddings/[id]/guests` | Guests, groups & share links | Auth |
| `/weddings/[id]/rsvps` | RSVP overview | Auth |
| `/preview/[id]` | Owner preview (real renderer, owner's data) | Auth |
| `/client/claim/[token]` | Client onboarding — claim a planner-created invitation | Token |
| `/w/[slug]/invite/[token]` | Guest **group** link → sets a guest session → `/w/[slug]` | Token |
| `/w/[slug]/share/[token]` | **Broadcast** link → self-RSVP session | Token |
| `/w/[slug]` | Live guest site (gated to the session's invited events) | Guest session |
| `/w/[slug]/opengraph-image`, `/icon` | Per-invitation link-preview + favicon monogram | Public |

Everything is **registry-driven**: a new theme automatically appears in `/demo`,
the theme picker, and (with one showcase entry) the landing gallery.

---

## 2. Core flows

### 2.1 Owner — build & share
```
Sign in → /dashboard
  → New → /weddings/new : 3-STEP WIZARD
       1. Occasion  — pick a celebration category (CATEGORIES: wedding · save-the-date ·
          kids-birthday · baby-shower · housewarming · party)
       2. Theme     — pick a theme mapped to that occasion (themesForCategory)
       3. Details   — fields adapt to the theme's subjectSpec (1/2 names + labels);
          the title (→ URL slug) is auto-suggested per occasion, editable
     → createWedding sets theme_id up front → /weddings/[id]
  → (theme can still be switched on the home page ThemePicker, admin-only)
  → /content: editor shows ONLY the sections this theme supports (image field
    hidden when the theme has no gallery) + the ONE theme-specific "experience"
    section (party rule · child age · blessing · gender reveal…)
  → /events: add events / timeline
  → /guests: create groups, tick which events each group is invited to,
    generate a private group link → share on WhatsApp
```

### 2.2 Guest — receive & RSVP
```
Open /w/[slug]/invite/[token] → signed guest cookie → redirect /w/[slug]
  → THE GATE (guest-access) selects ONLY that group's invited events (+ members)
  → SiteView renders the invitation in the chosen theme
  → RSVP per event, per member
Broadcast: /w/[slug]/share/[token] → scoped events + self-RSVP (name + headcount).
```

### 2.3 Public — discover
```
/ → themes gallery → "Preview theme" → /demo/[themeId] (real renderer, sample data)
Enquiry form → Resend email (RESEND_API_KEY; see .env.example).
```

---

## 3. Rendering pipeline (how any theme renders)

The **same pipeline** powers `/demo`, `/preview`, and the live guest site — what
an owner previews is exactly what a guest sees.

```
theme_id ─▶ getTheme(id)                    modules/website/themes/registry.ts
            Theme = tokens + category + subjectSpec + supports + heroMotif + swatch

row + events ─▶ buildSiteProps(...)         modules/website/render/build.ts
            names/initials (subject-aware: 2→"A & B", 1→"A", 0→title),
            dateLabel, countdownDate, parseWebsiteConfig(config)

          ─▶ SiteView(props)                modules/website/render/site.tsx
            switch(theme.id) → bespoke renderer (or shared WebsiteView)

bespoke renderer                            modules/website/render/<theme>/
            reads props + (experience themes) config.experience.<theme>
```

**Registry = single source of truth per theme:**
- `category` — wedding · save-the-date · party · kids-birthday · baby-shower · housewarming
- `subjectSpec` — number of name inputs + labels (+ optional `age`)
- `supports` — which content sections the editor offers (`taglineHero, story,
  gallery, family, faq, events, countdown`) → drives field visibility
- `vars` (CSS tokens) + `swatch` (3-colour preview)

Theme-specific content lives in **`config.experience.<theme>`** (schema:
`modules/website/schema.ts`), separate from shared config (`hero/story/gallery/
family/faq/footer`). Saves **merge** onto stored config (`updateWeddingConfig`)
so unmanaged blocks are never wiped.

Reusable interactive components (`modules/website/render/experience/`):
`MotionProvider, ScratchReveal, HoldToReveal, FlipCountdown, BounceCountdown,
ConfettiBurst, FloatingParticles, TapBalloon, StarCatchGame, PhotoCarousel,
WishUponStar, AnimatedDoorReveal, InteractiveRangoli, useTilt`.

---

## 4. The 12 themes

| Category | Themes (id) |
|---|---|
| Wedding | Maharaja (`royal`), Gulmohar (`ivory`), Vow (`christian`), Anand Karaj (`punjabi`), Kalyanam (`south-indian`), Rajputana (`rajasthani`) |
| Save the Date | The Overture (`save-the-date`) |
| Party | The Afterparty (`afterparty`) |
| Kids' birthday | The Confetti (`confetti`) |
| Baby shower | The Little Miracle (`little-miracle`) |
| Housewarming | The Shubh Aarambh (`shubh-aarambh`) |

`theme_id` is stored on the wedding row and is stable — never rename an id in use.

---

## 5. ➕ How to add a NEW THEME

Adding a theme is **registry-first** — most of the platform reacts automatically.
Two cases.

### Case A — theme in an EXISTING category (no schema/DB change)
e.g. another wedding theme, or a second party theme.

1. **Registry** (`modules/website/themes/registry.ts`)
   - Add a base literal to `THEME_BASES`: `id`, `name`, `description`, `swatch`
     (3 colours), `heroMotif`, `vars` (its `--w-*` tokens + any bespoke `--xx-*`
     palette/font vars).
   - Add a `THEME_META` entry: `category`, `subjectSpec`, `supports`.
     → now auto-shows in `/demo/[id]`, the theme picker, the demo nav, **and the
     create wizard** (grouped under its category's occasion — no wizard change
     needed; `themesForCategory` picks it up).
2. **Renderer** — reuse the shared `WebsiteView` (token-driven, zero code) **or**
   add `modules/website/render/<theme>/<theme>-view.tsx` consuming
   `WebsiteViewProps`. For motion, wrap in `MotionProvider` + reuse `render/experience/`.
3. **Dispatch** — add `case "<id>": return <YourView {...props} />;` in
   `render/site.tsx` (skip if reusing `WebsiteView`).
4. **Scoped CSS** — append a `.<scope> { … }` block + keyframes to
   `app/globals.css` (only if you need styles beyond tokens).
5. **Fonts** — new font? add via `next/font/google` in `app/layout.tsx`, reference
   its CSS variable in the theme's `vars`.
6. **Demo data (optional)** — add to `EXPERIENCE_DEMOS`/`getDemoData` in
   `modules/website/demo-data.ts`; else it falls back to the sample couple.
7. **Landing card (optional)** — add a `PhotoArt` recipe in
   `components/landing/art.tsx` + a `SHOWCASE_THEMES` entry in
   `components/landing/data.ts`.

Validate: `npx tsc --noEmit` · `npx eslint .` · `npm run build` (theme should show
in the SSG'd `/demo/*` list).

### Case B — theme in a NEW category with its own authored fields
Do Case A, **plus:**

8. **Category** — add the value to the `ThemeCategory` union (registry).
9. **Experience schema** — add a block to `experienceSchema`
   (`modules/website/schema.ts`), localized where guest-facing.
10. **Editor section** — add a `case "<category>"` to `ExperienceEditor` and extend
    `ExpState`/`normalizeExp`/`serializeExp` in
    `app/(admin)/weddings/[weddingId]/content/content-editor.tsx`.
11. **Renderer reads it** — your view reads `config.experience.<yourKey>`.

**No DB migration** for either case — theme data rides inside the `config` jsonb.
A migration is only needed to add a first-class **column** (rare).

### Golden rule
Everything a theme needs — palette, fonts, which name fields, which content
sections, which interactive fields — is declared on its **registry entry**. The
create form, content editor, demo, and picker all read from there, so a new theme
is essentially **one registry entry + one renderer**, not edits scattered across
the app.

---

## 6. Data, trust & integrations (quick reference)

- **DB** (`supabase/migrations/`): `weddings` (`title, name1, name2, event_date,
  config jsonb, theme_id, slug, created_by, client_id`), `events`, `guest_groups`,
  `guests`, `group_event_invites` (the authorization edge), `rsvps`, `share_links`.
  `name1/name2` were renamed from `partner_*` in `0010`.
- **Two trust domains**: owner/client via the RLS-scoped user client; guests via a
  service client **behind** the `guest-access` session gate (uninvited events are
  never selected). See `ARCHITECTURE.md` for the full security model.
- **Media**: photo uploads → client WebP compress → R2 presigned PUT (`R2_*`).
- **Email**: enquiry form → Resend REST API (`RESEND_API_KEY`).
