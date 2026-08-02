import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { hashGuestToken } from "../tokens";

export interface ResolvedInvite {
  groupId: string;
  weddingId: string;
  /** The wedding's CURRENT slug — the canonical URL to send the guest to. */
  slug: string;
}

/**
 * Verifies an invitation token. Uses the service-role client because guests are
 * not Supabase-authenticated — the authorization IS the explicit lookup here:
 * hash the token, find the one group carrying that hash. Returns null on any
 * mismatch.
 *
 * Deliberately does NOT take the slug from the URL. `invite_token_hash` has a
 * GLOBALLY UNIQUE index (0006), so the token alone already identifies exactly
 * one group across every tenant — requiring the slug to match added no
 * security, only a way for a wedding rename to kill every invitation ever sent.
 * The slug in the URL is cosmetic; the canonical one is returned from here.
 */
export async function resolveInviteToken(
  token: string
): Promise<ResolvedInvite | null> {
  if (!token) return null;

  const hash = await hashGuestToken(token);
  const svc = createSupabaseServiceClient();

  const { data, error } = await svc
    .from("guest_groups")
    .select("id, wedding_id, weddings!inner(slug)")
    .eq("invite_token_hash", hash)
    .maybeSingle<{
      id: string;
      wedding_id: string;
      weddings: { slug: string };
    }>();

  if (error || !data) return null;
  return {
    groupId: data.id,
    weddingId: data.wedding_id,
    slug: data.weddings.slug,
  };
}
