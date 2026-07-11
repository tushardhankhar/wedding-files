"use client";

import { useActionState, useState } from "react";
import type { EventFormState } from "@/modules/events/server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EventAction = (
  prev: EventFormState,
  formData: FormData
) => Promise<EventFormState>;

export interface EventFormValues {
  name?: string | null;
  nameHi?: string | null;
  eventDate?: string | null;
  startTime?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  mapsUrl?: string | null;
  description?: string | null;
  descriptionHi?: string | null;
}

const initialState: EventFormState = {};

export function EventForm({
  action,
  values,
  submitLabel,
  onCancel,
}: {
  action: EventAction;
  values?: EventFormValues;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  // Controlled — a post-save revalidate re-renders with the saved values, which
  // would trip Base UI's "uncontrolled defaultValue changed" warning otherwise.
  const [name, setName] = useState(values?.name ?? "");
  const [nameHi, setNameHi] = useState(values?.nameHi ?? "");
  const [eventDate, setEventDate] = useState(values?.eventDate ?? "");
  const [startTime, setStartTime] = useState(values?.startTime?.slice(0, 5) ?? "");
  const [venueName, setVenueName] = useState(values?.venueName ?? "");
  const [venueAddress, setVenueAddress] = useState(values?.venueAddress ?? "");
  const [mapsUrl, setMapsUrl] = useState(values?.mapsUrl ?? "");
  const [description, setDescription] = useState(values?.description ?? "");
  const [descriptionHi, setDescriptionHi] = useState(values?.descriptionHi ?? "");

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Event name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mehendi"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameHi">Event name (Hindi)</Label>
          <Input
            id="nameHi"
            name="nameHi"
            maxLength={120}
            value={nameHi}
            onChange={(e) => setNameHi(e.target.value)}
            placeholder="जैसे मेहंदी"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Date</Label>
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venueName">Venue name</Label>
        <Input
          id="venueName"
          name="venueName"
          maxLength={160}
          value={venueName}
          onChange={(e) => setVenueName(e.target.value)}
          placeholder="e.g. The Leela Palace"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="venueAddress">Venue address</Label>
        <Input
          id="venueAddress"
          name="venueAddress"
          maxLength={300}
          value={venueAddress}
          onChange={(e) => setVenueAddress(e.target.value)}
          placeholder="Street, city"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mapsUrl">Google Maps link</Label>
        <Input
          id="mapsUrl"
          name="mapsUrl"
          type="url"
          value={mapsUrl}
          onChange={(e) => setMapsUrl(e.target.value)}
          placeholder="https://maps.google.com/…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Details</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dress code, notes for guests, timings…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionHi">Details (Hindi)</Label>
        <Textarea
          id="descriptionHi"
          name="descriptionHi"
          rows={3}
          maxLength={2000}
          value={descriptionHi}
          onChange={(e) => setDescriptionHi(e.target.value)}
          placeholder="ड्रेस कोड, मेहमानों के लिए जानकारी…"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
