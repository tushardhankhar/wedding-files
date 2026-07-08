"use client";

import { useActionState } from "react";
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
  eventDate?: string | null;
  startTime?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  mapsUrl?: string | null;
  description?: string | null;
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

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Event name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={values?.name ?? ""}
          placeholder="e.g. Mehendi"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Date</Label>
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            defaultValue={values?.eventDate ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start time</Label>
          <Input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={values?.startTime?.slice(0, 5) ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venueName">Venue name</Label>
        <Input
          id="venueName"
          name="venueName"
          maxLength={160}
          defaultValue={values?.venueName ?? ""}
          placeholder="e.g. The Leela Palace"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="venueAddress">Venue address</Label>
        <Input
          id="venueAddress"
          name="venueAddress"
          maxLength={300}
          defaultValue={values?.venueAddress ?? ""}
          placeholder="Street, city"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mapsUrl">Google Maps link</Label>
        <Input
          id="mapsUrl"
          name="mapsUrl"
          type="url"
          defaultValue={values?.mapsUrl ?? ""}
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
          defaultValue={values?.description ?? ""}
          placeholder="Dress code, notes for guests, timings…"
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
