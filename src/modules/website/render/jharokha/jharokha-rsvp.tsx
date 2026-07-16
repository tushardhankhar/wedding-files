"use client";

import { useState, useTransition } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import {
  submitRsvpAction,
  type RsvpStatus,
} from "@/modules/guest-access/server/rsvp";
import { submitShareRsvpAction } from "@/modules/guest-access/server/share-rsvp";
import { TT } from "../bilingual";

/* A gold-edged ceremonial choice card (not a radio button). */
function Choice({
  selected,
  tone,
  onSelect,
  disabled,
  children,
}: {
  selected: boolean;
  tone: "attend" | "decline";
  onSelect?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const base =
    "flex-1 rounded-full border px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300";
  // Idle sits on the deep-maroon RSVP ground, so keep the label champagne-light
  // (maroon-on-maroon would be unreadable there).
  const idle =
    "border-[color:var(--jhr-gold)]/50 text-[color:var(--jhr-champagne)] hover:border-[color:var(--jhr-gold)] hover:text-[color:var(--jhr-gold-lite)]";
  const on =
    tone === "attend"
      ? "border-[color:var(--jhr-gold)] bg-gradient-to-r from-[color:var(--jhr-gold)] to-[color:var(--jhr-gold-lite)] text-[color:var(--jhr-maroon-2)]"
      : "border-[color:var(--jhr-rose-deep)] bg-[color:var(--jhr-rose-deep)] text-white";
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`${base} ${selected ? on : idle} ${disabled ? "cursor-default opacity-60" : ""}`}
    >
      {children}
    </button>
  );
}

function formatShort(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}

/** Confirmation shown once a response is recorded. */
export function BlessingConfirmation({
  familyName,
}: {
  familyName?: string;
}) {
  return (
    <div className="mt-12 text-center duration-700 animate-in fade-in">
      <p className="jhr-script text-5xl text-[color:var(--jhr-gold-deep)]">Dhanyavaad</p>
      <p className="jhr-serif mt-3 text-2xl text-[color:var(--jhr-maroon)]">
        <TT en="We await you" hi="हमें आपकी प्रतीक्षा है" />
        {familyName ? `, ${familyName}.` : "."}
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[color:var(--jhr-ink-soft)]">
        <TT en="Your response has been received" hi="आपका उत्तर प्राप्त हो गया है" />
      </p>
    </div>
  );
}

