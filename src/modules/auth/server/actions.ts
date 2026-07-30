"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSiteUrl } from "@/lib/env";
import { isCoolingDown } from "./throttle";

export type AuthFormState = {
  error?: string;
  message?: string;
  /** True once a request has been accepted, so the form can switch to a
   * "check your inbox" state instead of looking untouched. */
  sent?: boolean;
  /** Echoed back purely so the UI can name the address it just used. This is
   * the visitor's own input — it reveals nothing and keeps the enumeration
   * guard intact, since the copy stays conditional ("if an account exists"). */
  email?: string;
};

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

/**
 * Email a one-time magic sign-in link — the only way to sign in (the app is
 * passwordless). `shouldCreateUser: false` so the login surface can never mint
 * an account; only planner invites create clients. The response is identical
 * whether or not the email exists (enumeration guard), with a honeypot +
 * per-email cooldown to limit abuse.
 */
export async function requestMagicLinkAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  const generic: AuthFormState = {
    sent: true,
    email: parsed.data.email,
    message:
      "If an account exists for that email, a sign-in link is on its way. It can take a minute to arrive — check your spam folder too.",
  };
  if (String(formData.get("company") ?? "").trim()) return generic;

  const supabase = await createSupabaseServerClient();
  if (!(await isCoolingDown(supabase, parsed.data.email, "magic_link"))) {
    await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${requireSiteUrl()}/auth/callback?next=/dashboard`,
      },
    });
  }
  return generic;
}

/**
 * Verify a sign-in code typed on the login page.
 *
 * The Magic Link email carries `{{ .Token }}` because the client-claim flow
 * requires it, which previously left login users holding a code with nowhere to
 * put it. Accepting it here also fixes the common cross-device case: request the
 * link on a laptop, read the mail on a phone, type six digits instead of
 * forwarding a link between devices.
 *
 * The email arrives from a hidden field rather than a server lookup, which is
 * safe because the code is the secret — knowing an address gets you nothing
 * without it. Brute force is bounded by Supabase's own verification rate limits;
 * deliberately NOT the app's `check_auth_throttle`, whose cooldown would punish
 * someone simply mistyping their code twice.
 */
export async function verifyLoginOtpAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  // Supabase's OTP length is configurable (6–10 digits); accept any of them and
  // strip whatever spacing came along from a copy-paste out of the email.
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");

  if (!emailSchema.safeParse({ email }).success) {
    return { error: "Enter a valid email address." };
  }
  if (!/^\d{6,10}$/.test(code)) {
    return { sent: true, email, error: "Enter the code from your email." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });
  if (error) {
    return {
      sent: true,
      email,
      error: "That code is invalid or has expired. Request a new one.",
    };
  }

  redirect("/dashboard");
}

/** Sign out and return to the login screen. */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
