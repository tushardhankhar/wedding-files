"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Mandala } from "@/components/brand/motifs";
import { PetalField } from "./art";
import { BookNowButton } from "./book-now";
import { StartButton } from "./start-button";
import {
  SHOWCASE_THEMES,
  PRICE,
  DEMO_CTA_SHORT,
  BUY_CTA_SHORT,
  HERO_FACTS,
} from "./data";
import { ThemePhone } from "./theme-card";

const HERO_BG =
  "radial-gradient(90% 70% at 72% 18%, rgba(216,27,96,.40), transparent 60%), radial-gradient(70% 60% at 12% 88%, rgba(244,124,32,.30), transparent 60%), radial-gradient(120% 80% at 50% 118%, rgba(201,154,61,.28), transparent 55%), linear-gradient(168deg, #3b1022 0%, #57122e 48%, #2a0a18 100%)";

/**
 * The theme the hero shows off. Deliberately the same one the primary demo
 * button opens, so the phone is a preview of where that click lands rather than
 * a different site.
 */
const HERO_THEME =
  SHOWCASE_THEMES.find((t) => t.id === "maharaja") ?? SHOWCASE_THEMES[0];

/**
 * What the visitor is about to watch happen inside the phone. Naming the parts
 * in text does work the screenshot can't: it survives the seconds before the
 * live frame mounts, and it's readable by search engines and screen readers.
 *
 * Each chip lists the demo section ids it stands for, so the row doubles as a
 * legend the tour lights up as it arrives — without that link the chips are a
 * list of claims sitting next to an unrelated animation. Two ids per event chip
 * because themes name that section either "celebrations" or "events". The
 * bilingual chip maps to nothing: it's true of every section at once.
 */
const INCLUDED: Array<{ label: string; stops: string[] }> = [
  { label: "Live countdown", stops: ["top"] },
  { label: "Your story", stops: ["story"] },
  { label: "Events & venue maps", stops: ["celebrations", "events"] },
  { label: "Photo gallery", stops: ["gallery"] },
  { label: "RSVP", stops: ["rsvp"] },
  { label: "English + हिंदी", stops: [] },
  // Plays everywhere, not one scrollable moment — same as the bilingual chip.
  { label: "Background music", stops: [] },
];

/**
 * `ratingBadge` is rendered on the server and passed in, because the live Google
 * rating needs `getReviews()` and this component is a client component (it owns
 * the demo tour's `stop` state). The page composes them — see
 * `app/(marketing)/page.tsx`. It is `null` whenever there are no reviews, so
 * nothing here has to know about that case.
 */
