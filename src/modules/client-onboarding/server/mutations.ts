import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/modules/auth/server/user";
import { ForbiddenError } from "@/lib/errors";
import { randomToken, sha256Hex } from "@/lib/crypto";
import { requireSiteUrl } from "@/lib/env";

const INVITE_TTL_DAYS = 30;

/**
 * Creates a one-time, email-bound client onboarding invite for a wedding and
 * returns the shareable claim URL. Only admins may call this. The raw token is
 * returned once (in the URL) and only its SHA-256 hash is stored. The invite is
 * bound to `email`, so only someone who controls that inbox can claim it.
 *
 * Any still-open invite for the same wedding is retired first, so at most one
 * live claim link exists at a time.
 */
export async function createClientInvite(
  weddingId: string,
  email: string
): Promise<{ url: string; expiresAt: string; email: string }> {
  if (!(await isCurrentUserAdmin())) throw new ForbiddenError();

  const normalizedEmail = email.trim().toLowerCase();

  const supabase = await createSupabaseServerClient();
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  // Retire any unaccepted invite for this wedding so only the newest link is
  // live (prevents a pile of valid tokens accumulating). Accepted invites are
  // kept for history.
  await supabase
    .from("client_invites")
    .delete()
    .eq("wedding_id", weddingId)
    .is("accepted_at", null);

  const { error } = await supabase.from("client_invites").insert({
    wedding_id: weddingId,
    email: normalizedEmail,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
  if (error) throw error;

  const base = requireSiteUrl();
  return {
    url: `${base}/client/claim/${token}`,
    expiresAt,
    email: normalizedEmail,
  };
}

/**
 * Revokes any still-open (unaccepted) invite for a wedding, so an outstanding
 * claim link can no longer be used. Accepted invites are left intact. Admins only.
 */
export async function revokeClientInvites(weddingId: string): Promise<void> {
  if (!(await isCurrentUserAdmin())) throw new ForbiddenError();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("client_invites")
    .delete()
    .eq("wedding_id", weddingId)
    .is("accepted_at", null);
  if (error) throw error;
}
