"use client";

import { useEffect, useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { T, TT } from "../bilingual";
import { focusStyles } from "../image-focus";
import { MotionProvider } from "../experience/motion";
import { useCountdown, pad2 } from "../use-countdown";
import { resolveArtwork } from "../artwork-placement";
import { JodiPortrait } from "./portrait";
import {
  Mandala,
  LeafBorder,
  BaseScene,
  CoupleFromBehind,
  GoldRule,
  Sprig,
  CeremonyIcon,
} from "./ornaments";
import { JodiGroupRsvp, JodiSelfRsvp, JodiRsvpDemo } from "./jodi-rsvp";

/* ── helpers ──────────────────────────────────────────────────────────────── */
function splitNames(names: string): [string, string] | null {
  const parts = names.split(" & ");
  return parts.length === 2 ? [parts[0], parts[1]] : null;
}

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
   THE JODI — a painted invitation leaf.
   The page is composed like a printed invitation card: one sheet of ivory paper
   inside a gold keyline, a generous open field for the words at its head, and
   the couple standing in a gold mehrab arch at its foot. That last piece is
   painted artwork (see ART.md) — and it is the theme's one swappable slot, so a
   client's own caricature can stand in the arch instead (see portrait.tsx).
   ══════════════════════════════════════════════════════════════════════════ */
export function JodiView({
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
  const city = cityOf(events);
  const milestones = config.story?.milestones ?? [];
  const familyMembers = config.family?.members ?? [];
  const groomFamily = familyMembers.filter((m) => m.side !== "bride");
  const brideFamily = familyMembers.filter((m) => m.side === "bride");
  const images = config.gallery?.images ?? [];
  const faqs = config.faq?.items ?? [];
  const contacts = config.footer?.contacts ?? [];
  const hashtag = config.footer?.hashtag;
  const quote = config.hero?.tagline;
  /** The couple in the mehrab: the painted pair, the client's own drawing, or —
   * if they switched the slot off — nothing, leaving a typographic leaf. */
  const portrait = resolveArtwork(config.artwork, theme.supports.artwork);
  const hasRsvp = Boolean((rsvp && rsvp.events.length > 0) || selfRsvp || ownerPreview);
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
  if (images.length) links.push(["#gallery", "Portraits", "चित्र"]);
  if (faqs.length || contacts.length) links.push(["#details", "Details", "विवरण"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);

  const heroCta = hasRsvp ? "#rsvp" : events.length ? "#celebrations" : "#story";

  return (
    <MotionProvider>
      <div className="jdi" data-lang={lang} style={theme.vars}>
        {/* ── NAVIGATION ─────────────────────────────────────────────────── */}
        {/* The bar is always tinted, never transparent: the medallion hangs from
         * the top edge of the plate and a see-through nav puts link text
         * straight over its linework. `scrolled` only deepens the shadow. */}
        <header
          className={`jdi-nav-on fixed inset-x-0 top-0 z-40 transition-shadow duration-700 ${
            scrolled ? "jdi-nav-lift" : ""
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
            <a href="#top" className="flex items-center gap-3" aria-label={names}>
              <Mandala className="h-7 w-7 shrink-0" />
              <span className="jdi-serif text-lg tracking-[0.2em] text-[color:var(--jdi-ink)]">
                {pair ? `${pair[0][0]} · ${pair[1][0]}` : names}
              </span>
            </a>
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
              {links.map(([href, en, hi]) => (
                <a key={href} href={href} className="jdi-label text-[color:var(--jdi-ink)] transition-colors hover:text-[color:var(--jdi-maroon)]">
                  <TT en={en} hi={hi} />
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-5">
              <div className="hidden items-center gap-2 lg:flex">
                {(["en", "hi"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`jdi-label transition-colors ${lang === l ? "text-[color:var(--jdi-maroon)]" : "text-[color:var(--jdi-ink-soft)] hover:text-[color:var(--jdi-ink)]"}`}
                  >
                    {l === "en" ? "EN" : "हिं"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMenu(true)}
                className="jdi-label text-[color:var(--jdi-ink)] lg:hidden"
                aria-expanded={menu}
              >
                Menu
              </button>
            </div>
          </div>
        </header>

        {menu ? (
          <div
            className="fixed inset-0 z-[70] flex flex-col bg-[color:var(--jdi-cream)] p-6 duration-500 animate-in fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between">
              <span className="jdi-serif text-lg tracking-[0.2em] text-[color:var(--jdi-ink)]">
                {pair ? `${pair[0][0]} · ${pair[1][0]}` : names}
              </span>
              <button type="button" onClick={() => setMenu(false)} className="jdi-label text-[color:var(--jdi-ink)]">
                Close
              </button>
            </div>
            <nav className="mt-16 flex flex-col items-center gap-8" aria-label="Primary mobile">
              {links.map(([href, en, hi], i) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenu(false)}
                  className="jdi-display text-2xl text-[color:var(--jdi-ink)] duration-700 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${90 + i * 70}ms` }}
                >
                  <TT en={en} hi={hi} />
                </a>
              ))}
              <div className="mt-4 flex gap-6">
                {(["en", "hi"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`jdi-label ${lang === l ? "text-[color:var(--jdi-maroon)]" : "text-[color:var(--jdi-ink-soft)]"}`}
                  >
                    {l === "en" ? "English" : "हिंदी"}
                  </button>
                ))}
              </div>
            </nav>
            <div className="mx-auto mt-auto w-full max-w-xs">
              <Mandala half className="h-auto w-full opacity-60" />
            </div>
          </div>
        ) : null}

        {/* ── HERO — the invitation leaf ──────────────────────────────────
         * One sheet of ivory paper: a gold keyline running round the whole page,
         * the words in the open field at its head, and the painted plate — the
         * couple in their mehrab arch — standing at its foot.
         *
         * The words come FIRST and the artwork sits under them, rather than the
         * two sharing a row: at 390px a side-by-side would shrink the couple to
         * a thumbnail, and centring the copy over the artwork would put type on
         * top of her lehenga. Stacked, both read at every width.
         *
         * From `lg` up it becomes two columns instead. The hero's constraint is
         * HEIGHT — a 900px-tall laptop leaves a stacked plate about 430px, which
         * is smaller than the artwork deserves — while a wide screen has width
         * going spare on both sides of a centred card. Side by side, the same
         * page gives the couple ~750px and the copy a tighter measure.
         *
         * `.jdi-hero`'s wash resolves to flat `--jdi-paper` across its lower
         * half, which is what lets the plate — an opaque rectangle of the
         * illustration's own paper — sit on it with no visible edge. */}
        <section
          id="top"
          className="jdi-hero relative flex min-h-svh flex-col justify-between overflow-hidden pb-6 lg:flex-row lg:items-center lg:justify-center lg:gap-14 lg:px-16 lg:pb-0"
        >
          <LeafBorder />

          {/* the words — a generous open field, as on the reference plates. Kept
           * deliberately tight: stacked, every line here is height the plate
           * below does not get. */}
          <div className="relative z-30 mx-auto flex w-full max-w-2xl flex-col items-center px-6 pt-20 text-center sm:px-8 sm:pt-28 lg:mx-0 lg:max-w-md lg:items-start lg:px-0 lg:pt-0 lg:text-left">
            {/* the painted paper's blooms — scoped to this column on purpose, see
             * `.jdi-wash`: on the hero itself they showed the plate's edges. */}
            <div className="jdi-wash" aria-hidden />
            <p className="jdi-label jdi-fade text-[color:var(--jdi-maroon)]" style={{ animationDelay: "0.35s" }}>
              <TT en="Together with their families" hi="अपने परिवारों सहित" />
            </p>
            {/* the measure is capped so this breaks in two balanced lines on a
             * phone instead of leaving "of" alone on the second */}
            <p
              className="jdi-serif jdi-fade mt-3 max-w-[19rem] text-base italic text-[color:var(--jdi-ink-soft)] sm:max-w-none"
              style={{ animationDelay: "0.5s" }}
            >
              <TT en="request the honour of your presence at the marriage of" hi="आपकी उपस्थिति सादर प्रार्थनीय है" />
            </p>

            <div className="jdi-fade mt-5" style={{ animationDelay: "0.7s" }}>
              <h1 className="jdi-names text-[clamp(2rem,11vw,4.6rem)] leading-[1.08] text-[color:var(--jdi-maroon-2)]">
                {pair ? (
                  <>
                    {pair[0]} <span className="jdi-amp">&amp;</span> {pair[1]}
                  </>
                ) : (
                  names
                )}
              </h1>
            </div>

            <div className="jdi-fade mt-5 flex w-full justify-center lg:justify-start" style={{ animationDelay: "0.85s" }}>
              <GoldRule className="w-56" />
            </div>

            {dateLabel ? (
              <p className="jdi-label jdi-fade mt-5 text-[0.7rem] text-[color:var(--jdi-ink)]" style={{ animationDelay: "0.95s" }}>
                {dateLabel}
              </p>
            ) : null}
            {city ? (
              <p className="jdi-serif jdi-fade mt-2 text-sm italic text-[color:var(--jdi-ink-soft)]" style={{ animationDelay: "1.05s" }}>
                {city}
              </p>
            ) : null}

            <a href={heroCta} className="jdi-btn jdi-fade mt-8" style={{ animationDelay: "1.2s" }}>
              <TT en="Join us" hi="सम्मिलित हों" />
            </a>
          </div>

          {/* The plate, standing on the foot of the leaf. `.jdi-plate-slot` gives
           * it a definite height in `svh` and derives its width from the
           * artwork's aspect — see that rule for why a `flex: 1` height could
           * not do the job. `justify-between` on the section then keeps it on
           * the foot of the page whatever height the words came out. */}
          {portrait.show ? (
            <div className="jdi-plate-slot jdi-fade relative z-20 mx-auto mt-6 lg:mx-0 lg:mt-0" style={{ animationDelay: "1.35s" }}>
              <JodiPortrait artwork={portrait.art} className="h-full w-full" />
            </div>
          ) : null}
        </section>

        {/* ── GUEST WELCOME ──────────────────────────────────────────────── */}
        {family ? (
          <section className="jdi-cream relative px-6 pb-24 pt-20 sm:pb-28">
            <div className="mx-auto max-w-2xl text-center" data-tw-reveal>
              <Mandala className="mx-auto h-20 w-20 opacity-80" />
              <p className="jdi-serif mt-7 text-xl italic text-[color:var(--jdi-maroon)]">
                <TT en="Namaste" hi="नमस्ते" />
              </p>
              <h2 className="jdi-display mt-2 text-[clamp(1.8rem,5vw,2.9rem)] text-[color:var(--jdi-maroon-2)]">
                <T value={family} />
              </h2>
              <div className="mx-auto mt-6 flex justify-center">
                <GoldRule className="w-52" />
              </div>
              <p className="jdi-serif mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[color:var(--jdi-ink)]/85">
                <TT
                  en="It would mean a great deal to us to have you present as our two families come together, and as we begin this next chapter surrounded by the people who shaped us."
                  hi="जब हमारे दो परिवार एक होंगे और हम अपने प्रियजनों के बीच इस नए अध्याय की शुरुआत करेंगे, आपकी उपस्थिति हमारे लिए अत्यंत महत्वपूर्ण होगी।"
                />
              </p>
              {rsvp && chip ? (
                <p className="jdi-label mt-7 text-[color:var(--jdi-maroon)]">
                  <T value={chip} />
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ── OUR STORY ──────────────────────────────────────────────────── */}
        {milestones.length > 0 ? (
          <section id="story" className="jdi-ivory relative scroll-mt-16 overflow-hidden px-6 py-24 sm:py-32">
            <Mandala className="jdi-turn pointer-events-none absolute -right-24 top-8 h-72 w-72 opacity-[0.13]" />
            <div className="relative mx-auto max-w-4xl">
              <SectionHead over={{ en: "How we arrived here", hi: "यहाँ तक की राह" }} title={{ en: "Our Story", hi: "हमारी कहानी" }} />
              <div className="relative mt-16 space-y-16">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[color:var(--jdi-gold)]/40 to-transparent lg:block"
                />
                {milestones.map((m, i) => (
                  <div
                    key={i}
                    className={`relative lg:w-[46%] ${i % 2 ? "lg:ml-auto lg:text-left" : "lg:text-right"}`}
                    data-tw-reveal
                  >
                    <p className="jdi-label text-[color:var(--jdi-maroon)]">{m.when}</p>
                    <h3 className="jdi-display mt-3 text-2xl text-[color:var(--jdi-maroon-2)]">
                      <T value={m.title} />
                    </h3>
                    <p className="jdi-serif mt-3 text-lg leading-relaxed text-[color:var(--jdi-ink)]/80">
                      <T value={m.text} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── FAMILIES ───────────────────────────────────────────────────── */}
        {familyMembers.length > 0 ? (
          <section id="family" className="jdi-champ relative scroll-mt-16 px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-4xl">
              <SectionHead over={{ en: "With the blessings of", hi: "आशीर्वाद सहित" }} title={{ en: "Our Families", hi: "हमारे परिवार" }} />
              <div className={`mt-14 grid gap-14 ${groomFamily.length && brideFamily.length ? "md:grid-cols-2" : ""}`}>
                {[
                  { list: groomFamily, en: "Groom's Family", hi: "वर पक्ष", border: brideFamily.length > 0 },
                  { list: brideFamily, en: "Bride's Family", hi: "वधू पक्ष", border: false },
                ]
                  .filter((g) => g.list.length > 0)
                  .map((g) => (
                    <div
                      key={g.en}
                      className={`text-center ${g.border ? "md:border-r md:border-[color:var(--jdi-gold)]/30 md:pr-14" : ""}`}
                      data-tw-reveal
                    >
                      <p className="jdi-label text-[color:var(--jdi-maroon)]">
                        <TT en={g.en} hi={g.hi} />
                      </p>
                      <div className="mt-7 space-y-5">
                        {g.list.map((m, i) => (
                          <div key={i}>
                            <h3 className="jdi-serif text-xl text-[color:var(--jdi-ink)]">
                              <T value={m.name} />
                            </h3>
                            {m.relation ? (
                              <p className="jdi-sans mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--jdi-ink-soft)]">
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

        {/* ── COUNTDOWN ──────────────────────────────────────────────────── */}
        {countdownDate ? <JodiCountdown dateIso={countdownDate} time={config.eventTime} /> : null}

        {/* ── CELEBRATIONS ───────────────────────────────────────────────── */}
        {events.length > 0 ? (
          <section id="celebrations" className="jdi-ivory relative scroll-mt-16 px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-5xl">
              <SectionHead over={{ en: "The celebrations", hi: "आयोजन" }} title={{ en: "Order of Events", hi: "विवाह समारोह" }} />
              {!ownerPreview && rsvp ? (
                <p className="jdi-serif mx-auto mt-5 max-w-md text-center text-base italic text-[color:var(--jdi-ink-soft)]">
                  <TT
                    en="Only the celebrations chosen for your family appear here."
                    hi="यहाँ केवल वही आयोजन हैं जो आपके परिवार के लिए चुने गए हैं।"
                  />
                </p>
              ) : null}
              <div className="mt-14 grid gap-7 sm:grid-cols-2">
                {events.map((e, i) => {
                  const cal = gcalUrl(e, names);
                  return (
                    <article
                      key={e.id}
                      className="jdi-event group relative px-8 py-9"
                      data-tw-reveal
                      style={{ animationDelay: `${(i % 2) * 0.08}s` }}
                    >
                      <div className="flex justify-center">
                        <CeremonyIcon name={e.name} className="h-10 w-10" />
                      </div>
                      <h3 className="jdi-display mt-5 text-center text-2xl text-[color:var(--jdi-maroon-2)]">
                        <T value={{ en: e.name, hi: e.nameHi ?? undefined }} />
                      </h3>
                      <div className="mt-4 flex justify-center">
                        <GoldRule className="w-32" />
                      </div>
                      <div className="mt-4 space-y-2 text-center">
                        {e.eventDate ? <p className="jdi-label text-[color:var(--jdi-maroon)]">{longDate(e.eventDate)}</p> : null}
                        {timeLabel(e.startTime) ? (
                          <p className="jdi-label text-[color:var(--jdi-ink-soft)]">{timeLabel(e.startTime)}</p>
                        ) : null}
                        {e.venueName ? <p className="jdi-serif text-lg text-[color:var(--jdi-ink)]">{e.venueName}</p> : null}
                      </div>
                      {e.description ? (
                        <p className="jdi-serif mt-4 text-center text-base italic leading-relaxed text-[color:var(--jdi-ink)]/75">
                          <T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} />
                        </p>
                      ) : null}
                      {e.hostedByEnabled && e.hostedBy ? (
                        <p className="jdi-label mt-4 text-center text-[color:var(--jdi-ink-soft)]">
                          <TT en="Hosted by" hi="मेज़बान" /> {e.hostedBy}
                        </p>
                      ) : null}
                      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                        {e.mapsUrl ? (
                          <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="jdi-chip">
                            <TT en="Venue" hi="स्थान" />
                          </a>
                        ) : null}
                        {cal ? (
                          <a href={cal} target="_blank" rel="noopener noreferrer" className="jdi-chip">
                            <TT en="Add to calendar" hi="कैलेंडर" />
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── GALLERY ────────────────────────────────────────────────────── */}
        {images.length > 0 ? (
          <section id="gallery" className="jdi-cream relative scroll-mt-16 px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-5xl">
              <SectionHead over={{ en: "The album", hi: "संग्रह" }} title={{ en: "Portraits", hi: "हमारे चित्र" }} />
              <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {images.map((img, i) => {
                  const span = i % 5 === 0 ? "col-span-2 lg:col-span-2 aspect-[3/2]" : "aspect-[3/4]";
                  const fs = focusStyles(img.focus);
                  return (
                    <figure key={i} className={`jdi-frame group relative overflow-hidden ${span}`} data-tw-reveal>
                      <div className="h-full w-full" style={fs.zoom}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- couple-provided gallery URLs */}
                        <img
                          src={img.url}
                          alt=""
                          loading="lazy"
                          style={fs.image}
                          className="h-full w-full object-cover transition-transform duration-[2.4s] ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      {img.caption ? (
                        <figcaption className="jdi-label absolute inset-x-0 bottom-0 bg-gradient-to-t from-[color:var(--jdi-maroon-3)]/80 to-transparent px-4 pb-3 pt-10 text-[color:var(--jdi-cream)] opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                          <T value={img.caption} />
                        </figcaption>
                      ) : null}
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── DETAILS ────────────────────────────────────────────────────── */}
        {faqs.length > 0 || contacts.length > 0 ? (
          <section id="details" className="jdi-ivory relative scroll-mt-16 px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-3xl">
              <SectionHead over={{ en: "For our guests", hi: "अतिथियों हेतु" }} title={{ en: "Details", hi: "विवरण" }} />
              <div className="mt-12 divide-y divide-[color:var(--jdi-gold)]/25">
                {faqs.map((f, i) => (
                  <div key={i} className="py-7" data-tw-reveal>
                    <h3 className="jdi-display text-xl text-[color:var(--jdi-maroon-2)]">
                      <T value={f.q} />
                    </h3>
                    <p className="jdi-serif mt-2.5 text-lg leading-relaxed text-[color:var(--jdi-ink)]/80">
                      <T value={f.a} />
                    </p>
                  </div>
                ))}
              </div>
              {contacts.length > 0 ? (
                <div className="mt-14 text-center" data-tw-reveal>
                  <p className="jdi-label text-[color:var(--jdi-maroon)]">
                    <TT en="For any assistance" hi="सहायता हेतु संपर्क" />
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-x-10 gap-y-3">
                    {contacts.map((c, i) => (
                      <p key={i} className="jdi-serif text-lg text-[color:var(--jdi-ink)]">
                        {c.name}
                        {c.relation ? <span className="text-[color:var(--jdi-ink-soft)]"> · {c.relation}</span> : null}
                        <span className="text-[color:var(--jdi-ink-soft)]"> · {c.phone}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ── RSVP ───────────────────────────────────────────────────────── */}
        {hasRsvp ? (
          <section id="rsvp" className="jdi-champ relative scroll-mt-16 overflow-hidden px-6 py-24 sm:py-32">
            <div className="relative mx-auto max-w-3xl">
              <div className="text-center" data-tw-reveal>
                <Sprig className="mx-auto h-8 w-32" />
                <p className="jdi-label mt-5 text-[color:var(--jdi-maroon)]">
                  <TT en="Kindly respond" hi="कृपया उत्तर दें" />
                </p>
                <h2 className="jdi-display mt-3 text-[clamp(1.8rem,5vw,2.9rem)] text-[color:var(--jdi-maroon-2)]">
                  <TT en="Will you be with us?" hi="क्या आप पधारेंगे?" />
                </h2>
                <div className="mt-6 flex justify-center">
                  <GoldRule className="w-52" />
                </div>
                <p className="jdi-serif mx-auto mt-6 max-w-md text-lg italic text-[color:var(--jdi-ink)]/75">
                  <TT
                    en="So that we may set a place for everyone in your family."
                    hi="जिससे हम आपके परिवार के प्रत्येक सदस्य के लिए स्थान सुनिश्चित कर सकें।"
                  />
                </p>
              </div>
              <div className="mt-12">
                {rsvp ? (
                  <JodiGroupRsvp slug={rsvp.slug} events={events} existing={rsvp.existing} onSaved={() => {}} />
                ) : selfRsvp ? (
                  <JodiSelfRsvp slug={selfRsvp.slug} events={selfRsvp.events} existing={selfRsvp.existing} onSaved={() => {}} />
                ) : (
                  <JodiRsvpDemo events={events} />
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── FOOTER — the plate closes with the couple again ────────────── */}
        <footer className="jdi-footer relative overflow-hidden px-6 pt-20 text-center">
          <div className="relative z-20 pb-[34vh]">
            <Mandala half className="mx-auto h-auto w-48 opacity-70" />
            <p className="jdi-names mt-8 text-[clamp(2.1rem,9vw,3.4rem)] text-[color:var(--jdi-maroon-2)]">
              {pair ? `${pair[0]} & ${pair[1]}` : names}
            </p>
            {hashtag ? (
              <p className="jdi-label mt-4 text-[color:var(--jdi-maroon)]">#{hashtag.replace(/^#/, "")}</p>
            ) : null}
            {dateLabel ? <p className="jdi-label mt-3 text-[color:var(--jdi-ink-soft)]">{dateLabel}</p> : null}
            {quote ? (
              <p className="jdi-serif mx-auto mt-8 max-w-md text-lg italic text-[color:var(--jdi-ink)]/75">
                &ldquo;<T value={quote} />&rdquo;
              </p>
            ) : null}
            <p className="jdi-label mt-12 text-[0.55rem] text-[color:var(--jdi-ink-soft)]">
              <TT en="Illustrated with love · Jashn" hi="प्रेम से बनाया गया · जश्न" />
            </p>
            <JashnCredit className="mt-3 text-[color:var(--jdi-ink-soft)]" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
            <BaseScene className="h-[22vh] max-h-52 w-full" />
          </div>
          {/* the leaf closes on the couple again — but seen from behind, walking
           * away into the scene, so it reads as a farewell rather than a second
           * portrait competing with the hero's. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center">
            <CoupleFromBehind className="h-[30vh] max-h-[320px] w-auto opacity-95" />
          </div>
        </footer>
      </div>
    </MotionProvider>
  );
}

/* ── a quiet, letterspaced section heading ─────────────────────────────────── */
function SectionHead({
  over,
  title,
}: {
  over: { en: string; hi: string };
  title: { en: string; hi: string };
}) {
  return (
    <div className="text-center" data-tw-reveal>
      <p className="jdi-label text-[color:var(--jdi-maroon)]">
        <TT en={over.en} hi={over.hi} />
      </p>
      <h2 className="jdi-display mt-3 text-[clamp(1.8rem,5vw,2.9rem)] text-[color:var(--jdi-maroon-2)]">
        <TT en={title.en} hi={title.hi} />
      </h2>
      <div className="mx-auto mt-4 flex justify-center">
        <Sprig className="h-8 w-32" />
      </div>
    </div>
  );
}

/* ── the countdown ─────────────────────────────────────────────────────────── */
function JodiCountdown({ dateIso, time }: { dateIso: string; time?: string }) {
  const { ready, days, hours, minutes, seconds } = useCountdown(dateIso, time ? `${time}:00` : undefined);
  const units: Array<[string, string, string]> = [
    [ready ? String(days) : "—", "Days", "दिन"],
    [pad2(hours, ready), "Hours", "घंटे"],
    [pad2(minutes, ready), "Minutes", "मिनट"],
    [pad2(seconds, ready), "Seconds", "सेकंड"],
  ];
  return (
    <section className="jdi-cream relative overflow-hidden px-6 py-24 text-center sm:py-28">
      <div className="relative" data-tw-reveal>
        <p className="jdi-label text-[color:var(--jdi-maroon)]">
          <TT en="The muhurat approaches" hi="मुहूर्त निकट है" />
        </p>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-4">
          {units.map(([v, en, hi]) => (
            <div key={en} className="jdi-count flex flex-col items-center px-2 py-2">
              <span className="jdi-countnum text-[clamp(2rem,9vw,3.6rem)] leading-none">{v}</span>
              <span className="jdi-label mt-3 text-[0.55rem] text-[color:var(--jdi-ink-soft)]">
                <TT en={en} hi={hi} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
