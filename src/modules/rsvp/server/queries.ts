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
