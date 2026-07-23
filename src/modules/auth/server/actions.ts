"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSiteUrl } from "@/lib/env";
import { isCoolingDown } from "./throttle";

export type AuthFormState = { error?: string; message?: string };

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
    message:
      "If an account exists for that email, we've sent a sign-in link. Check your inbox.",
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

/** Sign out and return to the login screen. */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
