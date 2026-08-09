"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { T, TT } from "../bilingual";
import { focusStyles } from "../image-focus";
import { SmoothScroll } from "../experience/smooth-scroll";
import { useScrollScene, useRefreshOnLoad } from "../experience/use-scroll-scene";
import {
  RoyalInsignia,
  GoldRule,
  ArchColonnade,
  Jali,
  AmpersandSeal,
  CornerFiligree,
  ElephantProcession,
  MarigoldFall,
  PalaceSkyline,
  LightShafts,
} from "./ornaments";
import { usePointerCamera, tiltHandlers } from "./maharaja-motion";
import {
  MaharajaGroupRsvp,
  MaharajaSelfRsvp,
  MaharajaRsvpDemo,
} from "./maharaja-rsvp";
import { useCountdown, pad2 } from "../use-countdown";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function splitNames(names: string): [string, string] | null {
  const parts = names.split(" & ");
  return parts.length === 2 ? [parts[0], parts[1]] : null;
}

/** "2026-12-12" → "12 — 12 — 2026" */
function sealDate(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d} — ${m} — ${y}`;
}

function longDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    .toUpperCase();
}

/** "10:00" → "10:00 IN THE MORNING" */
function royalTime(t: string | null): string | null {
  if (!t) return null;
  const h = Number(t.slice(0, 2));
  const phase = h < 12 ? "IN THE MORNING" : h < 17 ? "IN THE AFTERNOON" : "IN THE EVENING";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${t.slice(3, 5)} ${phase}`;
}

