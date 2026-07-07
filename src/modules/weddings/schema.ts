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
  partnerOneName: optionalTrimmed,
  partnerTwoName: optionalTrimmed,
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

export const updateWeddingSchema = createWeddingSchema;

export type CreateWeddingInput = z.infer<typeof createWeddingSchema>;
export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>;
