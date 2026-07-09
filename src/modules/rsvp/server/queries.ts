import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface EventRsvps {
  attending: { id: string; name: string }[];
  declined: { id: string; name: string }[];
}

interface RsvpJoin {
  event_id: string;
  status: "attending" | "declined";
  guests: { id: string; name: string };
}

/**
 * Responses for a wedding, grouped by event id. RLS (`can_manage_event`) scopes
 * to weddings the current admin/client manages.
 */
export async function listWeddingRsvps(
  weddingId: string
): Promise<Record<string, EventRsvps>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("rsvps")
    .select("event_id, status, guests!inner(id, name), events!inner(wedding_id)")
    .eq("events.wedding_id", weddingId);

  if (error) throw error;

  const byEvent: Record<string, EventRsvps> = {};
  for (const r of (data as unknown as RsvpJoin[]) ?? []) {
    const bucket = (byEvent[r.event_id] ??= { attending: [], declined: [] });
    bucket[r.status].push({ id: r.guests.id, name: r.guests.name });
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
