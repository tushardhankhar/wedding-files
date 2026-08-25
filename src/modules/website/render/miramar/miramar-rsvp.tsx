"use client";

import { useState, useTransition } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import {
  submitShareRsvpAction,
  type ExistingSelfRsvp,
} from "@/modules/guest-access/server/share-rsvp";
import { useGroupRsvp, type ExistingGroupRsvp } from "../use-rsvp";
import { GuestCountField, clampParty } from "../guest-count-field";
import { T, TT } from "../bilingual";
import { hasCopy, type MiramarCopy } from "./copy";

/**
 * THE MIRAMAR — RSVP surfaces. The data contract is the shared one (the same
 * server actions and hooks every theme uses); only the dress is the theme's:
 * brass-edged choice cards on the deep-sea ground.
 *
 * Every word on them is the client's to rewrite, so each surface takes the
 * resolved {@link MiramarCopy} rather than printing its own labels — see
 * ./copy.ts. Only the demo surface (owner preview, never a guest) keeps its
 * fixed wording.
 */

/* A brass-edged choice card (not a radio button). */
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
  // Idle sits on the deep-sea RSVP ground, so keep the label shell-light.
  const idle =
    "border-[color:var(--mrm-gold)]/50 text-[color:var(--mrm-shell)] hover:border-[color:var(--mrm-gold)] hover:text-[color:var(--mrm-gold-lite)]";
  const on =
    tone === "attend"
      ? "border-[color:var(--mrm-gold)] bg-gradient-to-r from-[color:var(--mrm-gold)] to-[color:var(--mrm-gold-lite)] text-[color:var(--mrm-deep-3)]"
      : "border-[color:var(--mrm-rose)] bg-[color:var(--mrm-rose)] text-[color:var(--mrm-deep-3)]";
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
  copy,
}: {
  familyName?: string;
  copy: MiramarCopy;
}) {
  return (
    <div className="mt-12 text-center duration-700 animate-in fade-in">
      {hasCopy(copy.thanksTitle) ? (
        <p className="mrm-script text-5xl text-[color:var(--mrm-gold-lite)]">
          <T value={copy.thanksTitle} />
        </p>
      ) : null}
      {hasCopy(copy.thanksLine) ? (
        <p className="mrm-serif mt-3 text-2xl text-[color:var(--mrm-shell)]">
          <T value={copy.thanksLine} />
          {familyName ? `, ${familyName}.` : "."}
        </p>
      ) : null}
      {hasCopy(copy.thanksNote) ? (
        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[color:var(--mrm-shell)]/70">
          <T value={copy.thanksNote} />
        </p>
      ) : null}
    </div>
  );
}

