"use client";

import { useState, useTransition } from "react";
import {
  submitRsvpAction,
  type RsvpStatus,
} from "@/modules/guest-access/server/rsvp";
import { submitShareRsvpAction } from "@/modules/guest-access/server/share-rsvp";

/**
 * Headless RSVP state machines shared by every theme. They own the optimistic
 * state + the (secure, session-re-checked) server-action calls; each theme
 * renders its own visual controls on top. Behaviour is shared; presentation is
 * not.
 */

export type { RsvpStatus };

export function useGroupRsvp(
  slug: string,
  initial: Record<string, Record<string, RsvpStatus>>
) {
  const [state, setState] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [, start] = useTransition();

  function choose(eventId: string, guestId: string, status: RsvpStatus) {
    const prev = state[eventId]?.[guestId];
    setState((s) => ({ ...s, [eventId]: { ...s[eventId], [guestId]: status } }));
    setError(null);
    start(async () => {
      const res = await submitRsvpAction(slug, eventId, guestId, status);
      if (res?.error) {
        setState((s) => {
          const ev = { ...s[eventId] };
          if (prev) ev[guestId] = prev;
          else delete ev[guestId];
          return { ...s, [eventId]: ev };
        });
        setError(res.error);
      } else {
        setSaved(true);
      }
    });
  }

  return { state, error, saved, choose };
}

export function useSelfRsvp(slug: string, eventIds: string[]) {
  const [name, setName] = useState("");
  const [size, setSize] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(eventIds));
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    setError(null);
    start(async () => {
      const res = await submitShareRsvpAction(slug, name, size, [...selected]);
      if (res?.error) setError(res.error);
      else setDone(true);
    });
  }

  return {
    name,
    setName,
    size,
    setSize,
    selected,
    toggle,
    error,
    done,
    pending,
    submit,
  };
}
