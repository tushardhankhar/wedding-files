import { z } from "zod";

/**
 * A localized string: English required, Hindi optional (falls back to English
 * when absent). Every guest-facing content field is localized so the whole
 * site can toggle EN ⇄ HI.
 */
export const localizedSchema = z.object({
  en: z.string(),
  hi: z.string().optional(),
});
export type Localized = z.infer<typeof localizedSchema>;

/**
 * How a photo is framed inside a theme's crop. Stored per image and applied by
 * every renderer, so it is deliberately theme-agnostic: `x`/`y` are the focal
 * point (0–1, where the subject sits) and `zoom` scales the image up inside the
 * frame. Absent → centered, no zoom (identical to the pre-focus behaviour).
 */
export const focusSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  zoom: z.number().min(1).max(4),
});
export type Focus = z.infer<typeof focusSchema>;

/**
 * The theme's illustration slot — the couple drawn into the design (the Gulistan
 * balcony, the Overture's arched niche, the Muhurat medallion). The client can
 * switch the slot off entirely, keep the theme's own figures, or upload their own
 * caricature / portrait sketch to stand in for them.
 *
 * Unlike {@link Focus} (which crops a photo to *fill* a frame), an upload is a
 * whole transparent-background drawing placed *inside* a scene, so the client
 * nudges and sizes it rather than picking a focal point:
 *
 *   - `enabled` — whether the slot is drawn at all. A theme whose figures are
 *     part of its scene starts on; a theme where the illustration is an addition
 *     starts off (see `ThemeSupports.artwork`).
 *   - `url`     — the client's own drawing. Absent → the theme's own figures.
 *   - `x` / `y` — offset from the artwork's home position, as a fraction of the
 *     scene's width/height (0 = untouched, +y = lower, −y = higher).
 *   - `scale`   — size relative to the built-in artwork it replaces.
 *   - `flip`    — mirror horizontally, for a drawing that faces the wrong way.
 */
export const artworkSchema = z.object({
  enabled: z.boolean().default(true),
  url: z.string().optional(),
  x: z.number().min(-1).max(1).default(0),
  y: z.number().min(-1).max(1).default(0),
  scale: z.number().min(0.3).max(2.5).default(1),
  flip: z.boolean().default(false),
});
export type Artwork = z.infer<typeof artworkSchema>;

/**
 * One photograph behind the theme's hero — a backdrop, not the gallery.
 *
 * Only offered by themes whose `supports.heroPhoto` is true (today: the
 * Miramar, whose hero is a printed plate lying on a drawn shore, so the shore
 * can become a real photograph while the plate keeps its own ground). Reuses
 * {@link Focus} for framing, because unlike the illustration slot this IS a
 * photo cropped to fill a frame — the client picks the focal point and the
 * renderer crops around it at every screen size.
 *
 *   - `enabled` — off until the client turns it on. The drawn ground is the
 *                 theme's signature, so a photo is always an addition.
 *   - `url`     — absent → the theme's own drawn ground, whatever `enabled` says.
 *   - `focus`   — where the subject sits, so a tall crop on a phone keeps them.
 */
export const heroPhotoSchema = z.object({
  enabled: z.boolean().default(false),
  url: z.string().optional(),
  focus: focusSchema.optional(),
});
export type HeroPhoto = z.infer<typeof heroPhotoSchema>;

/**
 * The website content config, stored in weddings.config (jsonb). Everything is
 * optional — sections without content are simply not rendered. Content
 * authoring UI arrives in Phase 4; the renderer already reads all of it.
 */
/**
 * Theme-specific interactive content for the non-wedding "experience" themes
 * (afterparty / confetti / little-miracle / shubh-aarambh). Each bespoke
 * renderer reads only its own block; everything is optional so a theme falls
 * back to the wedding-level fields (names, dateLabel, events) when absent.
 * Colours are configurable (never hardcoded per gender/occasion).
 */
