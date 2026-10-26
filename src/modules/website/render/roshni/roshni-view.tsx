"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  AnimatePresence,
  m,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { WeddingEvent } from "@/modules/events/types";
import type { Localized } from "../../schema";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { MotionProvider } from "../experience/motion";
import { FloatingParticles } from "../experience/floating-particles";
import { useCountdown, pad2 } from "../use-countdown";
import {
  CalendarIcon,
  ClockIcon,
  Diya,
  GoldRule,
  Lantern,
  Mandala,
  PanelCorner,
  Petals,
  PinIcon,
  Rangoli,
  Toran,
} from "./ornaments";
import { RoshniGroupRsvp, RoshniRsvpDemo, RoshniSelfRsvp } from "./roshni-rsvp";
import { ROSHNI_DEFAULTS } from "./copy";

/**
 * THE ROSHNI — a Diwali invitation.
 *
 * Wine, antique gold and ivory. The guest arrives on a dark wine screen where
 * gold dust rises, diyas light one by one and a rangoli draws itself round a
 * centre flame; only when they tap "Begin the celebration" does the invitation
 * unfold. Scroll then walks them through an ivory letter, the when-and-where,
 * a lit festive scene and the RSVP, closing on a finale of diyas and the
 * JOIN THE JASHN signature.
 *
 * Every printed line is the host's to rewrite (`experience.roshni`), falling
 * back to the wording in ./copy.ts. Motion is Framer (transform/opacity)
 * plus CSS flames and one canvas of dust per section; reduced motion collapses
 * all of it, and low-end devices get the "lite" tier — fewer particles, no
 * parallax.
 */


const pick = (v: Localized | undefined, fallback: string) => v?.en?.trim() || fallback;

/* Stable arrays — FloatingParticles rebuilds whenever its props change. */
const DUST = ["#F0C35A", "#D9A52E", "#FFE7A0"];
const SPARKLE = ["#FFF1C4", "#F0C35A"];

/* ── Low-end tier ─────────────────────────────────────────────────────────── */
const noSubscribe = () => () => {};
function readLite(): boolean {
  const n = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    (n.hardwareConcurrency ?? 8) <= 2 ||
    (n.deviceMemory ?? 8) <= 2 ||
    n.connection?.saveData === true
  );
}
function useLite() {
  return useSyncExternalStore(noSubscribe, readLite, () => false);
}

/* ── Formatting ───────────────────────────────────────────────────────────── */
function parseTime(t: string | null | undefined): { h: number; m: number } | null {
  if (!t) return null;
  const [h, mm] = t.split(":").map(Number);
  return Number.isFinite(h) ? { h, m: Number.isFinite(mm) ? mm : 0 } : null;
}
function fmtTime(t: { h: number; m: number } | null): string {
  if (!t) return "";
  const ap = t.h < 12 ? "AM" : "PM";
  const hh = t.h % 12 === 0 ? 12 : t.h % 12;
  return `${hh}:${String(t.m).padStart(2, "0")} ${ap}`;
}
function weekday(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long" });
}
function directionsUrl(e: WeddingEvent | undefined): string | null {
  if (!e) return null;
  if (e.mapsUrl) return e.mapsUrl;
  const q = [e.venueName, e.venueAddress].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null;
}
function whatsappUrl(number: string | undefined, message: string): string | null {
  const digits = number?.replace(/\D/g, "");
  if (!digits || digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/* ── Shared bits ──────────────────────────────────────────────────────────── */
function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </m.div>
  );
}

