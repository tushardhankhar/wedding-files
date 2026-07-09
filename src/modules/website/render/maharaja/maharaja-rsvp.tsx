"use client";

import { useState, useTransition } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import {
  submitRsvpAction,
  type RsvpStatus,
} from "@/modules/guest-access/server/rsvp";
import { submitShareRsvpAction } from "@/modules/guest-access/server/share-rsvp";
import { TT } from "../bilingual";
import { RoyalInsignia } from "./ornaments";

/* Shared ceremonial selection panel. Not a radio button — a gold-edged card. */
function CeremonialChoice({
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
    "flex-1 border px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.22em] transition-all duration-300";
  const idle =
    "border-[color:var(--m-gold)]/45 text-[color:var(--m-gold)] hover:border-[color:var(--m-gold)]";
  const on =
    tone === "attend"
      ? "border-[color:var(--m-gold)] bg-[color:var(--m-gold)] text-[color:var(--m-wine)]"
      : "border-[color:var(--m-maroon)] bg-[color:var(--m-maroon)] text-[color:var(--m-ivory)]";
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
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("en-GB", { day: "numeric", month: "long" })
    .toUpperCase();
}

/** Confirmation shown once a response has been recorded. */
export function CourtConfirmation({ familyName, initials }: { familyName?: string; initials: string }) {
  return (
    <div className="mt-12 text-center duration-700 animate-in fade-in">
      <RoyalInsignia
        initials={initials}
        className="mx-auto h-24 text-[color:var(--m-gold)]"
      />
      <p className="m-serif mt-4 text-2xl uppercase tracking-[0.14em] text-[color:var(--m-ivory)]">
        <TT en="We await you" hi="हमें आपकी प्रतीक्षा है" />
        {familyName ? `, ${familyName}.` : "."}
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[color:var(--m-gold2)]/80">
        <TT en="Your response has been received" hi="आपका उत्तर प्राप्त हो गया है" />
      </p>
    </div>
  );
}

/* ── Group (personal invitation) RSVP ─────────────────────────────────────── */
export function MaharajaGroupRsvp({
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
    <div className="space-y-14">
      {error ? (
        <p className="text-center text-sm text-[#e2a49a]" role="alert">
          {error}
        </p>
      ) : null}
      {events.map((e) => (
        <div key={e.id}>
          <div className="text-center">
            <h3 className="m-serif text-3xl uppercase tracking-[0.14em] text-[color:var(--m-ivory)]">
              {e.name}
            </h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--m-gold2)]/80">
              {formatShort(e.eventDate)}
            </p>
          </div>
          <div className="mx-auto mt-6 max-w-xl space-y-3">
            {guests.map((g) => {
              const st = state[e.id]?.[g.id];
              return (
                <div key={g.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <span className="m-serif w-28 shrink-0 text-lg text-[color:var(--m-ivory)]/90">
                    {g.name}
                  </span>
                  <div className="flex flex-1 gap-2">
                    <CeremonialChoice
                      tone="attend"
                      selected={st === "attending"}
                      onSelect={() => choose(e.id, g.id, "attending")}
                    >
                      <TT en="Will attend" hi="पधारेंगे" />
                    </CeremonialChoice>
                    <CeremonialChoice
                      tone="decline"
                      selected={st === "declined"}
                      onSelect={() => choose(e.id, g.id, "declined")}
                    >
                      <TT en="Regretfully decline" hi="क्षमा करें" />
                    </CeremonialChoice>
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
export function MaharajaSelfRsvp({
  slug,
  events,
  initials,
  onSaved,
}: {
  slug: string;
  events: { id: string; name: string }[];
  initials: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [size, setSize] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(events.map((e) => e.id))
  );
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

  if (done) {
    return <CourtConfirmation familyName={name.trim() || undefined} initials={initials} />;
  }

  const field =
    "w-full border border-[color:var(--m-gold)]/40 bg-transparent px-4 py-3 text-[color:var(--m-ivory)] placeholder:text-[color:var(--m-ivory)]/35 focus:border-[color:var(--m-gold)] focus:outline-none";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {error ? (
        <p className="text-center text-sm text-[#e2a49a]" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="mhj-name" className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[color:var(--m-gold2)]">
          <TT en="Your name" hi="आपका नाम" />
        </label>
        <input
          id="mhj-name"
          type="text"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
          placeholder="Priya Sharma"
        />
      </div>
      <div>
        <label htmlFor="mhj-size" className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[color:var(--m-gold2)]">
          <TT en="Guests in your party" hi="आपके साथ कितने लोग" />
        </label>
        <input
          id="mhj-size"
          type="number"
          min={1}
          max={50}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className={field}
        />
      </div>
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--m-gold2)]">
          <TT en="Celebrations you will attend" hi="आप किन आयोजनों में पधारेंगे" />
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {events.map((e) => (
            <CeremonialChoice
              key={e.id}
              tone="attend"
              selected={selected.has(e.id)}
              onSelect={() => toggle(e.id)}
            >
              {e.name}
            </CeremonialChoice>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="w-full border border-[color:var(--m-gold)] bg-[color:var(--m-gold)] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--m-wine)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "…" : <TT en="Send our response" hi="उत्तर भेजें" />}
      </button>
    </div>
  );
}

/* ── Demonstration state (owner preview / public demo) ────────────────────── */
export function MaharajaRsvpDemo({ events }: { events: WeddingEvent[] }) {
  return (
    <div className="space-y-12">
      {events.slice(0, 2).map((e) => (
        <div key={e.id}>
          <div className="text-center">
            <h3 className="m-serif text-3xl uppercase tracking-[0.14em] text-[color:var(--m-ivory)]">
              {e.name}
            </h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--m-gold2)]/80">
              {formatShort(e.eventDate)}
            </p>
          </div>
          <div className="mx-auto mt-6 flex max-w-xl gap-2">
            <CeremonialChoice tone="attend" selected={false} disabled>
              <TT en="Will attend" hi="पधारेंगे" />
            </CeremonialChoice>
            <CeremonialChoice tone="decline" selected={false} disabled>
              <TT en="Regretfully decline" hi="क्षमा करें" />
            </CeremonialChoice>
          </div>
        </div>
      ))}
      <p className="text-center text-xs italic tracking-wide text-[color:var(--m-ivory)]/50">
        <TT
          en="Your guests will respond here, event by event."
          hi="आपके अतिथि यहाँ, हर आयोजन के लिए उत्तर देंगे।"
        />
      </p>
    </div>
  );
}