export const experienceSchema = z
  .object({
    /** The Afterparty — bachelor/bachelorette/nightlife. */
    afterparty: z
      .object({
        eventTitle: localizedSchema.optional(), // "…'s LAST NIGHT OF FREEDOM"
        guestLabel: z.string().optional(), // name printed on the VIP pass
        passTier: z.string().optional(), // e.g. "VIP ACCESS"
        location: z
          .object({
            venue: z.string(),
            city: z.string().optional(),
            mapsUrl: z.string().optional(),
          })
          .optional(),
        partyRule: localizedSchema.optional(), // hold-to-reveal payload
      })
      .optional(),

    /** The Confetti — children's birthday. */
    confetti: z
      .object({
        childName: z.string().optional(),
        age: z.number().int().min(1).max(120).optional(),
        surprise: localizedSchema.optional(), // hero pre-open line
        secretStar: localizedSchema.optional(), // reward on the lucky balloon
        cards: z
          .array(
            z.object({
              icon: z.string(), // emoji
              label: localizedSchema,
              value: localizedSchema,
            })
          )
          .default([]),
      })
      .optional(),

    /** The Little Miracle — baby shower / godh bharai / naming. */
    littleMiracle: z
      .object({
        parents: z.string().optional(),
        title: localizedSchema.optional(),
        wishPrompt: localizedSchema.optional(),
        genderReveal: z
          .object({
            enabled: z.boolean().default(false),
            reveal: localizedSchema, // "IT'S A BOY 💙" / "…GIRL 🌸" / "…SURPRISE 🤍"
            accent: z.string().optional(), // configurable hex — never hardcoded
          })
          .optional(),
      })
      .optional(),

    /** The Shubh Aarambh — griha pravesh / housewarming / puja. */
    shubhAarambh: z
      .object({
        familyName: localizedSchema.optional(),
        title: localizedSchema.optional(),
        blessing: localizedSchema.optional(), // Hindi with English fallback
        rangoliColors: z.array(z.string()).default([]), // palette dots (hex)
      })
      .optional(),
  })
  .optional();

export type Experience = z.infer<typeof experienceSchema>;

/**
 * Per-theme copy overrides — the fixed lines a bespoke theme prints (its
 * headings, its eyebrows, its scripture, its button labels), made editable.
 *
 * Keyed by theme id, then by that theme's own field key. Deliberately a record
 * rather than a hand-written object of forty keys: the renderer is the
 * authority on which keys exist (see render/miramar/copy.ts), it reads only the
 * ones it knows, and a key left behind by an edit to that list is inert instead
 * of failing the whole config's parse.
 */
export const themeCopySchema = z.object({
  miramar: z.record(z.string(), localizedSchema).optional(),
});

export type ThemeCopy = z.infer<typeof themeCopySchema>;

export const websiteConfigSchema = z.object({
  /** Time of day (HH:MM) for the event — makes theme countdowns exact. Stored
   * alongside the wedding's date (which is a date-only column). */
  eventTime: z.string().optional(),
  hero: z.object({ tagline: localizedSchema.optional() }).optional(),
  /** The wording of the theme's own fixed lines. Only bespoke themes that
   * publish a copy list (today: the Miramar) offer it. */
  themeCopy: themeCopySchema.optional(),
  experience: experienceSchema,
  /** The theme's illustration slot — switch it off, keep the theme's figures, or
   * replace them with the client's own drawing. Only themes whose
   * `supports.artwork` is truthy offer (and render) it. */
  artwork: artworkSchema.optional(),
  /** One photograph behind the hero. Only themes whose `supports.heroPhoto` is
   * true offer (and render) it. */
  heroPhoto: heroPhotoSchema.optional(),
  story: z
    .object({
      milestones: z
        .array(
          z.object({
            when: z.string(),
            title: localizedSchema,
            text: localizedSchema,
          })
        )
        .default([]),
    })
    .optional(),
  gallery: z
    .object({
      images: z
        .array(
          z.object({
            url: z.string(),
            caption: localizedSchema.optional(),
            focus: focusSchema.optional(),
          })
        )
        .default([]),
    })
    .optional(),
  music: z
    .object({
      // On by default, but browsers block autoplay-with-sound regardless —
      // this just controls whether the guest-facing toggle starts in the
      // "on" visual state. Actual playback still needs a first tap.
      enabled: z.boolean().default(true),
      source: z.enum(["library", "custom"]).default("library"),
      // Set when source === "library" — id into MUSIC_LIBRARY.
      trackId: z.string().optional(),
      // Set when source === "custom" — the client's own uploaded MP3.
      customUrl: z.string().optional(),
      // Loop segment, in seconds into the track. Both must be set to trim —
      // absent (the common case) means loop the whole track.
      loopStart: z.number().optional(),
      loopEnd: z.number().optional(),
    })
    .optional(),
  family: z
    .object({
      members: z
        .array(
          z.object({
            name: localizedSchema,
            relation: localizedSchema.optional(),
            /** Which side of the family this member belongs to — drives the
             * groom's-side / bride's-side split on themes that render it. */
            side: z.enum(["groom", "bride"]).default("groom"),
          })
        )
        .default([]),
    })
    .optional(),
  faq: z
    .object({
      items: z.array(z.object({ q: localizedSchema, a: localizedSchema })).default([]),
    })
    .optional(),
  footer: z
    .object({
      hashtag: z.string().optional(),
      contacts: z
        .array(
          z.object({
            name: z.string(),
            phone: z.string(),
            relation: z.string().optional(),
          })
        )
        .default([]),
    })
    .optional(),
});

export type WebsiteConfig = z.infer<typeof websiteConfigSchema>;

/** Safely parse a wedding's stored config, tolerating older/empty shapes. */
export function parseWebsiteConfig(raw: unknown): WebsiteConfig {
  const result = websiteConfigSchema.safeParse(raw ?? {});
  return result.success ? result.data : {};
}
