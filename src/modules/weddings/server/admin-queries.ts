import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/modules/auth/server/user";

export type InviteStatus =
  | "active"
  | "pending"
  | "expired"
  | "accepted"
  | "none";

export type WeddingAdminMeta = {
  clientEmail: string | null;
  invitedEmail: string | null;
  inviteStatus: InviteStatus;
  inviteExpiresAt: string | null;
};

type AdminInviteRow = {
  wedding_id: string;
  client_email: string | null;
  invited_email: string | null;
  invite_status: InviteStatus;
  invite_expires_at: string | null;
};

/**
 * Admin-only: per-wedding owning email + invite status/expiry, keyed by
 * wedding id. Backed by the is_admin()-gated `admin_invite_status` RPC (no
 * service-role). Returns an empty map for non-admins. Pass a weddingId to scope
 * to one wedding.
 */
export async function getAdminInviteStatus(
  weddingId?: string
): Promise<Map<string, WeddingAdminMeta>> {
  const map = new Map<string, WeddingAdminMeta>();
  if (!(await isCurrentUserAdmin())) return map;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc(
    "admin_invite_status",
    weddingId ? { p_wedding_id: weddingId } : {}
  );
  if (error || !data) return map;

  for (const r of data as AdminInviteRow[]) {
    map.set(r.wedding_id, {
      clientEmail: r.client_email,
      invitedEmail: r.invited_email,
      inviteStatus: r.invite_status,
      inviteExpiresAt: r.invite_expires_at,
    });
  }
  return map;
}
