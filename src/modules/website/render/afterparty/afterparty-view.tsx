"use client";

import { useState } from "react";
import { AnimatePresence, m, useTransform } from "motion/react";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { MotionProvider } from "../experience/motion";
import { FloatingParticles } from "../experience/floating-particles";
import { ConfettiBurst } from "../experience/confetti-burst";
import { FlipCountdown } from "../experience/flip-countdown";
import { ScratchReveal } from "../experience/scratch-reveal";
import { HoldToReveal } from "../experience/hold-to-reveal";
import { useTilt } from "../experience/use-tilt";

const NEON = ["#7C3AED", "#EC4899", "#C6FF00", "#FAFAFA"];
const PHRASE = "YOU'RE ON THE LIST.";
// Deterministic barcode (avoids Math.random hydration mismatch).
const BARS = "3121423113212431132142311321243113214231".split("").map(Number);

function fmtTime(t: string | null): string {
  if (!t) return "??:??";
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
}

/* ── Hero: flicker phrase → neon title → tiltable VIP pass ─────────────────── */
function VipPass({
  guest,
  title,
  tier,
  date,
}: {
  guest: string;
  title: string;
  tier: string;
  date: string | null;
}) {
  const tilt = useTilt(14);
  const sheenX = useTransform(tilt.glareX, [0, 1], ["-40%", "140%"]);
  return (
    <m.div
      initial={{ opacity: 0, y: 40, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 1000,
      }}
      className="ap-pass relative mx-auto mt-14 w-full max-w-sm overflow-hidden p-6 text-left"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.34em] text-[color:var(--ap-lime)]">
          {tier}
        </span>
        <span className="text-lg" aria-hidden>
          ⚡
        </span>
      </div>
      <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-white/45">
        Admit
      </p>
      <p className="ap-neon font-space text-[clamp(1.6rem,7vw,2.2rem)] font-bold uppercase leading-none">
        {guest}
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/70">
        {title}
      </p>
      {date ? (
        <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[color:var(--ap-pink)]">
          {date}
        </p>
      ) : null}
      <div className="mt-6 flex items-end gap-[3px]" aria-hidden>
        {BARS.map((w, i) => (
          <span
            key={i}
            className="block h-9 bg-white/85"
            style={{ width: w }}
          />
        ))}
      </div>
      <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40">
        One entry · non-transferable
      </p>
      <m.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/3"
        style={{
          left: sheenX,
          background:
            "linear-gradient(105deg, transparent, rgba(255,255,255,0.28), transparent)",
        }}
      />
    </m.div>
  );
}

function Wristband({ guest }: { guest: string }) {
  return (
    <div className="ap-band relative flex items-center">
      <span className="ap-band-tag">⚡ {guest}</span>
    </div>
  );
}

