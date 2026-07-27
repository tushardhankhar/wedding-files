"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { readGuestSession } from "./session";

export type GroupRsvpResult = { ok?: boolean; error?: string };

/** One event's answer in a group's headcount RSVP. */
export interface GroupRsvpEntry {
  eventId: string;
  attending: boolean;
  /** Heads attending when `attending`; ignored (stored as 0) otherwise. */
  partySize: number;
}

/** A group's saved RSVP: eventId → { attending, partySize }. */
export type ExistingGroupRsvp = Record<
  string,
  { attending: boolean; partySize: number }
>;

const MAX_PARTY = 50;

/**
 * Records a GROUP's headcount RSVP — one row per invited event, keyed on the
 * session's `groupId`. Because every family member opens the same invite link
 * (same group session), they all edit the same shared record. Re-resolves the
 * session, keeps only events the group is actually invited to, then upserts on
 * (group_id, event_id) so re-submits edit rather than duplicate (a UNIQUE index
 * and a DB trigger back this up).
 */
export async function submitGroupRsvpAction(
  slug: string,
  entries: GroupRsvpEntry[]
): Promise<GroupRsvpResult> {
  const session = await readGuestSession();
  if (!session || session.kind !== "group" || session.slug !== slug) {
    return { error: "Your session has expired — please reopen your invite link." };
  }

  const svc = createSupabaseServiceClient();

  // The events this group is actually invited to = the allowed scope.
  const { data: invites } = await svc
    .from("group_event_invites")
    .select("event_id")
    .eq("group_id", session.groupId);
  const allowed = new Set((invites ?? []).map((r) => r.event_id));

  const rows = entries
    .filter((e) => allowed.has(e.eventId))
    .map((e) => {
      const attending = Boolean(e.attending);
      const size = attending
        ? Math.min(MAX_PARTY, Math.max(1, Math.floor(e.partySize) || 1))
        : 0;
      return {
        group_id: session.groupId,
        event_id: e.eventId,
        attending,
        party_size: size,
      };
    });
  if (rows.length === 0) {
    return { error: "Please respond to at least one event." };
  }

  const { error } = await svc
    .from("group_rsvps")
    .upsert(rows, { onConflict: "group_id,event_id" });
  if (error) {
    return { error: `Could not save your RSVP: ${error.message}` };
  }

  revalidatePath(`/w/${slug}`);
  return { ok: true };
}
