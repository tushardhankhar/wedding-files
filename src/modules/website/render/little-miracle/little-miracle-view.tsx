"use client";

import { useState } from "react";
import {
  AnimatePresence,
  m,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import type { WebsiteViewProps } from "../website-view";
import type { Focus } from "../../schema";
import { MotionProvider } from "../experience/motion";
import { FloatingParticles } from "../experience/floating-particles";
import { ScratchReveal } from "../experience/scratch-reveal";
import { WishUponStar } from "../experience/wish-upon-star";
import { useCountdown, pad2 } from "../use-countdown";

// Deterministic heart of stars for the RSVP moment.
const HEART = Array.from({ length: 18 }, (_, i) => {
  const t = (i / 18) * Math.PI * 2;
  const x = 16 * Math.sin(t) ** 3;
  const y =
    13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { left: 50 + x * 2.5, top: 44 - y * 2.6 };
});

function fmtTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

/* Moon-phase countdown: each disc's lit portion tracks the unit's fraction. */
function MoonCountdown({ dateIso, time }: { dateIso: string; time?: string }) {
  const c = useCountdown(dateIso, time);
  const units = [
    { v: c.days, l: "Days", k: (c.days % 30) / 30 },
    { v: c.hours, l: "Hours", k: c.hours / 24 },
    { v: c.minutes, l: "Minutes", k: c.minutes / 60 },
    { v: c.seconds, l: "Seconds", k: c.seconds / 60 },
  ];
  return (
    <div className="flex items-start justify-center gap-3 sm:gap-6">
      {units.map((u, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <div className="lm-moon">
            <div
              className="lm-moon-lit"
              style={{ transform: `translateX(${(1 - 2 * u.k) * 100}%)` }}
            />
            <span className="lm-moon-num">{pad2(u.v, c.ready)}</span>
          </div>
          <span className="lm-moon-label">{u.l}</span>
        </div>
      ))}
    </div>
  );
}

function CloudFrame({
  url,
  focus,
  bg,
  emoji,
  caption,
  delay,
}: {
  url?: string;
  focus?: Focus;
  bg?: string;
  emoji?: string;
  caption: string;
  delay: number;
}) {
  return (
    <m.figure
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, delay }}
      className="flex flex-col items-center"
    >
      {/* Float lives on a separate node so its CSS transform doesn't clash with
          the Framer entrance transform on the figure. */}
      <div className="lm-frame-float" style={{ animationDelay: `${delay}s` }}>
        <div className="lm-frame">
          <div
            className="flex h-full w-full items-center justify-center rounded-[18px] bg-cover text-5xl"
            style={
              url
                ? {
                    backgroundImage: `url(${url})`,
                    backgroundPosition: focus
                      ? `${(focus.x * 100).toFixed(1)}% ${(focus.y * 100).toFixed(1)}%`
                      : "center",
                  }
                : { background: bg }
            }
          >
            {!url && emoji ? <span aria-hidden>{emoji}</span> : null}
          </div>
        </div>
      </div>
      <figcaption className="lm-display mt-3 text-center text-lg text-[color:var(--lm-cocoa)]">
        {caption}
      </figcaption>
    </m.figure>
  );
}