export function LandingHero({ ratingBadge }: { ratingBadge?: ReactNode }) {
  // Starts on the countdown so the row has a sensible resting state before the
  // first tour tick — and a settled one when reduced motion means no tour runs.
  const [stop, setStop] = useState("top");

  return (
    <section
      className="l-grain relative flex min-h-svh flex-col overflow-hidden"
      style={{ background: HERO_BG }}
      data-image-slot="hero"
    >
      <Mandala className="spin-slow left-1/2 top-[-260px] h-[640px] w-[640px] -translate-x-1/2 opacity-[0.14]" />
      <PetalField count={12} />

      {/* Tight on phones, generous from `lg` up. The mobile numbers here are
          not taste: at the old spacing the hero measured 1,630px on a 390×844
          screen, so the phone — the only thing on the page that proves the
          product is a live, scrolling website rather than a picture of one —
          began ~900px down and nobody arriving from an ad ever saw it. Every
          reduction below buys part of the ~290px that pulls it into the fold. */}
      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-5 pb-10 pt-24 sm:px-8 lg:gap-10 lg:pb-20 lg:pt-28 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <p className="l-load text-[11px] font-semibold uppercase tracking-[0.34em] text-[color:var(--l-gold-lite)]" style={{ animationDelay: "0.05s" }}>
            Invitation websites · {PRICE}
          </p>

          {/* Plain and literal on purpose: a cold visitor from Instagram has
              three seconds to know what this is, and "invitation website"
              said twice (eyebrow + here) does that job better than one
              clever line ever did. The swash still marks the one word worth
              lingering on — how fast it comes together. */}
          <h1 className="l-load l-display mt-4 text-balance text-[clamp(2.1rem,4.6vw,4rem)] font-semibold leading-[1.06] text-[color:var(--l-ivory)] lg:mt-6" style={{ animationDelay: "0.18s" }}>
            Your invitation website,{" "}
            {/* Kept on one line so the drawn swash underneath can't be split. */}
            <span className="relative inline-block whitespace-nowrap italic text-[color:var(--l-gold-lite)]">
              made in minutes
              <svg
                className="l-draw absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 14"
                fill="none"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 10 C 80 2, 220 2, 296 8"
                  stroke="var(--l-gold)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="l-load mx-auto mt-5 max-w-lg text-pretty text-[15px] leading-relaxed text-white/80 lg:mt-8 lg:text-base" style={{ animationDelay: "0.42s" }}>
            A live countdown, your photos, RSVP, venue maps and your full
            timeline — shared as one private WhatsApp link.
          </p>

          {/* The one thing a JPEG card and every cheaper competitor can't do,
              pulled out of the paragraph above and given its own weight. It was
              the last clause of a three-line sentence, which is exactly where a
              visitor skimming for three seconds never reaches — and it's the
              reason to buy, not a footnote to the feature list. */}
          <p
            className="l-load mx-auto mt-4 max-w-lg border-l-2 border-[color:var(--l-gold)] pl-4 text-left text-[16px] leading-snug text-[color:var(--l-ivory)] lg:mx-0 lg:mt-5 lg:text-[17px]"
            style={{ animationDelay: "0.46s" }}
          >
            One link.{" "}
            <span className="font-semibold text-[color:var(--l-gold-lite)]">
              Every family sees only the events they&apos;re invited to.
            </span>
          </p>

          {/* Desktop only. On a phone this row is 133px of text restating what
              the live phone right below it is already demonstrating, and it was
              costing the phone its place in the first screen. The legend is a
              nice touch beside a side-by-side layout; it is not worth the fold. */}
          <ul className="l-load mt-7 hidden flex-wrap justify-center gap-2 lg:flex lg:justify-start" style={{ animationDelay: "0.5s" }}>
            {INCLUDED.map(({ label, stops }) => {
              const active = stops.includes(stop);
              return (
                <li
                  key={label}
                  // Decorative highlight only — the tour it tracks lives in an
                  // aria-hidden iframe, so there's no state here to announce.
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-500",
                    active
                      ? "border-[color:var(--l-gold)]/70 bg-[color:var(--l-gold)]/15 text-[color:var(--l-gold-lite)]"
                      : "border-white/15 bg-white/[0.07] text-white/85",
                  )}
                >
                  {label}
                </li>
              );
            })}
          </ul>

          {/* Buy first, look second.
              This row used to show the demo and "See how it works" on desktop
              and hide the buy button entirely (`lg:hidden`, left over from when
              the only way to buy was WhatsApp) — so the highest-intent area of
              the page offered look and learn but no way to purchase.
              The order is deliberate too: at ₹99 buying is the low-commitment
              action, and the proof a demo would provide is already on screen in
              the live phone beside this copy. */}
          <div className="l-load mt-6 grid grid-cols-2 gap-2.5 lg:mt-9 lg:flex lg:items-center lg:justify-start" style={{ animationDelay: "0.6s" }}>
            {/* Short form on the phone: the full label wraps to two lines beside
                a one-line demo button, and a taller rectangle next to it makes
                the pair read as unequal choices. */}
            <StartButton
              from="hero"
              label={`${BUY_CTA_SHORT} · ${PRICE}`}
              className="px-4 py-3.5 text-[13px] leading-tight lg:px-8 lg:py-4 lg:text-sm"
            />
            <Link
              href={`/demo/${HERO_THEME.demo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/30 px-4 py-3.5 text-center text-[13px] font-semibold leading-tight text-[color:var(--l-ivory)] transition-colors hover:border-[color:var(--l-gold-lite)] lg:px-8 lg:py-4 lg:text-sm"
            >
              {/* Short label on desktop too, now that this is the secondary
                  button: at its full length it was physically wider than the
                  primary beside it, and size is read as importance before
                  colour is. */}
              {DEMO_CTA_SHORT}
            </Link>
            <a
              href="#how-it-works"
              className="hidden text-sm font-semibold text-white/70 underline-offset-4 transition-colors hover:text-[color:var(--l-gold-lite)] hover:underline lg:ml-2 lg:block"
            >
              See how it works
            </a>
          </div>

          {/* Three facts, sitting DIRECTLY under the button — reassurance only
              works where the doubt is felt.
              This was ten claims across three stacked blocks (a five-part line,
              a WhatsApp sentence, and a four-item bullet list), all in 11-12px
              type, in the one place on the page where a visitor is deciding
              rather than reading. Nobody reads ten things with a thumb over a
              button. What's left is the cost, the risk-remover, and the guest
              objection; the proof those adjectives were reaching for is now the
              rating badge below, which is one line and can be checked. */}
          <p className="l-load mt-3 text-center text-[11px] leading-relaxed tracking-wide text-white/65 lg:mt-4 lg:text-left lg:text-xs" style={{ animationDelay: "0.65s" }}>
            {HERO_FACTS.map((f, i) => (
              <span key={f.label}>
                {i > 0 ? <span className="opacity-50"> · </span> : null}
                <span
                  className={
                    f.emphasis
                      ? "font-semibold text-[color:var(--l-gold-lite)]"
                      : undefined
                  }
                >
                  {f.label}
                </span>
              </span>
            ))}
          </p>

          {/* Two small affordances on one line: the proof, and the way to reach a
              human. Both are chips rather than a sentence each, which is what
              collapsed three stacked paragraphs into one row.
              The rating badge is the only signpost to the reviews section for
              anyone who won't scroll ten screens — the nav link is the other.
              WhatsApp is now a filled green pill instead of a gold text link: it
              is the path for everyone who would rather hand this to a person,
              and as underlined text it was invisible next to two buttons. It
              stays smaller than the gold CTA above so the hierarchy still reads
              buy-first. */}
          <div className="l-load mt-4 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start" style={{ animationDelay: "0.72s" }}>
            {ratingBadge}
            <BookNowButton
              label="Chat on WhatsApp"
              className="min-h-11 px-4 py-2 text-[12px] sm:min-h-9"
            />
          </div>
        </div>

        {/* The product itself: a real guest site running live inside the phone,
            scrolling itself through countdown → events → gallery → RSVP. The
            frame mounts after first paint, so none of this is on the critical
            path for the headline above. */}
        <div className="l-load relative mx-auto flex w-full flex-col items-center lg:mx-0" style={{ animationDelay: "0.34s" }}>
          {/* Natural size: the frame is 538px tall and scaling it up pushes the
              CTA row off a 768px laptop screen. The preview inside it does its
              own scaling — see TOUR_VIEWPORT in theme-card. */}
          <ThemePhone theme={HERO_THEME} tour onStopChange={setStop} />
          <p className="mt-4 text-center text-xs text-white/60 lg:mt-6">
            A real invitation site, running live — tap the screen to explore it.
          </p>
          {/* The explainer link the mobile CTA row gave up. Below the phone
              rather than above it: someone who has watched the demo scroll and
              still wants the mechanics explained is exactly who this is for. */}
          <a
            href="#how-it-works"
            className="mt-3 text-xs font-semibold text-[color:var(--l-gold-lite)] underline-offset-4 hover:underline lg:hidden"
          >
            See how it works ↓
          </a>
        </div>
      </div>
    </section>
  );
}
