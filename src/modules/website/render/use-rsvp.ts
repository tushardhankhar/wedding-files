"use client";

import { useState, useTransition } from "react";
import {
  submitGroupRsvpAction,
  type ExistingGroupRsvp,
} from "@/modules/guest-access/server/group-rsvp";
import {
  submitShareRsvpAction,
  type ExistingSelfRsvp,
} from "@/modules/guest-access/server/share-rsvp";

export type { ExistingGroupRsvp, ExistingSelfRsvp };

/**
 * Headless RSVP state machines shared by every theme. They own the optimistic
 * state + the (secure, session-re-checked) server-action calls; each theme
 * renders its own visual controls on top. Behaviour is shared; presentation is
 * not.
 */

/** Per-event answer in a group's headcount RSVP. */
export interface GroupEntryState {
  attending: boolean;
  partySize: number;
}

/** The `rsvp` prop for a personal-invite (group) site. */
export interface GroupRsvpData {
  slug: string;
  events: { id: string; name: string }[];
  /** The family's saved RSVP (shared across the whole group), or {} if none. */
  existing: ExistingGroupRsvp;
}

/**
 * Group (personal-invite) RSVP: a per-event headcount for the whole family,
 * keyed on the group. Everyone who opens the invite link edits the SAME record,
 * so a returning family sees a confirmation with an Edit button instead of a
 * blank form; the write itself is idempotent (upsert keyed by the group).
 */
export function useGroupRsvp(
  slug: string,
  events: { id: string; name: string }[],
  existing: ExistingGroupRsvp,
  onSaved?: () => void
) {
  const hasExisting = Object.keys(existing).length > 0;

  const [entries, setEntries] = useState<Record<string, GroupEntryState>>(() => {
    const m: Record<string, GroupEntryState> = {};
    for (const e of events) {
      const ex = existing[e.id];
      m[e.id] = ex
        ? { attending: ex.attending, partySize: ex.partySize }
        : { attending: true, partySize: 1 };
    }
    return m;
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(hasExisting);
  const [editing, setEditing] = useState(!hasExisting);
  const [pending, start] = useTransition();

  function setAttending(eventId: string, attending: boolean) {
    setEntries((m) => ({
      ...m,
      [eventId]: {
        attending,
        partySize: attending ? Math.max(1, m[eventId]?.partySize || 1) : 0,
      },
    }));
  }

  function setSize(eventId: string, n: number) {
    const size = Number.isFinite(n) ? Math.floor(n) : 0;
    setEntries((m) => ({
      ...m,
      [eventId]: { attending: size > 0, partySize: Math.max(0, size) },
    }));
  }

  function submit() {
    setError(null);
    const payload = events.map((e) => ({
      eventId: e.id,
      attending: entries[e.id]?.attending ?? false,
      partySize: entries[e.id]?.partySize ?? 0,
    }));
    start(async () => {
      const res = await submitGroupRsvpAction(slug, payload);
      if (res?.error) setError(res.error);
      else {
        setSaved(true);
        setEditing(false);
        onSaved?.();
      }
    });
  }

  function edit() {
    setError(null);
    setEditing(true);
  }

  /** Total heads across all attending events — for the confirmation summary. */
  const totalAttending = events.reduce(
    (n, e) => n + (entries[e.id]?.attending ? entries[e.id].partySize : 0),
    0
  );

  return {
    entries,
    setAttending,
    setSize,
    error,
    pending,
    saved,
    editing,
    /** True once saved and the form is closed → show the confirmation panel. */
    done: saved && !editing,
    totalAttending,
    submit,
    edit,
  };
}

/**
 * Broadcast self-RSVP state machine: submit once, then edit — never a second
 * new RSVP. Seeds from the respondent's `existing` saved RSVP (loaded server
 * side) so a returning guest sees a confirmation with an Edit button; the write
 * itself is idempotent (upsert keyed by the session respondent), so this is the
 * presentational half of that guarantee.
 */
export function useSelfRsvp(
  slug: string,
  eventIds: string[],
  existing?: ExistingSelfRsvp | null
) {
  const [name, setName] = useState(existing?.name ?? "");
  const [size, setSize] = useState(existing?.partySize ?? 1);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(existing?.eventIds ?? eventIds)
  );
  const [error, setError] = useState<string | null>(null);
  // What's on record for this respondent (drives the confirmation panel).
  const [savedRsvp, setSavedRsvp] = useState<ExistingSelfRsvp | null>(
    existing ?? null
  );
  // Is the form open? Closed when a saved RSVP exists until the guest edits.
  const [editing, setEditing] = useState(existing == null);
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
    const ids = [...selected];
    start(async () => {
      const res = await submitShareRsvpAction(slug, name, size, ids);
      if (res?.error) {
        setError(res.error);
      } else {
        setSavedRsvp({ name: name.trim(), partySize: size, eventIds: ids });
        setEditing(false);
      }
    });
  }

  function edit() {
    setError(null);
    setEditing(true);
  }

  return {
    name,
    setName,
    size,
    setSize,
    selected,
    toggle,
    error,
    pending,
    /** True while the form is shown (no saved RSVP yet, or the guest is editing). */
    editing,
    /** The RSVP currently on record, or null — powers the confirmation panel. */
    savedRsvp,
    /** True once a response is saved and the form is closed. */
    done: savedRsvp != null && !editing,
    submit,
    edit,
  };
}