function SectionHead({
  eyebrow,
  title,
  lede,
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Reveal className="mx-auto max-w-xl text-center">
      <span className={tone === "dark" ? "rsh-eyebrow" : "rsh-eyebrow rsh-eyebrow-ink"}>{eyebrow}</span>
      <h2
        className={`rsh-serif mt-4 text-[clamp(1.9rem,7vw,3rem)] font-semibold leading-[1.08] ${
          tone === "dark" ? "text-[color:var(--rsh-ivory)]" : "text-[color:var(--rsh-wine)]"
        }`}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={`mx-auto mt-4 max-w-md text-[15px] leading-relaxed ${
            tone === "dark" ? "text-[color:var(--rsh-ivory)]/75" : "text-[color:var(--rsh-ink-soft)]"
          }`}
        >
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}

/* ── 1 · Cinematic intro ──────────────────────────────────────────────────── */
const GATE_DIYAS = [0, 1, 2, 3, 4];

function IntroGate({ onBegin, lite }: { onBegin: () => void; lite: boolean }) {
  const reduce = useReducedMotion();
  // Under reduced motion the whole sequence is already complete on arrival.
  const at = (s: number) => (reduce ? 0 : s);
  return (
    <m.div
      key="gate"
      className="rsh-gate fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1] } }}
      role="dialog"
      aria-modal="true"
      aria-label="Diwali invitation"
    >
      <div className="rsh-gate-glow" aria-hidden />
      <FloatingParticles
        colors={DUST}
        density={lite ? 3 : 7}
        maxCount={lite ? 26 : 70}
        minR={0.5}
        maxR={1.9}
        speed={0.2}
        mode="rise"
      />

      <m.p
        className="rsh-brand relative text-[10px] sm:text-[11px]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: at(0.5) }}
      >
        Join the Jashn <span className="opacity-60">presents</span>
      </m.p>

      <div className="relative mt-6 aspect-square w-[min(74vw,46svh,340px)]">
        <Rangoli
          delay={at(2.3)}
          duration={reduce ? 0 : 3.4}
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 flex items-center justify-center pb-[6%]">
          <Diya size={64} delay={at(1.1)} seed={3} />
        </div>
      </div>

      <div className="relative mt-2 flex items-end gap-3 sm:gap-5" aria-hidden>
        {GATE_DIYAS.map((i) => (
          <Diya key={i} size={i === 2 ? 40 : 32} delay={at(1.5 + Math.abs(i - 2) * 0.35)} seed={i} />
        ))}
      </div>

      <m.div
        className="relative mt-7 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: at(5.2), ease: [0.2, 0.7, 0.2, 1] }}
      >
        <p className="rsh-deva text-[clamp(1.1rem,4.6vw,1.4rem)] text-[color:var(--rsh-glow)]" lang="hi">
          शुभ दीपावली
        </p>
        <button type="button" onClick={onBegin} className="rsh-begin mt-5" autoFocus>
          <span className="rsh-begin-diya">
            <Diya size={22} seed={7} />
          </span>
          Tap to Begin the Celebration
        </button>
      </m.div>
    </m.div>
  );
}

/* ── 2 · Hero ─────────────────────────────────────────────────────────────── */
function Hero({
  host,
  headline,
  intro,
  invitation,
  dateLabel,
  time,
  venue,
  chip,
  lite,
}: {
  host: string;
  headline: string;
  intro: string;
  invitation: string;
  dateLabel: string | null;
  time: string;
  venue: string;
  chip?: Localized | null;
  lite: boolean;
}) {
  const ease = [0.2, 0.7, 0.2, 1] as const;
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay, ease },
  });
  const facts = [dateLabel, time, venue].filter(Boolean);

  return (
    <header className="rsh-hero relative flex min-h-dvh flex-col items-center overflow-hidden px-5 pb-20">
      <div className="rsh-hero-glow" aria-hidden />
      <div className="rsh-mandala-wrap" aria-hidden>
        <Mandala className="rsh-mandala" />
      </div>
      <FloatingParticles
        colors={DUST}
        density={lite ? 2 : 4}
        maxCount={lite ? 18 : 44}
        minR={0.5}
        maxR={1.6}
        speed={0.16}
        mode="rise"
      />
      <Petals count={lite ? 6 : 14} />

      <m.div
        className="absolute inset-x-0 top-0 z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease }}
      >
        <Toran className="h-[58px] w-full sm:h-[80px]" />
      </m.div>

      {/* Hanging lanterns at the edges, swaying from their hooks. */}
      {[
        { side: "left-[3%] sm:left-[7%]", cord: 34, w: "w-[34px] sm:w-[56px]", d: 0.7, k: 0 },
        { side: "right-[3%] sm:right-[7%]", cord: 58, w: "w-[34px] sm:w-[56px]", d: 0.9, k: 1 },
        { side: "left-[16%] hidden md:block", cord: 96, w: "w-[42px]", d: 1.1, k: 2 },
        { side: "right-[16%] hidden md:block", cord: 120, w: "w-[42px]", d: 1.25, k: 3 },
      ].map((l) => (
        <m.div
          key={l.k}
          aria-hidden
          className={`absolute top-[30px] z-[5] sm:top-[44px] ${l.side}`}
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: l.d, ease }}
        >
          <div className="rsh-sway" style={{ animationDelay: `${-l.k * 1.3}s` }}>
            <Lantern cord={l.cord} className={`h-auto ${l.w}`} />
          </div>
        </m.div>
      ))}

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center pt-28 text-center sm:pt-36">
        {chip ? (
          <m.span className="rsh-chip-badge mb-5" {...rise(0.3)}>
            {chip.en}
          </m.span>
        ) : null}
        <m.p className="rsh-brand text-[10px] sm:text-[11px]" {...rise(0.4)}>
          Join the Jashn
        </m.p>
        <m.div {...rise(0.55)}>
          <GoldRule className="mx-auto mt-4 w-40 sm:w-52" />
        </m.div>
        <m.p
          className="rsh-deva mt-4 text-[clamp(1rem,4vw,1.25rem)] text-[color:var(--rsh-glow)]"
          lang="hi"
          {...rise(0.7)}
        >
          शुभ दीपावली
        </m.p>
        <m.div {...rise(0.85)}>
          <h1 className="rsh-serif rsh-foil mt-3 text-[clamp(2.3rem,10vw,4.6rem)] font-semibold leading-[1.02]">
            {headline}
          </h1>
        </m.div>
        <m.p
          className="mx-auto mt-5 max-w-md text-[clamp(0.95rem,3.6vw,1.1rem)] leading-relaxed text-[color:var(--rsh-ivory)]/80"
          {...rise(1.05)}
        >
          {intro}
        </m.p>

        {/* The invitation card unfolds downward from its top edge. */}
        <m.div
          className="rsh-card-unfold relative mt-10 w-full max-w-lg"
          style={{ transformPerspective: 1000, originY: 0 }}
          initial={{ opacity: 0, rotateX: -78, y: 20 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 1.5, delay: 1.3, ease }}
        >
          <div className="rsh-invite relative px-6 py-9 sm:px-10">
            <p className="rsh-eyebrow">With love &amp; light</p>
            <p className="rsh-script mt-3 text-[clamp(2.1rem,9vw,3.1rem)] leading-[1.05] text-[color:var(--rsh-glow)]">
              {host}
            </p>
            <p className="mx-auto mt-4 max-w-sm text-[14.5px] leading-relaxed text-[color:var(--rsh-ivory)]/85">
              {invitation}
            </p>
            {facts.length > 0 ? (
              <ul className="rsh-facts mt-6">
                {facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : null}
            <m.a
              href="#details"
              className="rsh-btn mt-8"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Celebrate With Us
            </m.a>
          </div>
        </m.div>
      </div>

      <m.a
        href="#letter"
        className="rsh-scroll-cue relative z-10 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.6 }}
        aria-label="Scroll to the invitation"
      >
        <span />
      </m.a>
    </header>
  );
}

