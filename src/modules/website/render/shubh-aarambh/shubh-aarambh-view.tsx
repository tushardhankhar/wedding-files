"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { MotionProvider } from "../experience/motion";
import { AnimatedDoorReveal } from "../experience/animated-door-reveal";
import { InteractiveRangoli } from "../experience/interactive-rangoli";
import { Diya } from "../experience/diya";
import { useCountdown, pad2 } from "../use-countdown";

function fmtTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

/** Section header: brass rule-flanked eyebrow over a rosewood serif heading. */
function SectionHead({
  eyebrow,
  title,
  lede,
  className,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className ?? ""}`}>
      <span className="sa-eyebrow">{eyebrow}</span>
      <h2 className="sa-serif sa-h2 mt-4 text-[clamp(1.7rem,6vw,2.6rem)] font-semibold leading-tight">
        {title}
      </h2>
      {lede ? (
        <p className="sa-lede mx-auto mt-3 max-w-md text-[15px] leading-relaxed">{lede}</p>
      ) : null}
    </div>
  );
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
        <div key={i} className="flex flex-col items-center gap-2.5">
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
    // The top padding reserves the space the card slides up into, so opening
    // the envelope never shifts the rest of the page.
    <div className="relative mx-auto max-w-sm pt-36">
      <AnimatePresence>
        {open ? (
          <m.div
            key="card"
            initial={{ opacity: 0, y: 72, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="sa-bless-card absolute inset-x-2 top-0 z-20"
          >
            <span
              className="sa-serif sa-deva block text-[clamp(1.35rem,5vw,1.7rem)] leading-snug text-[color:var(--sa-terracotta)]"
              lang="hi"
            >
              {hi}
            </span>
            <span className="sa-lede mt-2.5 block text-sm">{en}</span>
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
        style={{ height: 188, touchAction: "pan-y", perspective: 900 }}
      >
        <div className="sa-env-body absolute inset-0" />
        <m.div
          className="sa-env-flap absolute inset-x-0 top-0"
          style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
          animate={{ rotateX: open ? -168 : 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        />
        <m.span
          aria-hidden
          className="sa-env-seal absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
          transition={{ duration: 0.35 }}
        >
          ✻
        </m.span>
        <span className="sa-env-hint absolute inset-x-0 bottom-5 z-10 text-center">
          {open ? "With our blessings" : "Swipe up or tap"}
        </span>
      </button>
    </div>
  );
}

function DiyaTimeline({ events }: { events: WeddingEvent[] }) {
  return (
    <ol className="relative mx-auto max-w-md">
      <span aria-hidden className="sa-tl-line absolute left-[12px] top-4 bottom-4 w-[2px]" />
      {events.map((e) => (
        <m.li
          key={e.id}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-14%" }}
          transition={{ duration: 0.5 }}
          className="relative mb-9 pl-12 last:mb-0"
        >
          <m.span
            aria-hidden
            className="sa-tl-node absolute left-0 top-0.5"
            initial={{ opacity: 0.4, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-14%" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Diya size={18} />
          </m.span>
          {e.startTime ? <span className="sa-tl-time block">{fmtTime(e.startTime)}</span> : null}
          <span className="sa-serif mt-1 block text-[clamp(1.2rem,4.4vw,1.45rem)] font-semibold text-[color:var(--sa-charcoal)]">
            {e.name}
          </span>
          {e.nameHi ? (
            <span className="sa-deva sa-lede mt-1 block text-[15px]" lang="hi">
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
      animate={{ scale: expanded ? 1.015 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="sa-card sa-map mx-auto block w-full max-w-md text-left"
    >
      {/* concentric brass rings behind the address — a quiet "you are here" */}
      <svg
        viewBox="0 0 400 200"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <g stroke="var(--sa-saffron)" fill="none">
          <circle cx="330" cy="150" r="34" strokeWidth="1" opacity="0.4" />
          <circle cx="330" cy="150" r="58" strokeWidth="0.8" opacity="0.26" />
          <circle cx="330" cy="150" r="84" strokeWidth="0.6" opacity="0.16" />
        </g>
        <circle cx="330" cy="150" r="5" fill="var(--sa-terracotta)" opacity="0.55" />
      </svg>
      <div className="relative p-7">
        <span className="sa-eyebrow">The venue</span>
        <span className="sa-serif mt-3 block text-[clamp(1.4rem,5vw,1.85rem)] font-semibold text-[color:var(--sa-terracotta)]">
          {event.venueName}
        </span>
        {event.venueAddress ? (
          <span className="sa-lede mt-1.5 block text-sm">{event.venueAddress}</span>
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
              className="sa-directions mt-5 inline-block"
            >
              Open directions →
            </m.a>
          ) : (
            <span className="sa-tl-time mt-4 block">Tap for directions</span>
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

/* Jewel tones — deep enough to stay elegant once the rangoli is filled in. */
const DEFAULT_RANGOLI = ["#C79A3D", "#9C3B21", "#123F3E", "#8E2F4C", "#3B5E3A"];

export function ShubhAarambhView(props: WebsiteViewProps) {
  const { theme, names, dateLabel, countdownDate, events, config, chip, initials } = props;
  const sa = config.experience?.shubhAarambh;
  const family = sa?.familyName?.en ?? names;
  const title = sa?.title?.en ?? "Griha Pravesh";
  const blessingEn = sa?.blessing?.en ?? "Welcome to our new home";
  const blessingHi = sa?.blessing?.hi ?? blessingEn;
  const rangoliColors =
    sa?.rangoliColors && sa.rangoliColors.length > 0 ? sa.rangoliColors : DEFAULT_RANGOLI;

  const [joined, setJoined] = useState(false);

  return (
    <MotionProvider>
      <div style={theme.vars} className="sa relative">
        {/* ── Hero: a rosewood room, doors opening onto warm light ─────────── */}
        <header className="sa-hero relative flex min-h-dvh flex-col items-center justify-center px-5 pb-24 pt-24">
          <nav className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-8">
            <span className="sa-serif sa-navlink text-lg font-semibold tracking-wide">
              {initials}
            </span>
            {chip ? (
              <span className="sa-chip rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em]">
                {chip.en}
              </span>
            ) : null}
          </nav>

          <AnimatedDoorReveal
            autoOpenDelay={1100}
            height="min(74dvh, 600px)"
            className="w-full max-w-2xl rounded-[26px]"
            doorLabel={
              <p className="sa-serif text-[clamp(1.4rem,5vw,2.1rem)] text-[color:var(--sa-gold-lite)]">
                A new door opens…
              </p>
            }
          >
            <p className="sa-hero-eyebrow text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-[11px]">
              Welcome to our new beginning
            </p>
            <h1 className="sa-serif sa-hero-title mt-4 text-[clamp(2.1rem,8vw,3.9rem)] font-bold leading-[1.05]">
              {family}
            </h1>
            <p className="sa-hero-sub mt-4 text-[clamp(0.85rem,3.4vw,1.05rem)] font-semibold uppercase tracking-[0.22em]">
              {title}
            </p>
            {dateLabel ? (
              <p className="sa-hero-date mt-5 text-[11px] font-medium uppercase tracking-[0.28em]">
                {dateLabel}
              </p>
            ) : null}
          </AnimatedDoorReveal>
        </header>

        {/* ── Interactive rangoli ────────────────────────────────────────── */}
        <section className="relative z-10 px-5 pb-20 pt-16 sm:pt-20">
          <SectionHead
            eyebrow="Leave your mark"
            title="Add a colour to our new beginning"
            lede="Pick a colour, then tap the rangoli to fill it in."
          />
          <div className="mt-11">
            <InteractiveRangoli colors={rangoliColors} completeText="Shubh Aarambh" />
          </div>
        </section>

        {/* ── Blessing (shagun) ──────────────────────────────────────────── */}
        <section className="sa-band relative z-10 px-5 py-20">
          <SectionHead eyebrow="Shagun" title="A blessing awaits you" />
          <BlessingEnvelope en={blessingEn} hi={blessingHi} />
        </section>

        {/* ── Ceremony timeline + venue ──────────────────────────────────── */}
        <section className="relative z-10 px-5 py-20">
          {events.length > 0 ? (
            <>
              <SectionHead eyebrow="The order of the day" title="The ceremony" className="mb-12" />
              <DiyaTimeline events={events} />
              <hr className="sa-rule mx-auto my-14 max-w-md" />
            </>
          ) : null}
          <MapCard event={events[events.length - 1]} />
        </section>

        {/* ── Countdown ──────────────────────────────────────────────────── */}
        {countdownDate ? (
          <section className="sa-band relative z-10 px-5 py-20">
            <SectionHead
              eyebrow="Save the muhurat"
              title="The auspicious day arrives in"
              className="mb-11"
            />
            <BrassCountdown dateIso={countdownDate} time="10:30:00" />
          </section>
        ) : null}

        {/* ── RSVP + signature: closes on the same rosewood as the hero ──── */}
        <section className="sa-close relative z-10 px-5 pb-14 pt-20 text-center">
          {joined ? (
            <div className="relative mx-auto max-w-lg">
              <AnimatedDoorReveal
                autoOpenDelay={300}
                height={300}
                className="mx-auto w-full rounded-[24px]"
              >
                <p className="sa-serif text-[clamp(1.4rem,5vw,2rem)] font-semibold leading-snug text-[color:var(--sa-ivory)]">
                  Our home will be happier with you in it.
                </p>
              </AnimatedDoorReveal>
              {/* petals drifting inward */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
              >
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
            <>
              <span className="sa-eyebrow sa-eyebrow-dark">Will you join us</span>
              <p className="sa-serif mx-auto mt-4 max-w-md text-[clamp(1.35rem,5vw,1.9rem)] leading-snug text-[color:var(--sa-ivory)]">
                Every new home needs the people who make it one.
              </p>
              <m.button
                type="button"
                onClick={() => setJoined(true)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="sa-btn mt-9"
              >
                Join our new beginning
              </m.button>
            </>
          )}

          <footer className="mt-16 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4" aria-hidden>
              <span className="sa-close-rule" />
              <Diya size={22} />
              <span className="sa-close-rule" />
            </div>
            {config.footer?.hashtag ? (
              <span className="sa-serif text-lg font-semibold text-[color:var(--sa-gold-lite)]">
                #{config.footer.hashtag}
              </span>
            ) : null}
            <JashnCredit className="text-[color:var(--sa-ivory)]/55" />
          </footer>
        </section>
      </div>
    </MotionProvider>
  );
}
