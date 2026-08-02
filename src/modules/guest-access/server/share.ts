import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { hashGuestToken } from "../tokens";

export interface ResolvedShareLink {
  shareLinkId: string;
  weddingId: string;
  /** The wedding's CURRENT slug — the canonical URL to send the guest to. */
  slug: string;
}

/**
 * Verifies a broadcast-link token. Service-role client (guests are
 * unauthenticated); the authorization is the explicit hash match.
 *
 * Slug-independent for the same reason as `resolveInviteToken`:
 * `share_links.token_hash` is globally unique (0009), so the token alone
 * identifies one link. Returns the wedding's canonical slug.
 */
export async function resolveShareToken(
  token: string
): Promise<ResolvedShareLink | null> {
  if (!token) return null;

  const hash = await hashGuestToken(token);
  const svc = createSupabaseServiceClient();

  const { data, error } = await svc
    .from("share_links")
    .select("id, wedding_id, weddings!inner(slug)")
    .eq("token_hash", hash)
    .maybeSingle<{
      id: string;
      wedding_id: string;
      weddings: { slug: string };
    }>();

  if (error || !data) return null;
  return {
    shareLinkId: data.id,
    weddingId: data.wedding_id,
    slug: data.weddings.slug,
  };
}