/* ── 3 · The ivory letter ─────────────────────────────────────────────────── */
function Letter({ title, body, host }: { title: string; body: string; host: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rot = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-25, 25]);
  const seen = useInView(ref, { once: true, margin: "-30%" });
  return (
    <section id="letter" ref={ref} className="rsh-letter-ground relative overflow-hidden px-5 py-24 sm:py-32">
      <m.div className="rsh-letter-mandala" style={{ rotate: rot }} aria-hidden>
        <Mandala className="h-full w-full" />
      </m.div>
      <Reveal className="relative mx-auto max-w-xl">
        <article className="rsh-panel relative px-7 py-14 text-center sm:px-14 sm:py-16">
          <PanelCorner className="rsh-corner rsh-corner-tl" />
          <PanelCorner className="rsh-corner rsh-corner-tr" />
          <PanelCorner className="rsh-corner rsh-corner-bl" />
          <PanelCorner className="rsh-corner rsh-corner-br" />
          <div className="mx-auto w-24 sm:w-28">
            <Rangoli draw={seen} delay={0.4} duration={2.6} className="rsh-panel-rangoli h-auto w-full" />
          </div>
          <span className="rsh-eyebrow rsh-eyebrow-ink mt-6 block">An invitation</span>
          <h2 className="rsh-serif mt-4 text-[clamp(1.8rem,7vw,2.6rem)] font-semibold leading-[1.1] text-[color:var(--rsh-wine)]">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.8] text-[color:var(--rsh-ink-soft)]">
            {body}
          </p>
          <GoldRule className="mx-auto mt-8 w-40" />
          <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-[color:var(--rsh-gold-deep)]">
            With warmth
          </p>
          <p className="rsh-script mt-1 text-[clamp(1.9rem,7vw,2.5rem)] leading-tight text-[color:var(--rsh-wine)]">
            {host}
          </p>
        </article>
      </Reveal>
    </section>
  );
}

