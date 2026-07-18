import "server-only";
import { serverEnv } from "@/lib/env.server";
import { escapeHtml } from "@/lib/html";

/**
 * Sends the branded client-invite email (the claim link an admin hands to a
 * couple) via Resend's REST API — the same no-SDK pattern as the enquiry form.
 *
 * This is NOT a Supabase-native auth email (OTP / magic link / reset go through
 * Supabase custom SMTP). It's our own transactional message carrying the claim
 * URL. Best-effort by design: if it can't send, the caller still has the URL to
 * copy or share over WhatsApp, so onboarding is never blocked.
 */
export type InviteEmailResult = { sent: boolean; reason?: string };

export async function sendClientInviteEmail({
  to,
  url,
  occasion,
}: {
  to: string;
  url: string;
  /** Lowercase occasion noun, e.g. "wedding", "baby shower". */
  occasion: string;
}): Promise<InviteEmailResult> {
  const apiKey = serverEnv.RESEND_API_KEY;
  const from = serverEnv.AUTH_FROM_EMAIL ?? serverEnv.ENQUIRY_FROM_EMAIL;
  if (!apiKey || !from) {
    return { sent: false, reason: "email-not-configured" };
  }

  const safeOccasion = escapeHtml(occasion);
  const safeUrl = escapeHtml(url);

  // Brand palette, kept to three colours per the brand rules: BF Navy
  // background, white body text, LocalFactor Yellow for the heading + CTA.
  const html = `
  <div style="margin:0;padding:24px;background:#2f3342;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#2f3342;color:#ffffff;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F2DA00;letter-spacing:0.04em;">
        JASHN
      </h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#ffffff;">
        You've been invited to set up your ${safeOccasion} website. Tap the
        button below to confirm your email and start managing your invitation —
        no password needed, we sign you in with a one-time code.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${safeUrl}"
           style="display:inline-block;padding:12px 22px;background:#F2DA00;color:#2f3342;
                  font-size:15px;font-weight:700;text-decoration:none;border-radius:6px;">
          Set up my ${safeOccasion} website
        </a>
      </p>
      <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#bfbfbf;">
        Or paste this link into your browser:
      </p>
      <p style="margin:0 0 20px;font-size:12px;line-height:1.6;color:#bfbfbf;word-break:break-all;">
        ${safeUrl}
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#bfbfbf;">
        This link is just for you and expires in 30 days. If you weren't
        expecting it, you can ignore this email.
      </p>
    </div>
  </div>`;

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
        subject: `Set up your ${occasion} website with Jashn`,
        html,
      }),
    });
    if (!res.ok) return { sent: false, reason: "send-failed" };
  } catch {
    return { sent: false, reason: "send-failed" };
  }
  return { sent: true };
}
