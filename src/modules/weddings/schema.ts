import { z } from "zod";

/**
 * Input contracts for wedding create/update. These validate admin form input;
 * the richer website "config" schema (sections/content) arrives in Phase 5.
 */
/** A name field that treats "" as absent. Exported because the self-serve
 * signup draft describes the same celebration in the same shapes. */
export const optionalName = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

/** HTML date inputs submit "" when empty; treat that as no date. */
export const optionalEventDate = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine(
    (v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v),
    "Use a valid date."
  );

/** Optional time of day (HH:MM) so countdowns target the exact moment. Stored
 * in the wedding's config jsonb (event_date is a date-only column). */
export const optionalEventTime = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine(
    (v) => v === undefined || /^\d{2}:\d{2}$/.test(v),
    "Use a valid time."
  );

export const createWeddingSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  // The theme chosen in the create wizard (validated against the registry in the
  // action). Optional so the update schema/flow, which never submits it, is fine.
  themeId: z.string().optional(),
  name1: optionalName,
  name2: optionalName,
  eventDate: optionalEventDate,
  eventTime: optionalEventTime,
  // The planner's contact number for this client. Admin-only, free-form (the
  // same loose 30-char shape as guest phones) so country codes, spaces and
  // dashes all paste in cleanly; digits are extracted when building wa.me links.
  clientPhone: z
    .string()
    .trim()
    .max(30, "That phone number is too long.")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

// Title is admin-only; clients don't submit it, so it's optional on update.
export const updateWeddingSchema = createWeddingSchema.extend({
  title: z.string().trim().min(1).max(120).optional(),
});

export type CreateWeddingInput = z.infer<typeof createWeddingSchema>;
export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>;