export function LittleMiracleView(props: WebsiteViewProps) {
  const { theme, names, dateLabel, countdownDate, events, config, chip, initials } =
    props;
  const lm = config.experience?.littleMiracle;
  const parents = lm?.parents ?? names;
  const title = lm?.title?.en ?? "A little miracle is on the way";
  const gr = lm?.genderReveal;
  const accent = gr?.accent ?? "#C5A46D";
  const wishPrompt = lm?.wishPrompt?.en ?? "Make a wish for the little one";

  const [loved, setLoved] = useState(false);
  const reduce = useReducedMotion();

  // Subtle pointer parallax for the hero sky.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const starX = useTransform(sx, (v) => v * 10);
  const starY = useTransform(sy, (v) => v * 10);
  const moonX = useTransform(sx, (v) => v * 22);
  const moonY = useTransform(sy, (v) => v * 22);
  const onMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <MotionProvider>
      <div style={theme.vars} className="lm relative">
        {/* Nav */}
        <nav className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-3.5 sm:px-8">
          <span className="lm-serif text-lg text-white">{initials}</span>
          {chip ? (
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] tracking-wide text-white backdrop-blur">
              {chip.en}
            </span>
          ) : null}
        </nav>

        {/* ── Hero: night sky ────────────────────────────────────────────── */}
        <header
          onPointerMove={onMove}
          className="lm-sky relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 text-center"
        >
          <m.div
            aria-hidden
            style={{ x: starX, y: starY }}
            className="absolute inset-0"
          >
            <FloatingParticles
              colors={["#ffffff", "#DCEAF7", "#C5A46D"]}
              density={9}
              maxCount={60}
              minR={0.4}
              maxR={1.9}
              speed={0.12}
            />
          </m.div>

          <m.div
            aria-hidden
            initial={{ opacity: 0, x: 60, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            style={{ x: moonX, y: moonY }}
            className="absolute right-[14%] top-[16%]"
          >
            <div className="lm-crescent" />
          </m.div>

          <div className="relative z-10 flex flex-col items-center">
            <m.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1.2 }}
              className="lm-serif max-w-2xl text-[clamp(1.9rem,6.5vw,3.6rem)] font-medium leading-tight text-white"
            >
              {title}
            </m.p>

            <div className="relative mt-8 h-16 w-full max-w-md overflow-hidden">
              <m.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 1 }}
                className="lm-display absolute inset-0 flex items-center justify-center text-[clamp(1.5rem,5vw,2.4rem)]"
                style={{ color: accent }}
              >
                {parents}
              </m.p>
              <m.div
                aria-hidden
                initial={{ x: "-130%" }}
                animate={{ x: "130%" }}
                transition={{ delay: 0.3, duration: 2.6, ease: "easeInOut" }}
                className="lm-cloud-sweep absolute top-1/2 h-14 w-40 -translate-y-1/2"
              />
            </div>

            {dateLabel ? (
              <m.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 1 }}
                className="mt-6 text-xs uppercase tracking-[0.34em] text-white/60"
              >
                {dateLabel}
              </m.p>
            ) : null}
          </div>
        </header>

        {/* ── Gender reveal (optional, configurable) ─────────────────────── */}
        {gr?.enabled ? (
          <section className="relative z-10 px-5 py-16 text-center">
            <h2 className="lm-serif text-[clamp(1.4rem,5vw,2rem)] text-[color:var(--lm-cocoa)]">
              A little secret is hiding here…
            </h2>
            <div className="mt-8 flex justify-center">
              <ScratchReveal
                className="lm-cloud-card h-48 w-full max-w-sm"
                radius={90}
                foilColors={["#DCEAF7", "#bcd2ef"]}
                foilText="SCRATCH TO REVEAL 💫"
                foilTextColor="#594A42"
                brushRadius={26}
              >
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6">
                  <span
                    className="lm-display text-[clamp(1.8rem,7vw,2.8rem)]"
                    style={{ color: accent }}
                  >
                    {gr.reveal.en}
                  </span>
                </div>
              </ScratchReveal>
            </div>
          </section>
        ) : null}

        {/* ── Wish upon a star ───────────────────────────────────────────── */}
        <section className="relative z-10 px-5 py-16">
          <WishUponStar
            prompt={wishPrompt}
            starColor={accent}
            confirmText="Your wish is now among the stars ✨"
          />
        </section>

        {/* ── Memory / parents frames ────────────────────────────────────── */}
        <section className="relative z-10 px-5 py-14">
          <h2 className="lm-serif mb-10 text-center text-[clamp(1.6rem,5vw,2.3rem)] text-[color:var(--lm-cocoa)]">
            Our little adventure begins
          </h2>
          <div className="mx-auto flex max-w-2xl flex-wrap items-start justify-center gap-8">
            {(config.gallery?.images ?? []).length > 0 ? (
              config.gallery!.images!.slice(0, 3).map((img, i) => (
                <CloudFrame
                  key={i}
                  url={img.url}
                  focus={img.focus}
                  caption={img.caption?.en ?? ""}
                  delay={i * 0.2}
                />
              ))
            ) : (
              <>
                <CloudFrame
                  bg="linear-gradient(135deg,#F6D6D6,#DCEAF7)"
                  emoji="🌙"
                  caption="Dreaming of you"
                  delay={0}
                />
                <CloudFrame
                  bg="linear-gradient(135deg,#DCEAF7,#C5A46D)"
                  emoji="👶"
                  caption="Almost here"
                  delay={0.25}
                />
              </>
            )}
          </div>
        </section>

        {/* ── Countdown ──────────────────────────────────────────────────── */}
        {countdownDate ? (
          <section className="relative z-10 px-5 py-14 text-center">
            <h2 className="lm-serif mb-9 text-[clamp(1.5rem,5vw,2.1rem)] text-[color:var(--lm-cocoa)]">
              Counting down to the big day
            </h2>
            <MoonCountdown dateIso={countdownDate} time="11:00:00" />
          </section>
        ) : null}

        {/* ── Event details ──────────────────────────────────────────────── */}
        {events.length > 0 ? (
          <section className="relative z-10 mx-auto max-w-2xl px-5 py-14">
            <div className="grid gap-4 sm:grid-cols-2">
              {events.map((e, i) => (
                <m.div
                  key={e.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="lm-detail"
                >
                  <span className="lm-serif text-2xl text-[color:var(--lm-cocoa)]">
                    {e.name}
                  </span>
                  {e.startTime ? (
                    <span className="mt-1 block text-sm tracking-wide text-[color:var(--lm-gold)]">
                      {fmtTime(e.startTime)}
                    </span>
                  ) : null}
                  {e.venueName ? (
                    <span className="mt-2 block text-sm text-[color:var(--w-ink-soft)]">
                      {e.venueName}
                      {e.venueAddress ? ` · ${e.venueAddress}` : ""}
                    </span>
                  ) : null}
                </m.div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── RSVP: stars form a heart ───────────────────────────────────── */}
        <section className="relative z-10 px-5 pb-8 pt-10 text-center">
          <AnimatePresence mode="wait" initial={false}>
            {loved ? (
              <m.div
                key="loved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative mx-auto h-56 w-64">
                  {HEART.map((p, i) => (
                    <m.span
                      key={i}
                      initial={{ left: "50%", top: "50%", opacity: 0, scale: 0.2 }}
                      animate={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{ delay: i * 0.035, type: "spring", stiffness: 120, damping: 14 }}
                      className="absolute text-lg"
                      style={{ color: accent, textShadow: `0 0 8px ${accent}` }}
                    >
                      ✦
                    </m.span>
                  ))}
                </div>
                <p className="lm-serif mt-4 text-[clamp(1.5rem,5vw,2.2rem)] text-[color:var(--lm-cocoa)]">
                  A little star is smiling ✨
                </p>
              </m.div>
            ) : (
              <m.button
                key="cta"
                type="button"
                onClick={() => setLoved(true)}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="lm-btn"
              >
                I&apos;ll be there with love 🤍
              </m.button>
            )}
          </AnimatePresence>
        </section>

        {/* Signature */}
        <footer className="relative z-10 flex flex-col items-center gap-3 pb-16">
          <div className="flex items-center gap-3 text-lg text-[color:var(--lm-gold)]" aria-hidden>
            <span>☾</span>
            <span>✦</span>
            <span>⋆</span>
            <span>✧</span>
          </div>
          {config.footer?.hashtag ? (
            <span className="lm-display text-lg text-[color:var(--lm-gold)]">
              #{config.footer.hashtag}
            </span>
          ) : null}
        </footer>
      </div>
    </MotionProvider>
  );
}
