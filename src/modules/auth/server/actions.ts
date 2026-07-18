"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSiteUrl } from "@/lib/env";
import { isCoolingDown } from "./throttle";

export type AuthFormState = { error?: string; message?: string };

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

/** Sign in with email + password. Redirects to the dashboard on success. */
export async function signInAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Invalid email or password." };

  redirect("/dashboard");
}

/**
 * Email a one-time magic sign-in link. `shouldCreateUser: false` so the login
 * surface can never mint an account — only planner invites create clients. The
 * response is identical whether or not the email exists (enumeration guard).
 */
export async function requestMagicLinkAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  // Same response whether the account exists, the honeypot tripped, or we're
  // within the cooldown — no enumeration, no email bombing.
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

/** Email a password-reset link. Enumeration-safe: always the same response. */
export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  const generic: AuthFormState = {
    message:
      "If an account exists for that email, we've sent a password reset link.",
  };
  if (String(formData.get("company") ?? "").trim()) return generic;

  const supabase = await createSupabaseServerClient();
  if (!(await isCoolingDown(supabase, parsed.data.email, "password_reset"))) {
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${requireSiteUrl()}/auth/callback?next=/reset-password`,
    });
  }
  return generic;
}

const passwordUpdateSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Those passwords don't match.",
    path: ["confirm"],
  });

/**
 * Set a new password for the currently-signed-in user. Used on /reset-password
 * (after the recovery link established a session) and for the optional
 * post-claim "set a password" step. Redirects to the dashboard on success.
 */
export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = passwordUpdateSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error:
        "Your link has expired. Request a new one from the sign-in page.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: "Couldn't update your password. Please try again." };
  }

  redirect("/dashboard");
}

/**
 * Optional "set a password" for an already-signed-in client (post-claim
 * convenience on the dashboard). Unlike updatePasswordAction it stays put and
 * returns a confirmation message rather than redirecting.
 */
export async function setOwnPasswordAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = passwordUpdateSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: "Couldn't update your password. Please try again." };
  }
  return { message: "Password saved — you can now sign in with it too." };
}

/** Sign out and return to the login screen. */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
