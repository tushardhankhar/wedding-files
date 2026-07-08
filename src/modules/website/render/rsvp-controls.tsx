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
  const [, startTransition] = useTransition();

  function choose(guestId: string, status: RsvpStatus) {
    setState((prev) => ({ ...prev, [guestId]: status }));
    startTransition(() => {
      void submitRsvpAction(slug, eventId, guestId, status);
    });
  }

  if (guests.length === 0) return null;

  return (
    <div className="rsvp-list">
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
