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
  /**
   * Honeypot — real users leave this blank; bots tend to fill every field.
   *
   * `company` is still accepted so an older cached bundle keeps working, but the
   * live field is `trap`: browsers autofilled a field named `company` from the
   * "organization" slot of a saved address, and password managers filled it as a
   * username because it was the first input in the form. See `enquiry.tsx`.
   */
  trap: z.string().optional(),
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
  const { name, email, phone, query, trap, company } = parsed.data;

  /**
   * Honeypot as a *signal*, not a gate.
   *
   * This used to `return { ok: true }` and send nothing, which lost real
   * enquiries in the worst possible way: the visitor saw "your enquiry is on its
   * way", the form cleared, and the analytics counted a conversion that never
   * reached anyone. Autofill trips this far more often than bots do.
   *
   * A honeypot is weak protection here anyway — this is a server action, and a
   * bot POSTing it directly just omits the field. So the mail always goes out,
   * flagged in the subject, and a human decides. Zero lost leads is worth some
   * spam in the inbox.
   */
  const suspected = [trap, company].some((v) => v && v.trim().length > 0);

  const apiKey = serverEnv.RESEND_API_KEY;
  const to = serverEnv.ENQUIRY_TO_EMAIL || "hello@jointhejashn.com";
  const from =
    serverEnv.ENQUIRY_FROM_EMAIL || "Join the Jashn <onboarding@resend.dev>";
  if (!apiKey) {
    console.error("[enquiry] RESEND_API_KEY is not set — nothing was sent.");
    return { error: "Enquiries aren't set up yet — please email us directly." };
  }

  const html = `
    <h2>New enquiry from Join the Jashn</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
    <p><strong>Query:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(query)}</p>
    ${
      suspected
        ? `<hr><p style="color:#8e1838"><strong>Spam check:</strong> the hidden
             honeypot field was filled. Usually browser autofill on a real
             enquiry, occasionally a bot. Judge it by the message above.</p>`
        : ""
    }
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
        subject: suspected ? `[check] New enquiry from ${name}` : `New enquiry from ${name}`,
        html,
      }),
    });
    if (!res.ok) {
      // Resend explains refusals in the body — an unverified sending domain, a
      // `from` the account doesn't own, a revoked key. Swallowing it left no way
      // to tell "form is broken" from "mail was never configured", so it goes to
      // the server log where Vercel keeps it.
      const detail = await res.text().catch(() => "<no body>");
      console.error(`[enquiry] Resend refused: ${res.status} ${detail}`);
      return { error: "Couldn't send right now. Please try again." };
    }
  } catch (err) {
    console.error("[enquiry] Resend request failed:", err);
    return { error: "Couldn't send right now. Please try again." };
  }

  return { ok: true };
}
