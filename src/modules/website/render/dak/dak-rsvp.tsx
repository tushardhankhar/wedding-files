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
import { Cachet, DakMark, Postmark, PostalRule, WaxSeal } from "./ornaments";

/**
 * THE REPLY CARD — the RSVP is the other half of the post. It is a detachable
 * card: a perforated tear edge along the top, a REPLY PAID cachet in the
 * corner, and answers given the way a form printed in 1955 would ask for them
 * — a ruled tick box, struck in vermilion, never a candy pill.
 */

/** A ruled tick box. Checked = the box is struck in ink, not filled in colour. */
function Tick({
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
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`dak-tick ${selected ? `dak-tick-on dak-tick-${tone}` : ""} ${
        disabled ? "cursor-default" : ""
      }`}
    >
      <span className="dak-tick-box" aria-hidden="true">
        {selected ? (
          <svg viewBox="0 0 20 20" fill="none" className="h-full w-full">
            {tone === "attend" ? (
              <path d="M3.5 11 L8 15.5 L16.5 4.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4.5 4.5 L15.5 15.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M15.5 4.5 L4.5 15.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </>
            )}
          </svg>
        ) : null}
      </span>
      <span className="dak-tick-label">{children}</span>
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

/** A small struck date-stamp beside an event's name on the reply card. */
function EventStrike({ event }: { event: WeddingEvent }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-[color:var(--dak-gold)]/40 pb-3">
      <h3 className="dak-display text-xl text-[color:var(--dak-text)]">{event.name}</h3>
      <p className="dak-mono text-[0.62rem] tracking-[0.22em] text-[color:var(--dak-red)]">
        {formatShort(event.eventDate)}
      </p>
    </div>
  );
}

/** Sealed and sent — the confirmation. */
export function Acknowledgement({ familyName }: { familyName?: string }) {
  return (
    <div className="text-center duration-1000 animate-in fade-in">
      <WaxSeal initials="✓" className="mx-auto h-24 w-24 dak-press" />
      <p className="dak-mono mt-8 text-[0.62rem] tracking-[0.4em] text-[color:var(--dak-gold-deep)]">
        <TT en="RECEIVED WITH THANKS" hi="सधन्यवाद प्राप्त" />
      </p>
      <p className="dak-display mt-3 text-2xl text-[color:var(--dak-text)]">
        <TT en="Your reply is in the post" hi="आपका उत्तर भेज दिया गया है" />
        {familyName ? `, ${familyName}.` : "."}
      </p>
      <div className="mt-5 flex justify-center">
        <PostalRule className="w-44" />
      </div>
      <p className="dak-serif mt-4 text-lg italic text-[color:var(--dak-text-soft)]">
        <TT en="We will keep a place for you." hi="हम आपके लिए स्थान सुरक्षित रखेंगे।" />
      </p>
    </div>
  );
}

/** The card stock every reply is printed on. */
function ReplyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="dak-reply mx-auto max-w-2xl">
      <div className="dak-reply-head">
        <span className="dak-mono text-[0.58rem] tracking-[0.34em] text-[color:var(--dak-text-soft)]">
          <TT en="REPLY CARD · तुरंत उत्तर दें" hi="उत्तर पत्र · REPLY CARD" />
        </span>
        <Cachet label="REPLY PAID" />
      </div>
      <div className="px-6 pb-8 pt-7 sm:px-10">{children}</div>
    </div>
  );
}

