"use client";

import { useState, useTransition } from "react";
import {
  submitRsvpAction,
  type RsvpStatus,
} from "@/modules/guest-access/server/rsvp";
import { TT } from "./bilingual";

export interface RsvpData {
  slug: string;
  guests: { id: string; name: string }[];
  // eventId -> guestId -> status
  statuses: Record<string, Record<string, RsvpStatus>>;
}

/** Per-guest attending/declined toggles for one event. Optimistic. */
export function RsvpControls({
  slug,
  eventId,
  guests,
  initial,
}: {
  slug: string;
  eventId: string;
  guests: { id: string; name: string }[];
  initial: Record<string, RsvpStatus>;
}) {
  const [state, setState] = useState<Record<string, RsvpStatus>>(initial);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function choose(guestId: string, status: RsvpStatus) {
    const previous = state[guestId];
    setState((prev) => ({ ...prev, [guestId]: status }));
    setError(null);
    startTransition(async () => {
      const res = await submitRsvpAction(slug, eventId, guestId, status);
      if (res?.error) {
        // Revert the optimistic change and show why it failed.
        setState((prev) => {
          const next = { ...prev };
          if (previous) next[guestId] = previous;
          else delete next[guestId];
          return next;
        });
        setError(res.error);
      }
    });
  }

  if (guests.length === 0) return null;

  return (
    <div className="rsvp-list">
      {error ? (
        <p className="text-note" role="alert" style={{ color: "#a3453f" }}>
          {error}
        </p>
      ) : null}
      {guests.map((g) => (
        <div className="rsvp-member" key={g.id}>
          <span>{g.name}</span>
          <div className="rsvp">
            <button
              type="button"
              className={`yes ${state[g.id] === "attending" ? "on" : ""}`}
              onClick={() => choose(g.id, "attending")}
            >
              <TT en="Going" hi="आ रहे" />
            </button>
            <button
              type="button"
              className={`no ${state[g.id] === "declined" ? "on" : ""}`}
              onClick={() => choose(g.id, "declined")}
            >
              <TT en="No" hi="नहीं" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
