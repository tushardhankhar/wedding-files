"use client";

import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import type { WebsiteViewProps } from "../website-view";
import { MotionProvider } from "../experience/motion";
import { ConfettiBurst } from "../experience/confetti-burst";
import { BounceCountdown } from "../experience/bounce-countdown";
import { StarCatchGame } from "../experience/star-catch-game";
import { TapBalloon } from "../experience/tap-balloon";
import { PhotoCarousel, type CarouselItem } from "../experience/photo-carousel";

const CONFETTI_COLORS = ["#60A5FA", "#FACC15", "#FB7185", "#A78BFA", "#34D399"];

// Deterministic balloon layout (position %, colour, bob delay).
const BALLOONS = [
  { top: 6, left: 6, color: "#FB7185", size: 58, delay: 0 },
  { top: 20, left: 82, color: "#60A5FA", size: 66, delay: 0.6 },
  { top: 48, left: 10, color: "#FACC15", size: 52, delay: 1.1 },
  { top: 40, left: 74, color: "#A78BFA", size: 60, delay: 0.3 },
  { top: 70, left: 22, color: "#34D399", size: 48, delay: 0.9 },
  { top: 66, left: 86, color: "#FB7185", size: 54, delay: 1.4 },
];

// Fun placeholder memories for the demo (no real photos needed).
const DEMO_MEMORIES: CarouselItem[] = [
  { bg: "linear-gradient(135deg,#60A5FA,#A78BFA)", emoji: "🚀", caption: "First steps!" },
  { bg: "linear-gradient(135deg,#FB7185,#FACC15)", emoji: "🎨", caption: "Little artist" },
  { bg: "linear-gradient(135deg,#34D399,#60A5FA)", emoji: "🧸", caption: "Best buddy" },
  { bg: "linear-gradient(135deg,#FACC15,#FB7185)", emoji: "🍰", caption: "Cake face" },
  { bg: "linear-gradient(135deg,#A78BFA,#FB7185)", emoji: "⭐", caption: "Our little star" },
];