/* ── Group (personal invitation) RSVP ─────────────────────────────────────── */
export function DakGroupRsvp({
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

  if (r.done) {
    const summary = events
      .filter((e) => r.entries[e.id]?.attending)
      .map((e) => `${e.name}: ${r.entries[e.id].partySize}`)
      .join("  ·  ");
    return (
      <ReplyCard>
        <Acknowledgement />
        <p className="dak-mono mt-6 text-center text-[0.62rem] tracking-[0.2em] text-[color:var(--dak-text-soft)]">
          {summary || <TT en="UNABLE TO ATTEND" hi="उपस्थित होने में असमर्थ" />}
        </p>
        <div className="mt-6 text-center">
          <button type="button" onClick={r.edit} className="dak-link">
            <TT en="Amend this reply" hi="उत्तर बदलें" />
          </button>
        </div>
      </ReplyCard>
    );
  }

  return (
    <ReplyCard>
      {r.error ? (
        <p className="dak-serif mb-6 text-center text-lg italic text-[color:var(--dak-red)]" role="alert">
          {r.error}
        </p>
      ) : null}
      <div className="space-y-8">
        {events.map((e) => {
          const en = r.entries[e.id] ?? { attending: true, partySize: 1 };
          return (
            <div key={e.id}>
              <EventStrike event={e} />
              <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
                <Tick tone="attend" selected={en.attending} onSelect={() => r.setAttending(e.id, true)}>
                  <TT en="We will attend" hi="हम पधारेंगे" />
                </Tick>
                <Tick tone="decline" selected={!en.attending} onSelect={() => r.setAttending(e.id, false)}>
                  <TT en="With regret" hi="क्षमा करें" />
                </Tick>
                {en.attending ? (
                  <label className="dak-mono flex items-center gap-3 text-[0.58rem] tracking-[0.24em] text-[color:var(--dak-text-soft)]">
                    <TT en="NO. OF GUESTS" hi="अतिथि संख्या" />
                    <GuestCountField
                      value={en.partySize}
                      onChange={(n) => r.setSize(e.id, n)}
                      className="dak-field w-16 text-center"
                    />
                  </label>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={r.submit} disabled={r.pending} className="dak-btn mt-10 w-full disabled:opacity-60">
        <DakMark className="h-5 w-5 shrink-0" />
        {r.pending ? "…" : r.saved ? <TT en="Post the changes" hi="बदलाव भेजें" /> : <TT en="Post our reply" hi="उत्तर भेजें" />}
      </button>
    </ReplyCard>
  );
}

/* ── Broadcast (share link) self-RSVP ─────────────────────────────────────── */
export function DakSelfRsvp({
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
      <ReplyCard>
        <Acknowledgement familyName={savedRsvp.name || undefined} />
        <p className="dak-mono mt-6 text-center text-[0.62rem] tracking-[0.2em] text-[color:var(--dak-text-soft)]">
          {savedRsvp.name} · {savedRsvp.partySize} <TT en="GUEST(S)" hi="अतिथि" />
        </p>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setEditing(true);
            }}
            className="dak-link"
          >
            <TT en="Amend this reply" hi="उत्तर बदलें" />
          </button>
        </div>
      </ReplyCard>
    );
  }

  return (
    <ReplyCard>
      {error ? (
        <p className="dak-serif mb-6 text-center text-lg italic text-[color:var(--dak-red)]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="space-y-7">
        <div>
          <label htmlFor="dak-name" className="dak-mono mb-2 block text-[0.58rem] tracking-[0.3em] text-[color:var(--dak-text-soft)]">
            <TT en="SENDER'S NAME" hi="आपका नाम" />
          </label>
          <input
            id="dak-name"
            type="text"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="dak-field dak-script w-full text-2xl"
            placeholder="Priya Sharma"
          />
        </div>
        <div>
          <label htmlFor="dak-size" className="dak-mono mb-2 block text-[0.58rem] tracking-[0.3em] text-[color:var(--dak-text-soft)]">
            <TT en="NO. OF GUESTS IN YOUR PARTY" hi="आपके साथ कितने लोग" />
          </label>
          <GuestCountField
            id="dak-size"
            value={size}
            onChange={setSize}
            className="dak-field w-24 text-center"
          />
        </div>
        <div>
          <p className="dak-mono mb-3 text-[0.58rem] tracking-[0.3em] text-[color:var(--dak-text-soft)]">
            <TT en="CELEBRATIONS YOU WILL ATTEND" hi="आप किन आयोजनों में पधारेंगे" />
          </p>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {events.map((e) => (
              <Tick key={e.id} tone="attend" selected={selected.has(e.id)} onSelect={() => toggle(e.id)}>
                {e.name}
              </Tick>
            ))}
          </div>
        </div>
      </div>
      <button type="button" onClick={submit} disabled={pending} className="dak-btn mt-10 w-full disabled:opacity-60">
        <DakMark className="h-5 w-5 shrink-0" />
        {pending ? "…" : savedRsvp ? <TT en="Post the changes" hi="बदलाव भेजें" /> : <TT en="Post our reply" hi="उत्तर भेजें" />}
      </button>
    </ReplyCard>
  );
}

/* ── Demonstration state (owner preview / public demo) ────────────────────── */
export function DakRsvpDemo({ events }: { events: WeddingEvent[] }) {
  return (
    <ReplyCard>
      <div className="space-y-8">
        {events.slice(0, 2).map((e) => (
          <div key={e.id}>
            <EventStrike event={e} />
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Tick tone="attend" selected disabled>
                <TT en="We will attend" hi="हम पधारेंगे" />
              </Tick>
              <Tick tone="decline" selected={false} disabled>
                <TT en="With regret" hi="क्षमा करें" />
              </Tick>
              <span className="dak-mono text-[0.58rem] tracking-[0.24em] text-[color:var(--dak-text-soft)]">
                <TT en="NO. OF GUESTS · 2" hi="अतिथि संख्या · 2" />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-9 flex items-center gap-5 border-t border-dashed border-[color:var(--dak-gold)]/40 pt-6">
        <Postmark
          town="RSVP"
          line1="DEMO"
          legend="SPECIMEN"
          className="h-16 w-16 shrink-0 -rotate-6 text-[color:var(--dak-red)] opacity-70"
        />
        <p className="dak-serif text-lg italic leading-relaxed text-[color:var(--dak-text-soft)]">
          <TT
            en="Your families will reply here, event by event, with a headcount."
            hi="आपके परिवार यहाँ, हर आयोजन के लिए संख्या के साथ उत्तर देंगे।"
          />
        </p>
      </div>
    </ReplyCard>
  );
}
