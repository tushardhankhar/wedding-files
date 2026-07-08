import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { sha256Hex } from "@/lib/crypto";

/**
 * Verifies an invitation token for a given wedding slug. Uses the service-role
 * client because guests are not Supabase-authenticated — the authorization IS
 * the explicit lookup here: hash the token, match a group whose wedding has this
 * exact slug. Returns null on any mismatch.
 */
export async function resolveInviteToken(
  slug: string,
  token: string
): Promise<{ groupId: string; weddingId: string } | null> {
  if (!token || !slug) return null;

  const hash = await sha256Hex(token);
  const svc = createSupabaseServiceClient();

  const { data, error } = await svc
    .from("guest_groups")
    .select("id, wedding_id, weddings!inner(slug)")
    .eq("invite_token_hash", hash)
    .eq("weddings.slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return { groupId: data.id, weddingId: data.wedding_id };
}
