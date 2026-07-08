import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

export const createEventSchema = z.object({
  name: z.string().trim().min(1, "Event name is required.").max(120),
  eventDate: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v),
      "Use a valid date."
    ),
  startTime: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^\d{2}:\d{2}$/.test(v),
      "Use a valid time."
    ),
  venueName: optionalText(160),
  venueAddress: optionalText(300),
  mapsUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine(
      (v) => v === undefined || /^https?:\/\/.+/.test(v),
      "Enter a valid link starting with http(s)://"
    ),
  description: optionalText(2000),
});

export const updateEventSchema = createEventSchema;

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
