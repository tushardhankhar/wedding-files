"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { readGuestSession } from "./session";

export type ShareRsvpResult = { ok?: boolean; error?: string };

/** A broadcast respondent's saved self-RSVP, loaded back to prefill an edit. */
export interface ExistingSelfRsvp {
  name: string;
  partySize: number;
  eventIds: string[];
}

const MAX_PARTY = 50;

/**
 * Self-RSVP from a broadcast link: the guest supplies a name + party size and
 * the events they'll attend. Re-resolves the share session, confirms each event
 * is within the link's scope, then writes ONE record per respondent per event.
 *
 * Idempotent by design: keyed on the session's stable `respondentId`, it upserts
 * the selected events and removes any the respondent de-selected. Submitting
 * again — or a double-click / refresh / retry — edits the same record instead of
 * creating duplicates (a UNIQUE (respondent_id, event_id) index backs this up).
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
  if (!Number.isFinite(size) || size < 1 || size > MAX_PARTY) {
    return { error: `Enter how many are coming (1–${MAX_PARTY}).` };
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

  const selected = [...new Set(eventIds)].filter((id) => allowed.has(id));
  if (selected.length === 0) return { error: "Not authorized for those events." };

  // Upsert the selected events for this respondent — idempotent on re-submit.
  const rows = selected.map((event_id) => ({
    wedding_id: link.wedding_id,
    share_link_id: link.id,
    event_id,
    respondent_id: session.respondentId,
    name: cleanName,
    party_size: size,
  }));
  const { error: upsertError } = await svc
    .from("share_rsvps")
    .upsert(rows, { onConflict: "respondent_id,event_id" });
  if (upsertError) {
    return { error: `Could not save your RSVP: ${upsertError.message}` };
  }

  // Editing down: drop any events this respondent previously chose but no longer.
  const { error: deleteError } = await svc
    .from("share_rsvps")
    .delete()
    .eq("respondent_id", session.respondentId)
    .not("event_id", "in", `(${selected.join(",")})`);
  if (deleteError) {
    return { error: `Could not update your RSVP: ${deleteError.message}` };
  }

  revalidatePath(`/w/${slug}`);
  return { ok: true };
}
