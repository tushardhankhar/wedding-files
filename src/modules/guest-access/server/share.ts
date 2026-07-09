import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { sha256Hex } from "@/lib/crypto";

/**
 * Verifies a shareable-link token for a wedding slug. Service-role client
 * (guests are unauthenticated); the authorization is the explicit hash + slug
 * match. Returns null on mismatch.
 */
export async function resolveShareToken(
  slug: string,
  token: string
): Promise<{ shareLinkId: string; weddingId: string } | null> {
  if (!token || !slug) return null;

  const hash = await sha256Hex(token);
  const svc = createSupabaseServiceClient();

  const { data, error } = await svc
    .from("share_links")
    .select("id, wedding_id, weddings!inner(slug)")
    .eq("token_hash", hash)
    .eq("weddings.slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return { shareLinkId: data.id, weddingId: data.wedding_id };
}
