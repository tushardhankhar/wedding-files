"use client";

import { useEffect, useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { T, TT } from "../bilingual";
import { focusStyles } from "../image-focus";
import {
  RoyalInsignia,
  GoldRule,
  ArchColonnade,
  Jali,
  AmpersandSeal,
  CornerFiligree,
} from "./ornaments";
import {
  MaharajaGroupRsvp,
  MaharajaSelfRsvp,
  MaharajaRsvpDemo,
  CourtConfirmation,
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

/** Cinematic backdrop per chapter — antique, never neon. */
const CHAPTER_ART = [
  // marigold morning
  "radial-gradient(80% 60% at 30% 20%, rgba(209,170,98,.5), transparent 60%), linear-gradient(160deg, #7a4a12 0%, #8b1835 70%, #3a0717 110%)",
  // deep evening
  "radial-gradient(80% 60% at 70% 15%, rgba(139,24,53,.6), transparent 60%), linear-gradient(170deg, #2c0f2e 0%, #3a0717 60%, #1d090d 100%)",
  // the most dramatic — imperial red into black
  "radial-gradient(90% 70% at 50% 0%, rgba(139,24,53,.85), transparent 65%), linear-gradient(180deg, #620f25 0%, #1d090d 90%)",
  // burnished gold finale
  "radial-gradient(80% 60% at 50% 10%, rgba(185,138,61,.45), transparent 60%), linear-gradient(170deg, #3a0717 0%, #620f25 55%, #7a4a12 130%)",
];

const HERO_ART =
  "radial-gradient(100% 75% at 65% 20%, rgba(139,24,53,.55), transparent 60%), radial-gradient(70% 55% at 20% 90%, rgba(185,138,61,.35), transparent 55%), linear-gradient(168deg, #3a0717 0%, #4c0a1e 50%, #1d090d 100%)";

const btnGhost =
  "inline-flex items-center justify-center border border-[color:var(--m-gold)]/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:var(--m-gold2)] transition-colors hover:border-[color:var(--m-gold2)] hover:text-[color:var(--m-ivory)]";

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
}: WebsiteViewProps) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [entered, setEntered] = useState(false);
  const [doorsGone, setDoorsGone] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [responded, setResponded] = useState(false);

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
    setTimeout(() => setDoorsGone(true), 1700);
  }

  const pair = splitNames(names);
  const seal = initials.replace(/\s*&\s*/, " · ");
  const milestones = config.story?.milestones ?? [];
  const images = config.gallery?.images ?? [];
  const faqs = config.faq?.items ?? [];
  const contacts = config.footer?.contacts ?? [];
  const hashtag = config.footer?.hashtag;
  const venues = events.filter((e) => e.venueName);
  const hasRsvp = Boolean(rsvp || selfRsvp || ownerPreview);
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
  if (events.length) links.push(["#celebrations", "Celebrations", "आयोजन"]);
  if (venues.length) links.push(["#palace", "Palace", "महल"]);
  if (images.length) links.push(["#gallery", "Gallery", "गैलरी"]);
  if (faqs.length || contacts.length) links.push(["#details", "Details", "विवरण"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);
  const mid = Math.ceil(links.length / 2);

  return (
    <div className="mhj" data-lang={lang}>
      {/* ── CEREMONIAL ENTRANCE ─────────────────────────────────────────── */}
      {!doorsGone ? (
        <div
          className="fixed inset-0 z-[80]"
          onWheel={enter}
          onTouchMove={enter}
          role="dialog"
          aria-label="Invitation"
        >
          {/* palace doors */}
          <div
            data-side="l"
            data-open={entered}
            className="m-door m-grain absolute inset-y-0 left-0 w-1/2 border-r border-[color:var(--m-gold)]/40"
            style={{ background: "linear-gradient(105deg, #2c0511 0%, var(--m-wine) 100%)" }}
          >
            <Jali className="text-[color:var(--m-gold)] opacity-[0.07]" />
          </div>
          <div
            data-side="r"
            data-open={entered}
            className="m-door m-grain absolute inset-y-0 right-0 w-1/2 border-l border-[color:var(--m-gold)]/40"
            style={{ background: "linear-gradient(255deg, #2c0511 0%, var(--m-wine) 100%)" }}
          >
            <Jali className="text-[color:var(--m-gold)] opacity-[0.07]" />
          </div>

          {/* the invitation */}
          <div
            data-open={entered}
            className="m-door-content absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <RoyalInsignia initials={seal} className="h-32 text-[color:var(--m-gold2)] sm:h-40" />
            {pair ? (
              <p className="m-serif mt-8 max-w-full break-words text-[clamp(1.9rem,5.4vw,3.4rem)] uppercase leading-tight tracking-[0.12em] text-[color:var(--m-ivory)] sm:tracking-[0.22em]">
                {pair[0]}{" "}
                <span className="m-goldtext mx-3 normal-case italic tracking-normal">&amp;</span>{" "}
                {pair[1]}
              </p>
            ) : (
              <p className="m-serif mt-8 max-w-full break-words text-[clamp(1.9rem,5.4vw,3.4rem)] uppercase tracking-[0.12em] text-[color:var(--m-ivory)] sm:tracking-[0.22em]">
                {names}
              </p>
            )}
            {sealDate(countdownDate) ? (
              <p className="mt-4 text-sm tracking-[0.5em] text-[color:var(--m-gold2)]">
                {sealDate(countdownDate)}
              </p>
            ) : null}
            <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-[color:var(--m-ivory)]/60">
              <TT en="With the blessings of our families" hi="परिवारों के आशीर्वाद सहित" />
            </p>
            <button
              type="button"
              onClick={enter}
              className="group mt-14 flex flex-col items-center gap-3 text-[color:var(--m-gold2)]"
            >
              <span className="border border-[color:var(--m-gold)]/60 px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.34em] transition-colors group-hover:border-[color:var(--m-gold2)] group-hover:text-[color:var(--m-ivory)]">
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
              <a key={href} href={href} className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:var(--m-ivory)]/75 transition-colors hover:text-[color:var(--m-gold2)]">
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
                <a key={href} href={href} className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:var(--m-ivory)]/75 transition-colors hover:text-[color:var(--m-gold2)]">
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
                  className={`px-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
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
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:var(--m-gold2)] lg:hidden"
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
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:var(--m-gold2)]"
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
                className="m-serif text-2xl uppercase tracking-[0.24em] text-[color:var(--m-ivory)] duration-500 animate-in fade-in slide-in-from-bottom-3"
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
                  className={`border px-4 py-2 text-[11px] font-semibold uppercase tracking-widest ${
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

      {/* ── HERO — asymmetric editorial portrait ─────────────────────────── */}
      <section id="top" className="m-grain relative flex min-h-svh flex-col overflow-hidden" style={{ background: "var(--m-mahog)" }}>
        <div className="m-kenburns absolute inset-0" style={{ background: HERO_ART }} />
        <Jali className="text-[color:var(--m-gold)] opacity-[0.05]" />
        <ArchColonnade className="absolute bottom-0 left-1/2 w-[140%] max-w-none -translate-x-1/2 text-[color:var(--m-gold)] opacity-[0.13]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-28 pt-32 sm:px-10">
          {pair ? (
            <>
              <p className="m-serif max-w-full self-start break-words text-[clamp(3.2rem,11vw,9rem)] uppercase leading-[0.95] tracking-[0.06em] text-[color:var(--m-ivory)]" data-mreveal>
                {pair[0]}
              </p>
              <div className="my-2 self-center lg:my-0" data-mreveal>
                <AmpersandSeal className="h-16 w-16 text-[color:var(--m-gold2)] sm:h-20 sm:w-20" />
              </div>
              <p className="m-serif max-w-full self-end break-words text-right text-[clamp(3.2rem,11vw,9rem)] uppercase leading-[0.95] tracking-[0.06em] text-[color:var(--m-ivory)]" data-mreveal>
                {pair[1]}
              </p>
            </>
          ) : (
            <p className="m-serif max-w-full break-words text-center text-[clamp(2.6rem,9vw,7rem)] uppercase leading-tight tracking-[0.08em] text-[color:var(--m-ivory)]" data-mreveal>
              {names}
            </p>
          )}
        </div>

        <div className="relative border-t border-[color:var(--m-gold)]/25">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-[10px] uppercase tracking-[0.34em] text-[color:var(--m-gold2)] sm:flex-row sm:px-10">
            <span>{sealDate(countdownDate) ?? dateLabel ?? ""}</span>
            <span className="text-[color:var(--m-ivory)]/60">
              <TT en="The royal celebration awaits" hi="शाही उत्सव आपकी प्रतीक्षा में है" />
            </span>
            {venues[0]?.venueName ? <span>{venues[0].venueName}</span> : <span />}
          </div>
        </div>
      </section>

      {/* ── PERSONAL GUEST WELCOME — the invitation ──────────────────────── */}
      {family ? (
        <section className="relative bg-[color:var(--m-ivory)] px-6 py-24 sm:py-32">
          <CornerFiligree className="absolute left-5 top-5 text-[color:var(--m-gold)]/50" />
          <CornerFiligree className="absolute right-5 top-5 -scale-x-100 text-[color:var(--m-gold)]/50" />
          <CornerFiligree className="absolute bottom-5 left-5 -scale-y-100 text-[color:var(--m-gold)]/50" />
          <CornerFiligree className="absolute bottom-5 right-5 -scale-100 text-[color:var(--m-gold)]/50" />
          <div className="mx-auto max-w-3xl text-center" data-mreveal>
            <RoyalInsignia initials={seal} className="mx-auto h-20 text-[color:var(--m-gold)]" />
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
              <TT en="Namaste" hi="नमस्ते" />
            </p>
            <h2 className="m-serif mt-3 text-[clamp(2.4rem,7vw,4.8rem)] uppercase leading-tight tracking-[0.1em] text-[color:var(--m-wine)]">
              <T value={family} />
            </h2>
            <GoldRule className="mx-auto mt-6 text-[color:var(--m-gold)]" />
            <p className="m-serif mx-auto mt-8 max-w-xl text-xl italic leading-relaxed text-[color:var(--m-ink)]/85">
              <TT
                en="With immense joy and the blessings of our families, we invite you to join us as we begin our forever."
                hi="अपार हर्ष और परिवारों के आशीर्वाद सहित, हम आपको अपने साथ इस नई शुरुआत में सम्मिलित होने के लिए आमंत्रित करते हैं।"
              />
            </p>
            {rsvp && rsvp.guests.length > 0 ? (
              <div className="mt-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--m-ink-soft)]">
                  <TT en="This invitation honours" hi="यह निमंत्रण जिनके नाम" />
                </p>
                <p className="m-serif mt-3 text-lg uppercase tracking-[0.3em] text-[color:var(--m-maroon)]">
                  {rsvp.guests.map((g) => g.name).join("  ·  ")}
                </p>
              </div>
            ) : null}
            <p className="mt-12 text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--m-gold)]">
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
                <TT en="The Chronicle" hi="गाथा" />
              </p>
              <h2 className="m-serif mt-3 text-[clamp(2.2rem,6vw,4rem)] uppercase leading-tight tracking-[0.12em] text-[color:var(--m-wine)]">
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
                  <p className="relative text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--m-gold)]">{m.when}</p>
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

      {/* ── COUNTDOWN ────────────────────────────────────────────────────── */}
      {countdownDate ? <RoyalCountdown dateIso={countdownDate} /> : null}

      {/* ── THE ROYAL ITINERARY — chapters ───────────────────────────────── */}
      {events.length > 0 ? (
        <section id="celebrations" className="scroll-mt-16">
          <div className="bg-[color:var(--m-ivory)] px-6 py-20 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[color:var(--m-gold)]" data-mreveal>
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

          {events.map((e, i) => {
            const last = i === events.length - 1 && events.length > 1;
            const cal = gcalUrl(e, names);
            return (
              <article
                key={e.id}
                className="m-grain relative flex min-h-[85vh] items-center overflow-hidden"
                style={{ background: CHAPTER_ART[i % CHAPTER_ART.length] }}
              >
                <Jali className="text-[color:var(--m-gold)] opacity-[0.05]" />
                <span aria-hidden="true" className="m-serif pointer-events-none absolute top-8 select-none text-[clamp(6rem,20vw,15rem)] font-semibold leading-none text-[color:var(--m-ivory)]/[0.06]"
                  style={i % 2 ? { left: "4%" } : { right: "4%" }}>
                  {ROMAN[i] ?? i + 1}
                </span>

                <div className={`relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 ${i % 2 ? "text-right" : ""}`}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[color:var(--m-gold2)]" data-mreveal>
                    {last ? <TT en="The Final Chapter" hi="अंतिम अध्याय" /> : (
                      <>
                        <TT en="Chapter" hi="अध्याय" /> {ROMAN[i] ?? i + 1}
                      </>
                    )}
                  </p>
                  <h3 className="m-serif mt-4 text-[clamp(3rem,9vw,7rem)] uppercase leading-none tracking-[0.06em] text-[color:var(--m-ivory)]" data-mreveal>
                    <T value={{ en: e.name, hi: e.nameHi ?? undefined }} />
                  </h3>
                  <div className={`mt-8 space-y-1.5 text-[11px] uppercase tracking-[0.32em] text-[color:var(--m-gold2)] ${i % 2 ? "" : ""}`} data-mreveal>
                    {e.eventDate ? <p>{longDate(e.eventDate)}</p> : null}
                    {e.venueName ? <p className="text-[color:var(--m-ivory)]/80">{e.venueName}</p> : null}
                    {royalTime(e.startTime) ? <p>{royalTime(e.startTime)}</p> : null}
                  </div>
                  {e.description ? (
                    <p className={`m-serif mt-6 max-w-md text-lg italic text-[color:var(--m-ivory)]/75 ${i % 2 ? "ml-auto" : ""}`} data-mreveal>
                      <T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} />
                    </p>
                  ) : null}
                  <div className={`mt-10 flex flex-wrap gap-3 ${i % 2 ? "justify-end" : ""}`} data-mreveal>
                    {e.mapsUrl ? (
                      <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                        <TT en="View the palace" hi="स्थान देखें" />
                      </a>
                    ) : null}
                    {cal ? (
                      <a href={cal} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                        <TT en="Add to calendar" hi="कैलेंडर में जोड़ें" />
                      </a>
                    ) : null}
                    {hasRsvp ? (
                      <a href="#rsvp" className="inline-flex items-center justify-center border border-[color:var(--m-gold)] bg-[color:var(--m-gold)] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:var(--m-wine)] transition-opacity hover:opacity-90">
                        <TT en="Confirm attendance" hi="उपस्थिति की पुष्टि करें" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {/* ── THE PALACE — venue ───────────────────────────────────────────── */}
      {venues.length > 0 ? (
        <section id="palace" className="scroll-mt-16 bg-[color:var(--m-ivory)] px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center" data-mreveal>
              <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
                <TT en="The setting" hi="स्थल" />
              </p>
              <h2 className="m-serif mt-3 text-[clamp(2.2rem,6vw,4rem)] uppercase tracking-[0.12em] text-[color:var(--m-wine)]">
                <TT en="The Palace" hi="महल" />
              </h2>
              <GoldRule className="mx-auto mt-6 text-[color:var(--m-gold)]" />
            </div>

            <div className="mt-16 space-y-16">
              {venues.map((v, i) => (
                <div key={v.id} className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`} data-mreveal>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--m-gold)]">{v.name}</p>
                    <h3 className="m-serif mt-2 text-[clamp(1.8rem,4.5vw,3rem)] uppercase leading-tight tracking-[0.08em] text-[color:var(--m-wine)]">
                      {v.venueName}
                    </h3>
                    {v.venueAddress ? (
                      <div className="mt-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--m-ink-soft)]">
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
                        className="mt-8 inline-flex items-center justify-center border border-[color:var(--m-wine)] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--m-wine)] transition-colors hover:bg-[color:var(--m-wine)] hover:text-[color:var(--m-gold2)]"
                      >
                        <TT en="Open in maps" hi="मैप खोलें" />
                      </a>
                    ) : null}
                  </div>
                  {/* arch-framed architectural panel */}
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

      {/* ── PORTRAITS OF US — museum gallery ─────────────────────────────── */}
      {images.length > 0 ? (
        <section id="gallery" className="scroll-mt-16 bg-[#fbf4e4] px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center" data-mreveal>
              <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
                <TT en="The collection" hi="संग्रह" />
              </p>
              <h2 className="m-serif mt-3 text-[clamp(2.2rem,6vw,4rem)] uppercase tracking-[0.12em] text-[color:var(--m-wine)]">
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
                  <figure key={i} className={`group ${span}`} data-mreveal>
                    <div className="relative h-full w-full overflow-hidden border border-[color:var(--m-gold)]/30 bg-[color:var(--m-ivory2)]">
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
                        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 text-[11px] uppercase tracking-[0.2em] text-[color:var(--m-ivory)] opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                          <T value={img.caption} />
                        </figcaption>
                      ) : null}
                    </div>
                    <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.34em] text-[color:var(--m-ink-soft)]">
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[color:var(--m-gold)]">
                <TT en="For our guests" hi="अतिथियों हेतु" />
              </p>
              <h2 className="m-serif mt-3 text-[clamp(2rem,5vw,3.2rem)] uppercase tracking-[0.12em] text-[color:var(--m-wine)]">
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--m-ink-soft)]">
                  <TT en="The court may be reached at" hi="संपर्क करें" />
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-x-10 gap-y-2">
                  {contacts.map((c, i) => (
                    <p key={i} className="m-serif text-lg text-[color:var(--m-wine)]">
                      {c.name} <span className="text-[color:var(--m-ink-soft)]">· {c.phone}</span>
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
          className="m-grain relative scroll-mt-16 overflow-hidden px-6 py-28 sm:py-36"
          style={{ background: "radial-gradient(90% 70% at 50% 0%, rgba(98,15,37,.7), transparent 65%), linear-gradient(180deg, var(--m-wine) 0%, var(--m-mahog) 100%)" }}
        >
          <Jali className="text-[color:var(--m-gold)] opacity-[0.05]" />
          <div className="relative mx-auto max-w-3xl">
            <div className="text-center" data-mreveal>
              <h2 className="m-serif text-[clamp(2.4rem,7vw,4.6rem)] uppercase leading-tight tracking-[0.12em] text-[color:var(--m-ivory)]">
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
                  guests={rsvp.guests}
                  initial={rsvp.statuses}
                  onSaved={() => setResponded(true)}
                />
              ) : selfRsvp ? (
                <MaharajaSelfRsvp
                  slug={selfRsvp.slug}
                  events={selfRsvp.events}
                  initials={seal}
                  onSaved={() => setResponded(true)}
                />
              ) : (
                <MaharajaRsvpDemo events={events} />
              )}
            </div>

            {rsvp && responded ? (
              <CourtConfirmation familyName={family ? (lang === "hi" && family.hi ? family.hi : family.en) : undefined} initials={seal} />
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="m-grain relative overflow-hidden bg-[color:var(--m-mahog)] px-6 py-20 text-center">
        <ArchColonnade className="absolute bottom-0 left-1/2 w-[160%] max-w-none -translate-x-1/2 text-[color:var(--m-gold)] opacity-[0.08]" />
        <div className="relative">
          <RoyalInsignia initials={seal} className="mx-auto h-20 text-[color:var(--m-gold)]" />
          <p className="m-serif mt-6 text-2xl uppercase tracking-[0.2em] text-[color:var(--m-ivory)]">{names}</p>
          {hashtag ? (
            <p className="m-script mt-3 text-3xl text-[color:var(--m-gold2)]">#{hashtag.replace(/^#/, "")}</p>
          ) : null}
          {dateLabel ? (
            <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-[color:var(--m-ivory)]/50">{dateLabel}</p>
          ) : null}
          <p className="mt-10 text-[9px] uppercase tracking-[0.3em] text-[color:var(--m-ivory)]/35">
            <TT en="Crafted with celebration · Jashn" hi="प्रेम से बनाया गया · जश्न" />
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Countdown — a ceremonial segmented countdown ───────────────────────── */
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
      className="m-grain relative overflow-hidden px-6 py-24 text-center sm:py-32"
      style={{ background: "linear-gradient(180deg, var(--m-mahog) 0%, var(--m-wine) 100%)" }}
    >
      <ArchColonnade className="absolute bottom-0 left-1/2 w-[150%] max-w-none -translate-x-1/2 text-[color:var(--m-gold)] opacity-[0.1]" />
      <div className="relative" data-mreveal>
        <p className="m-serif mx-auto max-w-md text-2xl uppercase leading-snug tracking-[0.2em] text-[color:var(--m-ivory)]">
          <TT en="Until the palace comes alive" hi="जब महल जीवंत हो उठेगा" />
        </p>
        <div className="mx-auto mt-10 flex max-w-2xl items-stretch justify-center">
          {units.map(([v, en, hi]) => (
            <div key={en} className="flex flex-1 flex-col items-center border-[color:var(--m-gold)]/30 px-2 sm:px-4 [&:not(:last-child)]:border-r">
              <span className="m-goldtext m-serif text-[clamp(2.6rem,10vw,5.5rem)] font-semibold leading-none tabular-nums">{v}</span>
              <span className="mt-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-[color:var(--m-gold2)]/85 sm:text-[10px]">
                <TT en={en} hi={hi} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
