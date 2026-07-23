"use client";

import { m } from "motion/react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { MotionProvider } from "../experience/motion";
import { FloatingParticles } from "../experience/floating-particles";
import { FlipCountdown } from "../experience/flip-countdown";
import {
  ArchFrame,
  Ganesha,
  FloralCascade,
  HangingBells,
  PalaceScene,
  Couple,
  Lantern,
  PetalFall,
} from "./ornaments";

/* ── helpers (shared shape with the other Save-the-Date themes) ───────────── */
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

function weekdayOf(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  });
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

const RISE = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

/* ══════════════════════════════════════════════════════════════════════════ */
export function GulistanView(props: WebsiteViewProps) {
  const { names, dateLabel, countdownDate, events, config, theme } = props;
  const city = cityOf(events);
  const weekday = weekdayOf(countdownDate);
  const calUrl = gcalUrl(countdownDate, `Save the Date — ${names}`);
  const nameParts = names.split(" & ");
  const quote =
    config.hero?.tagline?.en?.trim() ||
    "Two hearts, two families, one beautiful beginning.";

  return (
    <MotionProvider>
      <div style={theme.vars} className="glt relative flex min-h-dvh flex-col">
        {/* drifting rose petals + ambient gold motes over everything */}
        <PetalFall className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" />
        <FloatingParticles
          colors={["#e8cd7e", "#f2c9d4", "#fff4d0"]}
          density={4}
          maxCount={34}
          minR={0.4}
          maxR={1.8}
          speed={0.14}
        />

        {/* the cusped arch frame drawn behind the content */}
        <ArchFrame className="pointer-events-none absolute inset-x-1 top-2 bottom-2 z-0 h-[calc(100%-1rem)] w-[calc(100%-0.5rem)] opacity-90" />

        {/* corner rose cascades spilling from the arch */}
        <FloralCascade
          side="left"
          className="glt-sway pointer-events-none absolute left-0 top-0 z-10 h-[52vh] max-h-[440px] w-[42vw] max-w-[240px] origin-top"
        />
        <FloralCascade
          side="right"
          className="glt-sway-alt pointer-events-none absolute right-0 top-0 z-10 h-[52vh] max-h-[440px] w-[42vw] max-w-[240px] origin-top"
        />

        {/* bells hanging under the arch crown */}
        <HangingBells className="pointer-events-none absolute left-1/2 top-[13%] z-10 h-16 w-[min(78vw,320px)] -translate-x-1/2 origin-top sm:top-[10%]" />

        <main className="relative z-20 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-7 pb-16 pt-14 text-center sm:px-10">
          {/* Ganesha at the apex */}
          <m.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Ganesha className="h-16 w-16 sm:h-20 sm:w-20" />
          </m.div>

          {/* SAVE THE DATE */}
          <m.h1
            initial={{ opacity: 0, letterSpacing: "0.08em" }}
            animate={{ opacity: 1, letterSpacing: "0.16em" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="glt-title mt-5 text-[clamp(2.9rem,13vw,5.6rem)] font-bold leading-[0.92]"
          >
            <span className="block">Save</span>
            <span className="block text-[0.62em] font-semibold tracking-[0.3em]">
              the
            </span>
            <span className="block">Date</span>
          </m.h1>

          {/* for the wedding of */}
          <m.p
            {...RISE}
            transition={{ delay: 0.85, duration: 0.7 }}
            className="glt-sans mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-[color:var(--glt-maroon)]/80 sm:text-xs"
          >
            For the wedding of
          </m.p>

          {/* names — gold-foil script */}
          <m.p
            {...RISE}
            transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
            className="glt-names glt-foil mt-2 text-[clamp(2.8rem,15vw,5.4rem)] leading-[1.05]"
          >
            {nameParts.length === 2 ? (
              <>
                {nameParts[0]}{" "}
                <span className="glt-amp">&amp;</span> {nameParts[1]}
              </>
            ) : (
              names
            )}
          </m.p>

          {/* date + city */}
          <m.div
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="mt-6 flex w-full max-w-sm items-center gap-3"
          >
            <span className="glt-rule flex-1" />
            <span className="text-[color:var(--glt-gold)]" aria-hidden>
              ✦
            </span>
            <span className="glt-rule flex-1" />
          </m.div>

          {dateLabel ? (
            <m.p
              {...RISE}
              transition={{ delay: 1.4, duration: 0.7 }}
              className="glt-date mt-4 text-[clamp(1.3rem,5.5vw,2rem)] font-semibold uppercase tracking-[0.16em] text-[color:var(--glt-maroon)]"
            >
              {dateLabel}
            </m.p>
          ) : null}
          {city || weekday ? (
            <m.p
              {...RISE}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="glt-sans mt-1 text-xs uppercase tracking-[0.4em] text-[color:var(--glt-ink-soft)]"
            >
              {[weekday, city].filter(Boolean).join(" · ")}
            </m.p>
          ) : null}

          {/* the scene — palace + lake with the couple on the balcony */}
          <m.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.65, duration: 0.9, ease: "easeOut" }}
            className="glt-scene relative mt-9 w-full max-w-md"
          >
            <div className="glt-scene-sky relative aspect-[5/4] w-full overflow-hidden rounded-t-[999px]">
              <PalaceScene className="absolute inset-0 h-full w-full" />
              <Couple className="absolute inset-x-0 bottom-0 mx-auto h-[62%] w-auto" />
            </div>
          </m.div>

          {/* romantic quote */}
          <m.p
            {...RISE}
            transition={{ delay: 1.95, duration: 0.8 }}
            className="glt-quote mt-8 max-w-md text-[clamp(1.35rem,5vw,1.9rem)] leading-snug text-[color:var(--glt-maroon)]"
          >
            &ldquo;{quote}&rdquo;
          </m.p>

          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1, duration: 0.6 }}
            className="mt-4 text-2xl text-[color:var(--glt-rose-deep)]"
            aria-hidden
          >
            ♥
          </m.div>

          {/* countdown */}
          {countdownDate ? (
            <m.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.25, duration: 0.7 }}
              className="mt-8"
            >
              <FlipCountdown
                dateIso={countdownDate}
                time={config.eventTime ? `${config.eventTime}:00` : undefined}
                tileClassName="glt-flip"
                labelClassName="text-[color:var(--glt-ink-soft)]"
              />
            </m.div>
          ) : null}

          {/* add to calendar */}
          {calUrl ? (
            <m.a
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.6 }}
              href={calUrl}
              target="_blank"
              rel="noreferrer"
              className="glt-btn mt-9"
            >
              Add to calendar
            </m.a>
          ) : null}

          {config.footer?.hashtag ? (
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.55, duration: 0.6 }}
              className="glt-names glt-foil mt-8 text-[clamp(1.5rem,7vw,2.4rem)]"
            >
              #{config.footer.hashtag}
            </m.p>
          ) : null}
        </main>

        {/* lanterns anchored to the lower corners */}
        <Lantern className="glt-lantern pointer-events-none absolute bottom-6 left-3 z-10 h-32 w-16 origin-top sm:left-6 sm:h-40 sm:w-20" />
        <Lantern className="glt-lantern-alt pointer-events-none absolute bottom-6 right-3 z-10 h-32 w-16 origin-top sm:right-6 sm:h-40 sm:w-20" />

        <footer className="relative z-20 pb-9 text-center">
          <p className="glt-sans text-[11px] uppercase tracking-[0.32em] text-[color:var(--glt-ink-soft)]">
            A formal invitation will follow
          </p>
          <JashnCredit className="mt-4 text-[color:var(--glt-ink-soft)]" />
        </footer>
      </div>
    </MotionProvider>
  );
}
