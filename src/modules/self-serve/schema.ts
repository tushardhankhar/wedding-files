import { z } from "zod";
import {
  optionalName,
  optionalEventDate,
  optionalEventTime,
} from "@/modules/weddings/schema";

/**
 * The self-serve wizard's answers. Two groups of fields:
 *
 *   • contact — who is buying. Name and phone are MANDATORY here; the email is
 *     already verified on `auth.users` by the time this form can be reached, so
 *     between the two we hold all three contact details.
 *   • celebration — the same shapes the planner's create wizard collects, which
 *     is why the name/date/time fields are imported from `weddings/schema.ts`
 *     rather than restated.
 *
 * Note what is absent: any notion of price. The amount is read from
 * `pricing.ts` on the server at order time and never travels through a form.
 */
export const signupDraftSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(120, "That name is too long."),
  // Same loose 30-char shape as `weddings.client_phone` and guest phones, so
  // country codes, spaces and dashes all paste in cleanly. Digits are extracted
  // when a wa.me link is built.
  contactPhone: z
    .string()
    .trim()
    .min(6, "Please enter a phone number we can reach you on.")
    .max(30, "That phone number is too long.")
    .refine(
      (v) => (v.match(/\d/g) ?? []).length >= 6,
      "Please enter a valid phone number."
    ),
  themeId: z.string().min(1, "Please choose a theme."),
  title: z
    .string()
    .trim()
    .min(1, "Please give your invitation a title.")
    .max(120, "That title is too long."),
  name1: optionalName,
  name2: optionalName,
  eventDate: optionalEventDate,
  eventTime: optionalEventTime,
});

export type SignupDraftInput = z.infer<typeof signupDraftSchema>;
