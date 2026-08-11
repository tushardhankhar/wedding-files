"use client";

import { useState, useTransition } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import {
  submitShareRsvpAction,
  type ExistingSelfRsvp,
} from "@/modules/guest-access/server/share-rsvp";
import { useGroupRsvp, type ExistingGroupRsvp } from "../use-rsvp";
import { GuestCountField, clampParty } from "../guest-count-field";
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
    "flex-1 border px-4 py-3 text-center text-[11px] m-caps uppercase tracking-[0.22em] transition-all duration-300";
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

/* ── Group (personal invitation) RSVP — per-event headcount for the family ── */
export function MaharajaGroupRsvp({
  slug,
  events,
  existing,
  initials,
  onSaved,
}: {
  slug: string;
  events: WeddingEvent[];
  existing: ExistingGroupRsvp;
  initials: string;
  onSaved: () => void;
}) {
  const r = useGroupRsvp(slug, events, existing, onSaved);
  const numField =
    "w-24 border border-[color:var(--m-gold)]/40 bg-transparent px-3 py-3 text-center text-[color:var(--m-ivory)] focus:border-[color:var(--m-gold)] focus:outline-none";

  if (r.done) {
    const summary = events
      .filter((e) => r.entries[e.id]?.attending)
      .map((e) => `${e.name}: ${r.entries[e.id].partySize}`)
      .join(" · ");
    return (
      <div className="text-center">
        <CourtConfirmation initials={initials} />
        <p className="mt-3 text-sm text-[color:var(--m-ivory)]/80">
          {summary || <TT en="Not attending" hi="नहीं आ रहे" />}
        </p>
        <button
          type="button"
          onClick={r.edit}
          className="mt-4 text-[11px] uppercase tracking-[0.28em] text-[color:var(--m-gold2)] underline underline-offset-4 hover:text-[color:var(--m-gold)]"
        >
          <TT en="Edit my RSVP" hi="उत्तर बदलें" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      {r.error ? (
        <p className="text-center text-sm text-[#e2a49a]" role="alert">
          {r.error}
        </p>
      ) : null}
      {events.map((e) => {
        const en = r.entries[e.id] ?? { attending: true, partySize: 1 };
        return (
          <div key={e.id}>
            <div className="text-center">
              <h3 className="m-serif text-3xl uppercase tracking-[0.14em] text-[color:var(--m-ivory)]">
                {e.name}
              </h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--m-gold2)]/80">
                {formatShort(e.eventDate)}
              </p>
            </div>
            <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
              <CeremonialChoice
                tone="attend"
                selected={en.attending}
                onSelect={() => r.setAttending(e.id, true)}
              >
                <TT en="Will attend" hi="पधारेंगे" />
              </CeremonialChoice>
              <CeremonialChoice
                tone="decline"
                selected={!en.attending}
                onSelect={() => r.setAttending(e.id, false)}
              >
                <TT en="Regretfully decline" hi="क्षमा करें" />
              </CeremonialChoice>
              {en.attending ? (
                <label className="flex items-center gap-2 text-sm text-[color:var(--m-ivory)]/80">
                  <TT en="How many?" hi="कितने?" />
                  <GuestCountField
                    value={en.partySize}
                    onChange={(n) => r.setSize(e.id, n)}
                    className={numField}
                  />
                </label>
              ) : null}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={r.submit}
        disabled={r.pending}
        className="w-full border border-[color:var(--m-gold)] bg-[color:var(--m-gold)] px-6 py-4 text-[11px] m-caps uppercase tracking-[0.28em] text-[color:var(--m-wine)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {r.pending ? "…" : r.saved ? <TT en="Save changes" hi="बदलाव सहेजें" /> : <TT en="Send our response" hi="उत्तर भेजें" />}
      </button>
    </div>
  );
}

/* ── Broadcast (share link) self-RSVP ─────────────────────────────────────── */
export function MaharajaSelfRsvp({
  slug,
  events,
  initials,
  existing,
  onSaved,
}: {
  slug: string;
  events: { id: string; name: string }[];
  initials: string;
  existing?: ExistingSelfRsvp | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [size, setSize] = useState(existing?.partySize ?? 1);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(existing?.eventIds ?? events.map((e) => e.id))
  );
  const [error, setError] = useState<string | null>(null);
  const [savedRsvp, setSavedRsvp] = useState<ExistingSelfRsvp | null>(
    existing ?? null
  );
  const [editing, setEditing] = useState(existing == null);
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
    const ids = [...selected];
    const partySize = clampParty(size);
    startTransition(async () => {
      const res = await submitShareRsvpAction(slug, name, partySize, ids);
      if (res?.error) setError(res.error);
      else {
        setSavedRsvp({ name: name.trim(), partySize, eventIds: ids });
        setEditing(false);
        onSaved();
      }
    });
  }

  if (savedRsvp && !editing) {
    return (
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <CourtConfirmation familyName={savedRsvp.name || undefined} initials={initials} />
        <p className="text-sm text-[color:var(--m-ivory)]/70">
          {savedRsvp.name} · {savedRsvp.partySize} <TT en="guest(s)" hi="अतिथि" />
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing(true);
          }}
          className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--m-gold2)] underline underline-offset-4 hover:text-[color:var(--m-gold)]"
        >
          <TT en="Edit my RSVP" hi="उत्तर बदलें" />
        </button>
      </div>
    );
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
        <GuestCountField
          id="mhj-size"
          value={size}
          onChange={setSize}
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
        className="w-full border border-[color:var(--m-gold)] bg-[color:var(--m-gold)] px-6 py-4 text-[11px] m-caps uppercase tracking-[0.28em] text-[color:var(--m-wine)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "…" : savedRsvp ? <TT en="Save changes" hi="बदलाव सहेजें" /> : <TT en="Send our response" hi="उत्तर भेजें" />}
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