function GiftBox({ opening }: { opening: boolean }) {
  return (
    <div className="relative mx-auto" style={{ width: 168, height: 168 }}>
      <m.div
        animate={opening ? { rotate: [0, -5, 5, -4, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0"
      >
        {/* body */}
        <div className="cf-gift-body" />
        {/* vertical ribbon */}
        <span className="cf-gift-ribbon-v" aria-hidden />
        {/* lid */}
        <m.div
          animate={opening ? { y: -74, rotate: -14, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
          transition={{ delay: opening ? 0.45 : 0, duration: 0.45, ease: "easeOut" }}
          className="cf-gift-lid"
        >
          <span className="cf-gift-bow" aria-hidden>
            🎀
          </span>
        </m.div>
      </m.div>
    </div>
  );
}

function RisingBalloons() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      {BALLOONS.map((b, i) => (
        <m.span
          key={i}
          initial={{ y: "110vh", opacity: 0 }}
          animate={{ y: "-20vh", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.8, delay: i * 0.12, ease: "easeOut" }}
          className="absolute text-5xl"
          style={{ left: `${8 + i * 15}%` }}
        >
          🎈
        </m.span>
      ))}
    </div>
  );
}

export function ConfettiView(props: WebsiteViewProps) {
  const { theme, names, countdownDate, config, chip, initials, events } = props;
  const cf = config.experience?.confetti;
  const child = cf?.childName ?? names;
  const age = cf?.age;
  const surprise =
    cf?.surprise?.en ?? "A little surprise is waiting for you";
  const secret = cf?.secretStar?.en ?? "You found a secret star!";
  const cards = cf?.cards ?? [];
  const primary = events[0];

  const [armed, setArmed] = useState(false);
  const [opened, setOpened] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [rsvpd, setRsvpd] = useState(false);

  // The lucky balloon — deterministic from the child's name, so it's stable
  // across SSR/hydration yet varies per invite (no Math.random in render).
  const secretIdx =
    [...child].reduce((a, ch) => a + ch.charCodeAt(0), 0) % BALLOONS.length;

  const openGift = () => {
    if (armed) return;
    setArmed(true);
    window.setTimeout(() => {
      setOpened(true);
      setConfetti((c) => c + 1);
    }, 750);
  };
  const rsvp = () => {
    if (rsvpd) return;
    setRsvpd(true);
    setConfetti((c) => c + 1);
  };

  return (
    <MotionProvider>
      <div style={theme.vars} className="cf relative">
        <ConfettiBurst trigger={confetti} colors={CONFETTI_COLORS} />
        {opened ? <RisingBalloons /> : null}

        {/* Nav */}
        <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-3.5 sm:px-8">
          <span className="font-fredoka text-lg font-semibold text-[color:var(--cf-coral)]">
            {initials}
          </span>
          {chip ? (
            <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-[color:var(--cf-sky)] shadow-sm backdrop-blur">
              {chip.en}
            </span>
          ) : null}
        </nav>

        {/* ── Hero: gift box → reveal ─────────────────────────────────────── */}
        <header className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 pt-20 text-center">
          <div aria-hidden className="cf-cloud cf-cloud-1" />
          <div aria-hidden className="cf-cloud cf-cloud-2" />
          <AnimatePresence mode="wait">
            {!opened ? (
              <m.div
                key="gift"
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 flex flex-col items-center"
              >
                <GiftBox opening={armed} />
                <p className="mt-10 max-w-sm font-fredoka text-2xl font-medium text-[color:var(--w-ink)]">
                  {surprise} 🎁
                </p>
                <button
                  type="button"
                  onClick={openGift}
                  className="cf-btn mt-7"
                  disabled={armed}
                >
                  {armed ? "Opening…" : "Tap to open"}
                </button>
              </m.div>
            ) : (
              <m.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 16 }}
                className="relative z-10 flex flex-col items-center"
              >
                <p className="font-fredoka text-xl font-medium uppercase tracking-wide text-[color:var(--cf-sky)]">
                  {child} is turning
                </p>
                {age != null ? (
                  <m.span
                    animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                    className="cf-age"
                  >
                    {age}
                  </m.span>
                ) : null}
                <p className="mt-4 max-w-md font-fredoka text-3xl font-semibold text-[color:var(--cf-coral)]">
                  Let&apos;s celebrate! 🎉
                </p>
              </m.div>
            )}
          </AnimatePresence>
        </header>

        {/* ── Tappable balloons ──────────────────────────────────────────── */}
        <section className="relative mx-auto h-[380px] w-full max-w-2xl overflow-hidden px-5">
          <p className="pt-2 text-center font-fredoka text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--cf-sky)]">
            Pop the balloons! 🎈
          </p>
          {BALLOONS.map((b, i) => (
            <TapBalloon
              key={i}
              color={b.color}
              size={b.size}
              delay={b.delay}
              style={{ top: `${b.top}%`, left: `${b.left}%` }}
              reward={
                secretIdx === i ? (
                  <span className="rounded-full bg-white px-3 py-1.5 font-fredoka text-sm font-semibold text-[color:var(--cf-coral)] shadow-lg">
                    {secret} ⭐
                  </span>
                ) : undefined
              }
            />
          ))}
        </section>

        {/* ── Photo memories ─────────────────────────────────────────────── */}
        <section className="relative z-10 py-12">
          <h2 className="mb-2 text-center font-fredoka text-3xl font-semibold text-[color:var(--cf-coral)]">
            Sweet memories
          </h2>
          <PhotoCarousel items={DEMO_MEMORIES} captionColor="#7c88a1" />
        </section>

        {/* ── Countdown ──────────────────────────────────────────────────── */}
        {countdownDate ? (
          <section className="relative z-10 px-5 py-12 text-center">
            <h2 className="mb-8 font-fredoka text-2xl font-semibold text-[color:var(--cf-sky)]">
              The party starts in…
            </h2>
            <BounceCountdown dateIso={countdownDate} time="16:00:00" colors={CONFETTI_COLORS} />
          </section>
        ) : null}

        {/* ── Mini game ──────────────────────────────────────────────────── */}
        <section className="relative z-10 px-5 py-12">
          <StarCatchGame
            durationSec={8}
            colors={CONFETTI_COLORS}
            rewardText="You've won a birthday hug 🎉"
          />
        </section>

        {/* ── Party details ──────────────────────────────────────────────── */}
        {cards.length > 0 ? (
          <section className="relative z-10 mx-auto max-w-3xl px-5 py-12">
            <h2 className="mb-8 text-center font-fredoka text-3xl font-semibold text-[color:var(--cf-coral)]">
              Party details
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {cards.map((c, i) => (
                <div
                  key={i}
                  className="cf-card"
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <span className="text-3xl" aria-hidden>
                    {c.icon}
                  </span>
                  <span className="mt-2 font-fredoka text-sm font-semibold uppercase tracking-wide text-[color:var(--cf-sky)]">
                    {c.label.en}
                  </span>
                  <span className="mt-0.5 text-center text-sm text-[color:var(--w-ink)]">
                    {c.value.en}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── RSVP ───────────────────────────────────────────────────────── */}
        <section className="relative z-10 px-5 py-16 text-center">
          <AnimatePresence mode="wait" initial={false}>
            {rsvpd ? (
              <m.div
                key="done"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <p className="font-fredoka text-[clamp(1.6rem,6vw,2.6rem)] font-semibold text-[color:var(--cf-coral)]">
                  Yay! {child} can&apos;t wait to see you! 🎉
                </p>
              </m.div>
            ) : (
              <m.button
                key="cta"
                type="button"
                onClick={rsvp}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="cf-btn-lg"
              >
                I&apos;m coming to the party! 🎉
              </m.button>
            )}
          </AnimatePresence>
        </section>

        {/* Signature */}
        <footer className="relative z-10 flex flex-col items-center gap-3 pb-16">
          <div className="flex items-center gap-3 text-lg" aria-hidden>
            <span style={{ color: "#FACC15" }}>★</span>
            <span style={{ color: "#FB7185" }}>✦</span>
            <span style={{ color: "#60A5FA" }}>●</span>
            <span style={{ color: "#A78BFA" }}>▲</span>
          </div>
          {config.footer?.hashtag ? (
            <span className="font-fredoka text-sm text-[color:var(--cf-sky)]">
              #{config.footer.hashtag}
            </span>
          ) : (
            <span className="font-fredoka text-sm text-[color:var(--cf-sky)]">
              {primary?.venueName ?? ""}
            </span>
          )}
        </footer>
      </div>
    </MotionProvider>
  );
}
