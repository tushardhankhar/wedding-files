# Generalizing Invitations Beyond Weddings — Authoring Model & Forms

_Status: COMPLETE. Owner: TBD. Last updated: 2026-07-11._

**Progress:** Phases 0–6 all ✅.
- 0 — config merge (no experience wipe on save).
- 1 — registry category/subjectSpec/supports; capability-driven editor; subject-aware naming; theme-aware form labels.
- 2 — theme-specific editor sections (afterparty/confetti/littleMiracle/shubhAarambh) reading/writing `config.experience.*`.
- 3 — de-wedding shared authoring copy.
- 4 — verified guest-site forwards full `config` (incl. `experience`); OG monogram made subject-aware.
- 5 — confetti + little-miracle now read real `config.gallery.images` (placeholder fallback).
- 6 — renamed `partner_one_name`/`partner_two_name` → `name1`/`name2` across DB + 10 code files.

> ⚠️ **Phase 6 needs the DB migration applied:** `supabase/migrations/0010_generic_subject_names.sql`
> renames the columns. The code now expects `name1`/`name2`, so run the migration
> before pointing the app at the database or wedding create/edit will error.

## 1. Why this doc

The platform now ships **11 themes across very different event types**, but the
create/edit ("add info") forms are still wedding-shaped. A birthday needs one
name + an age; a griha pravesh needs a family name + a blessing; a bachelor
party needs a guest-of-honour + a classified location. Today none of that can be
entered — the forms only know "Partner one / Partner two" and wedding content
sections.

This doc maps the current state, defines a per-theme **subject + field model**,
and lays out what needs to be built, in priority order.

## 2. Current state (as-is)

**Creation form** — `src/app/(admin)/weddings/new/page.tsx` →
`wedding-form.tsx` (shared create/edit). Fields: `title`, `partnerOneName`,
`partnerTwoName`, `eventDate`. Schema: `createWeddingSchema` in
`src/modules/weddings/schema.ts`. No theme field here; theme is chosen later in
the theme picker.

**Data model** — `Wedding` (`src/modules/weddings/types.ts`) / table
`0001_weddings.sql`: `title`, `partner_one_name`, `partner_two_name`,
`event_date`, `config` (jsonb), `theme_id` (default `classic`), `slug`.

**Content editor** — `src/app/(admin)/weddings/[weddingId]/content/content-editor.tsx`.
One card-sectioned client form that edits **hero.tagline, story.milestones,
gallery.images, family.groups, faq.items, footer** and saves the whole `config`
via `saveWebsiteConfigAction` → `websiteConfigSchema`.

**Events editor** — `.../events/*`. Per-event: `name`, `nameHi`, `eventDate`,
`startTime`, `venueName`, `venueAddress`, `mapsUrl`, `description`,
`descriptionHi`.

**Config schema** — `src/modules/website/schema.ts`. Already contains an
`experience` block for the four experience themes (afterparty / confetti /
littleMiracle / shubhAarambh) — added when the themes were built.

**Naming derivation (the core assumption)** —
`src/modules/website/render/build.ts` `buildSiteProps()`:
`names = one && two ? "${one} & ${two}" : title`, `initials` similar. Every
theme gets the same `names`/`initials`; `themeId` only selects the renderer.

### Two structural gaps

1. **Subject model is couple-only.** `partnerOne/partnerTwo` → `"A & B"` is the
   only naming shape. Single-name and label-varying themes (child, parents,
   family, guest-of-honour) can't be expressed cleanly.
2. **Theme-specific fields have no UI — and are actively lost.** `config.experience.*`
   is only ever populated by demo/seed data and read by renderers. The content
   editor's `normalize`/`toConfig` only know hero/story/gallery/family/faq/footer,
   so **saving any content wipes `config.experience`**. This is a data-loss bug,
   not just a missing feature.

## 3. Target model: theme → category → subject → fields

