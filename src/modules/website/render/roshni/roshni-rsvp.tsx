"use client";

import { useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import { useGroupRsvp, useSelfRsvp, type GroupRsvpData } from "../use-rsvp";
import type { SelfRsvpData } from "../self-rsvp";
import { GuestCountField } from "../guest-count-field";
import { GoldRule } from "./ornaments";

/**
 * THE ROSHNI — RSVP.
 *
 * Presentation only. The state machines, validation and server actions are the
 * shared `useGroupRsvp` / `useSelfRsvp` hooks every theme uses — this file must
 * never touch the payload shape or call the actions directly.
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
  const cls = ["rsh-choice", selected ? `is-on rsh-choice-${tone}` : ""].filter(Boolean).join(" ");
  return (
    <button type="button" aria-pressed={selected} disabled={disabled} onClick={onSelect} className={cls}>
      {children}
    </button>
  );
}

function Confirmation({ heads, onEdit }: { heads: number; onEdit: () => void }) {
  return (
    <div className="rsh-rsvp-done" role="status">
      <p className="rsh-script text-[clamp(2.2rem,9vw,3rem)] leading-none text-[color:var(--rsh-glow)]">
        Dhanyavaad
      </p>
      <p className="rsh-serif mt-3 text-xl text-[color:var(--rsh-ivory)]">
        Your diya is lit. We can&rsquo;t wait to celebrate with you.
      </p>
      {heads > 0 ? (
        <p className="rsh-eyebrow mt-3">
          {heads} {heads === 1 ? "guest" : "guests"}
        </p>
      ) : null}
      <GoldRule className="mx-auto mt-6 w-40" />
      <button type="button" className="rsh-link mt-4" onClick={onEdit}>
        Change my response
      </button>
    </div>
  );
}

/** Personal-invite RSVP: a per-event headcount for the whole family. */
export function RoshniGroupRsvp({ data }: { data: GroupRsvpData }) {
  const r = useGroupRsvp(data.slug, data.events, data.existing);
  if (r.done) return <Confirmation heads={r.totalAttending} onEdit={r.edit} />;

  return (
    <div className="rsh-rsvp-form">
      {data.events.map((e) => {
        const entry = r.entries[e.id];
        return (
          <div key={e.id} className="rsh-rsvp-row">
            <p className="rsh-rsvp-event">{e.name}</p>
            <div className="rsh-choices">
              <Choice
                selected={entry?.attending === true}
                tone="attend"
                onSelect={() => r.setAttending(e.id, true)}
                disabled={r.pending}
              >
                With joy
              </Choice>
              <Choice
                selected={entry?.attending === false}
                tone="decline"
                onSelect={() => r.setAttending(e.id, false)}
                disabled={r.pending}
              >
                Regretfully
              </Choice>
            </div>
            {entry?.attending ? (
              <GuestCountField
                value={entry.partySize}
                onChange={(n) => r.setSize(e.id, n)}
                className="rsh-count-field"
                ariaLabel={`Guests for ${e.name}`}
              />
            ) : null}
          </div>
        );
      })}
      {r.error ? (
        <p className="rsh-rsvp-error" role="alert">
          {r.error}
        </p>
      ) : null}
      <button type="button" className="rsh-btn w-full" onClick={r.submit} disabled={r.pending}>
        {r.pending ? "Sending…" : "Send our response"}
      </button>
    </div>
  );
}

/** Broadcast (share-link) RSVP: one respondent names themselves. */
export function RoshniSelfRsvp({ data }: { data: SelfRsvpData }) {
  const r = useSelfRsvp(
    data.slug,
    data.events.map((e) => e.id),
    data.existing,
  );
  if (r.done) return <Confirmation heads={r.savedRsvp?.partySize ?? 0} onEdit={r.edit} />;

  return (
    <div className="rsh-rsvp-form">
      <label className="rsh-field">
        <span>Your name</span>
        <input
          type="text"
          value={r.name}
          onChange={(ev) => r.setName(ev.target.value)}
          disabled={r.pending}
          autoComplete="name"
        />
      </label>
      {data.events.length > 1 ? (
        <div className="rsh-rsvp-row">
          <p className="rsh-rsvp-event">Which moments will you join?</p>
          <div className="rsh-chiprow">
            {data.events.map((e) => (
              <button
                key={e.id}
                type="button"
                aria-pressed={r.selected.has(e.id)}
                disabled={r.pending}
                onClick={() => r.toggle(e.id)}
                className={r.selected.has(e.id) ? "rsh-chip is-on" : "rsh-chip"}
              >
                {e.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="rsh-rsvp-row">
        <p className="rsh-rsvp-event">How many of you?</p>
        <GuestCountField
          value={r.size}
          onChange={r.setSize}
          className="rsh-count-field"
          ariaLabel="Number of guests"
        />
      </div>
      {r.error ? (
        <p className="rsh-rsvp-error" role="alert">
          {r.error}
        </p>
      ) : null}
      <button type="button" className="rsh-btn w-full" onClick={r.submit} disabled={r.pending}>
        {r.pending ? "Sending…" : "Send my response"}
      </button>
    </div>
  );
}

/**
 * Owner preview / public demo. Fully interactive so the controls can be felt,
 * but it never calls a server action — there is no invite behind it.
 */
export function RoshniRsvpDemo({ events }: { events: WeddingEvent[] }) {
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);
  if (sent) return <Confirmation heads={0} onEdit={() => setSent(false)} />;

  return (
    <div className="rsh-rsvp-form">
      <p className="rsh-rsvp-hint">This is how your guests will reply.</p>
      {events.map((e) => (
        <div key={e.id} className="rsh-rsvp-row">
          <p className="rsh-rsvp-event">{e.name}</p>
          <div className="rsh-choices">
            <Choice
              selected={picked[e.id] === true}
              tone="attend"
              onSelect={() => setPicked((p) => ({ ...p, [e.id]: true }))}
            >
              With joy
            </Choice>
            <Choice
              selected={picked[e.id] === false}
              tone="decline"
              onSelect={() => setPicked((p) => ({ ...p, [e.id]: false }))}
            >
              Regretfully
            </Choice>
          </div>
        </div>
      ))}
      <button type="button" className="rsh-btn w-full" onClick={() => setSent(true)}>
        Send our response
      </button>
    </div>
  );
}
