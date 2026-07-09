"use client";

import { useState, useTransition } from "react";
import { submitShareRsvpAction } from "@/modules/guest-access/server/share-rsvp";
import { TT } from "./bilingual";
import { Divider } from "./sections";

export interface SelfRsvpData {
  slug: string;
  events: { id: string; name: string }[];
}

export function SelfRsvp({ slug, events }: SelfRsvpData) {
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
      else setDone(true);
    });
  }

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

        {done ? (
          <p className="thanks">
            <TT
              en="Thank you — your RSVP has been received. We can't wait to celebrate with you!"
              hi="धन्यवाद — आपका उत्तर मिल गया है। हम आपके साथ जश्न मनाने के लिए उत्सुक हैं!"
            />
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="rsvp-name">
                <TT en="Your name" hi="आपका नाम" />
              </label>
              <input
                id="rsvp-name"
                type="text"
                value={name}
                maxLength={120}
                onChange={(e) => setName(e.target.value)}
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
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
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
                      checked={selected.has(ev.id)}
                      onChange={() => toggle(ev.id)}
                    />
                    {ev.name}
                  </label>
                ))}
              </div>
            </div>

            {error ? (
              <p className="text-note" role="alert" style={{ color: "#a3453f" }}>
                {error}
              </p>
            ) : null}

            <button
              type="button"
              className="w-btn w-btn-gold"
              onClick={submit}
              disabled={pending}
            >
              {pending ? "…" : <TT en="Send RSVP" hi="उत्तर भेजें" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
