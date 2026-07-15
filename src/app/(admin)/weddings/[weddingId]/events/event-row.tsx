"use client";

import { useState, useTransition } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import {
  updateEventAction,
  deleteEventAction,
} from "@/modules/events/server/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventForm } from "./event-form";

function formatWhen(dateIso: string | null, time: string | null): string {
  if (!dateIso) return "Date to be decided";
  const d = new Date(`${dateIso}T00:00:00`);
  const date = d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!time) return date;
  const [h, m] = time.split(":");
  const t = new Date();
  t.setHours(Number(h), Number(m));
  return `${date} · ${t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

export function EventRow({
  event,
  weddingId,
}: {
  event: WeddingEvent;
  weddingId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm(`Delete "${event.name}"? This can't be undone.`)) return;
    startTransition(() => {
      void deleteEventAction(event.id, weddingId);
    });
  }

  if (editing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EventForm
            action={updateEventAction.bind(null, event.id, weddingId)}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            values={event}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gradient-to-b before:from-[color:var(--gold)] before:to-[color:var(--gold-deep)]">
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-semibold">{event.name}</h3>
          <p className="text-sm tabular-nums text-muted-foreground">
            {formatWhen(event.eventDate, event.startTime)}
          </p>
          {event.venueName || event.venueAddress ? (
            <p className="mt-1 text-sm text-foreground/80">
              {[event.venueName, event.venueAddress]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
          {event.mapsUrl ? (
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Directions →
            </a>
          ) : null}
          {event.description ? (
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
              {event.description}
            </p>
          ) : null}
          {event.hostedByEnabled && event.hostedBy ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Hosted by {event.hostedBy}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={pending}
          >
            {pending ? "…" : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
