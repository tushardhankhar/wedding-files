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

/* ── Group (personal invitation) RSVP — per-event headcount for the family ── */
export function JharokhaGroupRsvp({
  slug,
  events,
  existing,
  onSaved,
}: {
  slug: string;
  events: WeddingEvent[];
  existing: ExistingGroupRsvp;
  onSaved: () => void;
}) {
  const r = useGroupRsvp(slug, events, existing, onSaved);
  const numField =
    "w-24 rounded-2xl border border-[color:var(--jhr-gold)]/40 bg-white/60 px-3 py-3 text-center text-[color:var(--jhr-ink)] focus:border-[color:var(--jhr-gold)] focus:outline-none";

  if (r.done) {
    const summary = events
      .filter((e) => r.entries[e.id]?.attending)
      .map((e) => `${e.name}: ${r.entries[e.id].partySize}`)
      .join(" · ");
    return (
      <div className="text-center">
        <BlessingConfirmation />
        <p className="mt-3 text-sm text-[color:var(--jhr-ink-soft)]">
          {summary || <TT en="Not attending" hi="नहीं आ रहे" />}
        </p>
        <button
          type="button"
          onClick={r.edit}
          className="mt-4 text-[11px] uppercase tracking-[0.24em] text-[color:var(--jhr-gold-deep)] underline underline-offset-4 hover:text-[color:var(--jhr-rose-deep)]"
        >
          <TT en="Edit my RSVP" hi="उत्तर बदलें" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {r.error ? (
        <p className="text-center text-sm text-[color:var(--jhr-rose-deep)]" role="alert">
          {r.error}
        </p>
      ) : null}
      {events.map((e) => {
        const en = r.entries[e.id] ?? { attending: true, partySize: 1 };
        return (
          <div key={e.id} className="jhr-card rounded-3xl px-6 py-7">
            <div className="text-center">
              <h3 className="jhr-serif text-2xl text-[color:var(--jhr-maroon)]">{e.name}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--jhr-gold-deep)]">
                {formatShort(e.eventDate)}
              </p>
            </div>
            <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
              <Choice tone="attend" selected={en.attending} onSelect={() => r.setAttending(e.id, true)}>
                <TT en="Will attend" hi="पधारेंगे" />
              </Choice>
              <Choice tone="decline" selected={!en.attending} onSelect={() => r.setAttending(e.id, false)}>
                <TT en="Regretfully decline" hi="क्षमा करें" />
              </Choice>
              {en.attending ? (
                <label className="flex items-center gap-2 text-sm text-[color:var(--jhr-champagne)]">
                  <TT en="How many?" hi="कितने?" />
                  <GuestCountField value={en.partySize} onChange={(n) => r.setSize(e.id, n)} className={numField} />
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
        className="jhr-btn w-full justify-center disabled:opacity-60"
      >
        {r.pending ? "…" : r.saved ? <TT en="Save changes" hi="बदलाव सहेजें" /> : <TT en="Send our response" hi="उत्तर भेजें" />}
      </button>
    </div>
  );
}

/* ── Broadcast (share link) self-RSVP ─────────────────────────────────────── */
export function JharokhaSelfRsvp({
  slug,
  events,
  existing,
  onSaved,
}: {
  slug: string;
  events: { id: string; name: string }[];
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
      <div className="space-y-4 text-center">
        <BlessingConfirmation familyName={savedRsvp.name || undefined} />
        <p className="text-sm text-[color:var(--jhr-ink-soft)]">
          {savedRsvp.name} · {savedRsvp.partySize} <TT en="guest(s)" hi="अतिथि" />
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing(true);
          }}
          className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--jhr-gold-deep)] underline underline-offset-4 hover:text-[color:var(--jhr-rose-deep)]"
        >
          <TT en="Edit my RSVP" hi="उत्तर बदलें" />
        </button>
      </div>
    );
  }

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
        <GuestCountField id="jhr-size" value={size} onChange={setSize} className={field} />
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
        {pending ? "…" : savedRsvp ? <TT en="Save changes" hi="बदलाव सहेजें" /> : <TT en="Send our response" hi="उत्तर भेजें" />}
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
          <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
            <Choice tone="attend" selected disabled>
              <TT en="Will attend" hi="पधारेंगे" />
            </Choice>
            <Choice tone="decline" selected={false} disabled>
              <TT en="Regretfully decline" hi="क्षमा करें" />
            </Choice>
            <span className="rounded-2xl border border-[color:var(--jhr-gold)]/40 px-4 py-3 text-sm text-[color:var(--jhr-champagne)]"><TT en="2 guests" hi="2 अतिथि" /></span>
          </div>
        </div>
      ))}
      <p className="text-center text-sm italic text-[color:var(--jhr-ink-soft)]">
        <TT en="Your families will RSVP with a headcount, event by event." hi="आपके परिवार यहाँ, हर आयोजन के लिए संख्या के साथ उत्तर देंगे।" />
      </p>
    </div>
  );
}
