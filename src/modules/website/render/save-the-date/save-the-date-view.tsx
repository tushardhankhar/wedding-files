"use client";

import { m } from "motion/react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { MotionProvider } from "../experience/motion";
import { FloatingParticles } from "../experience/floating-particles";
import { FlipCountdown } from "../experience/flip-countdown";
import { resolveArtwork } from "../artwork-placement";
import { OvertureCameo } from "./cameo";

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

/** One animated gold corner flourish; rotate to place at each corner. */
function CornerFlourish({
  className,
  rotate,
  delay,
}: {
  className: string;
  rotate: number;
  delay: number;
}) {
  return (
    <svg
      viewBox="0 0 130 130"
      fill="none"
      aria-hidden
      className={`pointer-events-none absolute h-20 w-20 sm:h-28 sm:w-28 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <m.path
        d="M120 14 L48 14 Q14 14 14 48 L14 120"
        stroke="var(--std-gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ delay, duration: 1.5, ease: "easeInOut" }}
      />
      <m.path
        d="M14 48 q22 2 26 -18 q4 20 26 18"
        stroke="var(--std-gold)"
        strokeWidth="1.1"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{ delay: delay + 0.35, duration: 1, ease: "easeInOut" }}
      />
      <m.circle
        cx="48"
        cy="14"
        r="2.4"
        fill="var(--std-gold)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 1.1, duration: 0.5 }}
      />
    </svg>
  );
}

const RISE = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function SaveTheDateView(props: WebsiteViewProps) {
  const { theme, names, dateLabel, countdownDate, events, initials, config } =
    props;
  const city = cityOf(events);
  const weekday = weekdayOf(countdownDate);
  const calUrl = gcalUrl(countdownDate, `Save the Date — ${names}`);
  // Two names → stack them: first name, then "& second name" on its own line.
  const nameParts = names.split(" & ");
  // Off unless the client turns it on: the Overture is typographic by design, so
  // the illustration is an addition rather than something to switch off.
  const illustration = resolveArtwork(config.artwork, theme.supports.artwork);

  return (
    <MotionProvider>
      <div style={theme.vars} className="std relative flex min-h-dvh flex-col">
        {/* ambient gold motes */}
        <FloatingParticles
          colors={["#e8cd7e", "#c9a23f", "#fff4d0"]}
          density={5}
          maxCount={40}
          minR={0.4}
          maxR={1.9}
          speed={0.16}
        />

        <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
          {/* ornamental frame */}
          <CornerFlourish className="left-2 top-2 sm:left-4 sm:top-4" rotate={0} delay={0.2} />
          <CornerFlourish className="right-2 top-2 sm:right-4 sm:top-4" rotate={90} delay={0.35} />
          <CornerFlourish className="bottom-2 right-2 sm:bottom-4 sm:right-4" rotate={180} delay={0.5} />
          <CornerFlourish className="bottom-2 left-2 sm:bottom-4 sm:left-4" rotate={270} delay={0.65} />

          {/* the couple in their niche, or — with the illustration off — the
              monogram seal the theme opens with by default */}
          {illustration.show ? (
            <m.div
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
            >
              <OvertureCameo artwork={illustration.art ?? undefined} initials={initials} />
            </m.div>
          ) : (
            <m.div
              initial={{ opacity: 0, scale: 1.35, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 1, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative"
            >
              <span className="std-ring absolute inset-0 -m-3" aria-hidden />
              <span className="std-seal">
                <span className="std-seal-mono">{initials}</span>
              </span>
            </m.div>
          )}

          {/* SAVE THE DATE */}
          <m.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.5em" }}
            transition={{ delay: 1.35, duration: 1 }}
            className="std-foil std-sans mt-9 pl-[0.5em] text-xs font-semibold uppercase sm:text-sm"
          >
            Save the Date
          </m.p>

          {/* names */}
          <m.h1
            {...RISE}
            transition={{ delay: 1.6, duration: 0.9, ease: "easeOut" }}
            className="std-foil mt-5 text-[clamp(2.6rem,9vw,5.2rem)] font-semibold leading-[1.05]"
          >
            {nameParts.length === 2 ? (
              <>
                {nameParts[0]}
                <br />
                <span className="font-normal text-[0.62em]">&amp;</span>
                <br />
                {nameParts[1]}
              </>
            ) : (
              names
            )}
          </m.h1>

          {/* divider */}
          <m.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 2.1, duration: 0.8, ease: "easeOut" }}
            className="mt-7 flex w-full max-w-xs items-center gap-3"
          >
            <span className="std-rule flex-1" />
            <span className="text-[color:var(--std-gold-lite)]" aria-hidden>
              ✦
            </span>
            <span className="std-rule flex-1" />
          </m.div>

          {/* date */}
          {dateLabel ? (
            <m.div
              {...RISE}
              transition={{ delay: 2.3, duration: 0.8, ease: "easeOut" }}
              className="mt-6"
            >
              {weekday ? (
                <p className="std-sans text-[11px] uppercase tracking-[0.4em] text-[color:var(--std-ivory)]/70">
                  {weekday}
                </p>
              ) : null}
              <p className="mt-2 text-[clamp(1.5rem,5vw,2.4rem)] text-[color:var(--std-gold-lite)]">
                {dateLabel}
              </p>
            </m.div>
          ) : null}

          {/* countdown */}
          {countdownDate ? (
            <m.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.8 }}
              className="mt-9"
            >
              <FlipCountdown
                dateIso={countdownDate}
                time={config.eventTime ? `${config.eventTime}:00` : undefined}
                tileClassName="std-flip"
                labelClassName="text-[color:var(--std-gold-lite)]/70"
              />
            </m.div>
          ) : null}

          {/* city + calendar */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.95, duration: 0.8 }}
            className="mt-10 flex flex-col items-center gap-5"
          >
            {city ? (
              <p className="std-sans text-xs uppercase tracking-[0.34em] text-[color:var(--std-ivory)]/70">
                {city}
              </p>
            ) : null}
            <p className="std-script text-3xl text-[color:var(--std-gold-lite)]">
              Mark your calendars
            </p>
            {calUrl ? (
              <a href={calUrl} target="_blank" rel="noreferrer" className="std-btn">
                Add to calendar
              </a>
            ) : null}
          </m.div>
        </main>

        <footer className="relative z-10 pb-10 text-center">
          <p className="std-sans text-[11px] uppercase tracking-[0.3em] text-[color:var(--std-ivory)]/50">
            A formal invitation will follow
          </p>
          {config.footer?.hashtag ? (
            <p className="std-script mt-2 text-xl text-[color:var(--std-gold-lite)]">
              #{config.footer.hashtag}
            </p>
          ) : null}
          <JashnCredit className="mt-5 text-[color:var(--std-ivory)]/45" />
        </footer>
      </div>
    </MotionProvider>
  );
}
