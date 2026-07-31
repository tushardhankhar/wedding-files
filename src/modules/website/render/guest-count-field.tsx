"use client";

import { useState } from "react";

/** The headcount range every RSVP form (and both server actions) agrees on. */
export const MIN_PARTY = 1;
export const MAX_PARTY = 50;

/** Snap any half-typed number back into the range we actually store. */
export function clampParty(n: number): number {
  if (!Number.isFinite(n)) return MIN_PARTY;
  return Math.min(MAX_PARTY, Math.max(MIN_PARTY, Math.floor(n)));
}

/**
 * The guest-count field, shared by every theme's RSVP form.
 *
 * A bare `<input type="number">` can't be trusted here. Clearing the box — the
 * natural way to replace a number on a phone — fires `onChange` with `""`, and
 * `Number("")` is `0`; a zero used to read as "not attending", which unmounted
 * the field mid-typing, closed the keyboard and flipped the answer to declined.
 *
 * So the in-progress text lives here, locally, and the committed number only
 * moves when the guest has actually typed one: they can empty the box, pause,
 * and carry on. Blur settles anything left half-finished back into range, so a
 * form can never submit a zero or a 900-person party.
 */
export function GuestCountField({
  value,
  onChange,
  className,
  style,
  id,
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  ariaLabel?: string;
}) {
  // null → mirror `value`. A string → the guest is mid-edit; show their text.
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <input
      id={id}
      aria-label={ariaLabel}
      type="number"
      inputMode="numeric"
      min={MIN_PARTY}
      max={MAX_PARTY}
      value={draft ?? String(value)}
      className={className}
      style={style}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        // An empty or unparseable box is a moment in the middle of typing, not
        // an answer — leave the stored count (and the attending choice) alone.
        if (raw.trim() === "") return;
        const n = Number(raw);
        if (Number.isFinite(n)) onChange(clampParty(n));
      }}
      onBlur={() => {
        onChange(clampParty(draft == null ? value : Number(draft)));
        setDraft(null);
      }}
    />
  );
}