export function AfterpartyView(props: WebsiteViewProps) {
  const { theme, names, dateLabel, countdownDate, events, config, chip, initials } =
    props;
  const ap = config.experience?.afterparty;
  const title = ap?.eventTitle?.en ?? names;
  const guest = ap?.guestLabel ?? initials;
  const tier = ap?.passTier ?? "VIP ACCESS";
  const loc = ap?.location;
  const rule = ap?.partyRule?.en ?? "What happens here, stays here.";

  const [confetti, setConfetti] = useState(0);
  const [granted, setGranted] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const fire = () => setConfetti((c) => c + 1);

  const claim = () => {
    if (granted) return;
    setGranted(true);
    setOverlay(true);
    fire();
    window.setTimeout(() => setOverlay(false), 2600);
  };

  return (
    <MotionProvider>
      <div style={theme.vars} className="ap ap-grain relative">
        <ConfettiBurst trigger={confetti} colors={NEON} />

        {/* Nav */}
        <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-3.5 backdrop-blur-md sm:px-8">
          <span className="font-space text-sm font-bold uppercase tracking-[0.3em] text-white">
            {initials}
          </span>
          {chip ? (
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ap-lime)]">
              {chip.en}
            </span>
          ) : null}
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <header className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 pt-20 text-center">
          <div
            aria-hidden
            className="ap-blob1 pointer-events-none absolute left-1/2 top-[8%] h-[46vw] max-h-[420px] w-[46vw] max-w-[420px] -translate-x-1/2 rounded-full blur-[70px]"
            style={{ background: "var(--ap-violet)", opacity: 0.5 }}
          />
          <div
            aria-hidden
            className="ap-blob2 pointer-events-none absolute right-[6%] top-[24%] h-[38vw] max-h-[340px] w-[38vw] max-w-[340px] rounded-full blur-[70px]"
            style={{ background: "var(--ap-pink)", opacity: 0.4 }}
          />
          <FloatingParticles
            colors={["#C6FF00", "#FAFAFA", "#EC4899"]}
            density={4}
            maxCount={34}
            mode="rise"
            speed={0.35}
          />

          <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
            <m.h2
              aria-label={PHRASE}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.055, delayChildren: 0.25 } },
              }}
              initial="hidden"
              animate="show"
              className="font-space text-[clamp(1.1rem,4.5vw,1.8rem)] font-bold uppercase tracking-[0.22em] text-[color:var(--ap-lime)]"
            >
              {PHRASE.split("").map((ch, i) => (
                <m.span
                  key={i}
                  aria-hidden
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: [0, 1, 0.35, 1],
                      transition: { duration: 0.5, times: [0, 0.5, 0.75, 1] },
                    },
                  }}
                  className="ap-neon inline-block"
                >
                  {ch === " " ? " " : ch}
                </m.span>
              ))}
            </m.h2>

            <div className="relative mt-7">
              <div
                aria-hidden
                className="ap-blob1 absolute left-1/2 top-1/2 -z-10 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[54px]"
                style={{
                  background:
                    "conic-gradient(from 0deg, var(--ap-violet), var(--ap-pink), var(--ap-lime), var(--ap-violet))",
                  opacity: 0.32,
                }}
              />
              <m.h1
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.9, ease: "easeOut" }}
                className="ap-neon font-space text-[clamp(2.1rem,8vw,4.4rem)] font-bold uppercase leading-[1.02] text-white"
              >
                {title}
              </m.h1>
            </div>

            {dateLabel ? (
              <m.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.6 }}
                className="mt-5 text-xs uppercase tracking-[0.4em] text-white/60"
              >
                {dateLabel}
              </m.p>
            ) : null}

            <VipPass guest={guest} title={title} tier={tier} date={dateLabel} />

            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.9, duration: 0.6 }}
              className="ap-pulse mt-12 text-[10px] uppercase tracking-[0.4em] text-white/40"
            >
              Scroll ↓
            </m.div>
          </div>
        </header>

        {/* ── Countdown ──────────────────────────────────────────────────── */}
        {countdownDate ? (
          <section className="relative z-10 px-5 py-16">
            <h3 className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-white/50">
              Doors open in
            </h3>
            <FlipCountdown
              dateIso={countdownDate}
              time="21:00:00"
              tileClassName="ap-flip"
              labelClassName="text-white/50"
            />
          </section>
        ) : null}

        {/* ── Classified location ────────────────────────────────────────── */}
        <section className="relative z-10 px-5 py-16 text-center">
          <h3 className="ap-neon font-space text-[clamp(1.5rem,6vw,2.4rem)] font-bold uppercase text-white">
            The location is classified.
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
            Scratch the pass below to unlock where the night begins.
          </p>
          <div className="mt-8 flex justify-center">
            <ScratchReveal
              className="h-52 w-full max-w-md"
              foilColors={["#241c47", "#0c0a1a"]}
              foilText="SCRATCH TO UNLOCK THE LOCATION"
              foilTextColor="#C6FF00"
              brushRadius={26}
              onReveal={fire}
            >
              <div className="ap-reveal flex h-full flex-col items-center justify-center gap-1 px-4">
                <span className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--ap-lime)]">
                  The location
                </span>
                <span className="ap-neon font-space text-3xl font-bold uppercase text-white">
                  {loc?.venue ?? "TBA"}
                </span>
                {loc?.city ? (
                  <span className="text-sm uppercase tracking-[0.24em] text-white/70">
                    {loc.city}
                  </span>
                ) : null}
                {loc?.mapsUrl ? (
                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 rounded-full border border-[color:var(--ap-lime)]/60 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ap-lime)] transition-colors hover:bg-[color:var(--ap-lime)] hover:text-black"
                  >
                    Open in Maps →
                  </a>
                ) : null}
              </div>
            </ScratchReveal>
          </div>
        </section>

        {/* ── Timeline ───────────────────────────────────────────────────── */}
        {events.length > 0 ? (
          <section className="relative z-10 mx-auto max-w-lg px-6 py-16">
            <h3 className="mb-10 text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-white/50">
              The run of show
            </h3>
            <ol className="relative ml-3 border-l-0">
              <span
                aria-hidden
                className="ap-tl-line absolute left-[7px] top-2 bottom-2 w-[2px]"
              />
              {events.map((e, i) => (
                <m.li
                  key={e.id}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-12%" }}
                  transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
                  className="relative mb-9 pl-8 last:mb-0"
                >
                  <span aria-hidden className="ap-tl-dot absolute left-0 top-1.5" />
                  <span className="block font-space text-sm font-bold tracking-[0.16em] text-[color:var(--ap-lime)]">
                    {fmtTime(e.startTime)}
                  </span>
                  <span className="mt-1 block font-space text-lg font-semibold uppercase tracking-wide text-white">
                    {e.name}
                  </span>
                </m.li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* ── Secret party rule (hold to reveal) ─────────────────────────── */}
        <section className="relative z-10 px-5 py-20 text-center">
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-12 backdrop-blur-sm">
            <HoldToReveal
              label="Hold to reveal the party rule"
              ringColor="#C6FF00"
              onReveal={() => undefined}
            >
              <p className="ap-neon font-space text-xl font-bold uppercase leading-snug text-white">
                {rule}
              </p>
            </HoldToReveal>
          </div>
        </section>

        {/* ── RSVP ───────────────────────────────────────────────────────── */}
        <section className="relative z-10 px-5 pb-24 pt-6 text-center">
          <AnimatePresence mode="wait" initial={false}>
            {granted ? (
              <m.div
                key="granted"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <span className="ap-neon font-space text-[clamp(2rem,8vw,3.6rem)] font-bold uppercase text-[color:var(--ap-lime)]">
                  Access granted.
                </span>
                <div className="mt-8">
                  <Wristband guest={guest} />
                </div>
                <p className="mt-6 text-sm text-white/50">
                  See you on the dancefloor.
                </p>
              </m.div>
            ) : (
              <m.button
                key="claim"
                type="button"
                onClick={claim}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="ap-cta font-space text-base font-bold uppercase tracking-[0.24em]"
              >
                Claim your spot
              </m.button>
            )}
          </AnimatePresence>
        </section>

        {/* Signature */}
        <footer className="relative z-10 flex flex-col items-center gap-3 pb-16">
          <span className="ap-pulse text-2xl text-[color:var(--ap-lime)]" aria-hidden>
            ⚡
          </span>
          {config.footer?.hashtag ? (
            <span className="text-xs uppercase tracking-[0.34em] text-white/40">
              #{config.footer.hashtag}
            </span>
          ) : null}
          <JashnCredit className="text-white/35" />
        </footer>

        {/* Access-granted full-screen flash */}
        <AnimatePresence>
          {overlay ? (
            <m.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <m.div
                initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                animate={{ scale: 1, rotate: -4, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
              >
                <Wristband guest={guest} />
              </m.div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>
    </MotionProvider>
  );
}