function gcalUrl(e: WeddingEvent, siteTitle: string): string | null {
  if (!e.eventDate) return null;
  let dates: string;
  if (e.startTime) {
    const start = new Date(`${e.eventDate}T${e.startTime.slice(0, 5)}:00`);
    const end = new Date(start.getTime() + 2 * 3600_000);
    const f = (x: Date) =>
      `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}T${String(x.getHours()).padStart(2, "0")}${String(x.getMinutes()).padStart(2, "0")}00`;
    dates = `${f(start)}/${f(end)}`;
  } else {
    const next = new Date(`${e.eventDate}T00:00:00`);
    next.setDate(next.getDate() + 1);
    const f = (x: Date) =>
      `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}`;
    dates = `${e.eventDate.replace(/-/g, "")}/${f(next)}`;
  }
  const params = new URLSearchParams({ action: "TEMPLATE", text: `${e.name} — ${siteTitle}`, dates });
  const loc = [e.venueName, e.venueAddress].filter(Boolean).join(", ");
  if (loc) params.set("location", loc);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Cinematic backdrop per chapter — antique, never neon.
 *
 * Each is a *lit room* rather than a flat wash: one warm key light placed
 * off-centre, one cooler bounce opposite it, and the lacquer ramp underneath.
 * The key sits in a different quadrant each time, so scrolling the itinerary
 * feels like walking through rooms lit from different windows.
 */
const CHAPTER_ART = [
  // marigold morning — key high left, gold bounce off the floor
  "radial-gradient(70% 52% at 26% 12%, rgba(228,196,137,.42), transparent 62%), radial-gradient(60% 46% at 82% 96%, rgba(143,28,59,.55), transparent 60%), linear-gradient(162deg, #6d4413 0%, #8f1c3b 62%, #310a18 108%)",
  // deep evening — key high right, the room falling into shadow at the floor
  "radial-gradient(66% 50% at 76% 10%, rgba(143,28,59,.62), transparent 62%), radial-gradient(56% 44% at 14% 88%, rgba(192,150,73,.22), transparent 58%), linear-gradient(172deg, #3b0e2c 0%, #310a18 58%, #150409 100%)",
  // the most dramatic — imperial red falling into black, lit from directly above
  "radial-gradient(84% 62% at 50% -4%, rgba(143,28,59,.9), transparent 66%), radial-gradient(50% 40% at 50% 104%, rgba(122,83,22,.3), transparent 62%), linear-gradient(180deg, #5e1129 0%, #150409 92%)",
  // burnished gold finale — the warmest room, light rising from the floor
  "radial-gradient(72% 54% at 50% 8%, rgba(192,150,73,.5), transparent 62%), radial-gradient(66% 50% at 50% 100%, rgba(122,83,22,.45), transparent 64%), linear-gradient(170deg, #310a18 0%, #5e1129 52%, #6d4413 128%)",
];

const HERO_ART =
  "radial-gradient(95% 70% at 62% 16%, rgba(122,20,48,.5), transparent 62%), radial-gradient(72% 55% at 18% 92%, rgba(192,150,73,.32), transparent 58%), radial-gradient(120% 90% at 50% 50%, transparent 40%, rgba(21,4,9,.85) 100%), linear-gradient(168deg, #310a18 0%, #4e0d21 48%, #150409 100%)";

/* The gallery's tilt handlers close over nothing, so one shared set is enough
   for every portrait — building them per figure per render would churn a new
   pair of listeners on each pass for no gain. */
const TILT = tiltHandlers();

/** The lit hairline down a door's meeting edge, brightest where the light is. */
const SEAM =
  "linear-gradient(180deg, transparent 0%, var(--m-gold) 20%, var(--m-gold3) 48%, var(--m-gold) 78%, transparent 100%)";

const btnGhost =
  "inline-flex items-center justify-center border border-[color:var(--m-gold)]/60 px-6 py-3 text-[10px] uppercase tracking-[0.26em] text-[color:var(--m-gold2)] transition-colors hover:border-[color:var(--m-gold2)] hover:text-[color:var(--m-ivory)] m-caps";

/* ══════════════════════════════════════════════════════════════════════════ */
export function MaharajaView({
  names,
  initials,
  dateLabel,
  countdownDate,
  events,
  config,
  chip,
  rsvp,
  selfRsvp,
  ownerPreview,
  openImmediately,
}: WebsiteViewProps) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [entered, setEntered] = useState(Boolean(openImmediately));
  const [doorsGone, setDoorsGone] = useState(Boolean(openImmediately));
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  // Gallery images and the display webfonts both land after first paint and
  // both change the document height; every scrubbed scene below is measured
  // against that height, so they have to be re-measured when it settles.
  useRefreshOnLoad();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function enter() {
    if (entered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      setDoorsGone(true);
      return;
    }
    setEntered(true);
    // Must outlast the door swing (2s) and the invitation's push-through
    // (1.9s), or the overlay is torn away with the leaves still turning.
    setTimeout(() => setDoorsGone(true), 2100);
  }

  const pair = splitNames(names);
  const seal = initials.replace(/\s*&\s*/, " · ");
  const milestones = config.story?.milestones ?? [];
  const familyMembers = config.family?.members ?? [];
  const groomFamily = familyMembers.filter((m) => m.side !== "bride");
  const brideFamily = familyMembers.filter((m) => m.side === "bride");
  const images = config.gallery?.images ?? [];
  const faqs = config.faq?.items ?? [];
  const contacts = config.footer?.contacts ?? [];
  const hashtag = config.footer?.hashtag;
  const venues = events.filter((e) => e.venueName);
  // A group RSVP with no guests would render the section heading with
  // nothing beneath it (no guests to loop over) — hide it entirely rather
  // than show a confusing blank block.
  const hasRsvp = Boolean(
    (rsvp && rsvp.events.length > 0) || selfRsvp || ownerPreview
  );
  // Real family name on personal invitations; a dignified stand-in on
  // preview/demo so the welcome section still demonstrates itself.
  const family =
    rsvp && chip
      ? chip
      : ownerPreview
        ? { en: "Honoured Guests", hi: "सम्मानित अतिथिगण" }
        : null;

  const links: Array<[string, string, string]> = [];
  if (milestones.length) links.push(["#story", "Our Story", "हमारी कहानी"]);
  if (familyMembers.length) links.push(["#family", "Families", "परिवार"]);
  if (events.length) links.push(["#celebrations", "Celebrations", "आयोजन"]);
  // if (venues.length) links.push(["#palace", "Palace", "महल"]); // Palace section — temporarily disabled
  if (images.length) links.push(["#gallery", "Gallery", "गैलरी"]);
  if (faqs.length || contacts.length) links.push(["#details", "Details", "विवरण"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);
  const mid = Math.ceil(links.length / 2);

  return (
    <div className="mhj" data-lang={lang}>
      {/*
        Lenis owns the scroll for this theme: the eased scroll is what binds the
        scrubbed hero, the chapter dollies and the depth planes into one
        continuous camera move — with native scroll they all still work, but
        each arrives on its own stepped cadence and the effect reads as
        animation rather than as a shot.

        It is rendered here, childless, rather than as a wrapper around the
        whole theme, because it needs `doorsGone` — and that state belongs to
        this component. Until the doors are gone the page is held still; without
        that, a visitor who opens the invitation by scrolling scrolls the site
        behind it too, and the doors part on a hero already shifted upward.
      */}
      <SmoothScroll paused={!doorsGone} />

      {/* ── CEREMONIAL ENTRANCE ─────────────────────────────────────────── */}
      {!doorsGone ? (
        <div
          className="m-doorframe fixed inset-0 z-[80] bg-[color:var(--m-mahog)]"
          onWheel={enter}
          onTouchMove={enter}
          role="dialog"
          aria-label="Invitation"
        >
          {/* What lies beyond the doors — glimpsed the instant they part, so the
              gap between the leaves is a lit hall rather than a white flash. */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0" style={{ background: HERO_ART }} />
            <LightShafts className="opacity-70" />
          </div>

          {/* palace doors — hinged on their outer edges, see .m-door */}
          <div
            data-side="l"
            data-open={entered}
            className="m-door m-grain absolute inset-y-0 left-0 w-1/2"
            style={{ background: "linear-gradient(105deg, #200610 0%, var(--m-wine) 100%)" }}
          >
            <Jali className="text-[color:var(--m-gold)] opacity-[0.07]" />
            {/* The seam where the leaves meet. A hairline, and faded out at
                both ends: a full-height band of gold down the middle of the
                cover stops reading as a join and starts reading as a pole. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-px opacity-60"
              style={{ background: SEAM }}
            />
          </div>
          <div
            data-side="r"
            data-open={entered}
            className="m-door m-grain absolute inset-y-0 right-0 w-1/2"
            style={{ background: "linear-gradient(255deg, #200610 0%, var(--m-wine) 100%)" }}
          >
            <Jali className="text-[color:var(--m-gold)] opacity-[0.07]" />
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-px opacity-60"
              style={{ background: SEAM }}
            />
          </div>

          {/* the invitation */}
          <div
            data-open={entered}
            className="m-door-content absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="m-glint inline-block">
              <RoyalInsignia initials={seal} className="h-32 text-[color:var(--m-gold2)] sm:h-40" />
            </div>
            {pair ? (
              <div className="m-display m-engrave mt-8 max-w-full break-words text-center text-[clamp(1.9rem,5.4vw,3.4rem)] uppercase leading-tight tracking-[0.12em] text-[color:var(--m-ivory)] sm:tracking-[0.22em]">
                <span className="block">{pair[0]}</span>
                <span className="m-serif m-goldtext my-1 block text-[0.8em] normal-case italic tracking-normal">&amp;</span>
                <span className="block">{pair[1]}</span>
              </div>
            ) : (
              <p className="m-display m-engrave mt-8 max-w-full break-words text-[clamp(1.9rem,5.4vw,3.4rem)] uppercase tracking-[0.12em] text-[color:var(--m-ivory)] sm:tracking-[0.22em]">
                {names}
              </p>
            )}
            {sealDate(countdownDate) ? (
              <p className="m-caps mt-4 text-sm tracking-[0.5em] text-[color:var(--m-gold2)]">
                {sealDate(countdownDate)}
              </p>
            ) : null}
            <p className="m-caps mt-6 text-[11px] uppercase tracking-[0.3em] text-[color:var(--m-ivory)]/60">
              <TT en="With the blessings of our families" hi="परिवारों के आशीर्वाद सहित" />
            </p>
            <button
              type="button"
              onClick={enter}
              className="group mt-14 flex flex-col items-center gap-3 text-[color:var(--m-gold2)]"
            >
              <span className="m-glint border border-[color:var(--m-gold)]/60 px-8 py-3.5 text-[10px] m-caps uppercase tracking-[0.34em] transition-colors group-hover:border-[color:var(--m-gold2)] group-hover:text-[color:var(--m-ivory)]">
                <TT en="Enter the celebration" hi="उत्सव में प्रवेश करें" />
              </span>
              <svg className="l-cue" width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true">
                <path d="M6 1v13m0 0l-4.5-4.5M6 14l4.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      {/* ── NAVIGATION — luxury editorial index ─────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-500 ${
          scrolled
            ? "border-[color:var(--m-gold)]/30 bg-[color:var(--m-wine)]/95 backdrop-blur-sm"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 py-3 sm:px-8">
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary left">
            {links.slice(0, mid).map(([href, en, hi]) => (
              <a key={href} href={href} className="text-[10px] m-caps uppercase tracking-[0.26em] text-[color:var(--m-ivory)]/75 transition-colors hover:text-[color:var(--m-gold2)]">
                <TT en={en} hi={hi} />
              </a>
            ))}
          </nav>
          <a href="#top" className="justify-self-center" aria-label={names}>
            <span className="m-serif text-lg tracking-[0.2em] text-[color:var(--m-gold2)]">{seal}</span>
          </a>
          <div className="flex items-center justify-end gap-6">
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary right">
              {links.slice(mid).map(([href, en, hi]) => (
                <a key={href} href={href} className="text-[10px] m-caps uppercase tracking-[0.26em] text-[color:var(--m-ivory)]/75 transition-colors hover:text-[color:var(--m-gold2)]">
                  <TT en={en} hi={hi} />
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-1 lg:flex">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-1.5 text-[10px] m-caps uppercase tracking-widest transition-colors ${
                    lang === l ? "text-[color:var(--m-gold2)]" : "text-[color:var(--m-ivory)]/45 hover:text-[color:var(--m-ivory)]"
                  }`}
                >
                  {l === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="text-[10px] m-caps uppercase tracking-[0.3em] text-[color:var(--m-gold2)] lg:hidden"
              aria-expanded={menu}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* mobile royal directory */}
      {menu ? (
        <div
          className="m-grain fixed inset-0 z-[70] flex flex-col bg-[color:var(--m-wine)] p-6 duration-300 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <Jali className="text-[color:var(--m-gold)] opacity-[0.05]" />
          <div className="relative flex items-center justify-between">
            <span className="m-serif text-lg tracking-[0.2em] text-[color:var(--m-gold2)]">{seal}</span>
            <button
              type="button"
              onClick={() => setMenu(false)}
              className="text-[10px] m-caps uppercase tracking-[0.3em] text-[color:var(--m-gold2)]"
            >
              Close
            </button>
          </div>
          <nav className="relative mt-14 flex flex-col items-center gap-7" aria-label="Primary mobile">
            {links.map(([href, en, hi], i) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className="m-display text-2xl uppercase tracking-[0.24em] text-[color:var(--m-ivory)] duration-500 animate-in fade-in slide-in-from-bottom-3"
                style={{ animationDelay: `${90 + i * 70}ms` }}
              >
                <TT en={en} hi={hi} />
              </a>
            ))}
            <div className="mt-4 flex gap-4">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`border px-4 py-2 text-[11px] m-caps uppercase tracking-widest ${
                    lang === l
                      ? "border-[color:var(--m-gold)] text-[color:var(--m-gold2)]"
                      : "border-[color:var(--m-ivory)]/25 text-[color:var(--m-ivory)]/55"
                  }`}
                >
                  {l === "en" ? "English" : "हिंदी"}
                </button>
              ))}
            </div>
          </nav>
          <GoldRule className="relative mx-auto mt-auto text-[color:var(--m-gold)]/60" />
        </div>
      ) : null}

      {/* ── HERO — a 3D stage, not a backdrop ───────────────────────────── */}
      <RoyalHero
        names={names}
        pair={pair}
        stamp={sealDate(countdownDate) ?? dateLabel ?? ""}
        venue={venues[0]?.venueName ?? null}
      />

      {/* ── PERSONAL GUEST WELCOME — the invitation ──────────────────────── */}
      {family ? (
        <section className="relative bg-[color:var(--m-ivory)] px-6 py-24 sm:py-32">
          <CornerFiligree className="absolute left-5 top-5 text-[color:var(--m-gold)]/50" />
          <CornerFiligree className="absolute right-5 top-5 -scale-x-100 text-[color:var(--m-gold)]/50" />
          <CornerFiligree className="absolute bottom-5 left-5 -scale-y-100 text-[color:var(--m-gold)]/50" />
          <CornerFiligree className="absolute bottom-5 right-5 -scale-100 text-[color:var(--m-gold)]/50" />
          <div className="mx-auto max-w-3xl text-center" data-mreveal>
            <div className="m-glint inline-block">
              <RoyalInsignia initials={seal} className="mx-auto h-20 text-[color:var(--m-gold)]" />
            </div>
            <p className="mt-8 text-[11px] m-caps uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
              <TT en="Namaste" hi="नमस्ते" />
            </p>
            <h2 className="m-display mt-3 text-[clamp(2.4rem,7vw,4.8rem)] uppercase leading-tight tracking-[0.1em] text-[color:var(--m-wine)]">
              <T value={family} />
            </h2>
            <GoldRule className="mx-auto mt-6 text-[color:var(--m-gold)]" />
            <p className="m-serif mx-auto mt-8 max-w-xl text-xl italic leading-relaxed text-[color:var(--m-ink)]/85">
              <TT
                en="With immense joy and the blessings of our families, we invite you to join us as we begin our forever."
                hi="अपार हर्ष और परिवारों के आशीर्वाद सहित, हम आपको अपने साथ इस नई शुरुआत में सम्मिलित होने के लिए आमंत्रित करते हैं।"
              />
            </p>
            {rsvp && chip ? (
              <div className="mt-10">
                <p className="text-[10px] m-caps uppercase tracking-[0.4em] text-[color:var(--m-ink-soft)]">
                  <TT en="This invitation honours" hi="यह निमंत्रण जिनके नाम" />
                </p>
                <p className="m-serif mt-3 text-lg uppercase tracking-[0.3em] text-[color:var(--m-maroon)]">
                  <T value={chip} />
                </p>
              </div>
            ) : null}
            <p className="mt-12 text-[10px] m-caps uppercase tracking-[0.4em] text-[color:var(--m-gold)]">
              <TT en="Your celebrations follow" hi="आपके आयोजन आगे हैं" /> ↓
            </p>
          </div>
        </section>
      ) : null}

      {/* ── OUR STORY — a royal chronicle ────────────────────────────────── */}
      {milestones.length > 0 ? (
        <section id="story" className="scroll-mt-16 bg-[color:var(--m-ivory2)] px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="text-center" data-mreveal>
              <p className="text-[10px] m-caps uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
                <TT en="The Chronicle" hi="गाथा" />
              </p>
              <h2 className="m-display mt-3 text-[clamp(2.2rem,6vw,4rem)] uppercase leading-tight tracking-[0.12em] text-[color:var(--m-wine)]">
                <TT en="A story" hi="एक कहानी" />
                <br />
                <span className="m-goldtext">
                  <TT en="written in time" hi="समय में लिखी हुई" />
                </span>
              </h2>
            </div>

            <div className="relative mt-20 space-y-24">
              <span aria-hidden="true" className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[color:var(--m-gold)]/50 to-transparent lg:block" />
              {milestones.map((m, i) => (
                <div key={i} className={`relative lg:w-[46%] ${i % 2 ? "lg:ml-auto lg:text-left" : "lg:text-right"}`} data-mreveal>
                  <span aria-hidden="true" className={`m-serif pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 text-[7rem] font-semibold leading-none text-[color:var(--m-gold)]/15 lg:translate-x-0 lg:text-[9rem] ${i % 2 ? "lg:left-[-2rem] lg:right-auto" : "lg:right-[-2rem] lg:left-auto"}`}>
                    {m.when}
                  </span>
                  <p className="relative text-[10px] m-caps uppercase tracking-[0.4em] text-[color:var(--m-gold)]">{m.when}</p>
                  <h3 className="m-serif relative mt-2 text-3xl uppercase tracking-[0.1em] text-[color:var(--m-wine)]">
                    <T value={m.title} />
                  </h3>
                  <p className="relative mt-3 leading-relaxed text-[color:var(--m-ink)]/75">
                    <T value={m.text} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── FAMILIES — with the blessings of both houses ─────────────────── */}
      {familyMembers.length > 0 ? (
        <section id="family" className="scroll-mt-16 bg-[color:var(--m-ivory)] px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl">
            <div className="text-center" data-mreveal>
              <p className="text-[10px] m-caps uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
                <TT en="With blessings" hi="आशीर्वाद सहित" />
              </p>
              <h2 className="m-display mt-3 text-[clamp(2.2rem,6vw,4rem)] uppercase tracking-[0.12em] text-[color:var(--m-wine)]">
                <TT en="Our Families" hi="हमारे परिवार" />
              </h2>
              <GoldRule className="mx-auto mt-6 text-[color:var(--m-gold)]" />
            </div>
            <div className={`mt-16 grid gap-14 ${groomFamily.length && brideFamily.length ? "md:grid-cols-2" : ""}`}>
              {groomFamily.length > 0 ? (
                <div className={`text-center ${brideFamily.length > 0 ? "md:border-r md:border-[color:var(--m-gold)]/30 md:pr-14" : ""}`} data-mreveal>
                  <p className="text-[10px] m-caps uppercase tracking-[0.4em] text-[color:var(--m-gold)]">
                    <TT en="Groom's Family" hi="वर पक्ष" />
                  </p>
                  <div className="mt-6 space-y-5">
                    {groomFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="m-serif text-xl uppercase tracking-[0.08em] text-[color:var(--m-wine)]">
                          <T value={m.name} />
                        </h3>
                        {m.relation ? (
                          <p className="mt-1 text-sm italic text-[color:var(--m-ink-soft)]">
                            <T value={m.relation} />
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {brideFamily.length > 0 ? (
                <div className="text-center" data-mreveal>
                  <p className="text-[10px] m-caps uppercase tracking-[0.4em] text-[color:var(--m-gold)]">
                    <TT en="Bride's Family" hi="वधू पक्ष" />
                  </p>
                  <div className="mt-6 space-y-5">
                    {brideFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="m-serif text-xl uppercase tracking-[0.08em] text-[color:var(--m-wine)]">
                          <T value={m.name} />
                        </h3>
                        {m.relation ? (
                          <p className="mt-1 text-sm italic text-[color:var(--m-ink-soft)]">
                            <T value={m.relation} />
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── COUNTDOWN ────────────────────────────────────────────────────── */}
      {countdownDate ? <RoyalCountdown dateIso={countdownDate} /> : null}

      {/* ── THE ROYAL ITINERARY — chapters ───────────────────────────────── */}
      {events.length > 0 ? (
        <section id="celebrations" className="scroll-mt-16">
          <div className="bg-[color:var(--m-ivory)] px-6 py-20 text-center">
            <p className="text-[10px] m-caps uppercase tracking-[0.5em] text-[color:var(--m-gold)]" data-mreveal>
              <TT en="The celebrations" hi="आयोजन" />
            </p>
            <h2 className="m-serif mt-3 text-[clamp(2.2rem,6vw,4rem)] uppercase tracking-[0.12em] text-[color:var(--m-wine)]" data-mreveal>
              <TT en="The Royal Itinerary" hi="शाही कार्यक्रम" />
            </h2>
            <GoldRule className="mx-auto mt-6 text-[color:var(--m-gold)]" />
            {!ownerPreview && rsvp ? (
              <p className="mx-auto mt-5 max-w-md text-sm italic text-[color:var(--m-ink-soft)]">
                <TT
                  en="Only the celebrations chosen for your family appear here."
                  hi="यहाँ केवल वही आयोजन हैं जो आपके परिवार के लिए चुने गए हैं।"
                />
              </p>
            ) : null}
          </div>

          {events.map((e, i) => (
            <RoyalChapter
              key={e.id}
              event={e}
              index={i}
              last={i === events.length - 1 && events.length > 1}
              cal={gcalUrl(e, names)}
              hasRsvp={hasRsvp}
            />
          ))}
        </section>
      ) : null}

      {/* ── THE PALACE — venue — temporarily disabled
      {venues.length > 0 ? (
        <section id="palace" className="scroll-mt-16 bg-[color:var(--m-ivory)] px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center" data-mreveal>
              <p className="text-[10px] m-caps uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
                <TT en="The setting" hi="स्थल" />
              </p>
              <h2 className="m-display mt-3 text-[clamp(2.2rem,6vw,4rem)] uppercase tracking-[0.12em] text-[color:var(--m-wine)]">
                <TT en="The Palace" hi="महल" />
              </h2>
              <GoldRule className="mx-auto mt-6 text-[color:var(--m-gold)]" />
            </div>

            <div className="mt-16 space-y-16">
              {venues.map((v, i) => (
                <div key={v.id} className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`} data-mreveal>
                  <div>
                    <p className="text-[10px] m-caps uppercase tracking-[0.4em] text-[color:var(--m-gold)]">{v.name}</p>
                    <h3 className="m-serif mt-2 text-[clamp(1.8rem,4.5vw,3rem)] uppercase leading-tight tracking-[0.08em] text-[color:var(--m-wine)]">
                      {v.venueName}
                    </h3>
                    {v.venueAddress ? (
                      <div className="mt-6">
                        <p className="text-[10px] m-caps uppercase tracking-[0.4em] text-[color:var(--m-ink-soft)]">
                          <TT en="The address" hi="पता" />
                        </p>
                        <p className="m-serif mt-1.5 text-lg text-[color:var(--m-ink)]/85">{v.venueAddress}</p>
                      </div>
                    ) : null}
                    {v.mapsUrl ? (
                      <a
                        href={v.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 inline-flex items-center justify-center border border-[color:var(--m-wine)] px-7 py-3.5 text-[10px] m-caps uppercase tracking-[0.28em] text-[color:var(--m-wine)] transition-colors hover:bg-[color:var(--m-wine)] hover:text-[color:var(--m-gold2)]"
                      >
                        <TT en="Open in maps" hi="मैप खोलें" />
                      </a>
                    ) : null}
                  </div>
                  <div className="mx-auto w-full max-w-sm">
                    <div className="m-grain relative overflow-hidden rounded-t-[11rem] border border-[color:var(--m-gold)]/60 p-2.5">
                      <div
                        className="relative flex h-80 items-end justify-center overflow-hidden rounded-t-[10rem] border border-[color:var(--m-gold)]/40"
                        style={{ background: "linear-gradient(180deg, #143f33 0%, var(--m-emerald) 60%, #0a3d30 100%)" }}
                      >
                        <Jali className="text-[color:var(--m-gold2)] opacity-[0.12]" />
                        <ArchColonnade className="absolute bottom-10 text-[color:var(--m-gold2)] opacity-30" />
                        <svg width="30" height="42" viewBox="0 0 30 42" fill="none" className="relative mb-24 text-[color:var(--m-gold2)]" aria-hidden="true">
                          <path d="M15 41 C 15 41 3 24 3 14 a12 12 0 1 1 24 0 C 27 24 15 41 15 41 Z" stroke="currentColor" strokeWidth="1.6" />
                          <circle cx="15" cy="14" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
                        <p className="absolute bottom-6 text-[9px] uppercase tracking-[0.4em] text-[color:var(--m-gold2)]/90">
                          <TT en="Arrival · Valet" hi="आगमन · वैले" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      */}

      {/* ── PORTRAITS OF US — museum gallery ─────────────────────────────── */}
      {images.length > 0 ? (
        <section id="gallery" className="scroll-mt-16 bg-[#fbf4e4] px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center" data-mreveal>
              <p className="text-[10px] m-caps uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
                <TT en="The collection" hi="संग्रह" />
              </p>
              <h2 className="m-display mt-3 text-[clamp(2.2rem,6vw,4rem)] uppercase tracking-[0.12em] text-[color:var(--m-wine)]">
                <TT en="Portraits of Us" hi="हमारे चित्र" />
              </h2>
              <GoldRule className="mx-auto mt-6 text-[color:var(--m-gold)]" />
            </div>

            <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
              {images.map((img, i) => {
                const span =
                  i % 5 === 0
                    ? "col-span-2 lg:col-span-3 aspect-[3/2]"
                    : i % 5 === 3
                      ? "col-span-2 aspect-[16/9]"
                      : "aspect-[3/4]";
                const fs = focusStyles(img.focus);
                return (
                  <figure key={i} className={`group m-tilt ${span}`} data-mreveal {...TILT}>
                    {/* The frame itself pitches toward the pointer and a
                        highlight tracks across it — the portrait behaves like
                        glazed art on a wall rather than a tile on a page. */}
                    <div className="m-tilt-inner m-sheen relative h-full w-full overflow-hidden border border-[color:var(--m-gold)]/40 bg-[color:var(--m-ivory2)]">
                      {/* Zoom wrapper — scales about the focal point; kept
                          separate so the img's hover transform composes. */}
                      <div className="h-full w-full" style={fs.zoom}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- couple-provided gallery URLs */}
                        <img
                          src={img.url}
                          alt=""
                          loading="lazy"
                          style={fs.image}
                          className="h-full w-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      {img.caption ? (
                        <figcaption className="m-caps absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/65 to-transparent px-4 pb-3 pt-10 text-[11px] uppercase tracking-[0.2em] text-[color:var(--m-ivory)] opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                          <T value={img.caption} />
                        </figcaption>
                      ) : null}
                    </div>
                    <p className="m-caps mt-3 text-[9px] uppercase tracking-[0.34em] text-[color:var(--m-ink-soft)]">
                      <TT en="Portrait" hi="चित्र" /> {String(i + 1).padStart(2, "0")}
                    </p>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── DETAILS — royal Q&A + court contacts ─────────────────────────── */}
      {faqs.length > 0 || contacts.length > 0 ? (
        <section id="details" className="scroll-mt-16 bg-[color:var(--m-ivory2)] px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center" data-mreveal>
              <p className="text-[10px] m-caps uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
                <TT en="For our guests" hi="अतिथियों हेतु" />
              </p>
              <h2 className="m-display mt-3 text-[clamp(2rem,5vw,3.2rem)] uppercase tracking-[0.12em] text-[color:var(--m-wine)]">
                <TT en="Details" hi="विवरण" />
              </h2>
              <GoldRule className="mx-auto mt-6 text-[color:var(--m-gold)]" />
            </div>
            <div className="mt-14 space-y-10">
              {faqs.map((f, i) => (
                <div key={i} data-mreveal>
                  <h3 className="m-serif text-xl uppercase tracking-[0.1em] text-[color:var(--m-wine)]">
                    <T value={f.q} />
                  </h3>
                  <p className="mt-2 leading-relaxed text-[color:var(--m-ink)]/75">
                    <T value={f.a} />
                  </p>
                </div>
              ))}
            </div>
            {contacts.length > 0 ? (
              <div className="mt-14 border-t border-[color:var(--m-gold)]/30 pt-8 text-center" data-mreveal>
                <p className="text-[10px] m-caps uppercase tracking-[0.4em] text-[color:var(--m-ink-soft)]">
                  <TT en="The court may be reached at" hi="संपर्क करें" />
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-x-10 gap-y-2">
                  {contacts.map((c, i) => (
                    <p key={i} className="m-serif text-lg text-[color:var(--m-wine)]">
                      {c.name}{c.relation ? <span className="text-[color:var(--m-ink-soft)]"> ({c.relation})</span> : null} <span className="text-[color:var(--m-ink-soft)]">· {c.phone}</span>
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── RSVP — WILL YOU JOIN OUR COURT? ──────────────────────────────── */}
      {hasRsvp ? (
        <section
          id="rsvp"
          className="m-grain m-vignette relative scroll-mt-16 overflow-hidden px-6 py-28 sm:py-36"
          style={{ background: "radial-gradient(90% 70% at 50% 0%, rgba(94,17,41,.75), transparent 65%), linear-gradient(180deg, var(--m-wine) 0%, var(--m-mahog) 100%)" }}
        >
          <Jali className="text-[color:var(--m-gold)] opacity-[0.05]" />
          <LightShafts className="opacity-50" />
          <MarigoldFall className="text-[color:var(--m-gold2)]" />
          <div className="relative z-[2] mx-auto max-w-3xl">
            <div className="text-center" data-mreveal>
              <h2 className="m-display m-engrave text-[clamp(2.4rem,7vw,4.6rem)] uppercase leading-tight tracking-[0.12em] text-[color:var(--m-ivory)]">
                <TT en="Will you" hi="क्या आप" />
                <br />
                <span className="m-goldtext">
                  <TT en="join our court?" hi="हमारे उत्सव में पधारेंगे?" />
                </span>
              </h2>
              <p className="m-serif mt-5 text-lg italic text-[color:var(--m-ivory)]/70">
                <TT
                  en="Your presence would make our celebration complete."
                  hi="आपकी उपस्थिति हमारे उत्सव को पूर्ण बनाएगी।"
                />
              </p>
              <GoldRule className="mx-auto mt-8 text-[color:var(--m-gold)]" />
            </div>

            <div className="mt-16">
              {rsvp ? (
                <MaharajaGroupRsvp
                  slug={rsvp.slug}
                  events={events}
                  existing={rsvp.existing}
                  initials={seal}
                  onSaved={() => {}}
                />
              ) : selfRsvp ? (
                <MaharajaSelfRsvp
                  slug={selfRsvp.slug}
                  events={selfRsvp.events}
                  initials={seal}
                  existing={selfRsvp.existing}
                  onSaved={() => {}}
                />
              ) : (
                <MaharajaRsvpDemo events={events} />
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="m-grain m-vignette relative overflow-hidden bg-[color:var(--m-mahog)] px-6 py-20 text-center">
        <PalaceSkyline className="absolute inset-x-0 bottom-0 text-[color:var(--m-gold)] opacity-[0.1]" />
        <ArchColonnade className="absolute bottom-0 left-1/2 w-[160%] max-w-none -translate-x-1/2 text-[color:var(--m-gold)] opacity-[0.08]" />
        <div className="relative z-[2]">
          <div className="m-glint inline-block">
            <RoyalInsignia initials={seal} className="mx-auto h-20 text-[color:var(--m-gold)]" />
          </div>
          <p className="m-display m-engrave mt-6 text-2xl uppercase tracking-[0.2em] text-[color:var(--m-ivory)]">{names}</p>
          {hashtag ? (
            <p className="m-script mt-3 text-3xl text-[color:var(--m-gold2)]">#{hashtag.replace(/^#/, "")}</p>
          ) : null}
          {dateLabel ? (
            <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-[color:var(--m-ivory)]/50">{dateLabel}</p>
          ) : null}
          <p className="mt-10 text-[9px] uppercase tracking-[0.3em] text-[color:var(--m-ivory)]/35">
            <TT en="Crafted with celebration · Jashn" hi="प्रेम से बनाया गया · जश्न" />
          </p>
          <JashnCredit className="mt-3 text-[color:var(--m-gold2)]/45" />
        </div>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   A CHAPTER — one celebration, staged as a lit room the camera moves through.

   Three depths again: the room itself (its lighting drifts down as you pass
   through), the Roman numeral carved into the far wall, and the copy in front.
   Because these sections are not pinned, the scrub runs across the section's
   whole travel through the viewport — the room is still settling as its title
   arrives, which is what keeps a long itinerary from feeling like a list.
   ══════════════════════════════════════════════════════════════════════════ */
function RoyalChapter({
  event: e,
  index: i,
  last,
  cal,
  hasRsvp,
}: {
  event: WeddingEvent;
  index: number;
  last: boolean;
  cal: string | null;
  hasRsvp: boolean;
}) {
  const flip = i % 2 === 1;

  const ref = useScrollScene<HTMLElement>(({ tier, scope }) => {
    if (tier === "still") return;
    const q = gsap.utils.selector(scope);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    // The room drifts and swells very slightly — a slow push-in on a locked-off
    // camera. Anything faster than this and it reads as a parallax gimmick.
    tl.fromTo(
      q("[data-room]"),
      { yPercent: -6, scale: 1.1 },
      { yPercent: 6, scale: 1.16 },
      0,
    )
      // The numeral is on the far wall, so it travels least and lags the room.
      .fromTo(q("[data-numeral]"), { yPercent: -18 }, { yPercent: 22 }, 0)
      .fromTo(q("[data-screen]"), { yPercent: -10 }, { yPercent: 12 }, 0);
  });

  return (
    <article
      ref={ref}
      className="m-grain m-vignette relative flex min-h-[85vh] items-center overflow-hidden"
      style={{ background: "var(--m-mahog)" }}
    >
      <div data-room className="absolute inset-0" style={{ background: CHAPTER_ART[i % CHAPTER_ART.length] }} />
      <div data-screen className="absolute inset-0">
        <Jali className="text-[color:var(--m-gold)] opacity-[0.05]" />
      </div>
      <span
        aria-hidden="true"
        data-numeral
        className="m-display pointer-events-none absolute top-8 select-none text-[clamp(6rem,20vw,15rem)] leading-none text-[color:var(--m-ivory)]/[0.07]"
        style={flip ? { left: "4%" } : { right: "4%" }}
      >
        {ROMAN[i] ?? i + 1}
      </span>

      <div className={`relative z-[2] mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 ${flip ? "text-right" : ""}`}>
        <p className="m-caps text-[10px] uppercase tracking-[0.5em] text-[color:var(--m-gold2)]" data-mreveal>
          {last ? <TT en="The Final Chapter" hi="अंतिम अध्याय" /> : (
            <>
              <TT en="Chapter" hi="अध्याय" /> {ROMAN[i] ?? i + 1}
            </>
          )}
        </p>
        <h3 className="m-display m-engrave mt-4 text-[clamp(3rem,9vw,7rem)] uppercase leading-none text-[color:var(--m-ivory)]" data-mreveal>
          <T value={{ en: e.name, hi: e.nameHi ?? undefined }} />
        </h3>
        <div className="m-caps mt-8 space-y-1.5 text-[11px] uppercase tracking-[0.32em] text-[color:var(--m-gold2)]" data-mreveal>
          {e.eventDate ? <p>{longDate(e.eventDate)}</p> : null}
          {e.venueName ? <p className="text-[color:var(--m-ivory)]/80">{e.venueName}</p> : null}
          {royalTime(e.startTime) ? <p>{royalTime(e.startTime)}</p> : null}
        </div>
        {e.description ? (
          <p className={`m-serif mt-6 max-w-md text-lg italic text-[color:var(--m-ivory)]/75 ${flip ? "ml-auto" : ""}`} data-mreveal>
            <T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} />
          </p>
        ) : null}
        {e.hostedByEnabled && e.hostedBy ? (
          <p className={`m-caps mt-3 text-[10px] uppercase tracking-[0.32em] text-[color:var(--m-gold2)]/80 ${flip ? "text-right" : ""}`} data-mreveal>
            <TT en="Hosted by" hi="मेज़बान" /> {e.hostedBy}
          </p>
        ) : null}
        <div className={`mt-10 flex flex-wrap gap-3 ${flip ? "justify-end" : ""}`} data-mreveal>
          {e.mapsUrl ? (
            <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className={`${btnGhost} gap-2`}>
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
                <path d="M6 .5C3.24.5 1 2.74 1 5.5c0 3.5 5 8 5 8s5-4.5 5-8C11 2.74 8.76.5 6 .5Z" stroke="currentColor" strokeWidth="1.1" />
                <circle cx="6" cy="5.5" r="1.6" stroke="currentColor" strokeWidth="1.1" />
              </svg>
              <TT en="View the venue" hi="स्थान देखें" />
            </a>
          ) : null}
          {cal ? (
            <a href={cal} target="_blank" rel="noopener noreferrer" className={btnGhost}>
              <TT en="Add to calendar" hi="कैलेंडर में जोड़ें" />
            </a>
          ) : null}
          {hasRsvp ? (
            <a
              href="#rsvp"
              className="m-foil-surface m-glint m-caps inline-flex items-center justify-center border border-[color:var(--m-gold-deep)]/60 px-6 py-3 text-[10px] uppercase tracking-[0.26em] text-[color:var(--m-wine)] transition-transform duration-500 hover:-translate-y-0.5"
            >
              <TT en="Confirm attendance" hi="उपस्थिति की पुष्टि करें" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   THE HERO — a stage with a camera, not a picture with a caption.

   Four planes sit at genuinely different depths inside one `perspective`: the
   palace on the horizon, the screen and its light, the procession in the near
   ground, and the couple's names in front of all of it. Two things then move
   that space — the pointer yaws the whole stack a few degrees, and scrolling
   dollies the planes past each other at rates set by their distance.

   Splitting each plane into an outer div (CSS depth: translateZ + the exact
   counter-scale that keeps it the right size) and an inner div (GSAP's parallax)
   is not incidental. GSAP writes a whole transform matrix, so animating the
   outer div directly would silently erase its translateZ and collapse the stage
   flat on first scroll.
   ══════════════════════════════════════════════════════════════════════════ */
function RoyalHero({
  names,
  pair,
  stamp,
  venue,
}: {
  names: string;
  pair: [string, string] | null;
  stamp: string;
  venue: string | null;
}) {
  const camera = usePointerCamera<HTMLDivElement>(3.2);

  const ref = useScrollScene<HTMLElement>(({ tier, scope }) => {
    if (tier === "still") return;
    const q = gsap.utils.selector(scope);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: "top top",
        end: "bottom top",
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    // Distance sets rate: the horizon barely moves, the near ground races. The
    // names lift and dim on the way out so the section hands over rather than
    // just scrolling away.
    tl.to(q("[data-plane='far']"), { yPercent: 5 }, 0)
      .to(q("[data-plane='mid']"), { yPercent: 13 }, 0)
      .to(q("[data-plane='near']"), { yPercent: 27 }, 0)
      .to(q("[data-plane='copy']"), { yPercent: -14, autoAlpha: 0.1 }, 0);
  });

  return (
    <section
      ref={ref}
      id="top"
      className="m-scene m-grain m-vignette relative flex min-h-svh flex-col overflow-hidden"
      style={{ background: "var(--m-mahog)" }}
    >
      <div ref={camera} className="m-layers pointer-events-none absolute inset-0">
        {/* the horizon */}
        <div className="m-far absolute inset-0">
          <div data-plane="far" className="absolute inset-0">
            <div className="m-kenburns absolute inset-0" style={{ background: HERO_ART }} />
            <PalaceSkyline className="absolute inset-x-0 bottom-[22%] text-[color:var(--m-gold)] opacity-[0.17]" />
          </div>
        </div>

        {/* the screened hall and its light */}
        <div className="m-mid absolute inset-0">
          <div data-plane="mid" className="absolute inset-0">
            <Jali className="text-[color:var(--m-gold)] opacity-[0.06]" />
            <LightShafts />
            <ArchColonnade className="absolute bottom-0 left-1/2 w-[130%] max-w-none -translate-x-1/2 text-[color:var(--m-gold)] opacity-[0.09]" />
          </div>
        </div>

        {/* the near ground */}
        <div className="m-near absolute inset-0">
          <div data-plane="near" className="absolute inset-0">
            <ElephantProcession className="bottom-[5.25rem] text-[color:var(--m-gold)] opacity-[0.14]" />
            <MarigoldFall className="text-[color:var(--m-gold2)]" />
          </div>
        </div>
      </div>

      <div
        data-plane="copy"
        className="relative z-[2] mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-28 pt-32 sm:px-10"
      >
        {pair ? (
          <>
            <p className="m-display m-engrave max-w-full self-start break-words text-[clamp(3.2rem,11vw,9rem)] uppercase leading-[0.95] text-[color:var(--m-ivory)]" data-mreveal>
              {pair[0]}
            </p>
            <div className="my-2 self-center lg:my-0" data-mreveal>
              <AmpersandSeal className="h-16 w-16 text-[color:var(--m-gold2)] sm:h-20 sm:w-20" />
            </div>
            <p className="m-display m-engrave max-w-full self-end break-words text-right text-[clamp(3.2rem,11vw,9rem)] uppercase leading-[0.95] text-[color:var(--m-ivory)]" data-mreveal>
              {pair[1]}
            </p>
          </>
        ) : (
          <p className="m-display m-engrave max-w-full break-words text-center text-[clamp(2.6rem,9vw,7rem)] uppercase leading-tight text-[color:var(--m-ivory)]" data-mreveal>
            {names}
          </p>
        )}
      </div>

      <div className="relative z-[2] border-[color:var(--m-gold)]/25 sm:border-t">
        <div className="m-caps mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-[10px] uppercase tracking-[0.34em] text-[color:var(--m-gold2)] sm:flex-row sm:px-10">
          <span>{stamp}</span>
          <span className="text-[color:var(--m-ivory)]/60">
            <TT en="The royal celebration awaits" hi="शाही उत्सव आपकी प्रतीक्षा में है" />
          </span>
          {venue ? <span>{venue}</span> : <span />}
        </div>
      </div>
    </section>
  );
}

/* ── Countdown — four slabs set into the palace wall ─────────────────────── */
function RoyalCountdown({ dateIso }: { dateIso: string }) {
  const { ready, days, hours, minutes, seconds } = useCountdown(dateIso);
  const units: Array<[string, string, string]> = [
    [ready ? String(days) : "—", "Days", "दिन"],
    [pad2(hours, ready), "Hours", "घंटे"],
    [pad2(minutes, ready), "Minutes", "मिनट"],
    [pad2(seconds, ready), "Seconds", "सेकंड"],
  ];
  return (
    <section
      className="m-grain m-vignette relative overflow-hidden px-6 py-24 text-center sm:py-32"
      style={{ background: "linear-gradient(180deg, var(--m-mahog) 0%, var(--m-wine) 100%)" }}
    >
      <LightShafts className="opacity-60" />
      <ArchColonnade className="absolute bottom-0 left-1/2 w-[150%] max-w-none -translate-x-1/2 text-[color:var(--m-gold)] opacity-[0.1]" />
      <MarigoldFall className="text-[color:var(--m-gold2)]" />
      <div className="relative z-[2]" data-mreveal>
        <p className="m-display m-engrave mx-auto max-w-md text-[clamp(1.5rem,4vw,2.2rem)] uppercase leading-snug tracking-[0.2em] text-[color:var(--m-ivory)]">
          <TT en="Until the palace comes alive" hi="जब महल जीवंत हो उठेगा" />
        </p>
        {/* The row is pitched back a few degrees inside its own perspective, so
            the four slabs read as set into a wall the viewer is looking up at
            rather than as four boxes lying on the page. */}
        <div className="m-plaque-row mx-auto mt-12 flex max-w-2xl items-stretch justify-center gap-2 sm:gap-3">
          {units.map(([v, en, hi]) => (
            <div
              key={en}
              className="m-plaque flex flex-1 flex-col items-center border border-[color:var(--m-gold)]/25 px-1 py-5 sm:px-4"
            >
              {/* Only the seconds column ticks — a full-cast shimmer on all
                  four would read as glitching, one living pulse reads as a
                  clock. */}
              <span
                className={`m-goldtext m-display text-[clamp(2.2rem,9vw,4.8rem)] leading-none tabular-nums ${en === "Seconds" ? "m-tick" : ""}`}
              >
                {v}
              </span>
              <span className="m-caps mt-3 text-[8px] uppercase tracking-[0.28em] text-[color:var(--m-gold2)]/85 sm:text-[10px]">
                <TT en={en} hi={hi} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
