"use server";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { readGuestSession } from "./session";

export type ShareRsvpResult = { ok?: boolean; error?: string };

/**
 * Self-RSVP from a broadcast link: the guest supplies a name + party size and
 * the events they'll attend. Re-resolves the share session, confirms each event
 * is within the link's scope, then records one row per attended event.
 */
export async function submitShareRsvpAction(
  slug: string,
  name: string,
  partySize: number,
  eventIds: string[]
): Promise<ShareRsvpResult> {
  const cleanName = name.trim();
  if (cleanName.length === 0) return { error: "Please enter your name." };
  if (cleanName.length > 120) return { error: "Name is too long." };

  const size = Math.floor(partySize);
  if (!Number.isFinite(size) || size < 1 || size > 50) {
    return { error: "Enter how many are coming (1–50)." };
  }
  if (eventIds.length === 0) {
    return { error: "Select at least one event you'll attend." };
  }

  const session = await readGuestSession();
  if (!session || session.kind !== "share" || session.slug !== slug) {
    return { error: "Your session has expired — please reopen the link." };
  }

  const svc = createSupabaseServiceClient();

  // Which events are actually in this link's scope?
  const { data: link } = await svc
    .from("share_links")
    .select("id, all_events, wedding_id")
    .eq("id", session.shareLinkId)
    .maybeSingle<{ id: string; all_events: boolean; wedding_id: string }>();
  if (!link) return { error: "Not authorized." };

  let allowed: Set<string>;
  if (link.all_events) {
    const { data } = await svc
      .from("events")
      .select("id")
      .eq("wedding_id", link.wedding_id);
    allowed = new Set((data ?? []).map((e) => e.id));
  } else {
    const { data } = await svc
      .from("share_link_events")
      .select("event_id")
      .eq("share_link_id", link.id);
    allowed = new Set((data ?? []).map((e) => e.event_id));
  }

  const rows = eventIds
    .filter((id) => allowed.has(id))
    .map((event_id) => ({
      wedding_id: link.wedding_id,
      event_id,
      name: cleanName,
      party_size: size,
    }));
  if (rows.length === 0) return { error: "Not authorized for those events." };

  const { error } = await svc.from("share_rsvps").insert(rows);
  if (error) return { error: `Could not save your RSVP: ${error.message}` };

  return { ok: true };
}
