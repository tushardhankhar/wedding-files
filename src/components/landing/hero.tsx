"use client";

import Link from "next/link";
import { useRef } from "react";
import { Mandala } from "@/components/brand/motifs";
import { PetalField } from "./art";
import { UtsavMonogram } from "./logo";

const HERO_BG =
  "radial-gradient(90% 70% at 72% 18%, rgba(216,27,96,.40), transparent 60%), radial-gradient(70% 60% at 12% 88%, rgba(244,124,32,.30), transparent 60%), radial-gradient(120% 80% at 50% 118%, rgba(201,154,61,.28), transparent 55%), linear-gradient(168deg, #3b1022 0%, #57122e 48%, #2a0a18 100%)";

export function LandingHero() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Subtle cursor parallax on the invitation card (desktop only, motion-safe).
  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    const card = cardRef.current;
    if (!card || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { innerWidth: w, innerHeight: h } = window;
    const dx = (e.clientX / w - 0.5) * 14;
    const dy = (e.clientY / h - 0.5) * 10;
    card.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  return (
    <section
      className="l-grain relative flex min-h-svh flex-col overflow-hidden"
      style={{ background: HERO_BG }}
      onPointerMove={onPointerMove}
      data-image-slot="hero"
    >
      <Mandala className="spin-slow left-1/2 top-[-260px] h-[640px] w-[640px] -translate-x-1/2 opacity-[0.14]" />
      <PetalField count={12} />

      <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 pb-24 pt-32 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <p className="l-load text-[11px] font-semibold uppercase tracking-[0.34em] text-[color:var(--l-gold-lite)]" style={{ animationDelay: "0.05s" }}>
            Digital wedding invitations · ₹1,599
          </p>

          <h1 className="l-load l-display mt-6 text-balance text-[clamp(2.7rem,7.2vw,6.2rem)] font-semibold leading-[1.04] text-[color:var(--l-ivory)]" style={{ animationDelay: "0.18s" }}>
            Your wedding.
            <br />
            Their invitation.
            <br />
            One unforgettable{" "}
            <span className="relative inline-block italic text-[color:var(--l-gold-lite)]">
              Jashn
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

          <p className="l-load mx-auto mt-7 max-w-md text-pretty text-base leading-relaxed text-white/80 lg:mx-0" style={{ animationDelay: "0.42s" }}>
            Make your own wedding website in minutes — add your names, events
            and photos yourself. Share one private link on WhatsApp, and every
            family sees only the events they&apos;re invited to.
          </p>

          <div className="l-load mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start" style={{ animationDelay: "0.56s" }}>
            <Link
              href="/demo/royal"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full bg-gradient-to-r from-[color:var(--l-marigold)] via-[color:var(--l-pink)] to-[color:var(--l-red)] px-8 py-4 text-center text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgba(216,27,96,.75)] transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              See a live demo
            </Link>
            <a
              href="#how-it-works"
              className="w-full rounded-full border border-white/30 px-8 py-4 text-center text-sm font-semibold text-[color:var(--l-ivory)] transition-colors hover:border-[color:var(--l-gold-lite)] sm:w-auto"
            >
              See how it works
            </a>
          </div>

          <p className="l-load mt-5 text-xs tracking-wide text-white/55" style={{ animationDelay: "0.7s" }}>
            Just ₹1,599 · No app · No guest accounts · Ready in minutes.
          </p>
        </div>

        {/* Floating invitation card */}
        <div className="l-load relative mx-auto w-full max-w-sm lg:mx-0" style={{ animationDelay: "0.34s" }}>
          <div ref={cardRef} className="transition-transform duration-300 ease-out">
            <div className="l-float relative rounded-3xl bg-[color:var(--l-ivory)] p-7 shadow-[0_44px_90px_-28px_rgba(0,0,0,.7)]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-2 rounded-2xl border border-[color:var(--l-gold)]/45"
              />
              <div className="flex items-center justify-between">
                <UtsavMonogram className="h-8 w-8" stroke="var(--l-gold)" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--l-emerald)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--l-emerald)]">
                  <span className="size-1.5 rounded-full bg-[color:var(--l-emerald)]" />
                  via WhatsApp
                </span>
              </div>

              <p className="l-script mt-5 text-2xl leading-none text-[color:var(--l-gold)]">
                You&apos;re invited
              </p>
              <p className="l-display mt-1 text-3xl font-semibold text-[color:var(--l-wine)]">
                Aarav <span className="italic text-[color:var(--l-pink)]">&amp;</span> Meera
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--l-ink-soft)]">
                Sharma Family, you&apos;re invited ✨ — three evenings of music,
                colour and celebration await you.
              </p>

              <span className="mt-6 block rounded-full bg-[color:var(--l-wine)] px-5 py-3.5 text-center text-sm font-semibold text-[color:var(--l-gold-lite)]">
                Open your invitation
              </span>

              <p className="l-deva mt-4 text-center text-xs text-[color:var(--l-ink-soft)]">
                आप सादर आमंत्रित हैं
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="relative pb-8">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">
            Scroll to join the celebration
          </span>
          <svg className="l-cue" width="14" height="20" viewBox="0 0 14 20" fill="none" aria-hidden="true">
            <path d="M7 2v14m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
