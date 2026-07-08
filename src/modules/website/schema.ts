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
        .array(z.object({ url: z.string(), caption: localizedSchema.optional() }))
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
