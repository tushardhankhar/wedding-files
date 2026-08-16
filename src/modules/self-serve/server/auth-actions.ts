"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSiteUrl } from "@/lib/env";
import { isCoolingDown } from "@/modules/auth/server/throttle";
import type { AuthFormState } from "@/modules/auth/server/actions";

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

/** Where the emailed link lands. The wizard reads the session from there. */
const NEXT_PATH = "/start";

/**
 * Email a one-time link/code that CREATES an account if none exists.
 *
 * This is the one and only surface allowed to mint a user. The login page
 * (`modules/auth/server/actions.ts`) deliberately pins `shouldCreateUser: false`
 * so that signing in can never silently create an account; self-serve signup is
 * the deliberate exception, which is why it lives in its own module with its own
 * throttle key rather than as a flag on the shared action.
 *
 * The reply is identical for a new and an existing address, so this stays free
 * of the account-enumeration leak the login flow guards against — an existing
 * user simply gets a sign-in link instead of a signup one.
 */
export async function startSignupAction(
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
      "Your link and code are on the way. It can take a minute to arrive — check your spam folder too.",
  };
  // Honeypot — real visitors leave this blank.
  if (String(formData.get("company") ?? "").trim()) return generic;

  const supabase = await createSupabaseServerClient();
  if (!(await isCoolingDown(supabase, parsed.data.email, "self_serve_signup"))) {
    await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${requireSiteUrl()}/auth/callback?next=${NEXT_PATH}`,
      },
    });
  }
  return generic;
}

/**
 * Verify the six-digit code from that email and drop the visitor into the
 * wizard. Mirrors `verifyLoginOtpAction` — see its notes on why the address
 * comes from a hidden field and why this deliberately skips the app-level
 * cooldown (mistyping a code twice shouldn't lock someone out mid-purchase).
 *
 * `type: "email"` covers both templates: Supabase sends "Confirm signup" to a
 * new address and "Magic Link" to an existing one, and both carry `{{ .Token }}`
 * (see `docs/auth-setup.md` §2a).
 */
export async function verifySignupOtpAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
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

  // `?signup=new` tells the page to announce a registration to the tag layer.
  // It rides on the redirect because the action runs on the server, where there
  // is no dataLayer to push to.
  //
  // Only this path carries it. The magic-LINK path lands via /auth/callback,
  // which cannot tell a first-time signup from a returning sign-in without an
  // extra lookup — and tagging every sign-in as a registration would inflate
  // the number more than missing some of it deflates it.
  redirect(`${NEXT_PATH}?signup=new`);
}
