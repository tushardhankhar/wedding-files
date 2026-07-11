import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { GroupDetail, ShareLinkDetail } from "../types";

interface GroupRow {
  id: string;
  name: string;
  created_at: string;
  invite_token_hash: string | null;
  guests:
    | { id: string; name: string; is_primary: boolean; phone: string | null }[]
    | null;
  group_event_invites: { event_id: string }[] | null;
}

/**
 * Lists a wedding's guest groups with their members and invited-event ids.
 * RLS scopes to manageable weddings.
 */
export async function listGroups(weddingId: string): Promise<GroupDetail[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("guest_groups")
    .select(
      "id, name, created_at, invite_token_hash, guests(id, name, is_primary, phone), group_event_invites(event_id)"
    )
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data as GroupRow[]).map((g) => ({
    id: g.id,
    name: g.name,
    guests: (g.guests ?? [])
      .map((x) => ({
        id: x.id,
        name: x.name,
        isPrimary: x.is_primary,
        phone: x.phone,
      }))
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)),
    invitedEventIds: (g.group_event_invites ?? []).map((i) => i.event_id),
    hasInvite: g.invite_token_hash != null,
  }));
}

interface ShareLinkRow {
  id: string;
  label: string;
  all_events: boolean;
  token: string | null;
  created_at: string;
  share_link_events: { event_id: string }[] | null;
}

/** Lists a wedding's broadcast/share links with their scoped event ids. */
export async function listShareLinks(
  weddingId: string
): Promise<ShareLinkDetail[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("share_links")
    .select(
      "id, label, all_events, token, created_at, share_link_events(event_id)"
    )
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as ShareLinkRow[]).map((s) => ({
    id: s.id,
    label: s.label,
    allEvents: s.all_events,
    eventIds: (s.share_link_events ?? []).map((e) => e.event_id),
    token: s.token,
  }));
}
