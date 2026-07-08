import { z } from "zod";

export const groupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required.").max(120),
});

export const guestSchema = z.object({
  name: z.string().trim().min(1, "Guest name is required.").max(120),
  isPrimary: z.boolean().default(false),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type GroupInput = z.infer<typeof groupSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
