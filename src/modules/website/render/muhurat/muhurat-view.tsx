"use client";

import { m } from "motion/react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { MotionProvider } from "../experience/motion";
import { FloatingParticles } from "../experience/floating-particles";
import { FlipCountdown } from "../experience/flip-countdown";

/* ── helpers ──────────────────────────────────────────────────────────────── */
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

/* ── ornaments ─────────────────────────────────────────────────────────────── */

/** A concentric-petal mandala in antique gold line-art — the theme's signature.
 *  Spins slowly (via the .mht-mandala CSS class) behind the monogram seal. */
function Mandala({ className }: { className?: string }) {
  const rings = [
    { n: 12, d: "M100 100 C 94 72 94 46 100 30 C 106 46 106 72 100 100 Z", w: 0.9, o: 0.42 },
    { n: 8, d: "M100 100 C 93 82 93 68 100 60 C 107 68 107 82 100 100 Z", w: 1, o: 0.6 },
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className={className}>
      <g stroke="var(--mht-gold)">
        <circle cx="100" cy="100" r="78" strokeWidth="0.6" opacity="0.25" />
        <circle cx="100" cy="100" r="44" strokeWidth="0.6" opacity="0.25" />
        {rings.map((ring, ri) =>
          Array.from({ length: ring.n }).map((_, i) => (
            <path
              key={`${ri}-${i}`}
              d={ring.d}
              strokeWidth={ring.w}
              opacity={ring.o}
              transform={`rotate(${(360 / ring.n) * i} 100 100)`}
            />
          ))
        )}
        <circle cx="100" cy="100" r="3" fill="var(--mht-gold)" stroke="none" />
      </g>
    </svg>
  );
}

/** A hanging toran (bandhanwar) — a draped rope with leaf-and-marigold strands,
 *  the auspicious garland strung over an Indian doorway. Draws itself in on load. */
function Toran({ className }: { className?: string }) {
  const strands = Array.from({ length: 13 }).map((_, i) => {
    const x = 12 + i * 31; // 12 … 384 across the 400-wide viewBox
    const t = (x - 200) / 200;
    const y = 8 + 34 * (1 - t * t); // parabola matching the drooping rope
    const len = i % 2 ? 24 : 40;
    return { x, y, len };
  });
  return (
    <svg
      viewBox="0 0 400 90"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      <m.path
        d="M0 8 Q 200 42 400 8"
        stroke="var(--mht-gold)"
        strokeWidth="1.2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      {strands.map((s, i) => (
        <m.g
          key={i}
          stroke="var(--mht-gold)"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 0.75, y: 0 }}
          transition={{ delay: 0.6 + i * 0.05, duration: 0.5 }}
        >
          <line x1={s.x} y1={s.y} x2={s.x} y2={s.y + s.len} strokeWidth="0.9" />
          <ellipse cx={s.x - 3} cy={s.y + s.len * 0.5} rx="2.4" ry="4" strokeWidth="0.8" />
          <ellipse cx={s.x + 3} cy={s.y + s.len * 0.68} rx="2.4" ry="4" strokeWidth="0.8" />
          <circle cx={s.x} cy={s.y + s.len} r="3" fill="var(--mht-gold-lite)" stroke="none" />
        </m.g>
      ))}
    </svg>
  );
}

const RISE = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

/* ══════════════════════════════════════════════════════════════════════════ */
export function MuhuratView(props: WebsiteViewProps) {
  const { theme, names, dateLabel, countdownDate, events, initials, config } =
    props;
  const city = cityOf(events);
  const weekday = weekdayOf(countdownDate);
  const calUrl = gcalUrl(countdownDate, `Save the Date — ${names}`);
  // Two names → stack them: first name, then "& second name" on its own line.
  const nameParts = names.split(" & ");

  return (
    <MotionProvider>
      <div style={theme.vars} className="mht relative flex min-h-dvh flex-col">
        {/* ambient gold motes */}
        <FloatingParticles
          colors={["#e8cd7e", "#c9a23f", "#fff4d0"]}
          density={5}
          maxCount={40}
          minR={0.4}
          maxR={1.9}
          speed={0.16}
        />

        {/* toran strung across the top */}
        <Toran className="pointer-events-none absolute inset-x-0 top-0 h-16 w-full sm:h-20" />

        <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
          {/* seal + mandala */}
          <div className="relative flex items-center justify-center">
            <Mandala className="mht-mandala pointer-events-none absolute h-[clamp(240px,78vw,400px)] w-[clamp(240px,78vw,400px)]" />
            <m.div
              initial={{ opacity: 0, scale: 1.35, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.9, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative"
            >
              <span className="mht-seal">
                <span className="mht-seal-mono">{initials}</span>
              </span>
            </m.div>
          </div>

          {/* auspicious line (Devanagari) */}
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.25, duration: 0.9 }}
            className="mht-deva mt-8 text-sm tracking-[0.3em] text-[color:var(--mht-gold-lite)]/85"
          >
            ॥ शुभ मुहूर्त ॥
          </m.p>

          {/* SAVE THE DATE */}
          <m.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.5em" }}
            transition={{ delay: 1.4, duration: 1 }}
            className="mht-foil mht-sans mt-4 pl-[0.5em] text-xs font-semibold uppercase sm:text-sm"
          >
            Save the Date
          </m.p>

          {/* names */}
          <m.h1
            {...RISE}
            transition={{ delay: 1.65, duration: 0.9, ease: "easeOut" }}
            className="mht-foil mt-5 text-[clamp(2.6rem,9vw,5.2rem)] font-semibold leading-[1.05]"
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
            <span className="mht-rule flex-1" />
            <span className="text-[color:var(--mht-gold-lite)]" aria-hidden>
              ✦
            </span>
            <span className="mht-rule flex-1" />
          </m.div>

          {/* the muhurat — date card */}
          {dateLabel ? (
            <m.div
              {...RISE}
              transition={{ delay: 2.3, duration: 0.8, ease: "easeOut" }}
              className="mht-datecard mt-7 px-8 py-4"
            >
              {weekday ? (
                <p className="mht-sans text-[11px] uppercase tracking-[0.4em] text-[color:var(--mht-ivory)]/70">
                  {weekday}
                </p>
              ) : null}
              <p className="mt-2 text-[clamp(1.5rem,5vw,2.4rem)] text-[color:var(--mht-gold-lite)]">
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
                tileClassName="mht-flip"
                labelClassName="text-[color:var(--mht-gold-lite)]/70"
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
              <p className="mht-sans text-xs uppercase tracking-[0.34em] text-[color:var(--mht-ivory)]/70">
                {city}
              </p>
            ) : null}
            <p className="mht-script text-3xl text-[color:var(--mht-gold-lite)]">
              Mark your calendars
            </p>
            {calUrl ? (
              <a href={calUrl} target="_blank" rel="noreferrer" className="mht-btn">
                Add to calendar
              </a>
            ) : null}
          </m.div>
        </main>

        <footer className="relative z-10 pb-10 text-center">
          <p className="mht-sans text-[11px] uppercase tracking-[0.3em] text-[color:var(--mht-ivory)]/50">
            A formal invitation will follow
          </p>
          {config.footer?.hashtag ? (
            <p className="mht-script mt-2 text-xl text-[color:var(--mht-gold-lite)]">
              #{config.footer.hashtag}
            </p>
          ) : null}
          <JashnCredit className="mt-5 text-[color:var(--mht-ivory)]/45" />
        </footer>
      </div>
    </MotionProvider>
  );
}
