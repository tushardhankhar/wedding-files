import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/modules/auth/server/user";
import { ForbiddenError } from "@/lib/errors";
import { randomToken, sha256Hex } from "@/lib/crypto";
import { env } from "@/lib/env";

const INVITE_TTL_DAYS = 30;

/**
 * Creates a one-time client onboarding invite for a wedding and returns the
 * shareable claim URL. Only admins may call this. The raw token is returned
 * once (in the URL) and only its SHA-256 hash is stored.
 */
export async function createClientInvite(
  weddingId: string
): Promise<{ url: string; expiresAt: string }> {
  if (!(await isCurrentUserAdmin())) throw new ForbiddenError();

  const supabase = await createSupabaseServerClient();
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabase.from("client_invites").insert({
    wedding_id: weddingId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
  if (error) throw error;

  const base = env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  return { url: `${base}/client/claim/${token}`, expiresAt };
}