/* ── 4 · When & where ─────────────────────────────────────────────────────── */
function Countdown({ dateIso, time }: { dateIso: string; time: string }) {
  const c = useCountdown(dateIso, time);
  if (c.ready && c.totalSeconds === 0) {
    return (
      <p className="rsh-serif text-center text-2xl text-[color:var(--rsh-glow)]">
        The celebration has begun ✨
      </p>
    );
  }
  const units = [
    { v: c.days, l: "Days" },
    { v: c.hours, l: "Hours" },
    { v: c.minutes, l: "Minutes" },
    { v: c.seconds, l: "Seconds" },
  ];
  return (
    <div className="flex items-start justify-center gap-2.5 sm:gap-4" role="timer" aria-live="off">
      {units.map((u) => (
        <div key={u.l} className="flex flex-col items-center gap-2">
          <div className="rsh-count">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={pad2(u.v, c.ready)}
                initial={{ y: "-60%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "60%", opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                className="rsh-count-num"
              >
                {pad2(u.v, c.ready)}
              </m.span>
            </AnimatePresence>
          </div>
          <span className="rsh-count-label">{u.l}</span>
        </div>
      ))}
    </div>
  );
}

function DetailCard({
  icon,
  label,
  children,
  index,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  index: number;
}) {
  return (
    <m.div
      className="rsh-card w-full sm:w-[calc(33.333%-0.7rem)] sm:min-w-[15rem]"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div className="flex h-16 items-center justify-center">{icon}</div>
      <p className="rsh-eyebrow mt-4">{label}</p>
      <div className="mt-3">{children}</div>
    </m.div>
  );
}

function Programme({ events }: { events: WeddingEvent[] }) {
  return (
    <ol className="relative mx-auto mt-6 max-w-md text-left">
      <span aria-hidden className="rsh-prog-line" />
      {events.map((e, i) => (
        <ProgrammeItem key={e.id} event={e} index={i} />
      ))}
    </ol>
  );
}
function ProgrammeItem({ event, index }: { event: WeddingEvent; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  return (
    <m.li
      ref={ref}
      className="relative mb-8 pl-14 last:mb-0"
      initial={{ opacity: 0, x: -14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 0.6 }}
    >
      <span className="absolute -top-3 left-0">
        <Diya size={34} lit={inView} delay={0.2} seed={index + 2} />
      </span>
      {event.startTime ? (
        <span className="rsh-eyebrow block">{fmtTime(parseTime(event.startTime))}</span>
      ) : null}
      <span className="rsh-serif mt-1 block text-[clamp(1.25rem,4.6vw,1.5rem)] font-semibold text-[color:var(--rsh-ivory)]">
        {event.name}
      </span>
      {event.description ? (
        <span className="mt-1 block text-sm text-[color:var(--rsh-ivory)]/70">{event.description}</span>
      ) : null}
    </m.li>
  );
}

function Details({
  countdownDate,
  dateLabel,
  time,
  timeRaw,
  venueEvent,
  events,
}: {
  countdownDate: string | null;
  dateLabel: string | null;
  time: { h: number; m: number } | null;
  timeRaw: string;
  venueEvent: WeddingEvent | undefined;
  events: WeddingEvent[];
}) {
  const directions = directionsUrl(venueEvent);
  const day = countdownDate?.split("-")[2]?.replace(/^0/, "") ?? "";
  let i = 0;
  return (
    <section id="details" className="rsh-details relative scroll-mt-4 overflow-hidden px-5 py-24 sm:py-28">
      <SectionHead eyebrow="Save the evening" title="The Celebration" />
      <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-4 sm:gap-[1.05rem]">
        {dateLabel ? (
          <DetailCard index={i++} label="Date" icon={<CalendarIcon day={day} />}>
            <p className="rsh-serif text-2xl font-semibold text-[color:var(--rsh-ivory)]">{dateLabel}</p>
            <p className="mt-1 text-sm text-[color:var(--rsh-ivory)]/70">{weekday(countdownDate)}</p>
          </DetailCard>
        ) : null}
        {time ? (
          <DetailCard index={i++} label="Time" icon={<ClockIcon hours={time.h} minutes={time.m} />}>
            <p className="rsh-serif text-2xl font-semibold text-[color:var(--rsh-ivory)]">{fmtTime(time)}</p>
            <p className="mt-1 text-sm text-[color:var(--rsh-ivory)]/70">onwards</p>
          </DetailCard>
        ) : null}
        {venueEvent?.venueName || venueEvent?.venueAddress ? (
          <DetailCard index={i++} label="Venue" icon={<PinIcon />}>
            {venueEvent.venueName ? (
              <p className="rsh-serif text-2xl font-semibold leading-tight text-[color:var(--rsh-ivory)]">
                {venueEvent.venueName}
              </p>
            ) : null}
            {venueEvent.venueAddress ? (
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--rsh-ivory)]/70">
                {venueEvent.venueAddress}
              </p>
            ) : null}
            {directions ? (
              <a href={directions} target="_blank" rel="noreferrer" className="rsh-btn-ghost mt-5">
                Get Directions
              </a>
            ) : null}
          </DetailCard>
        ) : null}
      </div>

      {countdownDate ? (
        <div className="mt-20">
          <Reveal className="mb-8 text-center">
            <span className="rsh-eyebrow">The diyas will be lit in</span>
          </Reveal>
          <Reveal delay={0.15}>
            <Countdown dateIso={countdownDate} time={timeRaw} />
          </Reveal>
        </div>
      ) : null}

      {events.length > 1 ? (
        <div className="mt-20">
          <SectionHead eyebrow="Through the evening" title="The Programme" />
          <div className="mt-10">
            <Programme events={events} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* ── 5 · The festive scene ────────────────────────────────────────────────── */
const SCENE_DIYAS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const FAR_LANTERNS = [
  { x: "8%", cord: 20, w: 26 },
  { x: "30%", cord: 70, w: 22 },
  { x: "66%", cord: 44, w: 24 },
  { x: "88%", cord: 86, w: 20 },
];

function FestiveScene({ blessing, lite }: { blessing: string; lite: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const still = Boolean(reduce) || lite;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yFar = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [50, -50]);
  const yMid = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [90, -60]);
  const yNear = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [160, -140]);
  const inView = useInView(ref, { once: true, margin: "-25%" });

  return (
    <section ref={ref} className="rsh-scene relative overflow-hidden" aria-label="Shubh Deepavali">
      <div className="rsh-scene-sky" aria-hidden />
      <FloatingParticles
        colors={DUST}
        density={lite ? 3 : 6}
        maxCount={lite ? 24 : 60}
        minR={0.5}
        maxR={2}
        speed={0.2}
        mode="rise"
      />

      <m.div className="absolute inset-x-0 top-0" style={{ y: yFar }} aria-hidden>
        {FAR_LANTERNS.map((l, k) => (
          <div key={k} className="rsh-far-lantern absolute top-0" style={{ left: l.x, width: l.w }}>
            <div className="rsh-sway" style={{ animationDelay: `${-k * 0.9}s` }}>
              <Lantern cord={l.cord} className="h-auto w-full" />
            </div>
          </div>
        ))}
      </m.div>
      <Toran className="relative z-10 h-[58px] w-full sm:h-[80px]" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pb-[11rem] pt-14 text-center sm:pb-[13rem]">
        <Reveal>
          <p className="rsh-deva rsh-glow-text text-[clamp(2.4rem,11vw,4.4rem)] leading-tight" lang="hi">
            शुभ दीपावली
          </p>
          <p className="rsh-brand mt-2 text-[10px] sm:text-[11px]">Shubh Deepavali</p>
        </Reveal>
        <m.div className="relative mt-8 w-[min(80vw,420px)]" style={{ y: yMid }}>
          <div className="rsh-rangoli-glow" aria-hidden />
          <Rangoli draw={inView} duration={3} className="relative h-auto w-full" />
          <div className="absolute inset-0 flex items-center justify-center pb-[6%]">
            <Diya size={58} lit={inView} delay={0.3} seed={5} />
          </div>
        </m.div>
        <Reveal delay={0.2}>
          <p className="rsh-serif mx-auto mt-10 max-w-md text-[clamp(1.25rem,4.8vw,1.6rem)] italic leading-snug text-[color:var(--rsh-ivory)]/90">
            {blessing}
          </p>
        </Reveal>
      </div>

      <m.div className="pointer-events-none absolute inset-x-0 top-[18%] z-20" style={{ y: yNear }} aria-hidden>
        <div className="absolute left-[-2%] w-[52px] sm:left-[4%] sm:w-[78px]">
          <div className="rsh-sway">
            <Lantern cord={10} className="h-auto w-full" />
          </div>
        </div>
        <div className="absolute right-[-2%] w-[52px] sm:right-[4%] sm:w-[78px]">
          <div className="rsh-sway" style={{ animationDelay: "-2.1s" }}>
            <Lantern cord={30} className="h-auto w-full" />
          </div>
        </div>
      </m.div>

      {/* The ledge: a row of diyas that light outward from the centre. */}
      <div className="rsh-ledge absolute inset-x-0 bottom-0 z-20 flex items-end justify-center gap-[3vw] px-3 pb-6 sm:gap-8">
        {SCENE_DIYAS.map((i) => (
          <span key={i} className={i === 0 || i === 8 ? "hidden sm:inline-flex" : "inline-flex"}>
            <Diya
              size={i === 4 ? 56 : 44}
              lit={inView}
              delay={0.4 + Math.abs(i - 4) * 0.28}
              seed={i}
            />
          </span>
        ))}
      </div>
    </section>
  );
}

/* ── 6 · RSVP & finale ────────────────────────────────────────────────────── */
const SPARKS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  const d = 70 + ((i * 23) % 50);
  return { x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d), s: 0.6 + (i % 3) * 0.3 };
});
const FINALE_DIYAS = [0, 1, 2, 3, 4, 5, 6];

