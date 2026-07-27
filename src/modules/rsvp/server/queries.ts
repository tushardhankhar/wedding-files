import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface EventRsvps {
  /** Families coming to this event, with how many heads each is bringing. */
  attending: { name: string; partySize: number }[];
  /** Families who declined this event. */
  declined: { name: string }[];
}

interface GroupRsvpJoin {
  event_id: string;
  attending: boolean;
  party_size: number;
  guest_groups: { name: string };
}

/**
 * Group (personal-invite) responses for a wedding, grouped by event id. Each
 * family submits one headcount per event, so this lists families + heads rather
 * than individual guests. RLS scopes to weddings the current manager owns.
 */
export async function listWeddingRsvps(
  weddingId: string
): Promise<Record<string, EventRsvps>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("group_rsvps")
    .select(
      "event_id, attending, party_size, guest_groups!inner(name), events!inner(wedding_id)"
    )
    .eq("events.wedding_id", weddingId);

  if (error) throw error;

  const byEvent: Record<string, EventRsvps> = {};
  for (const r of (data as unknown as GroupRsvpJoin[]) ?? []) {
    const bucket = (byEvent[r.event_id] ??= { attending: [], declined: [] });
    if (r.attending) {
      bucket.attending.push({ name: r.guest_groups.name, partySize: r.party_size });
    } else {
      bucket.declined.push({ name: r.guest_groups.name });
    }
  }
  return byEvent;
}

export interface DirectRsvp {
  name: string;
  partySize: number;
}

/** Self-RSVP (broadcast link) responses, grouped by event id. */
export async function listShareRsvps(
  weddingId: string
): Promise<Record<string, DirectRsvp[]>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("share_rsvps")
    .select("event_id, name, party_size")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byEvent: Record<string, DirectRsvp[]> = {};
  for (const r of (data ?? []) as {
    event_id: string;
    name: string;
    party_size: number;
  }[]) {
    (byEvent[r.event_id] ??= []).push({ name: r.name, partySize: r.party_size });
  }
  return byEvent;
}
