"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { MotionProvider } from "../experience/motion";
import { AnimatedDoorReveal } from "../experience/animated-door-reveal";
import { InteractiveRangoli } from "../experience/interactive-rangoli";
import { useCountdown, pad2 } from "../use-countdown";

function fmtTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

/* Brass medallions — numbers rotate into place as they change. */
function BrassCountdown({ dateIso, time }: { dateIso: string; time?: string }) {
  const c = useCountdown(dateIso, time);
  const units = [
    { v: c.days, l: "Days" },
    { v: c.hours, l: "Hours" },
    { v: c.minutes, l: "Minutes" },
    { v: c.seconds, l: "Seconds" },
  ];
  return (
    <div className="flex items-start justify-center gap-3 sm:gap-5">
      {units.map((u, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <div className="sa-medallion">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={pad2(u.v, c.ready)}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                className="sa-medallion-num"
              >
                {pad2(u.v, c.ready)}
              </m.span>
            </AnimatePresence>
          </div>
          <span className="sa-medallion-label">{u.l}</span>
        </div>
      ))}
    </div>
  );
}

/* Swipe-up / tap envelope → blessing card slides out. */
function BlessingEnvelope({ en, hi }: { en: string; hi: string }) {
  const [open, setOpen] = useState(false);
  const startY = useRef<number | null>(null);
  const onDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
  };
  const onUp = (e: React.PointerEvent) => {
    if (startY.current != null && startY.current - e.clientY > 24) setOpen(true);
    startY.current = null;
  };
  return (
    <div className="relative mx-auto max-w-sm pt-36">
      <AnimatePresence>
        {open ? (
          <m.div
            key="card"
            initial={{ opacity: 0, y: 64, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="sa-bless-card absolute inset-x-2 top-0"
          >
            <span className="sa-serif block text-2xl text-[color:var(--sa-terracotta)]" lang="hi">
              {hi}
            </span>
            <span className="mt-2 block text-sm text-[color:var(--w-ink-soft)]">{en}</span>
          </m.div>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onPointerDown={onDown}
        onPointerUp={onUp}
        aria-label="Open the blessing"
        className="sa-envelope relative block w-full"
        style={{ height: 180, touchAction: "pan-y" }}
      >
        <div className="sa-env-body absolute inset-0" />
        <m.div
          className="sa-env-flap absolute inset-x-0 top-0"
          style={{ transformOrigin: "top center" }}
          animate={{ rotateX: open ? -165 : 0 }}
          transition={{ duration: 0.5 }}
        />
        <span className="absolute inset-x-0 bottom-5 z-10 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85">
          {open ? "🙏" : "Swipe up or tap"}
        </span>
      </button>
    </div>
  );
}

function DiyaTimeline({ events }: { events: WeddingEvent[] }) {
  return (
    <ol className="relative mx-auto max-w-md">
      <span aria-hidden className="sa-tl-line absolute left-[11px] top-3 bottom-3 w-[2px]" />
      {events.map((e) => (
        <m.li
          key={e.id}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-14%" }}
          transition={{ duration: 0.5 }}
          className="relative mb-8 pl-10 last:mb-0"
        >
          <m.span
            aria-hidden
            className="sa-tl-diya absolute left-0 top-0.5"
            initial={{ opacity: 0.4, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-14%" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            🪔
          </m.span>
          {e.startTime ? (
            <span className="block text-sm font-semibold tracking-wide text-[color:var(--sa-saffron)]">
              {fmtTime(e.startTime)}
            </span>
          ) : null}
          <span className="sa-serif mt-0.5 block text-xl text-[color:var(--sa-charcoal)]">
            {e.name}
          </span>
          {e.nameHi ? (
            <span className="mt-0.5 block text-sm text-[color:var(--w-ink-soft)]" lang="hi">
              {e.nameHi}
            </span>
          ) : null}
        </m.li>
      ))}
    </ol>
  );
}

function MapCard({ event }: { event: WeddingEvent | undefined }) {
  const [expanded, setExpanded] = useState(false);
  if (!event?.venueName) return null;
  return (
    <m.button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      animate={{ scale: expanded ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="sa-map relative mx-auto block w-full max-w-md overflow-hidden text-left"
    >
      <svg viewBox="0 0 400 160" className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
        <path d="M0 40 L120 40 L120 160 M120 90 L400 90 M240 0 L240 90 M60 90 L60 160" fill="none" stroke="var(--sa-saffron)" strokeWidth="2" />
        <circle cx="240" cy="90" r="8" fill="var(--sa-terracotta)" />
      </svg>
      <div className="relative p-6">
        <span className="sa-serif text-2xl text-[color:var(--sa-charcoal)]">
          {event.venueName}
        </span>
        {event.venueAddress ? (
          <span className="mt-1 block text-sm text-[color:var(--w-ink-soft)]">
            {event.venueAddress}
          </span>
        ) : null}
        <AnimatePresence initial={false}>
          {expanded && event.mapsUrl ? (
            <m.a
              href={event.mapsUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="sa-directions mt-4 inline-block"
            >
              Open directions →
            </m.a>
          ) : (
            <span className="mt-3 block text-xs uppercase tracking-[0.2em] text-[color:var(--sa-saffron)]">
              Tap for directions
            </span>
          )}
        </AnimatePresence>
      </div>
    </m.button>
  );
}

// Deterministic inward-drifting petals for the RSVP moment.
const PETALS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return { x: Math.cos(a) * 60, y: Math.sin(a) * 60, delay: (i % 4) * 0.08 };
});

export function ShubhAarambhView(props: WebsiteViewProps) {
  const { theme, names, dateLabel, countdownDate, events, config, chip, initials } =
    props;
  const sa = config.experience?.shubhAarambh;
  const family = sa?.familyName?.en ?? names;
  const title = sa?.title?.en ?? "Griha Pravesh";
  const blessingEn = sa?.blessing?.en ?? "Welcome to our new home";
  const blessingHi = sa?.blessing?.hi ?? blessingEn;
  const rangoliColors =
    sa?.rangoliColors && sa.rangoliColors.length > 0
      ? sa.rangoliColors
      : ["#D99A2B", "#B55233", "#174C4F", "#C2185B", "#2E7D32"];

  const [joined, setJoined] = useState(false);

  return (
    <MotionProvider>
      <div style={theme.vars} className="sa relative">
        {/* Nav */}
        <nav className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-3.5 sm:px-8">
          <span className="sa-serif text-lg text-white">{initials}</span>
          {chip ? (
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] tracking-wide text-white backdrop-blur">
              {chip.en}
            </span>
          ) : null}
        </nav>

        {/* ── Hero: opening doors ────────────────────────────────────────── */}
        <header className="relative flex min-h-dvh items-center justify-center px-5 py-20">
          <AnimatedDoorReveal
            autoOpenDelay={1100}
            height="min(78dvh, 620px)"
            className="w-full max-w-2xl rounded-[28px]"
            doorLabel={
              <p className="sa-serif text-[clamp(1.4rem,5vw,2.2rem)] text-[color:var(--sa-ivory)]">
                A new door opens…
              </p>
            }
          >
            <p className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--sa-charcoal)]/70">
              Welcome to our new beginning
            </p>
            <h1 className="sa-serif mt-4 text-[clamp(2rem,8vw,3.8rem)] font-semibold leading-tight text-[color:var(--sa-terracotta)]">
              {family}
            </h1>
            <p className="mt-3 text-lg uppercase tracking-[0.2em] text-[color:var(--sa-teal)]">
              {title}
            </p>
            {dateLabel ? (
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[color:var(--sa-charcoal)]/70">
                {dateLabel}
              </p>
            ) : null}
          </AnimatedDoorReveal>
        </header>

        {/* ── Interactive rangoli ────────────────────────────────────────── */}
        <section className="relative z-10 px-5 py-16 text-center">
          <h2 className="sa-serif text-[clamp(1.5rem,5vw,2.2rem)] text-[color:var(--sa-charcoal)]">
            Add a colour to our new beginning
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[color:var(--w-ink-soft)]">
            Pick a colour, then tap the rangoli to fill it in.
          </p>
          <div className="mt-10">
            <InteractiveRangoli colors={rangoliColors} completeText="Shubh Aarambh ✨" />
          </div>
        </section>

        {/* ── Blessing (shagun) ──────────────────────────────────────────── */}
        <section className="relative z-10 px-5 py-16 text-center">
          <h2 className="sa-serif text-[clamp(1.4rem,5vw,2rem)] text-[color:var(--sa-charcoal)]">
            A blessing awaits you
          </h2>
          <div className="mt-8">
            <BlessingEnvelope en={blessingEn} hi={blessingHi} />
          </div>
        </section>

        {/* ── Ceremony timeline ──────────────────────────────────────────── */}
        {events.length > 0 ? (
          <section className="relative z-10 px-5 py-16">
            <h2 className="sa-serif mb-10 text-center text-[clamp(1.5rem,5vw,2.2rem)] text-[color:var(--sa-charcoal)]">
              The ceremony
            </h2>
            <DiyaTimeline events={events} />
          </section>
        ) : null}

        {/* ── Location ───────────────────────────────────────────────────── */}
        <section className="relative z-10 px-5 py-14">
          <MapCard event={events[events.length - 1]} />
        </section>

        {/* ── Countdown ──────────────────────────────────────────────────── */}
        {countdownDate ? (
          <section className="relative z-10 px-5 py-14 text-center">
            <h2 className="sa-serif mb-9 text-[clamp(1.5rem,5vw,2.1rem)] text-[color:var(--sa-charcoal)]">
              The auspicious day arrives in
            </h2>
            <BrassCountdown dateIso={countdownDate} time="10:30:00" />
          </section>
        ) : null}

        {/* ── RSVP ───────────────────────────────────────────────────────── */}
        <section className="relative z-10 px-5 pb-8 pt-10 text-center">
          {joined ? (
            <div className="relative">
              <AnimatedDoorReveal
                autoOpenDelay={300}
                height={300}
                className="mx-auto w-full max-w-lg rounded-[24px]"
              >
                <p className="sa-serif text-[clamp(1.4rem,5vw,2rem)] leading-snug text-[color:var(--sa-terracotta)]">
                  Our home will be happier with you in it.
                </p>
              </AnimatedDoorReveal>
              {/* petals drifting inward */}
              <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                {PETALS.map((p, i) => (
                  <m.span
                    key={i}
                    initial={{ x: `${p.x}%`, y: `${p.y}%`, opacity: 0, scale: 0.6 }}
                    animate={{ x: "0%", y: "0%", opacity: [0, 1, 0], scale: 1 }}
                    transition={{ duration: 1.8, delay: 0.4 + p.delay, ease: "easeIn" }}
                    className="absolute text-xl"
                  >
                    🌼
                  </m.span>
                ))}
              </div>
            </div>
          ) : (
            <m.button
              type="button"
              onClick={() => setJoined(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="sa-btn"
            >
              Join our new beginning
            </m.button>
          )}
        </section>

        {/* Signature */}
        <footer className="relative z-10 flex flex-col items-center gap-3 pb-16">
          <div className="flex items-center gap-3 text-lg text-[color:var(--sa-saffron)]" aria-hidden>
            <span>◇</span>
            <span>✦</span>
            <span>◇</span>
          </div>
          {config.footer?.hashtag ? (
            <span className="sa-serif text-lg text-[color:var(--sa-terracotta)]">
              #{config.footer.hashtag}
            </span>
          ) : null}
          <JashnCredit className="text-[color:var(--sa-terracotta)]/55" />
        </footer>
      </div>
    </MotionProvider>
  );
}
