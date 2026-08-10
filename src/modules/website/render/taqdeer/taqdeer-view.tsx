"use client";

import { useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { TT } from "../bilingual";
import { useCountdown, pad2 } from "../use-countdown";
import { DecoArch, DecoFan, DecoRule, Monogram } from "./ornaments";
import { SlotMachine, slotDateOf } from "./slot-machine";

/* ── helpers ──────────────────────────────────────────────────────────────── */
function splitNames(names: string): [string, string] | null {
  const parts = names.split(" & ");
  return parts.length === 2 ? [parts[0], parts[1]] : null;
}

function monogramOf(names: string): string {
  const pair = splitNames(names);
  if (pair) return `${pair[0][0] ?? ""}${pair[1][0] ?? ""}`.toUpperCase();
  return names.slice(0, 2).toUpperCase();
}

/** "18 FEBRUARY 2027" — the reveal line, set in deco capitals. */
function longDateCaps(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

function weekdayOf(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
}

/** The city the celebration sits in, read off whatever venue is known. */
function cityOf(events: WeddingEvent[]): string | null {
  for (const e of events) {
    if (e.venueAddress) {
      const parts = e.venueAddress.split(",");
      return parts[parts.length - 1].trim();
    }
    if (e.venueName) return e.venueName;
  }
  return null;
}

/** All-day Google Calendar link for the date. */
function gcalUrl(iso: string | null, title: string): string | null {
  if (!iso) return null;
  const start = iso.replace(/-/g, "");
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const end = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${start}/${end}`;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE TAQDEER — a vintage Art Deco slot machine, as a Save the Date.

   ONE SCREEN, like every other save-the-date here (the Overture, the Muhurat,
   the Gulistan): an announcement, not an invitation. There is no programme, no
   gallery and no RSVP — a save-the-date's job is to make a date impossible to
   forget and then get out of the way. What replaces all of that is the machine:
   three reels marked DAY, MONTH and YEAR, a gold lever on the flank, and a date
   that only exists once the guest pulls it.

   The restraint is the point. Four materials — wine velvet, obsidian lacquer,
   antique gold, champagne ivory — one accent metal, no confetti, nothing that
   blinks. A luxury machine, not a casino floor.
   ══════════════════════════════════════════════════════════════════════════ */
export function TaqdeerView({
  theme,
  names,
  dateLabel,
  countdownDate,
  events,
  config,
  openImmediately,
}: WebsiteViewProps) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [revealed, setRevealed] = useState(false);

  const pair = splitNames(names);
  const monogram = monogramOf(names);
  const city = cityOf(events);
  const weekday = weekdayOf(countdownDate);
  const slotDate = slotDateOf(
    countdownDate ?? events.find((e) => e.eventDate)?.eventDate ?? null
  );
  const calUrl = gcalUrl(countdownDate, `Save the Date — ${names}`);
  const hashtag = config.footer?.hashtag;

  const announcement = (
    <Announcement
      dateCaps={dateLabel ? longDateCaps(countdownDate) : null}
      weekday={weekday}
      pair={pair}
      names={names}
      city={city}
      calUrl={calUrl}
      countdownDate={countdownDate}
      eventTime={config.eventTime}
    />
  );

  return (
    <div className="tqd flex min-h-dvh flex-col" data-lang={lang} style={theme.vars}>
      <main
        className="tqd-hero relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-14 sm:px-6"
        data-revealed={revealed ? "1" : "0"}
      >
        <div className="tqd-motes" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <i
              key={i}
              className="tqd-mote"
              style={{
                left: `${(i * 7.3 + 3) % 100}%`,
                // Deterministic drift — identical on the server and the client.
                animationDuration: `${16 + (i % 5) * 4.5}s`,
                animationDelay: `${i * 1.35}s`,
                width: i % 4 === 0 ? 3 : 2,
                height: i % 4 === 0 ? 3 : 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          <p className="tqd-hero-over">
            <TT en="Together with their families" hi="अपने परिवारों सहित" />
          </p>

          {slotDate ? (
            <SlotMachine
              date={slotDate}
              monogram={monogram}
              auto={openImmediately}
              onRevealed={() => setRevealed(true)}
            >
              {revealed ? announcement : null}
            </SlotMachine>
          ) : (
            // No date set yet: there is nothing for the reels to land on, so the
            // announcement stands on its own behind a deco arch.
            <>
              <div className="mt-10 text-center">
                <DecoArch className="mx-auto h-16 w-28 text-[color:var(--tqd-gold)]" />
              </div>
              {announcement}
            </>
          )}
        </div>
      </main>

      <footer className="tqd-foot relative z-10 px-6 pb-10 pt-4 text-center">
        <Monogram initials={monogram} className="mx-auto h-16 w-16 opacity-90" />
        <p className="tqd-foot-note mt-6">
          <TT en="A formal invitation will follow" hi="औपचारिक निमंत्रण शीघ्र भेजा जाएगा" />
        </p>
        {hashtag ? (
          <p className="tqd-caps mt-4 inline-block border border-[color:var(--tqd-gold)]/45 px-4 py-2 text-[0.58rem] tracking-[0.28em] text-[color:var(--tqd-gold-lite)]">
            #{hashtag.replace(/^#/, "")}
          </p>
        ) : null}
        <div className="mt-6 flex items-center justify-center gap-5">
          {(["en", "hi"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`tqd-caps text-[0.55rem] tracking-[0.26em] text-[color:var(--tqd-ivory)] transition-opacity ${
                lang === l ? "opacity-90" : "opacity-40 hover:opacity-70"
              }`}
            >
              {l === "en" ? "EN" : "हिं"}
            </button>
          ))}
        </div>
        <JashnCredit className="mt-5 text-[color:var(--tqd-gold-lite)]/45" />
      </footer>
    </div>
  );
}

/* ── THE ANNOUNCEMENT ───────────────────────────────────────────────────────
   Everything the save-the-date has to say, mounted only once the reels have
   settled — mounted rather than merely faded in, because anything that holds
   height here while the machine is still at rest pushes the reveal below the
   fold, and the reveal is the one moment on this page that must never have to be
   scrolled to. */
function Announcement({
  dateCaps,
  weekday,
  pair,
  names,
  city,
  calUrl,
  countdownDate,
  eventTime,
}: {
  dateCaps: string | null;
  weekday: string | null;
  pair: [string, string] | null;
  names: string;
  city: string | null;
  calUrl: string | null;
  countdownDate: string | null;
  eventTime?: string;
}) {
  return (
    <div className="tqd-reveal">
      <p className="tqd-reveal-eyebrow">
        <TT en="Save the Date" hi="तिथि सुरक्षित रखें" />
      </p>
      {weekday ? <p className="tqd-reveal-weekday">{weekday}</p> : null}
      {dateCaps ? <p className="tqd-reveal-date">{dateCaps}</p> : null}
      <div className="tqd-reveal-rule">
        <DecoFan className="tqd-reveal-fan" />
        <DecoRule className="tqd-reveal-rule-mid" />
        <DecoFan className="tqd-reveal-fan" flip />
      </div>
      <h1 className="tqd-names">
        {pair ? (
          <>
            {pair[0]}
            <span className="tqd-amp"> &amp; </span>
            {pair[1]}
          </>
        ) : (
          names
        )}
      </h1>
      {city ? <p className="tqd-reveal-city">{city}</p> : null}

      {countdownDate ? <Countdown dateIso={countdownDate} time={eventTime} /> : null}

      {calUrl ? (
        <a href={calUrl} target="_blank" rel="noopener noreferrer" className="tqd-btn mt-8">
          <TT en="Add to calendar" hi="कैलेंडर में जोड़ें" />
        </a>
      ) : null}
    </div>
  );
}

/* ── COUNTDOWN — four brass drums, echoing the reels above them ────────────── */
function Countdown({ dateIso, time }: { dateIso: string; time?: string }) {
  const { ready, days, hours, minutes, seconds } = useCountdown(
    dateIso,
    time ? `${time}:00` : undefined
  );
  const units: Array<[string, string, string]> = [
    [ready ? String(days) : "—", "DAYS", "दिन"],
    [pad2(hours, ready), "HOURS", "घंटे"],
    [pad2(minutes, ready), "MINUTES", "मिनट"],
    [pad2(seconds, ready), "SECONDS", "सेकंड"],
  ];
  return (
    <div className="mx-auto mt-9 grid max-w-md grid-cols-4 gap-2 sm:gap-3.5">
      {units.map(([v, en, hi]) => (
        <div key={en} className="tqd-drum">
          <span className="tqd-drum-num">{v}</span>
          <span className="tqd-drum-label">
            <TT en={en} hi={hi} />
          </span>
        </div>
      ))}
    </div>
  );
}
