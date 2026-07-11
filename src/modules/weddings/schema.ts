import { z } from "zod";

/**
 * Input contracts for wedding create/update. These validate admin form input;
 * the richer website "config" schema (sections/content) arrives in Phase 5.
 */
const optionalTrimmed = z
  .string()
  .trim()
  .max(120)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const createWeddingSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  // The theme chosen in the create wizard (validated against the registry in the
  // action). Optional so the update schema/flow, which never submits it, is fine.
  themeId: z.string().optional(),
  name1: optionalTrimmed,
  name2: optionalTrimmed,
  // HTML date inputs submit "" when empty; treat that as no date.
  eventDate: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Use a valid date."
    ),
});

// Title is admin-only; clients don't submit it, so it's optional on update.
export const updateWeddingSchema = createWeddingSchema.extend({
  title: z.string().trim().min(1).max(120).optional(),
});

export type CreateWeddingInput = z.infer<typeof createWeddingSchema>;
export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>;
