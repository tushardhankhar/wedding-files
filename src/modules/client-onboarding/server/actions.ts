"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClientInvite } from "./mutations";

// ── Admin: generate a client onboarding link ────────────────────────────────
export type GenerateInviteState = { url?: string; error?: string };

export async function generateClientInviteAction(
  weddingId: string,
  _prev: GenerateInviteState,
  _formData: FormData
): Promise<GenerateInviteState> {
  try {
    const { url } = await createClientInvite(weddingId);
    revalidatePath(`/weddings/${weddingId}`);
    return { url };
  } catch {
    return { error: "Could not generate a client link. Please try again." };
  }
}

// ── Client: claim an invite (create account + bind to the wedding) ──────────
export type ClaimState = { error?: string; message?: string };

const claimSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function claimClientInviteAction(
  token: string,
  _prev: ClaimState,
  formData: FormData
): Promise<ClaimState> {
  const parsed = claimSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();

  // Start from a clean slate: if the link is opened while already signed in
  // (e.g. an admin testing, or a returning visitor), don't claim under that
  // identity — the new client account should own this wedding.
  await supabase.auth.signOut();

  const { data, error } = await supabase.auth.signUp(parsed.data);
  if (error) {
    return {
      error:
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already exists")
          ? "That email already has an account. Sign in instead, then reopen this link."
          : error.message,
    };
  }

  // With email confirmation on, there is no session yet — the client can't
  // claim until confirmed. Guide them instead of failing silently.
  if (!data.session) {
    return {
      message:
        "Account created. Confirm your email, then open this link again to finish setup.",
    };
  }

  // Bind this freshly authenticated client to the wedding (SECURITY DEFINER).
  const { error: claimError } = await supabase.rpc("claim_client_invite", {
    p_token: token,
  });
  if (claimError) {
    return { error: "This invite link is invalid or has expired." };
  }

  redirect("/dashboard");
}
