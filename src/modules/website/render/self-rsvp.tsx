"use client";

import { TT } from "./bilingual";
import { Divider } from "./sections";
import { useSelfRsvp, type ExistingSelfRsvp } from "./use-rsvp";

export interface SelfRsvpData {
  slug: string;
  events: { id: string; name: string }[];
  /** This respondent's saved RSVP (server-loaded), or null if not yet answered. */
  existing?: ExistingSelfRsvp | null;
}

export function SelfRsvp({ slug, events, existing }: SelfRsvpData) {
  const rsvp = useSelfRsvp(
    slug,
    events.map((e) => e.id),
    existing
  );

  const savedEventNames = rsvp.savedRsvp
    ? events
        .filter((e) => rsvp.savedRsvp!.eventIds.includes(e.id))
        .map((e) => e.name)
    : [];

  return (
    <section id="rsvp" className="band-alt">
      <div className="wrap self-rsvp">
        <p className="eyebrow center">
          <TT en="RSVP" hi="उत्तर दें" />
        </p>
        <h2 className="h-sec center">
          <TT en="Will you join us?" hi="क्या आप आएँगे?" />
        </h2>
        <Divider />

        {rsvp.done ? (
          <div className="space-y-4 text-center">
            <p className="thanks">
              <TT
                en="Thank you — your RSVP has been received. We can't wait to celebrate with you!"
                hi="धन्यवाद — आपका उत्तर मिल गया है। हम आपके साथ जश्न मनाने के लिए उत्सुक हैं!"
              />
            </p>
            <p className="text-note">
              <TT en="On record for" hi="दर्ज है" />:{" "}
              <strong>{rsvp.savedRsvp?.name}</strong> ·{" "}
              {rsvp.savedRsvp?.partySize}{" "}
              <TT en="guest(s)" hi="अतिथि" />
              {savedEventNames.length ? ` · ${savedEventNames.join(", ")}` : ""}
            </p>
            <button
              type="button"
              className="w-btn w-btn-gold"
              onClick={rsvp.edit}
            >
              <TT en="Edit my RSVP" hi="उत्तर बदलें" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="rsvp-name">
                <TT en="Your name" hi="आपका नाम" />
              </label>
              <input
                id="rsvp-name"
                type="text"
                value={rsvp.name}
                maxLength={120}
                onChange={(e) => rsvp.setName(e.target.value)}
                placeholder="Priya Sharma"
              />
            </div>
            <div>
              <label htmlFor="rsvp-size">
                <TT en="How many are coming?" hi="कितने लोग आ रहे हैं?" />
              </label>
              <input
                id="rsvp-size"
                type="number"
                min={1}
                max={50}
                value={rsvp.size}
                onChange={(e) => rsvp.setSize(Number(e.target.value))}
              />
            </div>
            <div>
              <label>
                <TT en="Which events will you attend?" hi="आप किन आयोजनों में आएँगे?" />
              </label>
              <div className="events-check">
                {events.map((ev) => (
                  <label key={ev.id}>
                    <input
                      type="checkbox"
                      checked={rsvp.selected.has(ev.id)}
                      onChange={() => rsvp.toggle(ev.id)}
                    />
                    {ev.name}
                  </label>
                ))}
              </div>
            </div>

            {rsvp.error ? (
              <p className="text-note" role="alert" style={{ color: "#a3453f" }}>
                {rsvp.error}
              </p>
            ) : null}

            <button
              type="button"
              className="w-btn w-btn-gold"
              onClick={rsvp.submit}
              disabled={rsvp.pending}
            >
              {rsvp.pending ? (
                "…"
              ) : rsvp.savedRsvp ? (
                <TT en="Save changes" hi="बदलाव सहेजें" />
              ) : (
                <TT en="Send RSVP" hi="उत्तर भेजें" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
