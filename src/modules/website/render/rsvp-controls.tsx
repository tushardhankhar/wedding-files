"use client";

import { TT } from "./bilingual";
import { Divider } from "./sections";
import { useGroupRsvp, type GroupRsvpData } from "./use-rsvp";

export type { GroupRsvpData };

/**
 * Group (personal-invite) RSVP for the shared token theme: one headcount per
 * invited event for the whole family, submitted once and editable thereafter.
 * Everyone who opens the family's invite link edits the same shared record.
 */
export function GroupRsvp({ slug, events, existing }: GroupRsvpData) {
  const r = useGroupRsvp(slug, events, existing);

  return (
    <section id="rsvp" className="band-alt">
      <div className="wrap self-rsvp">
        <p className="eyebrow center">
          <TT en="RSVP" hi="उत्तर दें" />
        </p>
        <h2 className="h-sec center">
          <TT en="Will your family join us?" hi="क्या आपका परिवार आएगा?" />
        </h2>
        <Divider />

        {r.done ? (
          <div className="space-y-4 text-center">
            <p className="thanks">
              <TT
                en="Thank you — your RSVP has been received!"
                hi="धन्यवाद — आपका उत्तर मिल गया है!"
              />
            </p>
            <p className="text-note">
              {events
                .filter((e) => r.entries[e.id]?.attending)
                .map((e) => `${e.name}: ${r.entries[e.id].partySize}`)
                .join(" · ") || <TT en="Not attending" hi="नहीं आ रहे" />}
            </p>
            <button type="button" className="w-btn w-btn-gold" onClick={r.edit}>
              <TT en="Edit my RSVP" hi="उत्तर बदलें" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rsvp-list">
              {events.map((e) => {
                const en = r.entries[e.id] ?? { attending: true, partySize: 1 };
                return (
                  <div className="rsvp-member" key={e.id}>
                    <span>{e.name}</span>
                    <div className="rsvp">
                      <button
                        type="button"
                        className={`yes ${en.attending ? "on" : ""}`}
                        onClick={() => r.setAttending(e.id, true)}
                      >
                        <TT en="Going" hi="आ रहे" />
                      </button>
                      <button
                        type="button"
                        className={`no ${!en.attending ? "on" : ""}`}
                        onClick={() => r.setAttending(e.id, false)}
                      >
                        <TT en="No" hi="नहीं" />
                      </button>
                      {en.attending ? (
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={en.partySize}
                          onChange={(ev) => r.setSize(e.id, Number(ev.target.value))}
                          aria-label={`Guests for ${e.name}`}
                          style={{ width: "4.5rem" }}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {r.error ? (
              <p className="text-note" role="alert" style={{ color: "#a3453f" }}>
                {r.error}
              </p>
            ) : null}

            <button
              type="button"
              className="w-btn w-btn-gold"
              onClick={r.submit}
              disabled={r.pending}
            >
              {r.pending ? (
                "…"
              ) : r.saved ? (
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
