"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { readGuestSession } from "./session";

export type RsvpStatus = "attending" | "declined";
export type RsvpResult = { ok?: boolean; error?: string };

/**
 * Records one guest's RSVP to one event. Re-resolves the guest session server
 * side (never trusts client ids beyond re-checking them), confirms the guest
 * belongs to the session's group AND the group is invited to the event, then
 * upserts via the service-role client. The DB trigger enforces the same rules.
 */
export async function submitRsvpAction(
  slug: string,
  eventId: string,
  guestId: string,
  status: RsvpStatus
): Promise<RsvpResult> {
  if (status !== "attending" && status !== "declined") {
    return { error: "Invalid response." };
  }

  const session = await readGuestSession();
  if (!session || session.kind !== "group" || session.slug !== slug) {
    return { error: "Your session has expired — please reopen your invite link." };
  }

  const svc = createSupabaseServiceClient();

  // The guest must be a member of the session's group.
  const { data: guest } = await svc
    .from("guests")
    .select("id")
    .eq("id", guestId)
    .eq("group_id", session.groupId)
    .maybeSingle();
  if (!guest) return { error: "Not authorized." };

  // The group must be invited to the event.
  const { data: invite } = await svc
    .from("group_event_invites")
    .select("event_id")
    .eq("group_id", session.groupId)
    .eq("event_id", eventId)
    .maybeSingle();
  if (!invite) return { error: "Not authorized for this event." };

  const { error } = await svc
    .from("rsvps")
    .upsert(
      { guest_id: guestId, event_id: eventId, status },
      { onConflict: "guest_id,event_id" }
    );
  if (error) {
    return { error: `Could not save your RSVP: ${error.message}` };
  }

  revalidatePath(`/w/${slug}`);
  return { ok: true };
}
