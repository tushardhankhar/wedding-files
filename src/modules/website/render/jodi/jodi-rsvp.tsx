"use client";

import { useState, useTransition } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import {
  submitShareRsvpAction,
  type ExistingSelfRsvp,
} from "@/modules/guest-access/server/share-rsvp";
import { useGroupRsvp, type ExistingGroupRsvp } from "../use-rsvp";
import { TT } from "../bilingual";
import { Mandala, GoldRule } from "./ornaments";

/**
 * A hairline choice box — outlined, letterspaced, filling with magenta when
 * chosen. Everything here sits on the soft blush ground, so it stays ink-on-
 * light: the plate's furniture is quiet and the illustration carries the page.
 */
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
    "flex-1 border px-5 py-3 text-center text-[0.58rem] font-medium uppercase tracking-[0.24em] transition-all duration-500";
  const idle =
    "border-[color:var(--jdi-gold)]/45 text-[color:var(--jdi-ink)]/75 hover:border-[color:var(--jdi-gold)] hover:text-[color:var(--jdi-magenta)]";
  const on =
    tone === "attend"
      ? "border-[color:var(--jdi-magenta)] bg-[color:var(--jdi-magenta)] text-[color:var(--jdi-cream)]"
      : "border-[color:var(--jdi-ink-soft)] bg-[color:var(--jdi-ink-soft)] text-[color:var(--jdi-cream)]";
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
export function Acknowledgement({ familyName }: { familyName?: string }) {
  return (
    <div className="mt-10 text-center duration-1000 animate-in fade-in">
      <Mandala className="mx-auto h-20 w-20 opacity-85" />
      <p className="jdi-label mt-7 text-[color:var(--jdi-magenta)]">
        <TT en="With gratitude" hi="सधन्यवाद" />
      </p>
      <p className="jdi-display mt-3 text-2xl text-[color:var(--jdi-magenta-2)]">
        <TT en="We look forward to welcoming you" hi="हमें आपके स्वागत की प्रतीक्षा है" />
        {familyName ? `, ${familyName}.` : "."}
      </p>
      <div className="mt-6 flex justify-center">
        <GoldRule className="w-40" />
      </div>
      <p className="jdi-serif mt-4 text-base italic text-[color:var(--jdi-ink-soft)]">
        <TT en="Your response has been recorded" hi="आपका उत्तर दर्ज हो गया है" />
      </p>
    </div>
  );
}

