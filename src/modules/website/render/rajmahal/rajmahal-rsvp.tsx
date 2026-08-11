"use client";

import { useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import { useGroupRsvp, useSelfRsvp, type GroupRsvpData } from "../use-rsvp";
import type { SelfRsvpData } from "../self-rsvp";
import { GuestCountField } from "../guest-count-field";
import { TT } from "../bilingual";
import { GoldRule } from "./ornaments";

/**
 * THE RAJMAHAL — RSVP.
 *
 * Presentation only. The state machines, validation and server actions are the
 * shared `useGroupRsvp` / `useSelfRsvp` hooks every theme uses — this file must
 * never touch the payload shape or call the actions directly, or a returning
 * family's saved RSVP stops being idempotent.
 */

/* A gold-edged ceremonial choice, not a radio button. */
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
  const cls = [
    "rjm-choice",
    selected ? `is-on rjm-choice-${tone}` : "",
    disabled ? "is-locked" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" aria-pressed={selected} disabled={disabled} onClick={onSelect} className={cls}>
      {children}
    </button>
  );
}

function Confirmation({ heads, onEdit }: { heads: number; onEdit: () => void }) {
  return (
    <div className="rjm-rsvp-done">
      <p className="rjm-rsvp-thanks">Dhanyavaad</p>
      <p className="rjm-rsvp-await">
        <TT en="We await you" hi="हमें आपकी प्रतीक्षा है" />
      </p>
      {heads > 0 ? (
        <p className="rjm-rsvp-heads">
          {heads}{" "}
          <TT en={heads === 1 ? "guest" : "guests"} hi="अतिथि" />
        </p>
      ) : null}
      <GoldRule className="rjm-rsvp-rule" />
      <button type="button" className="rjm-link" onClick={onEdit}>
        <TT en="Change our response" hi="उत्तर बदलें" />
      </button>
    </div>
  );
}

/** Personal-invite RSVP: a per-event headcount for the whole family. */
export function RajmahalGroupRsvp({ data }: { data: GroupRsvpData }) {
  const r = useGroupRsvp(data.slug, data.events, data.existing);

  if (r.done) return <Confirmation heads={r.totalAttending} onEdit={r.edit} />;

  return (
    <div className="rjm-rsvp-form">
      {data.events.map((e) => {
        const entry = r.entries[e.id];
        return (
          <div key={e.id} className="rjm-rsvp-row">
            <p className="rjm-rsvp-event">{e.name}</p>
            <div className="rjm-choices">
              <Choice
                selected={entry?.attending === true}
                tone="attend"
                onSelect={() => r.setAttending(e.id, true)}
                disabled={r.pending}
              >
                <TT en="With joy" hi="सहर्ष" />
              </Choice>
              <Choice
                selected={entry?.attending === false}
                tone="decline"
                onSelect={() => r.setAttending(e.id, false)}
                disabled={r.pending}
              >
                <TT en="Regretfully" hi="क्षमा करें" />
              </Choice>
            </div>
            {entry?.attending ? (
              <GuestCountField
                value={entry.partySize}
                onChange={(n) => r.setSize(e.id, n)}
                className="rjm-count-field"
                ariaLabel={`Guests for ${e.name}`}
              />
            ) : null}
          </div>
        );
      })}

      {r.error ? <p className="rjm-rsvp-error">{r.error}</p> : null}

      <button type="button" className="rjm-submit" onClick={r.submit} disabled={r.pending}>
        {r.pending ? (
          <TT en="Sending…" hi="भेजा जा रहा है…" />
        ) : (
          <TT en="Send our response" hi="उत्तर भेजें" />
        )}
      </button>
    </div>
  );
}

/** Broadcast (share-link) RSVP: one respondent names themselves. */
export function RajmahalSelfRsvp({ data }: { data: SelfRsvpData }) {
  const r = useSelfRsvp(
    data.slug,
    data.events.map((e) => e.id),
    data.existing,
  );

  if (r.done) return <Confirmation heads={r.savedRsvp?.partySize ?? 0} onEdit={r.edit} />;

  return (
    <div className="rjm-rsvp-form">
      <label className="rjm-field">
        <span>
          <TT en="Your name" hi="आपका नाम" />
        </span>
        <input
          type="text"
          value={r.name}
          onChange={(ev) => r.setName(ev.target.value)}
          disabled={r.pending}
          autoComplete="name"
        />
      </label>

      <div className="rjm-rsvp-row">
        <p className="rjm-rsvp-event">
          <TT en="Which celebrations?" hi="कौन से समारोह?" />
        </p>
        <div className="rjm-chiprow">
          {data.events.map((e) => (
            <button
              key={e.id}
              type="button"
              aria-pressed={r.selected.has(e.id)}
              disabled={r.pending}
              onClick={() => r.toggle(e.id)}
              className={r.selected.has(e.id) ? "rjm-chip is-on" : "rjm-chip"}
            >
              {e.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rjm-rsvp-row">
        <p className="rjm-rsvp-event">
          <TT en="How many of you?" hi="कितने लोग?" />
        </p>
        <GuestCountField
          value={r.size}
          onChange={r.setSize}
          className="rjm-count-field"
          ariaLabel="Number of guests"
        />
      </div>

      {r.error ? <p className="rjm-rsvp-error">{r.error}</p> : null}

      <button type="button" className="rjm-submit" onClick={r.submit} disabled={r.pending}>
        {r.pending ? (
          <TT en="Sending…" hi="भेजा जा रहा है…" />
        ) : (
          <TT en="Send my response" hi="उत्तर भेजें" />
        )}
      </button>
    </div>
  );
}

/**
 * Owner preview / public demo. Fully interactive so the controls can be felt,
 * but it never calls a server action — there is no invite behind it to write to.
 */
export function RajmahalRsvpDemo({ events }: { events: WeddingEvent[] }) {
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);

  if (sent) return <Confirmation heads={0} onEdit={() => setSent(false)} />;

  return (
    <div className="rjm-rsvp-form">
      <p className="rjm-rsvp-hint">
        <TT
          en="This is how your guests will reply."
          hi="आपके अतिथि इसी तरह उत्तर देंगे।"
        />
      </p>
      {events.map((e) => (
        <div key={e.id} className="rjm-rsvp-row">
          <p className="rjm-rsvp-event">{e.name}</p>
          <div className="rjm-choices">
            <Choice
              selected={picked[e.id] === true}
              tone="attend"
              onSelect={() => setPicked((p) => ({ ...p, [e.id]: true }))}
            >
              <TT en="With joy" hi="सहर्ष" />
            </Choice>
            <Choice
              selected={picked[e.id] === false}
              tone="decline"
              onSelect={() => setPicked((p) => ({ ...p, [e.id]: false }))}
            >
              <TT en="Regretfully" hi="क्षमा करें" />
            </Choice>
          </div>
        </div>
      ))}
      <button type="button" className="rjm-submit" onClick={() => setSent(true)}>
        <TT en="Send our response" hi="उत्तर भेजें" />
      </button>
    </div>
  );
}
