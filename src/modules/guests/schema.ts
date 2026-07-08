import { z } from "zod";

export const groupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required.").max(120),
});

export const guestSchema = z.object({
  name: z.string().trim().min(1, "Guest name is required.").max(120),
  isPrimary: z.boolean().default(false),
});

export type GroupInput = z.infer<typeof groupSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