/* ── Group (personal invitation) RSVP ─────────────────────────────────────── */
export function JodiGroupRsvp({
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
    "w-20 border border-[color:var(--jdi-gold)]/45 bg-transparent px-3 py-3 text-center text-[color:var(--jdi-ink)] focus:border-[color:var(--jdi-magenta)] focus:outline-none";

  if (r.done) {
    const summary = events
      .filter((e) => r.entries[e.id]?.attending)
      .map((e) => `${e.name}: ${r.entries[e.id].partySize}`)
      .join("  ·  ");
    return (
      <div className="text-center">
        <Acknowledgement />
        <p className="jdi-serif mt-5 text-base text-[color:var(--jdi-ink)]/75">
          {summary || <TT en="Unable to attend" hi="उपस्थित होने में असमर्थ" />}
        </p>
        <button
          type="button"
          onClick={r.edit}
          className="jdi-label mt-5 text-[color:var(--jdi-ink-soft)] underline underline-offset-[6px] hover:text-[color:var(--jdi-magenta)]"
        >
          <TT en="Amend response" hi="उत्तर बदलें" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {r.error ? (
        <p className="jdi-serif text-center text-base italic text-[color:var(--jdi-magenta)]" role="alert">
          {r.error}
        </p>
      ) : null}
      {events.map((e) => {
        const en = r.entries[e.id] ?? { attending: true, partySize: 1 };
        return (
          <div key={e.id} className="jdi-card px-7 py-7">
            <div className="text-center">
              <h3 className="jdi-display text-xl text-[color:var(--jdi-magenta-2)]">{e.name}</h3>
              <p className="jdi-label mt-2 text-[color:var(--jdi-magenta)]">{formatShort(e.eventDate)}</p>
            </div>
            <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2.5">
              <Choice tone="attend" selected={en.attending} onSelect={() => r.setAttending(e.id, true)}>
                <TT en="We will attend" hi="हम पधारेंगे" />
              </Choice>
              <Choice tone="decline" selected={!en.attending} onSelect={() => r.setAttending(e.id, false)}>
                <TT en="With regret" hi="क्षमा करें" />
              </Choice>
              {en.attending ? (
                <label className="jdi-label flex items-center gap-3 text-[color:var(--jdi-ink-soft)]">
                  <TT en="Guests" hi="कितने" />
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={en.partySize}
                    onChange={(ev) => r.setSize(e.id, Number(ev.target.value))}
                    className={numField}
                  />
                </label>
              ) : null}
            </div>
          </div>
        );
      })}
      <button type="button" onClick={r.submit} disabled={r.pending} className="jdi-btn w-full disabled:opacity-60">
        {r.pending ? "…" : r.saved ? <TT en="Save changes" hi="बदलाव सहेजें" /> : <TT en="Send our response" hi="उत्तर भेजें" />}
      </button>
    </div>
  );
}

/* ── Broadcast (share link) self-RSVP ─────────────────────────────────────── */
export function JodiSelfRsvp({
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
  const [savedRsvp, setSavedRsvp] = useState<ExistingSelfRsvp | null>(existing ?? null);
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
    startTransition(async () => {
      const res = await submitShareRsvpAction(slug, name, size, ids);
      if (res?.error) setError(res.error);
      else {
        setSavedRsvp({ name: name.trim(), partySize: size, eventIds: ids });
        setEditing(false);
        onSaved();
      }
    });
  }

  if (savedRsvp && !editing) {
    return (
      <div className="space-y-4 text-center">
        <Acknowledgement familyName={savedRsvp.name || undefined} />
        <p className="jdi-label text-[color:var(--jdi-ink-soft)]">
          {savedRsvp.name} · {savedRsvp.partySize} <TT en="guest(s)" hi="अतिथि" />
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing(true);
          }}
          className="jdi-label text-[color:var(--jdi-ink-soft)] underline underline-offset-[6px] hover:text-[color:var(--jdi-magenta)]"
        >
          <TT en="Amend response" hi="उत्तर बदलें" />
        </button>
      </div>
    );
  }

  const field =
    "w-full border border-[color:var(--jdi-gold)]/45 bg-transparent px-4 py-3 text-[color:var(--jdi-ink)] placeholder:text-[color:var(--jdi-ink-soft)]/60 focus:border-[color:var(--jdi-magenta)] focus:outline-none";

  return (
    <div className="jdi-card mx-auto max-w-xl space-y-7 px-7 py-9">
      {error ? (
        <p className="jdi-serif text-center text-base italic text-[color:var(--jdi-magenta)]" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="jdi-name" className="jdi-label mb-3 block text-[color:var(--jdi-magenta)]">
          <TT en="Your name" hi="आपका नाम" />
        </label>
        <input
          id="jdi-name"
          type="text"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
          placeholder="Priya Sharma"
        />
      </div>
      <div>
        <label htmlFor="jdi-size" className="jdi-label mb-3 block text-[color:var(--jdi-magenta)]">
          <TT en="Guests in your party" hi="आपके साथ कितने लोग" />
        </label>
        <input
          id="jdi-size"
          type="number"
          min={1}
          max={50}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className={field}
        />
      </div>
      <div>
        <p className="jdi-label mb-3 text-[color:var(--jdi-magenta)]">
          <TT en="Celebrations you will attend" hi="आप किन आयोजनों में पधारेंगे" />
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {events.map((e) => (
            <Choice key={e.id} tone="attend" selected={selected.has(e.id)} onSelect={() => toggle(e.id)}>
              {e.name}
            </Choice>
          ))}
        </div>
      </div>
      <button type="button" onClick={submit} disabled={pending} className="jdi-btn w-full disabled:opacity-60">
        {pending ? "…" : savedRsvp ? <TT en="Save changes" hi="बदलाव सहेजें" /> : <TT en="Send our response" hi="उत्तर भेजें" />}
      </button>
    </div>
  );
}

/* ── Demonstration state (owner preview / public demo) ────────────────────── */
export function JodiRsvpDemo({ events }: { events: WeddingEvent[] }) {
  return (
    <div className="space-y-5">
      {events.slice(0, 2).map((e) => (
        <div key={e.id} className="jdi-card px-7 py-7">
          <div className="text-center">
            <h3 className="jdi-display text-xl text-[color:var(--jdi-magenta-2)]">{e.name}</h3>
            <p className="jdi-label mt-2 text-[color:var(--jdi-magenta)]">{formatShort(e.eventDate)}</p>
          </div>
          <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2.5">
            <Choice tone="attend" selected disabled>
              <TT en="We will attend" hi="हम पधारेंगे" />
            </Choice>
            <Choice tone="decline" selected={false} disabled>
              <TT en="With regret" hi="क्षमा करें" />
            </Choice>
            <span className="jdi-label border border-[color:var(--jdi-gold)]/45 px-5 py-3 text-[color:var(--jdi-ink-soft)]">
              <TT en="2 guests" hi="2 अतिथि" />
            </span>
          </div>
        </div>
      ))}
      <p className="jdi-serif text-center text-base italic text-[color:var(--jdi-ink-soft)]">
        <TT
          en="Your families will RSVP with a headcount, event by event."
          hi="आपके परिवार यहाँ, हर आयोजन के लिए संख्या के साथ उत्तर देंगे।"
        />
      </p>
    </div>
  );
}