function Closing({
  props,
  host,
  title,
  line,
  blessing,
  whatsapp,
  lite,
}: {
  props: WebsiteViewProps;
  host: string;
  title: string;
  line: string;
  blessing: string;
  whatsapp: string | null;
  lite: boolean;
}) {
  const { rsvp, selfRsvp, ownerPreview, events, config } = props;
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const finaleRef = useRef<HTMLDivElement>(null);
  const finaleLit = useInView(finaleRef, { once: true, margin: "-15%" });

  const form =
    rsvp && rsvp.events.length > 0 ? (
      <RoshniGroupRsvp data={rsvp} />
    ) : selfRsvp ? (
      <RoshniSelfRsvp data={selfRsvp} />
    ) : ownerPreview && events.length > 0 ? (
      <RoshniRsvpDemo events={events} />
    ) : null;

  const cta = "Count Me In ✨";

  return (
    <section id="rsvp" className="rsh-close relative overflow-hidden px-5 pb-12 pt-24 text-center sm:pt-28">
      <FloatingParticles
        colors={SPARKLE}
        density={lite ? 2 : 5}
        maxCount={lite ? 18 : 50}
        minR={0.4}
        maxR={1.5}
        speed={0.12}
      />
      <SectionHead eyebrow="RSVP" title={title} lede={line} />

      <div className="relative mx-auto mt-10 max-w-md">
        {form && !open ? (
          <m.button
            type="button"
            className="rsh-btn rsh-btn-lg"
            onClick={() => {
              setOpen(true);
              setBurst((b) => b + 1);
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {cta}
          </m.button>
        ) : null}
        {!form && whatsapp ? (
          <m.a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rsh-btn rsh-btn-lg"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {cta}
          </m.a>
        ) : null}

        {burst > 0 ? (
          <span key={burst} className="pointer-events-none absolute left-1/2 top-6" aria-hidden>
            {SPARKS.map((s, k) => (
              <m.span
                key={k}
                className="rsh-spark"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ x: s.x, y: s.y, opacity: 0, scale: s.s }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            ))}
          </span>
        ) : null}

        <AnimatePresence>
          {form && open ? (
            <m.div
              key="form"
              className="rsh-rsvp-panel text-left"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {form}
            </m.div>
          ) : null}
        </AnimatePresence>

        {form && whatsapp ? (
          <a href={whatsapp} target="_blank" rel="noreferrer" className="rsh-link mt-6 inline-block">
            Or reply on WhatsApp
          </a>
        ) : null}
      </div>

      {/* Finale: an arc of diyas lights over the blessing and the signature. */}
      <div ref={finaleRef} className="rsh-finale relative mx-auto mt-28 max-w-2xl">
        <div className="rsh-finale-glow" aria-hidden />
        <div className="relative flex items-end justify-center gap-3 sm:gap-5" aria-hidden>
          {FINALE_DIYAS.map((i) => (
            <span
              key={i}
              className={i === 0 || i === 6 ? "hidden sm:inline-flex" : "inline-flex"}
              style={{ transform: `translateY(${Math.abs(i - 3) ** 2 * -3}px)` }}
            >
              <Diya size={i === 3 ? 46 : 36} lit={finaleLit} delay={Math.abs(i - 3) * 0.25} seed={i + 4} />
            </span>
          ))}
        </div>
        <Reveal delay={0.3}>
          <p className="rsh-serif rsh-foil mx-auto mt-8 max-w-lg text-[clamp(1.6rem,6.4vw,2.4rem)] font-semibold leading-[1.15]">
            {blessing}
          </p>
          <p className="mt-4 text-[13px] uppercase tracking-[0.26em] text-[color:var(--rsh-ivory)]/70">
            {host}
          </p>
        </Reveal>

        <footer className="relative mt-20 flex flex-col items-center">
          <GoldRule className="w-44" />
          <p className="rsh-brand rsh-brand-lg mt-6">Join the Jashn</p>
          <p className="rsh-serif mt-2 text-[17px] italic text-[color:var(--rsh-ivory)]/80">
            Your moment. Your people. Your Jashn.
          </p>
          {config.footer?.hashtag ? (
            <p className="rsh-serif mt-5 text-lg font-semibold text-[color:var(--rsh-glow)]">
              #{config.footer.hashtag}
            </p>
          ) : null}
          <JashnCredit className="mt-6 text-[color:var(--rsh-ivory)]/60" />
        </footer>
      </div>
    </section>
  );
}

/* ── The page ─────────────────────────────────────────────────────────────── */
export function RoshniView(props: WebsiteViewProps) {
  const { theme, names, dateLabel, countdownDate, events, config, chip, openImmediately } = props;
  const rs = config.experience?.roshni;
  const lite = useLite();
  const [begun, setBegun] = useState(Boolean(openImmediately));

  const host = pick(rs?.host, names);
  const D = ROSHNI_DEFAULTS;
  const timeRaw = config.eventTime ?? events[0]?.startTime ?? "";
  const time = parseTime(timeRaw);
  const countdownTime = time
    ? `${String(time.h).padStart(2, "0")}:${String(time.m).padStart(2, "0")}:00`
    : "19:00:00";
  const venueEvent = events.find((e) => e.venueName || e.venueAddress);
  const blessing = pick(rs?.blessing, D.blessing);
  const wa = whatsappUrl(
    rs?.whatsapp,
    `Hi! Count me in for ${host}’s Diwali celebration${dateLabel ? ` on ${dateLabel}` : ""} ✨`,
  );

  return (
    <MotionProvider>
      <div style={theme.vars} data-lang="en" data-lite={lite ? "1" : undefined} className="rsh relative">
        <AnimatePresence>
          {!begun ? <IntroGate key="gate" lite={lite} onBegin={() => setBegun(true)} /> : null}
        </AnimatePresence>

        {begun ? (
          <>
            <Hero
              host={host}
              headline={pick(rs?.headline, D.headline)}
              intro={pick(rs?.intro, D.intro)}
              invitation={pick(rs?.invitation, D.invitation)}
              dateLabel={dateLabel}
              time={time ? `${fmtTime(time)} onwards` : ""}
              venue={venueEvent?.venueName ?? ""}
              chip={chip}
              lite={lite}
            />
            <Letter
              title={pick(rs?.letterTitle, D.letterTitle)}
              body={pick(rs?.letterBody, D.letterBody)}
              host={host}
            />
            <Details
              countdownDate={countdownDate}
              dateLabel={dateLabel}
              time={time}
              timeRaw={countdownTime}
              venueEvent={venueEvent}
              events={events}
            />
            <FestiveScene blessing="May every diya you light tonight light a little more of the year ahead." lite={lite} />
            <Closing
              props={props}
              host={host}
              title={pick(rs?.closingTitle, D.closingTitle)}
              line={pick(rs?.closingLine, D.closingLine)}
              blessing={blessing}
              whatsapp={wa}
              lite={lite}
            />
          </>
        ) : null}
      </div>
    </MotionProvider>
  );
}