Give every theme a **category** and a **subject spec** (how many names, their
labels, any extra scalar like age), plus its **theme-specific fields**.

| Theme (id) | Category | Subject (names) | Extra subject | Core | Theme-specific fields (config.experience.*) |
|---|---|---|---|---|---|
| royal, ivory, christian, punjabi, south-indian, rajasthani | `wedding` | 2 — partners | — | date, events | story, family, gallery, faq, footer _(existing)_ |
| save-the-date (Overture) | `save-the-date` | 1–2 — hosts | — | date **(required)**, city | footer.hashtag; "formal invite to follow" _(no new block)_ |
| afterparty | `party` | 1 — guest of honour | — | date, timeline (events) | `eventTitle`, `guestLabel`, `passTier`, `location{venue,city,mapsUrl}`, `partyRule` |
| confetti | `kids-birthday` | 1 — child | **age (int)** | date, venue | `childName`, `age`, `surprise`, `secretStar`, `cards[]{icon,label,value}` |
| little-miracle | `baby-shower` | 1–2 — parents | — | date, venue | `parents`, `title`, `wishPrompt`, `genderReveal{enabled,reveal,accent}` |
| shubh-aarambh | `housewarming` | 1 — family name | — | date, timeline (events) | `familyName`, `title`, `blessing{en,hi}`, `rangoliColors[]` |

Key insight: the experience themes **already model their own subject** inside
`config.experience.*` (`childName`, `parents`, `familyName`, `guestLabel`). So we
mostly need **authoring UI** to populate those, plus a **subject-aware naming**
path so the base name fields relabel per category and single-name themes don't
render "Name & " artifacts.

### 3.1 Theme capability manifest — hide fields a theme doesn't use

The renderer already hides *empty* sections at display time, but the **authoring
form still offers every field regardless of theme** — so a Save-the-Date owner
is asked to upload a gallery that will never render, and an Afterparty owner sees
"Our story" and "Families" sections that don't exist in that theme. This is the
same class of problem as naming: the form isn't theme-aware.

**Solution: a single `supports` manifest per theme** (in the registry) that
declares which sections/fields it exposes. The content editor iterates the
manifest and renders **only** the supported sections; the same manifest can also
gate the renderer, so there's one source of truth instead of two.

```ts
// on each registry Theme:
supports: {
  taglineHero: boolean,
  story:       boolean,   // milestones timeline
  gallery:     boolean,   // photos → HIDE the image/upload field when false
  family:      boolean,
  faq:         boolean,
  events:      boolean,   // multi-event / timeline
  countdown:   boolean,
}
// plus `category` + `subjectSpec` from §3, and the theme's experience block key.
```

**Capability matrix (proposed):**

| Field / section | wedding | save-the-date | afterparty | confetti | little-miracle | shubh-aarambh |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Names | 2 | 1–2 | 1 | 1 **+ age** | 1–2 | 1 (family) |
| Date | ✓ | ✓ req | ✓ | ✓ | ✓ | ✓ |
| Events / timeline | ✓ multi | — | ✓ | ~ 1 | ~ | ✓ |
| Countdown | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hero tagline | ✓ | — | — | — | — | — |
| Story / milestones | ✓ | — | — | — | — | — |
| **Gallery / photos** | ✓ | **—** | **—** | ✓ | ✓ | **—** |
| Family groups | ✓ | — | — | — | ~ parents | — |
| FAQ | ✓ | — | ~ | ~ | — | ~ |
| Footer hashtag | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Experience block | — | — | afterparty | confetti | littleMiracle | shubhAarambh |

So the **image field shows for wedding / confetti / little-miracle only**, and is
hidden everywhere else — driven by `supports.gallery`, not by hardcoded `if`s.

> Note: the experience renderers currently show **placeholder** photos
> (`confetti` `DEMO_MEMORIES`, `little-miracle` `CloudFrame`) rather than reading
> `config.gallery.images`. Part of Phase 2 is wiring the gallery-supporting
> themes to real `config.gallery.images` so the manifest is honest.

