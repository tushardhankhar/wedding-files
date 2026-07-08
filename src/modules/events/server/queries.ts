import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapEventRow, type EventRow, type WeddingEvent } from "../types";

const COLUMNS =
  "id, wedding_id, name, name_hi, event_date, start_time, venue_name, venue_address, maps_url, description, description_hi, sort_order, created_at, updated_at";

/**
 * Lists a wedding's events in timeline order. RLS (`can_manage_wedding`) ensures
 * only events of an accessible wedding are returned.
 */
export async function listEvents(weddingId: string): Promise<WeddingEvent[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select(COLUMNS)
    .eq("wedding_id", weddingId)
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("start_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as EventRow[]).map(mapEventRow);
}