/* ── Group (personal invitation) RSVP ─────────────────────────────────────── */
export function MiramarGroupRsvp({
  slug,
  events,
  existing,
  onSaved,
  copy,
}: {
  slug: string;
  events: WeddingEvent[];
  existing: ExistingGroupRsvp;
  onSaved: () => void;
  copy: MiramarCopy;
}) {
  const r = useGroupRsvp(slug, events, existing, onSaved);
  const numField =
    "w-24 rounded-2xl border border-[color:var(--mrm-gold)]/40 bg-white/10 px-3 py-3 text-center text-[color:var(--mrm-shell)] focus:border-[color:var(--mrm-gold)] focus:outline-none";

  if (r.done) {
    const summary = events
      .filter((e) => r.entries[e.id]?.attending)
      .map((e) => `${e.name}: ${r.entries[e.id].partySize}`)
      .join(" · ");
    return (
      <div className="text-center">
        <BlessingConfirmation copy={copy} />
        <p className="mt-3 text-sm text-[color:var(--mrm-shell)]/80">
          {summary || <T value={copy.rsvpNotAttending} />}
        </p>
        <button
          type="button"
          onClick={r.edit}
          className="mt-4 text-[11px] uppercase tracking-[0.24em] text-[color:var(--mrm-shell)]/70 underline underline-offset-4 hover:text-[color:var(--mrm-gold-lite)]"
        >
          <T value={copy.rsvpEdit} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {r.error ? (
        <p className="text-center text-sm text-[color:var(--mrm-gold-lite)]" role="alert">
          {r.error}
        </p>
      ) : null}
      {events.map((e) => {
        const en = r.entries[e.id] ?? { attending: true, partySize: 1 };
        return (
          <div key={e.id} className="mrm-card rounded-3xl px-6 py-7">
            <div className="text-center">
              <h3 className="mrm-serif text-2xl text-[color:var(--mrm-shell)]">{e.name}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--mrm-gold-lite)]">
                {formatShort(e.eventDate)}
              </p>
            </div>
            <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
              <Choice tone="attend" selected={en.attending} onSelect={() => r.setAttending(e.id, true)}>
                <T value={copy.rsvpAccept} />
              </Choice>
              <Choice tone="decline" selected={!en.attending} onSelect={() => r.setAttending(e.id, false)}>
                <T value={copy.rsvpDecline} />
              </Choice>
              {en.attending ? (
                <label className="flex items-center gap-2 text-sm text-[color:var(--mrm-shell)]">
                  <T value={copy.rsvpHowMany} />
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
        className="mrm-btn w-full justify-center disabled:opacity-60"
      >
        {r.pending ? "…" : <T value={r.saved ? copy.rsvpSave : copy.rsvpSend} />}
      </button>
    </div>
  );
}

/* ── Broadcast (share link) self-RSVP ─────────────────────────────────────── */
export function MiramarSelfRsvp({
  slug,
  events,
  existing,
  onSaved,
  copy,
}: {
  slug: string;
  events: { id: string; name: string }[];
  existing?: ExistingSelfRsvp | null;
  onSaved: () => void;
  copy: MiramarCopy;
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
      <div className="space-y-4 text-center">
        <BlessingConfirmation familyName={savedRsvp.name || undefined} copy={copy} />
        <p className="text-sm text-[color:var(--mrm-shell)]/70">
          {savedRsvp.name} · {savedRsvp.partySize} <T value={copy.rsvpGuestsSuffix} />
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing(true);
          }}
          className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--mrm-shell)]/70 underline underline-offset-4 hover:text-[color:var(--mrm-gold-lite)]"
        >
          <T value={copy.rsvpEdit} />
        </button>
      </div>
    );
  }

  const field =
    "w-full rounded-2xl border border-[color:var(--mrm-gold)]/40 bg-white/10 px-4 py-3 text-[color:var(--mrm-shell)] placeholder:text-[color:var(--mrm-shell)]/50 focus:border-[color:var(--mrm-gold)] focus:outline-none";

  return (
    <div className="mrm-card mx-auto max-w-xl space-y-6 rounded-3xl px-6 py-8">
      {error ? (
        <p className="text-center text-sm text-[color:var(--mrm-gold-lite)]" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <label htmlFor="mrm-name" className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[color:var(--mrm-gold-lite)]">
          <T value={copy.rsvpYourName} />
        </label>
        <input id="mrm-name" type="text" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Maria Fernandes" />
      </div>
      <div>
        <label htmlFor="mrm-size" className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[color:var(--mrm-gold-lite)]">
          <T value={copy.rsvpPartySize} />
        </label>
        <GuestCountField id="mrm-size" value={size} onChange={setSize} className={field} />
      </div>
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--mrm-gold-lite)]">
          <T value={copy.rsvpWhichEvents} />
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
        className="mrm-btn w-full justify-center disabled:opacity-60"
      >
        {pending ? "…" : <T value={savedRsvp ? copy.rsvpSave : copy.rsvpSend} />}
      </button>
    </div>
  );
}

/* ── Demonstration state (owner preview / public demo) ────────────────────── */
export function MiramarRsvpDemo({
  events,
  copy,
}: {
  events: WeddingEvent[];
  copy: MiramarCopy;
}) {
  return (
    <div className="space-y-8">
      {events.slice(0, 2).map((e) => (
        <div key={e.id} className="mrm-card rounded-3xl px-6 py-7">
          <div className="text-center">
            <h3 className="mrm-serif text-2xl text-[color:var(--mrm-shell)]">{e.name}</h3>
            <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--mrm-gold-lite)]">
              {formatShort(e.eventDate)}
            </p>
          </div>
          <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
            <Choice tone="attend" selected disabled>
              <T value={copy.rsvpAccept} />
            </Choice>
            <Choice tone="decline" selected={false} disabled>
              <T value={copy.rsvpDecline} />
            </Choice>
            <span className="rounded-2xl border border-[color:var(--mrm-gold)]/40 px-4 py-3 text-sm text-[color:var(--mrm-shell)]">
              <TT en="2 guests" hi="2 अतिथि" />
            </span>
          </div>
        </div>
      ))}
      <p className="text-center text-sm italic text-[color:var(--mrm-shell)]/70">
        <TT
          en="Your families will RSVP with a headcount, event by event."
          hi="आपके परिवार यहाँ, हर आयोजन के लिए संख्या के साथ उत्तर देंगे।"
        />
      </p>
    </div>
  );
}