### 3.2 Greenfield advantage — do it clean now

There is **no production data yet**. That removes the usual reason to defer the
clean model: we can rename columns, restructure `config`, and change the naming
contract **without backfills or migration risk**. The recommendation below is
therefore to build the scalable model now rather than the reuse-and-defer hack.

## 4. Recommended approach

**Build the clean model now (no users → no backfill risk, see §3.2).** Three
workstreams, all driven by data on the theme registry rather than hardcoded
conditionals:

- **A. Subject/naming** — registry gains `category` + `subjectSpec`; naming
  becomes subject-aware; forms relabel/show-hide name fields per category. Since
  we're greenfield, migrate `partner_one_name`/`partner_two_name` to a generic
  subject shape (`name1`/`name2`, or a `subject` jsonb) rather than reusing the
  couple columns.
- **B. Capability-driven forms** — every theme declares a `supports` manifest
  (§3.1); the content editor renders each section **only if supported** (hides
  the image field when `!supports.gallery`, etc.). Same manifest gates the
  renderer → one source of truth.
- **C. Theme-specific authoring** — content editor gains per-category sections
  that read/write `config.experience.<theme>` and **preserve** unknown blocks.

## 5. What needs to be done (task breakdown)

### Phase 0 — Stop the data loss _(critical, small)_
- [ ] In `content-editor.tsx` `toConfig()` (and `saveWebsiteConfigAction`),
      **merge** onto the existing stored config instead of replacing it, so
      `config.experience` (and any future block) survives a save.
- [ ] Add a regression check: seed an `experience` block, save content, assert it
      still round-trips.

### Phase 1 — Theme registry: category, subject spec & capability manifest _(medium)_
- [ ] Add to the theme registry (`src/modules/website/themes/registry.ts`):
      `category`, `subjectSpec { names: 0|1|2, labels: string[], extras?: ('age')[] }`,
      and the **`supports` manifest** (§3.1) for every one of the 11 themes.
- [ ] Content editor renders each section **conditionally on `theme.supports`**
      — most importantly, **hide the image / gallery upload when `!supports.gallery`**
      (Save-the-Date, Afterparty, Shubh Aarambh). Replace any hardcoded section
      list with a manifest-driven loop.
- [ ] (Optional but cheap) have `WebsiteView` / renderers read the same manifest
      so section gating lives in one place.
- [ ] Make naming subject-aware. Options:
      - Simple: `buildSiteProps` reads the theme's `subjectSpec` and derives
        `names`/`initials` (1 name → just the name, no "&"); experience themes
        pull their display subject from `config.experience.*` when present.
      - Cleaner: each renderer already owns its subject; make `buildSiteProps`
        only responsible for the generic fallback.
- [ ] `wedding-form.tsx`: relabel name inputs per category
      (Partner one/two → Host name / Child's name / Parents' names / Family name),
      show/hide the 2nd name, and add category-specific scalar inputs (e.g.
      **age** for kids-birthday). Requires the form to know the chosen theme →
      either move theme selection into creation, or add a category step.
