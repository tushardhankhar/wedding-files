import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapEventRow, type EventRow, type WeddingEvent } from "../types";
import type { CreateEventInput, UpdateEventInput } from "../schema";

const COLUMNS =
  "id, wedding_id, name, name_hi, event_date, start_time, venue_name, venue_address, maps_url, description, description_hi, hosted_by, hosted_by_enabled, sort_order, created_at, updated_at";

function toRow(input: CreateEventInput | UpdateEventInput) {
  return {
    name: input.name,
    name_hi: input.nameHi ?? null,
    event_date: input.eventDate ?? null,
    start_time: input.startTime ?? null,
    venue_name: input.venueName ?? null,
    venue_address: input.venueAddress ?? null,
    maps_url: input.mapsUrl ?? null,
    description: input.description ?? null,
    description_hi: input.descriptionHi ?? null,
    hosted_by: input.hostedBy ?? null,
    hosted_by_enabled: input.hostedByEnabled,
  };
}

/** Creates an event under a wedding. RLS confirms the wedding is manageable. */
export async function createEvent(
  weddingId: string,
  input: CreateEventInput
): Promise<WeddingEvent> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .insert({ wedding_id: weddingId, ...toRow(input) })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return mapEventRow(data as EventRow);
}

/** Updates an event (RLS-scoped by its wedding). */
export async function updateEvent(
  id: string,
  input: UpdateEventInput
): Promise<WeddingEvent> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .update(toRow(input))
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return mapEventRow(data as EventRow);
}

/** Deletes an event (RLS-scoped by its wedding). */
export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
