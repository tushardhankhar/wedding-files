"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSiteUrl } from "@/lib/env";
import { isCoolingDown } from "@/modules/auth/server/throttle";
import { createClientInvite, revokeClientInvites } from "./mutations";
import { sendClientInviteEmail } from "./email";

// ── Admin: generate an email-bound client onboarding link ────────────────────
export type GenerateInviteState = {
  url?: string;
  email?: string;
  /** true when the invite email was sent; false when it must be shared manually. */
  emailSent?: boolean;
  error?: string;
};

const inviteEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid client email address.");

export async function generateClientInviteAction(
  weddingId: string,
  _prev: GenerateInviteState,
  formData: FormData
): Promise<GenerateInviteState> {
  const parsed = inviteEmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  }
  const occasion = String(formData.get("occasion") ?? "").trim() || "wedding";

  try {
    const { url, email } = await createClientInvite(weddingId, parsed.data);
    revalidatePath(`/weddings/${weddingId}`);

    // Best-effort: email the claim link to the client. If it can't send, the
    // admin still has the URL to copy or share over WhatsApp.
    const { sent } = await sendClientInviteEmail({ to: email, url, occasion });
    return { url, email, emailSent: sent };
  } catch {
    return { error: "Could not generate a client link. Please try again." };
  }
}

// ── Admin: revoke an outstanding invite ─────────────────────────────────────
export type RevokeInviteState = { revoked?: boolean; error?: string };

export async function revokeClientInviteAction(
  weddingId: string,
  _prev: RevokeInviteState,
  _formData: FormData
): Promise<RevokeInviteState> {
  try {
    await revokeClientInvites(weddingId);
    revalidatePath(`/weddings/${weddingId}`);
    return { revoked: true };
  } catch {
    return { error: "Couldn't revoke the invite. Please try again." };
  }
}

// ── Client: claim an invite via email-bound OTP ─────────────────────────────
//
// The invite is bound to a specific email. We email a 6-digit code to THAT
// address (never a user-typed one) and the client proves ownership by entering
// it — so it's impossible to claim under the wrong email, and there's no
// password to forget. New and returning clients follow the identical path.
export type ClaimState = { error?: string; message?: string; sent?: boolean };

/** Bind an already-signed-in, matching client to the wedding. */
export async function finalizeClaimAction(
  token: string,
  _prev: ClaimState,
  _formData: FormData
): Promise<ClaimState> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("claim_client_invite_v2", {
    p_token: token,
  });
  if (error) {
    // EMAIL_MISMATCH is the server-side backstop; the page normally routes a
    // mismatched viewer to the "wrong email" UI before this runs.
    return { error: "This invite link is invalid or has expired." };
  }
  redirect("/dashboard");
}

/** Step 1: email a 6-digit sign-in code to the invited address. */
export async function requestClaimOtpAction(
  token: string,
  _prev: ClaimState,
  formData: FormData
): Promise<ClaimState> {
  const supabase = await createSupabaseServerClient();
  const { data: email, error: lookupError } = await supabase.rpc(
    "get_invite_email",
    { p_token: token }
  );
  if (lookupError || !email) {
    return { error: "This invite link is invalid or has expired." };
  }

  // Honeypot: bots fill hidden fields. Advance the UI without sending.
  const sentState: ClaimState = {
    sent: true,
    message:
      "We emailed you a sign-in code — enter it below, or just tap the link in that email.",
  };
  if (String(formData.get("company") ?? "").trim()) return sentState;

  // Within cooldown → don't re-send; the prior code is still valid.
  if (await isCoolingDown(supabase, email, "claim_otp")) {
    return {
      sent: true,
      message:
        "We already emailed you a code — enter it below. You can request another shortly.",
    };
  }

  // shouldCreateUser handles new and returning clients identically: creates the
  // account if absent, signs into the existing one otherwise. emailRedirectTo
  // makes the email's magic link land on /auth/callback and continue the claim,
  // so BOTH typing the code and clicking the link work.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${requireSiteUrl()}/auth/callback?next=/client/claim/${token}`,
    },
  });
  if (error) {
    return { error: "Couldn't send the code. Please try again in a moment." };
  }
  return sentState;
}

/** Step 2: verify the code, establish the session, and bind the wedding. */
export async function verifyClaimOtpAction(
  token: string,
  _prev: ClaimState,
  formData: FormData
): Promise<ClaimState> {
  // Supabase's OTP length is configurable (6–10 digits); accept any of them and
  // ignore stray spaces the user may paste in.
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (!/^\d{6,10}$/.test(code)) {
    return { sent: true, error: "Enter the code from your email." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: email, error: lookupError } = await supabase.rpc(
    "get_invite_email",
    { p_token: token }
  );
  if (lookupError || !email) {
    return { error: "This invite link is invalid or has expired." };
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });
  if (verifyError) {
    return {
      sent: true,
      error: "That code is invalid or has expired. Request a new one.",
    };
  }

  // Session established as the invited email, so the email match always holds.
  const { error: claimError } = await supabase.rpc("claim_client_invite_v2", {
    p_token: token,
  });
  if (claimError) {
    return { error: "This invite link is invalid or has expired." };
  }
  redirect("/dashboard");
}

/** Sign out a wrong-email visitor and return them to the claim page. */
export async function claimSignOutAction(token: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/client/claim/${token}`);
}