- [ ] Decide **when** the category is chosen: at creation (recommended — pick a
      theme/category first, then show the right fields) vs. after (today's flow).

### Phase 2 — Theme-specific content sections _(large — the main build)_
Add editor UI, shown only for the relevant category, writing `config.experience.<theme>`:
- [ ] **afterparty** — event title, guest label, pass tier, location
      (venue / city / maps URL), party rule. Timeline = existing events editor.
- [ ] **confetti** — child name, age, surprise line, secret-star reward, and a
      repeatable **party cards** list (icon / label / value).
- [ ] **little-miracle** — parents, title, wish prompt, **gender reveal**
      (enable toggle + reveal text + accent colour picker — never gender-locked).
- [ ] **shubh-aarambh** — family name, title, blessing (EN + HI), **rangoli
      colour palette** (list of hex swatches).
- [ ] Reuse the existing `LocField` (EN/HI) helper for all localized fields.
- [ ] Section visibility keyed off the wedding's `theme_id` → `category`.

### Phase 3 — De-wedding the generic sections _(medium)_
- [ ] Content editor labels: "the couple's names" → category-aware / generic;
      "Our story", "Families", "Events" → neutral or per-category wording.
- [ ] Events framing: a birthday is one "party", a griha pravesh is a puja
      timeline — mostly copy/labels, the data model already fits.
- [ ] Note: the 5 wedding renderers contain "couple" wording — that's fine, they
      are wedding-only; no change needed unless reused elsewhere.

### Phase 4 — Guest-site & preview passthrough _(small, verify)_
- [ ] Confirm `src/modules/guest-access/server/guest-site.ts` passes the **full
      `config` (incl. `experience`)** to the guest renderer, not a trimmed subset
      — otherwise experience themes render empty for real guests.
- [ ] Confirm owner Preview path already carries it (it uses `buildSiteProps`).

### Phase 5 — Photo wiring for gallery-supporting experience themes _(small)_
- [ ] Wire `confetti` (`PhotoCarousel`) and `little-miracle` (`CloudFrame`) to
      read real `config.gallery.images` instead of hardcoded placeholders, so
      `supports.gallery = true` is honest for them.

### Phase 6 — Naming/data-model migration _(do now — greenfield)_
- [ ] Migrate `partner_one_name`/`partner_two_name` → a generic subject shape
      (`name1`/`name2` columns, or a `subject` jsonb `{ names: string[], age?, label }`).
      No backfill needed (no rows). Update `Wedding` type, `mapWeddingRow`,
      schemas, `buildSiteProps`, and `guest-site.ts`.
- [ ] Because there are no users, this is a clean rename, not a compatibility
      shim — prefer it over carrying `partner_*` naming forward.

## 6. Validation & edge cases
- **Required fields per category** (e.g. save-the-date requires a date; confetti
  requires child name + age; afterparty requires location before the scratch
  reveal is meaningful). Encode in the create/edit zod schemas per category.
- **Bilingual**: keep EN/HI on every guest-facing string via `LocField`.
- **Fallbacks**: renderer already falls back to base names when a block is empty
  — keep that so a half-filled invite still renders.
- **Slug**: generated from `title`; works for all categories, no change.
- **Colour inputs** (gender-reveal accent, rangoli palette): validate hex.

## 7. Suggested sequencing & rough effort

```
Phase 0  Stop data loss                    ▓ small      ← ship first
Phase 1  Registry: category + subject +
         capability manifest (hide fields) ▓▓ medium
Phase 2  Theme-specific editor sections    ▓▓▓▓ large   ← the bulk
Phase 3  De-wedding generic copy           ▓▓ medium
Phase 4  Guest/preview passthrough         ▓ small
Phase 5  Photo wiring (confetti, l-miracle) ▓ small
Phase 6  Naming/data migration (greenfield) ▓▓ medium
```

## 8. Open decisions (need a call before building)
1. **Category at creation or after?** Recommend choosing theme/category up front
   so the form can show the right fields immediately.
2. **Reuse `partner_*` columns, or migrate to a generic subject now?** Recommend
   **migrate now** — no users means no backfill risk, and carrying couple-shaped
   columns forward is exactly the wedding-specific debt we're removing.
3. **One content editor vs. per-category editors?** Recommend **one** editor that
   renders sections off the `supports` manifest + the one experience section for
   the chosen category (hides everything a theme doesn't use).
4. **Where does capability live — registry vs. a separate manifest file?**
   Recommend on the registry `Theme` object, so theme + fields + rendering stay
   colocated and adding a future theme is a single edit.
```
