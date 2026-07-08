"use server";

import { revalidatePath } from "next/cache";
import { createEventSchema, updateEventSchema } from "../schema";
import { createEvent, deleteEvent, updateEvent } from "./mutations";

export type EventFormState = { error?: string; saved?: boolean };

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    eventDate: formData.get("eventDate"),
    startTime: formData.get("startTime"),
    venueName: formData.get("venueName"),
    venueAddress: formData.get("venueAddress"),
    mapsUrl: formData.get("mapsUrl"),
    description: formData.get("description"),
  };
}

export async function createEventAction(
  weddingId: string,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = createEventSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    await createEvent(weddingId, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not add the event." };
  }
  revalidatePath(`/weddings/${weddingId}/events`);
  return { saved: true };
}

export async function updateEventAction(
  id: string,
  weddingId: string,
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = updateEventSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  try {
    await updateEvent(id, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save changes." };
  }
  revalidatePath(`/weddings/${weddingId}/events`);
  return { saved: true };
}

export async function deleteEventAction(
  id: string,
  weddingId: string
): Promise<void> {
  await deleteEvent(id);
  revalidatePath(`/weddings/${weddingId}/events`);
}
