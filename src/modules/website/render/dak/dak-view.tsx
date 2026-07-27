"use client";

import { useEffect, useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { T, TT } from "../bilingual";
import { focusStyles } from "../image-focus";
import { useCountdown, pad2 } from "../use-countdown";
import {
  Cachet,
  CancelWaves,
  CeremonyVignette,
  CoupleStamp,
  DakMark,
  FlightRoute,
  MapPlate,
  Postmark,
  PostalRule,
  StrikeRings,
  WaxSeal,
  WingedLetter,
} from "./ornaments";
import { DakGroupRsvp, DakSelfRsvp, DakRsvpDemo } from "./dak-rsvp";

/* ── helpers ──────────────────────────────────────────────────────────────── */
function splitNames(names: string): [string, string] | null {
  const parts = names.split(" & ");
  return parts.length === 2 ? [parts[0], parts[1]] : null;
}

function initialsOf(names: string): string {
  const pair = splitNames(names);
  if (pair) return `${pair[0][0] ?? ""} · ${pair[1][0] ?? ""}`.toUpperCase();
  return names.slice(0, 2).toUpperCase();
}

/** The town struck into every postmark on the page — the wedding's own city. */
function cityOf(events: WeddingEvent[]): string | null {
  for (const e of events) {
    if (e.venueAddress) {
      const parts = e.venueAddress.split(",");
      return parts[parts.length - 1].trim();
    }
    if (e.venueName) return e.venueName;
  }
  return null;
}

function longDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** A postmark's two struck lines: "12 DEC" over "2026". */
function strikeDate(iso: string | null): { line1: string; line2?: string } {
  if (!iso) return { line1: "•" };
  const d = new Date(`${iso}T00:00:00`);
  return {
    line1: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase(),
    line2: String(d.getFullYear()),
  };
}

/** ddmmyy, split into the six boxes of a postal code panel. */
function pinDigits(iso: string | null): string[] {
  if (!iso) return ["", "", "", "", "", ""];
  const [y, m, d] = iso.split("-");
  return `${d}${m}${y.slice(2)}`.split("").slice(0, 6);
}

function timeLabel(t: string | null): string | null {
  if (!t) return null;
  const h = Number(t.slice(0, 2));
  const m = t.slice(3, 5);
  const ap = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m} ${ap}`;
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

/* ══════════════════════════════════════════════════════════════════════════
   THE DAK — the invitation arrives as airmail.

   The hero is not a page with a card on it; it is the card. Card stock at a
   slight angle on a navy desk, the message written on the left, the address
   side on the right with a perforated stamp and a postmark struck half over
   it. Everything below continues the conceit rather than decorating it: the
   celebrations are a set of commemorative stamps, the story is a route of
   postmarks, the countdown is a flight in transit, and the RSVP is the reply
   card that tears off along the perforation.
   ══════════════════════════════════════════════════════════════════════════ */
export function DakView({
  theme,
  names,
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
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pair = splitNames(names);
  const initials = initialsOf(names);
  const city = cityOf(events);
  const town = (city ?? "JASHN").toUpperCase().slice(0, 14);
  // Every postmark on the page is struck with the same date: the wedding day.
  const primaryIso = countdownDate ?? events.find((e) => e.eventDate)?.eventDate ?? null;
  const strike = strikeDate(primaryIso);
  const pins = pinDigits(primaryIso);
  const year = primaryIso ? primaryIso.slice(0, 4) : "";

  const milestones = config.story?.milestones ?? [];
  const familyMembers = config.family?.members ?? [];
  const groomFamily = familyMembers.filter((m) => m.side !== "bride");
  const brideFamily = familyMembers.filter((m) => m.side === "bride");
  const images = config.gallery?.images ?? [];
  const faqs = config.faq?.items ?? [];
  const contacts = config.footer?.contacts ?? [];
  const hashtag = config.footer?.hashtag;
  const quote = config.hero?.tagline;
  const hasRsvp = Boolean((rsvp && rsvp.events.length > 0) || selfRsvp || ownerPreview);
  const addressee =
    rsvp && chip
      ? chip
      : ownerPreview
        ? { en: "Our honoured guests", hi: "सम्मानित अतिथिगण" }
        : null;

  const links: Array<[string, string, string]> = [];
  if (milestones.length) links.push(["#story", "Postmarks", "पड़ाव"]);
  if (familyMembers.length) links.push(["#family", "Families", "परिवार"]);
  if (events.length) links.push(["#celebrations", "Celebrations", "आयोजन"]);
  if (images.length) links.push(["#album", "Album", "अल्बम"]);
  if (faqs.length || contacts.length) links.push(["#details", "Details", "विवरण"]);
  if (hasRsvp) links.push(["#rsvp", "Reply", "उत्तर"]);

  const heroCta = hasRsvp ? "#rsvp" : events.length ? "#celebrations" : "#story";

  return (
    <div className="dak" data-lang={lang} style={theme.vars}>
      {/* ── NAVIGATION ───────────────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-700 ${
          scrolled ? "dak-nav-on" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label={names}>
            <DakMark className="h-9 w-9 text-[color:var(--dak-gold-lite)]" />
            <span className="dak-mono dak-navname text-[0.72rem] tracking-[0.34em]">{initials}</span>
          </a>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {links.map(([href, en, hi]) => (
              <a key={href} href={href} className="dak-navlink dak-mono text-[0.6rem] tracking-[0.28em]">
                <TT en={en.toUpperCase()} hi={hi} />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 lg:flex">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`dak-navlink dak-mono text-[0.6rem] tracking-[0.24em] transition-opacity ${
                    lang === l ? "opacity-100" : "opacity-45 hover:opacity-80"
                  }`}
                >
                  {l === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="dak-navlink dak-mono text-[0.6rem] tracking-[0.28em] lg:hidden"
              aria-expanded={menu}
            >
              MENU
            </button>
          </div>
        </div>
        {/* the airmail chevron, hemming the bar once it lands on paper */}
        <div className={`dak-airmail-strip transition-opacity duration-700 ${scrolled ? "opacity-100" : "opacity-0"}`} />
      </header>

      {menu ? (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-[color:var(--dak-paper)] p-6 duration-500 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between">
            <span className="dak-mono text-[0.7rem] tracking-[0.34em] text-[color:var(--dak-text)]">{initials}</span>
            <button type="button" onClick={() => setMenu(false)} className="dak-mono text-[0.62rem] tracking-[0.28em] text-[color:var(--dak-text)]">
              CLOSE
            </button>
          </div>
          <nav className="mt-14 flex flex-col items-center gap-7" aria-label="Primary mobile">
            {links.map(([href, en, hi], i) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className="dak-display text-2xl text-[color:var(--dak-text)] duration-700 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${90 + i * 70}ms` }}
              >
                <TT en={en} hi={hi} />
              </a>
            ))}
            <div className="mt-3 flex gap-6">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`dak-mono text-[0.62rem] tracking-[0.24em] text-[color:var(--dak-text)] ${
                    lang === l ? "opacity-100" : "opacity-45"
                  }`}
                >
                  {l === "en" ? "ENGLISH" : "हिंदी"}
                </button>
              ))}
            </div>
          </nav>
          <div className="mx-auto mt-auto">
            <Postmark
              town={town}
              line1={strike.line1}
              line2={strike.line2}
              className="h-28 w-28 -rotate-6 text-[color:var(--dak-red)] opacity-80"
            />
          </div>
        </div>
      ) : null}

      {/* ── HERO — the postcard on the desk ──────────────────────────────── */}
      <section id="top" className="dak-desk relative flex min-h-svh flex-col justify-center overflow-hidden px-4 py-24 sm:px-8">
        <MapPlate className="pointer-events-none absolute inset-x-0 top-1/4 z-0 h-auto w-full opacity-[0.16]" />
        <StrikeRings className="dak-turn pointer-events-none absolute -left-40 -top-32 z-0 h-[26rem] w-[26rem] opacity-[0.07]" />
        <StrikeRings className="dak-turn pointer-events-none absolute -bottom-44 -right-36 z-0 h-[30rem] w-[30rem] opacity-[0.06]" />

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          <article className="dak-card dak-arrive">
            <div className="dak-card-edge" aria-hidden="true" />
            <div className="grid gap-0 md:grid-cols-[1.08fr_1fr]">
              {/* MESSAGE SIDE */}
              <div className="min-w-0 px-6 pb-9 pt-8 sm:px-10 sm:pb-11 sm:pt-10">
                <div className="flex items-center gap-3">
                  <div className="dak-airmail-tag" aria-hidden="true" />
                  <span className="dak-mono text-[0.55rem] tracking-[0.32em] text-[color:var(--dak-text-soft)]">
                    <TT en="AIR MAIL · PAR AVION" hi="वायु डाक · PAR AVION" />
                  </span>
                </div>

                <p className="dak-serif mt-8 text-lg italic text-[color:var(--dak-text-soft)]">
                  <TT en="Together with their families," hi="अपने परिवारों सहित," />
                </p>
                <h1 className="dak-names dak-foil mt-3 text-[clamp(2.5rem,9vw,4.4rem)] leading-[1.02]">
                  {pair ? (
                    <>
                      {pair[0]}
                      <span className="dak-amp"> &amp; </span>
                      {pair[1]}
                    </>
                  ) : (
                    names
                  )}
                </h1>
                <p className="dak-serif mt-4 max-w-sm text-lg leading-relaxed text-[color:var(--dak-text)]/85">
                  <TT
                    en="request the honour of your presence as they marry —"
                    hi="अपने विवाह के अवसर पर आपकी उपस्थिति सादर प्रार्थनीय है —"
                  />
                </p>

                <div className="mt-7 max-w-xs">
                  <PostalRule className="w-full" />
                </div>

                {dateLabel ? (
                  <p className="dak-mono mt-6 text-[0.68rem] tracking-[0.3em] text-[color:var(--dak-text)]">{dateLabel}</p>
                ) : null}
                {city ? (
                  <p className="dak-script mt-2 text-3xl text-[color:var(--dak-red)]">{city}</p>
                ) : null}
              </div>

              {/* ADDRESS SIDE */}
              <div className="dak-card-split min-w-0 px-6 pb-9 pt-8 sm:px-9 sm:pb-11 sm:pt-10">
                <div className="flex items-start justify-between gap-4">
                  <span className="dak-mono text-[0.55rem] tracking-[0.3em] text-[color:var(--dak-text-soft)]">
                    <TT en="POST CARD" hi="पत्र कार्ड" />
                  </span>
                  <div className="relative shrink-0">
                    <CoupleStamp initials={initials} year={year} className="dak-stamp-shadow h-24 w-auto rotate-[2.5deg] sm:h-36" />
                    {/* struck half over the stamp, as a real cancellation is */}
                    <Postmark
                      town={town}
                      line1={strike.line1}
                      line2={strike.line2}
                      className="dak-strike absolute -left-6 top-4 h-20 w-20 text-[color:var(--dak-red)] sm:-left-10 sm:top-5 sm:h-28 sm:w-28"
                    />
                    <CancelWaves className="dak-strike absolute -left-16 top-6 h-8 w-24 text-[color:var(--dak-red)] opacity-55 sm:-left-24 sm:top-8 sm:h-10 sm:w-28" />
                  </div>
                </div>

                <div className="mt-10">
                  <span className="dak-mono text-[0.55rem] tracking-[0.3em] text-[color:var(--dak-text-soft)]">
                    <TT en="TO" hi="प्रति" />
                  </span>
                  <p className="dak-script mt-1 text-[clamp(1.7rem,5vw,2.3rem)] leading-tight text-[color:var(--dak-ink)]">
                    {addressee ? <T value={addressee} /> : <TT en="Our dearest people" hi="हमारे प्रियजन" />}
                  </p>
                  <div className="mt-4 space-y-4" aria-hidden="true">
                    <div className="dak-addr-line" />
                    <div className="dak-addr-line w-4/5" />
                  </div>
                  <p className="dak-mono mt-5 text-[0.62rem] tracking-[0.22em] text-[color:var(--dak-text-soft)]">
                    {city ?? ""}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
                    <span className="dak-mono text-[0.5rem] tracking-[0.24em] text-[color:var(--dak-text-soft)]">
                      <TT en="DATE" hi="दिनांक" />
                    </span>
                    <div className="flex gap-1 sm:gap-1.5">
                      {pins.map((d, i) => (
                        <span key={i} className="dak-pin">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className="mt-10 flex flex-col items-center gap-4">
            <a href={heroCta} className="dak-btn dak-btn-lite">
              <DakMark className="h-5 w-5 shrink-0" />
              <TT en={hasRsvp ? "Reply by post" : "Read the invitation"} hi={hasRsvp ? "उत्तर भेजें" : "निमंत्रण पढ़ें"} />
            </a>
            <p className="dak-mono text-[0.55rem] tracking-[0.3em] text-[color:var(--dak-paper)]/45">
              <TT en="POSTED WITH LOVE" hi="प्रेम सहित प्रेषित" />
            </p>
          </div>
        </div>
      </section>

      {/* ── DELIVERED TO ─────────────────────────────────────────────────── */}
      {addressee ? (
        <section className="dak-paper relative px-6 pb-24 pt-20 sm:pb-28">
          <div className="mx-auto max-w-2xl text-center" data-tw-reveal>
            <div className="flex justify-center">
              <Postmark
                town={town}
                line1={strike.line1}
                line2={strike.line2}
                legend="DELIVERED"
                className="h-28 w-28 -rotate-[7deg] text-[color:var(--dak-red)] opacity-85"
              />
            </div>
            <p className="dak-mono mt-7 text-[0.6rem] tracking-[0.4em] text-[color:var(--dak-gold-deep)]">
              <TT en="DELIVERED TO" hi="प्राप्तकर्ता" />
            </p>
            <h2 className="dak-script mt-3 text-[clamp(2.2rem,7vw,3.4rem)] leading-tight text-[color:var(--dak-ink)]">
              <T value={addressee} />
            </h2>
            <div className="mt-5 flex justify-center">
              <PostalRule className="w-52" />
            </div>
            <p className="dak-serif mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[color:var(--dak-text)]/85">
              <TT
                en="Some invitations are sent. This one is delivered by hand, to the people who made us who we are — and we would love nothing more than to have you with us."
                hi="कुछ निमंत्रण भेजे जाते हैं। यह उन लोगों तक स्वयं पहुँचाया गया है जिन्होंने हमें बनाया — और आपकी उपस्थिति से बढ़कर हमारे लिए कुछ नहीं।"
              />
            </p>
          </div>
        </section>
      ) : null}

      {/* ── THE ROUTE (our story) ────────────────────────────────────────── */}
      {milestones.length > 0 ? (
        <section id="story" className="dak-paper2 relative scroll-mt-16 overflow-hidden px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <SectionHead
              over={{ en: "THE ROUTE SO FAR", hi: "अब तक का सफ़र" }}
              title={{ en: "Postmarks", hi: "पड़ाव" }}
            />
            <ol className="dak-route mt-14 space-y-12">
              {milestones.map((m, i) => (
                <li key={i} className="dak-route-item" data-tw-reveal>
                  <span className="dak-route-mark" aria-hidden="true">
                    <span className="dak-mono text-[0.58rem] tracking-[0.1em]">{m.when}</span>
                  </span>
                  <div className="dak-route-body">
                    <h3 className="dak-display text-2xl text-[color:var(--dak-text)]">
                      <T value={m.title} />
                    </h3>
                    <p className="dak-serif mt-2.5 text-lg leading-relaxed text-[color:var(--dak-text)]/80">
                      <T value={m.text} />
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ── FAMILIES — the two senders ───────────────────────────────────── */}
      {familyMembers.length > 0 ? (
        <section id="family" className="dak-paper relative scroll-mt-16 px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl">
            <SectionHead
              over={{ en: "WITH THE BLESSINGS OF", hi: "आशीर्वाद सहित" }}
              title={{ en: "Our Families", hi: "हमारे परिवार" }}
            />
            <div className={`mt-14 grid gap-12 ${groomFamily.length && brideFamily.length ? "md:grid-cols-2" : ""}`}>
              {[
                { list: groomFamily, en: "FROM THE FAMILY OF THE GROOM", hi: "वर पक्ष", rule: brideFamily.length > 0 },
                { list: brideFamily, en: "FROM THE FAMILY OF THE BRIDE", hi: "वधू पक्ष", rule: false },
              ]
                .filter((g) => g.list.length > 0)
                .map((g) => (
                  <div
                    key={g.en}
                    className={`text-center ${g.rule ? "md:border-r md:border-dashed md:border-[color:var(--dak-gold)]/40 md:pr-12" : ""}`}
                    data-tw-reveal
                  >
                    <p className="dak-mono text-[0.55rem] tracking-[0.28em] text-[color:var(--dak-gold-deep)]">
                      <TT en={g.en} hi={g.hi} />
                    </p>
                    <div className="mt-7 space-y-5">
                      {g.list.map((m, i) => (
                        <div key={i}>
                          <h3 className="dak-serif text-xl text-[color:var(--dak-text)]">
                            <T value={m.name} />
                          </h3>
                          {m.relation ? (
                            <p className="dak-mono mt-1 text-[0.55rem] tracking-[0.22em] text-[color:var(--dak-text-soft)]">
                              <T value={m.relation} />
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── IN TRANSIT (countdown) ───────────────────────────────────────── */}
      {countdownDate ? <DakCountdown dateIso={countdownDate} time={config.eventTime} city={city} /> : null}

      {/* ── CELEBRATIONS — a stamp for each ──────────────────────────────── */}
      {events.length > 0 ? (
        <section id="celebrations" className="dak-paper2 relative scroll-mt-16 px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHead
              over={{ en: "THE COMMEMORATIVE SET", hi: "आयोजन" }}
              title={{ en: "A Stamp for Every Celebration", hi: "हर आयोजन, एक मुहर" }}
            />
            {!ownerPreview && rsvp ? (
              <p className="dak-serif mx-auto mt-5 max-w-md text-center text-lg italic text-[color:var(--dak-text-soft)]">
                <TT
                  en="Only the celebrations chosen for your family appear here."
                  hi="यहाँ केवल वही आयोजन हैं जो आपके परिवार के लिए चुने गए हैं।"
                />
              </p>
            ) : null}
            <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e, i) => {
                const cal = gcalUrl(e, names);
                const es = strikeDate(e.eventDate);
                return (
                  <article key={e.id} className="dak-perf dak-lift relative" data-tw-reveal>
                    <div className="dak-perf-panel">
                      <span className="dak-mono absolute left-3 top-2.5 text-[0.5rem] tracking-[0.18em] text-[color:var(--dak-gold-deep)]">
                        No. {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex justify-center pt-5">
                        <CeremonyVignette name={e.name} className="h-14 w-14 text-[color:var(--dak-gold-deep)]" />
                      </div>
                      <h3 className="dak-display mt-4 text-center text-2xl text-[color:var(--dak-text)]">
                        <T value={{ en: e.name, hi: e.nameHi ?? undefined }} />
                      </h3>
                      <div className="mx-auto mt-3 h-px w-16 bg-[color:var(--dak-gold)]/45" />
                      <div className="mt-3 space-y-1.5 text-center">
                        {e.eventDate ? (
                          <p className="dak-mono text-[0.58rem] tracking-[0.24em] text-[color:var(--dak-gold-deep)]">
                            {longDate(e.eventDate)}
                          </p>
                        ) : null}
                        {timeLabel(e.startTime) ? (
                          <p className="dak-mono text-[0.58rem] tracking-[0.24em] text-[color:var(--dak-text-soft)]">
                            {timeLabel(e.startTime)}
                          </p>
                        ) : null}
                        {e.venueName ? (
                          <p className="dak-serif pt-1 text-lg text-[color:var(--dak-text)]">{e.venueName}</p>
                        ) : null}
                      </div>
                      {e.description ? (
                        <p className="dak-serif mt-3 text-center text-base italic leading-relaxed text-[color:var(--dak-text)]/75">
                          <T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} />
                        </p>
                      ) : null}
                      {e.hostedByEnabled && e.hostedBy ? (
                        <p className="dak-mono mt-3 text-center text-[0.55rem] tracking-[0.22em] text-[color:var(--dak-text-soft)]">
                          <TT en="HOSTED BY" hi="मेज़बान" /> {e.hostedBy}
                        </p>
                      ) : null}
                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {e.mapsUrl ? (
                          <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="dak-chip">
                            <TT en="VENUE" hi="स्थान" />
                          </a>
                        ) : null}
                        {cal ? (
                          <a href={cal} target="_blank" rel="noopener noreferrer" className="dak-chip">
                            <TT en="CALENDAR" hi="कैलेंडर" />
                          </a>
                        ) : null}
                      </div>
                      {/* the cancellation, struck across the corner of the stamp */}
                      <Postmark
                        town={town}
                        line1={es.line1}
                        line2={es.line2}
                        className="pointer-events-none absolute -top-3 right-0 h-20 w-20 rotate-[9deg] text-[color:var(--dak-red)] opacity-45 sm:-right-3"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── THE ALBUM (gallery) ──────────────────────────────────────────── */}
      {images.length > 0 ? (
        <section id="album" className="dak-paper relative scroll-mt-16 px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHead over={{ en: "MOUNTED IN THE ALBUM", hi: "संग्रह" }} title={{ en: "The Album", hi: "अल्बम" }} />
            <div className="mt-16 grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
              {images.map((img, i) => {
                const span = i % 5 === 0 ? "col-span-2 aspect-[3/2]" : "aspect-[3/4]";
                const fs = focusStyles(img.focus);
                return (
                  <figure key={i} className={`dak-perf dak-lift group relative ${span}`} data-tw-reveal>
                    <div className="dak-perf-panel h-full overflow-hidden p-2">
                      <div className="relative h-full w-full overflow-hidden">
                        <div className="h-full w-full" style={fs.zoom}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- couple-provided gallery URLs */}
                          <img
                            src={img.url}
                            alt=""
                            loading="lazy"
                            style={fs.image}
                            className="h-full w-full object-cover transition-transform duration-[2.4s] ease-out group-hover:scale-[1.05]"
                          />
                        </div>
                        <span className="dak-mounts" aria-hidden="true" />
                        {img.caption ? (
                          <figcaption className="dak-mono absolute inset-x-0 bottom-0 bg-gradient-to-t from-[color:var(--dak-ink)]/85 to-transparent px-3 pb-2.5 pt-9 text-[0.55rem] tracking-[0.22em] text-[color:var(--dak-paper)] opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                            <T value={img.caption} />
                          </figcaption>
                        ) : null}
                      </div>
                    </div>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── POSTE RESTANTE (details) ─────────────────────────────────────── */}
      {faqs.length > 0 || contacts.length > 0 ? (
        <section id="details" className="dak-paper2 relative scroll-mt-16 px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <SectionHead over={{ en: "POSTE RESTANTE", hi: "अतिथियों हेतु" }} title={{ en: "Details", hi: "विवरण" }} />
            <div className="mt-12">
              {faqs.map((f, i) => (
                <div key={i} className="dak-dashed-row py-7" data-tw-reveal>
                  <h3 className="dak-display text-xl text-[color:var(--dak-text)]">
                    <T value={f.q} />
                  </h3>
                  <p className="dak-serif mt-2.5 text-lg leading-relaxed text-[color:var(--dak-text)]/80">
                    <T value={f.a} />
                  </p>
                </div>
              ))}
            </div>
            {contacts.length > 0 ? (
              <div className="mt-14 text-center" data-tw-reveal>
                <p className="dak-mono text-[0.55rem] tracking-[0.32em] text-[color:var(--dak-gold-deep)]">
                  <TT en="ENQUIRIES · SENDER'S DESK" hi="सहायता हेतु संपर्क" />
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-x-10 gap-y-3">
                  {contacts.map((c, i) => (
                    <p key={i} className="dak-serif text-lg text-[color:var(--dak-text)]">
                      {c.name}
                      {c.relation ? <span className="text-[color:var(--dak-text-soft)]"> · {c.relation}</span> : null}
                      <span className="text-[color:var(--dak-text-soft)]"> · {c.phone}</span>
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── THE REPLY ────────────────────────────────────────────────────── */}
      {hasRsvp ? (
        <section id="rsvp" className="dak-desk relative scroll-mt-16 overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
          <StrikeRings className="dak-turn pointer-events-none absolute -right-40 top-10 z-0 h-[28rem] w-[28rem] opacity-[0.06]" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="text-center" data-tw-reveal>
              <WingedLetter className="mx-auto h-12 w-24 text-[color:var(--dak-gold-lite)]" />
              <p className="dak-mono mt-6 text-[0.6rem] tracking-[0.4em] text-[color:var(--dak-gold-lite)]">
                <TT en="RETURN POST" hi="कृपया उत्तर दें" />
              </p>
              <h2 className="dak-display mt-4 text-[clamp(1.9rem,5vw,2.9rem)] text-[color:var(--dak-paper)]">
                <TT en="Will you be with us?" hi="क्या आप पधारेंगे?" />
              </h2>
              <p className="dak-serif mx-auto mt-5 max-w-md text-lg italic text-[color:var(--dak-paper)]/70">
                <TT
                  en="Tear along the perforation, tick your boxes and send it back."
                  hi="अपने उत्तर पर निशान लगाइए और हमें भेज दीजिए।"
                />
              </p>
            </div>
            <div className="mt-12">
              {rsvp ? (
                <DakGroupRsvp slug={rsvp.slug} events={events} existing={rsvp.existing} onSaved={() => {}} />
              ) : selfRsvp ? (
                <DakSelfRsvp slug={selfRsvp.slug} events={selfRsvp.events} existing={selfRsvp.existing} onSaved={() => {}} />
              ) : (
                <DakRsvpDemo events={events} />
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── FOOTER — the envelope, sealed ────────────────────────────────── */}
      <footer className="dak-desk dak-rule-top relative overflow-hidden px-6 py-20 text-center">
        <div className="relative z-10">
          <WaxSeal initials={pair ? `${pair[0][0]}${pair[1][0]}` : names.slice(0, 2)} className="mx-auto h-24 w-24" />
          <p className="dak-names dak-foil mt-8 text-[clamp(2rem,8vw,3.2rem)]">
            {pair ? `${pair[0]} & ${pair[1]}` : names}
          </p>
          {dateLabel ? (
            <p className="dak-mono mt-4 text-[0.6rem] tracking-[0.34em] text-[color:var(--dak-paper)]/55">{dateLabel}</p>
          ) : null}
          {hashtag ? (
            <div className="mt-6 flex justify-center">
              <Cachet label={`#${hashtag.replace(/^#/, "")}`} className="dak-cachet-lite" />
            </div>
          ) : null}
          {quote ? (
            <p className="dak-serif mx-auto mt-8 max-w-md text-lg italic text-[color:var(--dak-paper)]/70">
              &ldquo;<T value={quote} />&rdquo;
            </p>
          ) : null}
          <p className="dak-mono mt-12 text-[0.5rem] tracking-[0.34em] text-[color:var(--dak-paper)]/35">
            <TT en="POSTED WITH LOVE · JASHN" hi="प्रेम सहित प्रेषित · जश्न" />
          </p>
          <JashnCredit className="mt-3 text-[color:var(--dak-gold-lite)]/45" />
        </div>
      </footer>
    </div>
  );
}

/* ── a struck, letterspaced section heading ────────────────────────────────── */
function SectionHead({
  over,
  title,
}: {
  over: { en: string; hi: string };
  title: { en: string; hi: string };
}) {
  return (
    <div className="text-center" data-tw-reveal>
      <p className="dak-mono text-[0.58rem] tracking-[0.4em] text-[color:var(--dak-gold-deep)]">
        <TT en={over.en} hi={over.hi} />
      </p>
      <h2 className="dak-display mt-3 text-[clamp(1.9rem,5vw,2.9rem)] text-[color:var(--dak-text)]">
        <TT en={title.en} hi={title.hi} />
      </h2>
      <div className="mx-auto mt-4 flex justify-center">
        <PostalRule className="w-44 opacity-90" />
      </div>
    </div>
  );
}

/* ── IN TRANSIT — the countdown as a flight ────────────────────────────────── */
function DakCountdown({
  dateIso,
  time,
  city,
}: {
  dateIso: string;
  time?: string;
  city: string | null;
}) {
  const { ready, days, hours, minutes, seconds } = useCountdown(dateIso, time ? `${time}:00` : undefined);
  const units: Array<[string, string, string]> = [
    [ready ? String(days) : "—", "DAYS", "दिन"],
    [pad2(hours, ready), "HOURS", "घंटे"],
    [pad2(minutes, ready), "MINUTES", "मिनट"],
    [pad2(seconds, ready), "SECONDS", "सेकंड"],
  ];
  return (
    <section className="dak-desk dak-rule-top relative overflow-hidden px-6 py-24 text-center sm:py-28">
      <div className="relative z-10" data-tw-reveal>
        <WingedLetter className="mx-auto h-11 w-20 text-[color:var(--dak-gold-lite)]" />
        <p className="dak-mono mt-5 text-[0.6rem] tracking-[0.42em] text-[color:var(--dak-gold-lite)]">
          <TT en="IN TRANSIT" hi="मार्ग में" />
        </p>
        <p className="dak-serif mt-3 text-xl italic text-[color:var(--dak-paper)]/75">
          <TT en={city ? `Arriving in ${city}` : "On its way to you"} hi="शुभ अवसर निकट है" />
        </p>
        <FlightRoute className="mx-auto mt-6 h-auto w-full max-w-3xl" />
        <div className="mx-auto -mt-2 grid max-w-2xl grid-cols-4 gap-3 sm:gap-5">
          {units.map(([v, en, hi]) => (
            <div key={en} className="dak-count">
              <span className="dak-countnum">{v}</span>
              <span className="dak-mono mt-2 block text-[0.5rem] tracking-[0.26em] text-[color:var(--dak-paper)]/55">
                <TT en={en} hi={hi} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
