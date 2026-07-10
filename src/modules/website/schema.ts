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
export const websiteConfigSchema = z.object({
  hero: z.object({ tagline: localizedSchema.optional() }).optional(),
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
