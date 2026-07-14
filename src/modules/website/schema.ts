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

export const websiteConfigSchema = z.object({
  /** Time of day (HH:MM) for the event — makes theme countdowns exact. Stored
   * alongside the wedding's date (which is a date-only column). */
  eventTime: z.string().optional(),
  hero: z.object({ tagline: localizedSchema.optional() }).optional(),
  experience: experienceSchema,
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
  family: z
    .object({
      groups: z
        .array(
          z.object({
            name: localizedSchema,
            members: localizedSchema.optional(),
            relation: localizedSchema.optional(),
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
        .array(z.object({ name: z.string(), phone: z.string() }))
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