/* ── Group (personal invitation) RSVP ─────────────────────────────────────── */
export function JharokhaGroupRsvp({
  slug,
  events,
  guests,
  initial,
  onSaved,
}: {
  slug: string;
  events: WeddingEvent[];
  guests: { id: string; name: string }[];
  initial: Record<string, Record<string, RsvpStatus>>;
  onSaved: () => void;
}) {
  const [state, setState] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function choose(eventId: string, guestId: string, status: RsvpStatus) {
    const prev = state[eventId]?.[guestId];
    setState((s) => ({ ...s, [eventId]: { ...s[eventId], [guestId]: status } }));
    setError(null);
    startTransition(async () => {
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
        onSaved();
      }
    });
  }

  return (
    <div className="space-y-10">
      {error ? (
        <p className="text-center text-sm text-[color:var(--jhr-rose-deep)]" role="alert">
          {error}
        </p>
      ) : null}
      {events.map((e) => (
        <div key={e.id} className="jhr-card rounded-3xl px-6 py-7">
          <div className="text-center">
            <h3 className="jhr-serif text-2xl text-[color:var(--jhr-maroon)]">{e.name}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--jhr-gold-deep)]">
              {formatShort(e.eventDate)}
            </p>
          </div>
          <div className="mx-auto mt-6 max-w-xl space-y-3">
            {guests.map((g) => {
              const st = state[e.id]?.[g.id];
              return (
                <div key={g.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <span className="jhr-serif w-28 shrink-0 text-lg text-[color:var(--jhr-ink)]">
                    {g.name}
                  </span>
                  <div className="flex flex-1 gap-2">
                    <Choice tone="attend" selected={st === "attending"} onSelect={() => choose(e.id, g.id, "attending")}>
                      <TT en="Will attend" hi="पधारेंगे" />
                    </Choice>
                    <Choice tone="decline" selected={st === "declined"} onSelect={() => choose(e.id, g.id, "declined")}>
                      <TT en="Regretfully decline" hi="क्षमा करें" />
                    </Choice>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Broadcast (share link) self-RSVP ─────────────────────────────────────── */
export function JharokhaSelfRsvp({
  slug,
  events,
  onSaved,
}: {
  slug: string;
  events: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [size, setSize] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(events.map((e) => e.id)));
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

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
    startTransition(async () => {
      const res = await submitShareRsvpAction(slug, name, size, [...selected]);
      if (res?.error) setError(res.error);
      else {
        setDone(true);
        onSaved();
      }
    });
  }

  if (done) return <BlessingConfirmation familyName={name.trim() || undefined} />;

  const field =
    "w-full rounded-2xl border border-[color:var(--jhr-gold)]/40 bg-white/60 px-4 py-3 text-[color:var(--jhr-ink)] placeholder:text-[color:var(--jhr-ink-soft)]/60 focus:border-[color:var(--jhr-gold)] focus:outline-none";

  return (
    <div className="jhr-card mx-auto max-w-xl space-y-6 rounded-3xl px-6 py-8">
      {error ? (
        <p className="text-center text-sm text-[color:var(--jhr-rose-deep)]" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="jhr-name" className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[color:var(--jhr-gold-deep)]">
          <TT en="Your name" hi="आपका नाम" />
        </label>
        <input id="jhr-name" type="text" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Priya Sharma" />
      </div>
      <div>
        <label htmlFor="jhr-size" className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[color:var(--jhr-gold-deep)]">
          <TT en="Guests in your party" hi="आपके साथ कितने लोग" />
        </label>
        <input id="jhr-size" type="number" min={1} max={50} value={size} onChange={(e) => setSize(Number(e.target.value))} className={field} />
      </div>
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--jhr-gold-deep)]">
          <TT en="Celebrations you will attend" hi="आप किन आयोजनों में पधारेंगे" />
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {events.map((e) => (
            <Choice key={e.id} tone="attend" selected={selected.has(e.id)} onSelect={() => toggle(e.id)}>
              {e.name}
            </Choice>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="jhr-btn w-full justify-center disabled:opacity-60"
      >
        {pending ? "…" : <TT en="Send our response" hi="उत्तर भेजें" />}
      </button>
    </div>
  );
}

/* ── Demonstration state (owner preview / public demo) ────────────────────── */
export function JharokhaRsvpDemo({ events }: { events: WeddingEvent[] }) {
  return (
    <div className="space-y-8">
      {events.slice(0, 2).map((e) => (
        <div key={e.id} className="jhr-card rounded-3xl px-6 py-7">
          <div className="text-center">
            <h3 className="jhr-serif text-2xl text-[color:var(--jhr-maroon)]">{e.name}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--jhr-gold-deep)]">
              {formatShort(e.eventDate)}
            </p>
          </div>
          <div className="mx-auto mt-6 flex max-w-xl gap-2">
            <Choice tone="attend" selected={false} disabled>
              <TT en="Will attend" hi="पधारेंगे" />
            </Choice>
            <Choice tone="decline" selected={false} disabled>
              <TT en="Regretfully decline" hi="क्षमा करें" />
            </Choice>
          </div>
        </div>
      ))}
      <p className="text-center text-sm italic text-[color:var(--jhr-ink-soft)]">
        <TT en="Your guests will respond here, event by event." hi="आपके अतिथि यहाँ, हर आयोजन के लिए उत्तर देंगे।" />
      </p>
    </div>
  );
}
