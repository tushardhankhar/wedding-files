"use server";

import { z } from "zod";
import { serverEnv } from "@/lib/env.server";
import { escapeHtml } from "@/lib/html";

/**
 * Public enquiry form → email to the site owner via Resend's REST API (no SDK
 * dependency). Configured lazily: if RESEND_API_KEY is absent the action fails
 * with a friendly message rather than crashing the app.
 *
 * Env:
 *   RESEND_API_KEY      required to actually send
 *   ENQUIRY_TO_EMAIL    recipient (defaults to the owner's address)
 *   ENQUIRY_FROM_EMAIL  verified sender; defaults to Resend's shared sender,
 *                       which can only deliver to the account's own email.
 */
const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("That email doesn't look right.").max(200),
  phone: z
    .string()
    .trim()
    .min(4, "Please enter your phone number.")
    .max(40),
  query: z
    .string()
    .trim()
    .min(1, "Please tell us how we can help.")
    .max(4000),
  // Honeypot — real users leave this blank; bots tend to fill every field.
  company: z.string().optional(),
});

export type EnquiryState = { ok?: boolean; error?: string };

export async function submitEnquiryAction(
  input: unknown
): Promise<EnquiryState> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const { name, email, phone, query, company } = parsed.data;

  // Honeypot tripped → pretend success, send nothing.
  if (company && company.trim().length > 0) return { ok: true };

  const apiKey = serverEnv.RESEND_API_KEY;
  const to = serverEnv.ENQUIRY_TO_EMAIL || "hello@jointhejashn.com";
  const from =
    serverEnv.ENQUIRY_FROM_EMAIL || "Join the Jashn <onboarding@resend.dev>";
  if (!apiKey) {
    return { error: "Enquiries aren't set up yet — please email us directly." };
  }

  const html = `
    <h2>New enquiry from Join the Jashn</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Query:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(query)}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New enquiry from ${name}`,
        html,
      }),
    });
    if (!res.ok) {
      return { error: "Couldn't send right now. Please try again." };
    }
  } catch {
    return { error: "Couldn't send right now. Please try again." };
  }

  return { ok: true };
}
