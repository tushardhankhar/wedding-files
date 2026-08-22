"use client";

import { useEffect, useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { T, TT } from "../bilingual";
import { focusStyles } from "../image-focus";
import { useCountdown, pad2 } from "../use-countdown";
import { splitNames, fitName, shouldStack, longDate, clockTime, gcalUrl } from "../format";
import {
  RadiantCross,
  Rings,
  Anchor,
  Compass,
  Lighthouse,
  Dove,
  Seagulls,
  SurfLine,
  ShoreScene,
  ShoreWash,
  CornerBloom,
  CornerShells,
  ScallopShell,
  Conch,
  Starfish,
  GoldDivider,
  HeadFlourish,
  RopeRule,
  FoamDrift,
  CeremonyIcon,
} from "./ornaments";
import { MiramarGroupRsvp, MiramarSelfRsvp, MiramarRsvpDemo } from "./miramar-rsvp";

/* ── helpers ──────────────────────────────────────────────────────────────── */
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

/* The scripture on the plate. The couple's own tagline replaces it the moment
 * they write one; until then the invitation reads as a Catholic invitation
 * rather than as an empty frame. */
const DEFAULT_VERSE = {
  en: "“No one has ever seen God; but if we love one another, God lives in us and his love is made complete in us.”",
  hi: "“परमेश्वर को किसी ने कभी नहीं देखा; परन्तु यदि हम एक दूसरे से प्रेम रखें, तो परमेश्वर हम में बना रहता है और उसका प्रेम हम में सिद्ध होता है।”",
};
const VERSE_REF = "1 John 4:12";

/* `mrm-names` is Great Vibes — a script face, so its average advance is much
 * narrower than a serif's.
 *
 * The measure is NOT a plain vw here, because on this theme the names do not
 * live in the viewport: they live inside a bounded plate (max-w-38rem, less its
 * padding). A vw-only measure told the estimate it had 1094px to play with at a
 * 1440 desktop when the real measure is ~512, so `min()` never kicked in and
 * "Ryan & Alisha" broke after the "&". Capped at the plate's own inner width, it
 * steps down correctly at every size. 0.52em/char, not 0.46: measured against
 * what the face actually set at 248px, where the wrap first showed up. */
const NAME_FIT = {
  max: "clamp(2.9rem,15vw,5.8rem)",
  emPerChar: 0.52,
  measure: "min(74vw, 30rem)",
};
/* The footer's names are full-bleed, so they get their own, wider measure. */
const FOOTER_NAME_FIT = {
  max: "clamp(2.3rem,10vw,3.9rem)",
  emPerChar: 0.52,
  measure: "min(88vw, 44rem)",
};

const longerOf = (pair: [string, string]) => (pair[0].length >= pair[1].length ? pair[0] : pair[1]);

export function MiramarView({
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
  const tagline = config.hero?.tagline;
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
  if (images.length) links.push(["#gallery", "Gallery", "गैलरी"]);
  if (faqs.length || contacts.length) links.push(["#details", "Details", "विवरण"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);

  const heroCta = hasRsvp ? "#rsvp" : events.length ? "#celebrations" : "#story";

  return (
    <div className="mrm" data-lang={lang} style={theme.vars}>
      {/* rose petals & sea foam drift over the whole site */}
      <FoamDrift className="pointer-events-none fixed inset-0 z-[3] overflow-hidden" />

      {/* ── NAVIGATION ─────────────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled ? "mrm-nav-on" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <a href="#top" className="mrm-script text-2xl text-[color:var(--mrm-deep)]" aria-label={names}>
            {pair ? `${pair[0][0]} & ${pair[1][0]}` : names}
          </a>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {links.map(([href, en, hi]) => (
              <a
                key={href}
                href={href}
                className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--mrm-ink)] transition-colors hover:text-[color:var(--mrm-rose-deep)]"
              >
                <TT en={en} hi={hi} />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-1 lg:flex">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                    lang === l
                      ? "text-[color:var(--mrm-rose-deep)]"
                      : "text-[color:var(--mrm-ink-soft)] hover:text-[color:var(--mrm-deep)]"
                  }`}
                >
                  {l === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--mrm-deep)] lg:hidden"
              aria-expanded={menu}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {menu ? (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-[color:var(--mrm-shell)] p-6 duration-300 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex items-center justify-between">
            <span className="mrm-script text-3xl text-[color:var(--mrm-deep)]">
              {pair ? `${pair[0][0]} & ${pair[1][0]}` : names}
            </span>
            <button
              type="button"
              onClick={() => setMenu(false)}
              className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--mrm-deep)]"
            >
              Close
            </button>
          </div>
          <nav className="mt-16 flex flex-col items-center gap-8" aria-label="Primary mobile">
            {links.map(([href, en, hi], i) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className="mrm-serif text-3xl text-[color:var(--mrm-deep)] duration-500 animate-in fade-in slide-in-from-bottom-3"
                style={{ animationDelay: `${90 + i * 70}ms` }}
              >
                <TT en={en} hi={hi} />
              </a>
            ))}
            <div className="mt-4 flex gap-3">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-widest ${
                    lang === l
                      ? "border-[color:var(--mrm-gold)] text-[color:var(--mrm-rose-deep)]"
                      : "border-[color:var(--mrm-ink-soft)]/30 text-[color:var(--mrm-ink-soft)]"
                  }`}
                >
                  {l === "en" ? "English" : "हिंदी"}
                </button>
              ))}
            </div>
          </nav>
          <div className="mx-auto mt-auto">
            <GoldDivider className="w-52" />
          </div>
        </div>
      ) : null}

      {/* ── HERO — the invitation plate ─────────────────────────────────── */}
      {/* The plate is a CARD, not a page. It has to have an edge: given the whole
          viewport (which is what a full-bleed hero does at 1440), the copy floats
          in a cream void and the corner sprays retreat to specks. Bounded to a
          portrait measure and dropped onto a shore-coloured ground, the same
          ornament reads as the printed invitation it is drawn from — and the nav
          gets its own strip of ground instead of sitting on the flowers. */}
      <section
        id="top"
        className="mrm-shorescape relative flex min-h-svh flex-col items-center overflow-hidden px-2 pb-10 pt-14 sm:px-6 sm:pb-16 sm:pt-24"
      >
        <Seagulls className="pointer-events-none absolute right-[6%] top-[7%] z-0 h-14 w-28 opacity-70 sm:h-20 sm:w-44" />
        <Seagulls className="pointer-events-none absolute left-[8%] top-[16%] z-0 hidden h-14 w-28 opacity-50 lg:block" />

        <div className="mrm-sheet relative z-10 w-full max-w-[38rem] overflow-hidden">
          {/* the sea washing into two opposite corners of the plate */}
          <ShoreWash
            corner="tr"
            className="pointer-events-none absolute -right-10 -top-10 z-0 h-56 w-56 sm:h-[22rem] sm:w-[22rem]"
          />
          <ShoreWash
            corner="bl"
            className="pointer-events-none absolute -bottom-10 -left-10 z-0 h-56 w-56 sm:h-[22rem] sm:w-[22rem]"
          />
          {/* the plate's gold keyline */}
          <div className="mrm-frameline pointer-events-none absolute inset-2 z-[2] sm:inset-3" />

          {/* the corner sprays: florals above, the shore's treasures below */}
          <CornerBloom className="pointer-events-none absolute left-0 top-0 z-[4] h-auto w-[32%] sm:w-[38%] max-w-[224px]" />
          <CornerBloom className="pointer-events-none absolute right-0 top-0 z-[4] h-auto w-[32%] sm:w-[38%] max-w-[224px] -scale-x-100" />
          <CornerShells className="pointer-events-none absolute bottom-0 left-0 z-[4] h-auto w-[36%] sm:w-[42%] max-w-[244px]" />
          <CornerShells className="pointer-events-none absolute bottom-0 right-0 z-[4] h-auto w-[36%] sm:w-[42%] max-w-[244px] -scale-x-100" />

          <div className="relative z-20 mx-auto flex w-full flex-col items-center px-5 pb-20 pt-8 text-center sm:px-12 sm:pb-24 sm:pt-12">
            <div className="mrm-fade" style={{ animationDelay: "0.35s" }}>
              <RadiantCross className="h-16 w-12 sm:h-24 sm:w-20" />
            </div>

            {/* the scripture */}
            <div className="mrm-fade mt-2 max-w-md" style={{ animationDelay: "0.6s" }}>
              <p className="mrm-serif text-[0.78rem] italic leading-relaxed text-[color:var(--mrm-ink)]/85 sm:text-base">
                {tagline ? <T value={tagline} /> : <T value={DEFAULT_VERSE} />}
              </p>
              {tagline ? null : (
                <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.34em] text-[color:var(--mrm-gold-deep)]">
                  {VERSE_REF}
                </p>
              )}
            </div>

            <p
              className="mrm-sans mrm-fade mt-5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--mrm-sea)] sm:mt-6 sm:text-[0.66rem] sm:tracking-[0.4em]"
              style={{ animationDelay: "0.85s" }}
            >
              <TT en="Together with their families" hi="अपने परिवारों सहित" />
            </p>
            <p
              className="mrm-sans mrm-fade mt-1.5 text-[0.55rem] uppercase tracking-[0.18em] text-[color:var(--mrm-ink-soft)] sm:text-[0.66rem] sm:tracking-[0.3em]"
              style={{ animationDelay: "1s" }}
            >
              <TT en="invite you to the wedding of" hi="आपको विवाह में आमंत्रित करते हैं" />
            </p>

            <div className="mrm-fade mt-2 w-full" style={{ animationDelay: "1.15s" }}>
              <h1
                className="mrm-names mrm-foil leading-[1.05]"
                style={pair ? fitName(longerOf(pair), NAME_FIT) : fitName(names, NAME_FIT)}
              >
                {pair ? (
                  shouldStack(pair) ? (
                    // On one flowing line a long pair breaks after the "&" and
                    // strands it at the end of the first name's line.
                    <>
                      <span className="block">{pair[0]}</span>
                      <span className="mrm-amp block">&amp;</span>
                      <span className="block">{pair[1]}</span>
                    </>
                  ) : (
                    <>
                      {pair[0]} <span className="mrm-amp">&amp;</span> {pair[1]}
                    </>
                  )
                ) : (
                  names
                )}
              </h1>
            </div>

            {/* the rings */}
            <div className="mrm-fade" style={{ animationDelay: "1.35s" }}>
              <Rings className="h-14 w-24 sm:h-[4.5rem] sm:w-32" />
            </div>

            <div className="mrm-fade flex w-full max-w-sm items-center justify-center" style={{ animationDelay: "1.5s" }}>
              <GoldDivider className="w-56" />
            </div>

            {dateLabel ? (
              <p
                className="mrm-serif mrm-fade mt-3 text-[clamp(1rem,4.2vw,1.5rem)] font-semibold uppercase tracking-[0.14em] text-[color:var(--mrm-deep)]"
                style={{ animationDelay: "1.6s" }}
              >
                {dateLabel}
              </p>
            ) : null}
            {city ? (
              <p
                className="mrm-sans mrm-fade mt-1 text-[0.62rem] uppercase tracking-[0.34em] text-[color:var(--mrm-ink-soft)]"
                style={{ animationDelay: "1.7s" }}
              >
                {city}
              </p>
            ) : null}

            <a href={heroCta} className="mrm-btn mrm-fade mt-6" style={{ animationDelay: "1.85s" }}>
              <TT en="Celebrate with us" hi="हमारे साथ जश्न मनाइए" />
            </a>

            {/* the shore, seen through a porthole arch */}
            <div className="mrm-fade relative mt-8 w-[86%] max-w-[22rem]" style={{ animationDelay: "2.05s" }}>
              <div className="mrm-porthole-arch relative aspect-[5/4] w-full overflow-hidden">
                <ShoreScene className="absolute inset-0 h-full w-full" />
              </div>
            </div>
          </div>

          {/* the surf, running along the foot of the plate */}
          <SurfLine className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-12 w-full sm:h-14" />
        </div>
      </section>

      {/* ── GUEST WELCOME ──────────────────────────────────────────────── */}
      {family ? (
        <section className="mrm-paper relative px-6 py-24 sm:py-28">
          <RopeRule className="absolute inset-x-0 top-0 h-3.5 w-full" />
          <div className="mx-auto max-w-2xl text-center" data-tw-reveal>
            <div className="mx-auto mb-2 flex justify-center">
              <Dove className="h-16 w-24" />
            </div>
            <p className="mrm-script text-5xl text-[color:var(--mrm-rose-deep)]">
              <TT en="Peace be with you" hi="आप पर शांति हो" />
            </p>
            <h2 className="mrm-serif mt-2 text-[clamp(1.9rem,6vw,3.3rem)] text-[color:var(--mrm-deep)]">
              <T value={family} />
            </h2>
            <div className="mx-auto mt-5 flex justify-center">
              <GoldDivider className="w-56" />
            </div>
            <p className="mrm-serif mx-auto mt-6 max-w-xl text-xl italic leading-relaxed text-[color:var(--mrm-ink)]">
              <TT
                en="With grateful hearts and the blessing of our families, we invite you to the church, to the shore, and to every moment in between."
                hi="कृतज्ञ हृदय और अपने परिवारों के आशीर्वाद सहित, हम आपको गिरजाघर, समुद्र तट और बीच के हर पल में आमंत्रित करते हैं।"
              />
            </p>
            {rsvp && chip ? (
              <p className="mrm-serif mt-6 text-lg uppercase tracking-[0.24em] text-[color:var(--mrm-rose-deep)]">
                <T value={chip} />
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── OUR STORY ──────────────────────────────────────────────────── */}
      {milestones.length > 0 ? (
        <section id="story" className="mrm-paper2 relative scroll-mt-16 overflow-hidden px-6 py-24 sm:py-28">
          <Compass className="mrm-turn pointer-events-none absolute -right-20 top-12 h-64 w-64 opacity-[0.12]" />
          <div className="mx-auto max-w-4xl">
            <SectionHead over={{ en: "Our Chronicle", hi: "गाथा" }} title={{ en: "How We Set Sail", hi: "हमारी कहानी" }} />
            <div className="relative mt-16 space-y-16">
              {/* the rope spine */}
              <span
                aria-hidden
                className="mrm-rope absolute inset-y-0 left-1/2 hidden w-[3px] -translate-x-1/2 lg:block"
              />
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className={`relative lg:w-[calc(50%-2.5rem)] ${i % 2 ? "lg:ml-auto" : ""}`}
                  data-tw-reveal
                >
                  <div
                    className={`mb-4 flex justify-center lg:absolute lg:top-3 lg:mb-0 ${
                      i % 2 ? "lg:-left-16" : "lg:-right-16"
                    }`}
                  >
                    {/* A gold-ringed medallion: a shell drawn in shell ivory,
                        on shell-ivory paper, is invisible on its own. */}
                    <span className="mrm-marker flex h-12 w-12 items-center justify-center rounded-full">
                      {i % 3 === 0 ? (
                        <ScallopShell className="h-7 w-7" />
                      ) : i % 3 === 1 ? (
                        <Starfish className="h-7 w-7" />
                      ) : (
                        <Conch className="h-7 w-5" />
                      )}
                    </span>
                  </div>
                  <div className="mrm-log rounded-2xl px-6 py-6 text-center sm:px-8 sm:py-7">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--mrm-rose-deep)]">
                      {m.when}
                    </p>
                    <h3 className="mrm-serif mt-2 text-2xl text-[color:var(--mrm-deep)] sm:text-3xl">
                      <T value={m.title} />
                    </h3>
                    <div className="mx-auto mt-3 flex justify-center">
                      <GoldDivider className="w-32" />
                    </div>
                    <p className="mt-3 leading-relaxed text-[color:var(--mrm-ink)]">
                      <T value={m.text} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── FAMILIES ───────────────────────────────────────────────────── */}
      {familyMembers.length > 0 ? (
        <section id="family" className="mrm-tide relative scroll-mt-16 px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-4xl">
            <SectionHead over={{ en: "With Blessings", hi: "आशीर्वाद सहित" }} title={{ en: "Our Families", hi: "हमारे परिवार" }} />
            <div className="mt-8 flex justify-center">
              <Dove className="h-16 w-24" />
            </div>
            <div className={`mt-10 grid gap-12 ${groomFamily.length && brideFamily.length ? "md:grid-cols-2" : ""}`}>
              {[
                { list: groomFamily, en: "Groom's Family", hi: "वर पक्ष", border: brideFamily.length > 0 },
                { list: brideFamily, en: "Bride's Family", hi: "वधू पक्ष", border: false },
              ]
                .filter((g) => g.list.length > 0)
                .map((g) => (
                  <div
                    key={g.en}
                    className={`text-center ${g.border ? "md:border-r md:border-[color:var(--mrm-gold)]/30 md:pr-12" : ""}`}
                    data-tw-reveal
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--mrm-rose-deep)]">
                      <TT en={g.en} hi={g.hi} />
                    </p>
                    <div className="mt-5 space-y-4">
                      {g.list.map((m, i) => (
                        <div key={i}>
                          <h3 className="mrm-serif text-xl text-[color:var(--mrm-deep)]">
                            <T value={m.name} />
                          </h3>
                          {m.relation ? (
                            <p className="mt-0.5 text-sm italic text-[color:var(--mrm-ink-soft)]">
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
      {countdownDate ? <MiramarCountdown dateIso={countdownDate} time={config.eventTime} /> : null}

      {/* ── CELEBRATIONS ───────────────────────────────────────────────── */}
      {events.length > 0 ? (
        <section id="celebrations" className="mrm-paper2 relative scroll-mt-16 px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <SectionHead over={{ en: "The Celebrations", hi: "आयोजन" }} title={{ en: "The Order of Days", hi: "समारोह" }} />
            {!ownerPreview && rsvp ? (
              <p className="mx-auto mt-4 max-w-md text-center text-sm italic text-[color:var(--mrm-ink-soft)]">
                <TT
                  en="Only the celebrations chosen for your family appear here."
                  hi="यहाँ केवल वही आयोजन हैं जो आपके परिवार के लिए चुने गए हैं।"
                />
              </p>
            ) : null}
            <div className="mt-14 grid gap-8 sm:grid-cols-2">
              {events.map((e, i) => {
                const cal = gcalUrl(e, names);
                return (
                  <article
                    key={e.id}
                    className="mrm-event group relative overflow-hidden rounded-3xl px-7 py-8"
                    data-tw-reveal
                    style={{ animationDelay: `${(i % 2) * 0.08}s` }}
                  >
                    <div className="mrm-event-icon mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                      <CeremonyIcon name={e.name} className="h-9 w-9" />
                    </div>
                    <h3 className="mrm-serif mt-4 text-center text-3xl text-[color:var(--mrm-deep)]">
                      <T value={{ en: e.name, hi: e.nameHi ?? undefined }} />
                    </h3>
                    <div className="mt-3 flex justify-center">
                      <GoldDivider className="w-40" />
                    </div>
                    <div className="mt-4 space-y-1.5 text-center text-[11px] uppercase tracking-[0.24em] text-[color:var(--mrm-rose-deep)]">
                      {e.eventDate ? <p>{longDate(e.eventDate)}</p> : null}
                      {clockTime(e.startTime) ? (
                        <p className="text-[color:var(--mrm-ink-soft)]">{clockTime(e.startTime)}</p>
                      ) : null}
                      {e.venueName ? (
                        <p className="mrm-serif text-base normal-case tracking-normal text-[color:var(--mrm-ink)]">
                          {e.venueName}
                        </p>
                      ) : null}
                    </div>
                    {e.description ? (
                      <p className="mrm-serif mt-3 text-center text-base italic leading-relaxed text-[color:var(--mrm-ink)]">
                        <T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} />
                      </p>
                    ) : null}
                    {e.hostedByEnabled && e.hostedBy ? (
                      <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:var(--mrm-ink-soft)]">
                        <TT en="Hosted by" hi="मेज़बान" /> {e.hostedBy}
                      </p>
                    ) : null}
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {e.mapsUrl ? (
                        <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="mrm-chip">
                          <TT en="View venue" hi="स्थान देखें" />
                        </a>
                      ) : null}
                      {cal ? (
                        <a href={cal} target="_blank" rel="noopener noreferrer" className="mrm-chip">
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

      {/* ── GALLERY — the photographs, through brass portholes ─────────── */}
      {images.length > 0 ? (
        <section id="gallery" className="mrm-paper relative scroll-mt-16 px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <SectionHead over={{ en: "The Collection", hi: "संग्रह" }} title={{ en: "Our Portraits", hi: "हमारे चित्र" }} />
            <div className="mt-14 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3">
              {images.map((img, i) => {
                // Every third photograph is a round brass porthole; the rest
                // are arched plates. The mix is what keeps the wall from
                // reading as a grid of stamps.
                const round = i % 3 === 0;
                const fs = focusStyles(img.focus);
                return (
                  <figure
                    key={i}
                    className={`group relative min-w-0 ${round ? "mrm-porthole aspect-square" : "mrm-plate aspect-[3/4]"}`}
                    data-tw-reveal
                  >
                    <div className={`h-full w-full overflow-hidden ${round ? "rounded-full" : "mrm-plate-clip"}`} style={fs.zoom}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- couple-provided gallery URLs */}
                      <img
                        src={img.url}
                        alt=""
                        loading="lazy"
                        style={fs.image}
                        className="h-full w-full object-cover transition-transform duration-[2.2s] ease-out group-hover:scale-[1.05]"
                      />
                    </div>
                    {img.caption ? (
                      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[color:var(--mrm-deep-3)]/80 to-transparent px-3 pb-3 pt-10 text-center text-[10px] uppercase tracking-[0.18em] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
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

      {/* ── DETAILS + BLESSINGS ────────────────────────────────────────── */}
      {faqs.length > 0 || contacts.length > 0 ? (
        <section id="details" className="mrm-paper2 relative scroll-mt-16 px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-3xl">
            <SectionHead over={{ en: "For Our Guests", hi: "अतिथियों हेतु" }} title={{ en: "Charts & Bearings", hi: "विवरण" }} />
            <div className="mt-8 flex justify-center">
              <Compass className="h-16 w-16" />
            </div>
            <div className="mt-8 space-y-6">
              {faqs.map((f, i) => (
                <div key={i} className="mrm-card-light rounded-2xl px-6 py-5" data-tw-reveal>
                  <h3 className="mrm-serif text-xl text-[color:var(--mrm-deep)]">
                    <T value={f.q} />
                  </h3>
                  <p className="mt-2 leading-relaxed text-[color:var(--mrm-ink)]">
                    <T value={f.a} />
                  </p>
                </div>
              ))}
            </div>
            {contacts.length > 0 ? (
              <div className="mt-12 text-center" data-tw-reveal>
                <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--mrm-rose-deep)]">
                  <TT en="With love, reach us at" hi="स्नेह सहित, संपर्क करें" />
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-x-8 gap-y-2">
                  {contacts.map((c, i) => (
                    <p key={i} className="mrm-serif text-lg text-[color:var(--mrm-deep)]">
                      {c.name}
                      {c.relation ? <span className="text-[color:var(--mrm-ink-soft)]"> ({c.relation})</span> : null}
                      <span className="text-[color:var(--mrm-ink-soft)]"> · {c.phone}</span>
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
        <section id="rsvp" className="mrm-deep relative scroll-mt-16 overflow-hidden px-6 py-24 sm:py-32">
          <SurfLine className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full opacity-60" />
          <div className="relative mx-auto max-w-3xl">
            <div className="text-center" data-tw-reveal>
              <p className="mrm-script text-5xl text-[color:var(--mrm-gold-lite)]">
                <TT en="Will you join us?" hi="क्या आप पधारेंगे?" />
              </p>
              <p className="mrm-serif mt-4 text-lg italic text-[color:var(--mrm-shell)]/85">
                <TT
                  en="Your presence and blessings would make our celebration complete."
                  hi="आपकी उपस्थिति और आशीर्वाद हमारे उत्सव को पूर्ण बनाएंगे।"
                />
              </p>
              <div className="mt-6 flex justify-center">
                <GoldDivider className="w-56" />
              </div>
            </div>
            <div className="mt-12">
              {rsvp ? (
                <MiramarGroupRsvp slug={rsvp.slug} events={events} existing={rsvp.existing} onSaved={() => {}} />
              ) : selfRsvp ? (
                <MiramarSelfRsvp
                  slug={selfRsvp.slug}
                  events={selfRsvp.events}
                  existing={selfRsvp.existing}
                  onSaved={() => {}}
                />
              ) : (
                <MiramarRsvpDemo events={events} />
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="mrm-deep relative overflow-hidden px-6 pb-20 pt-24 text-center">
        <SurfLine className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full opacity-60" />
        <Lighthouse className="pointer-events-none absolute -left-6 bottom-0 h-56 w-40 opacity-40 sm:left-6 sm:h-72 sm:w-52 sm:opacity-60" />
        <div className="relative">
          <div className="mx-auto mb-5 flex justify-center">
            <Anchor className="h-20 w-14 opacity-90" />
          </div>
          <p
            className="mrm-names mrm-foil leading-[1.1]"
            style={fitName(pair ? `${pair[0]} & ${pair[1]}` : names, FOOTER_NAME_FIT)}
          >
            {pair ? `${pair[0]} & ${pair[1]}` : names}
          </p>
          {hashtag ? (
            <p className="mrm-script mt-2 text-3xl text-[color:var(--mrm-gold-lite)]">#{hashtag.replace(/^#/, "")}</p>
          ) : null}
          {dateLabel ? (
            <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-[color:var(--mrm-shell)]/60">{dateLabel}</p>
          ) : null}
          <div className="mx-auto mt-6 flex justify-center">
            <GoldDivider className="w-56 opacity-80" />
          </div>
          <p className="mrm-serif mx-auto mt-6 max-w-md text-lg italic text-[color:var(--mrm-shell)]/80">
            <TT
              en="“Whither thou goest, I will go.”"
              hi="“जहाँ तू जाएगा, वहीं मैं भी जाऊँगी।”"
            />
          </p>
          <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.34em] text-[color:var(--mrm-gold-lite)]/70">
            Ruth 1:16
          </p>
          <p className="mt-10 text-[9px] uppercase tracking-[0.3em] text-[color:var(--mrm-shell)]/40">
            <TT en="Crafted with love · Jashn" hi="प्रेम से बनाया गया · जश्न" />
          </p>
          <JashnCredit className="mt-3 text-[color:var(--mrm-gold-lite)]/50" />
        </div>
      </footer>
    </div>
  );
}

/* ── a reusable ornamented section heading ────────────────────────────────── */
function SectionHead({
  over,
  title,
}: {
  over: { en: string; hi: string };
  title: { en: string; hi: string };
}) {
  return (
    <div className="text-center" data-tw-reveal>
      <div className="mx-auto mb-4 flex justify-center">
        <HeadFlourish className="h-8 w-48" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[color:var(--mrm-rose-deep)]">
        <TT en={over.en} hi={over.hi} />
      </p>
      <h2 className="mrm-serif mt-2 text-[clamp(1.9rem,6vw,3.5rem)] text-[color:var(--mrm-deep)]">
        <TT en={title.en} hi={title.hi} />
      </h2>
      <div className="mx-auto mt-4 flex justify-center">
        <GoldDivider className="w-56" />
      </div>
    </div>
  );
}

/* ── the countdown, kept by the lighthouse ────────────────────────────────── */
function MiramarCountdown({ dateIso, time }: { dateIso: string; time?: string }) {
  const { ready, days, hours, minutes, seconds } = useCountdown(dateIso, time ? `${time}:00` : undefined);
  const units: Array<[string, string, string]> = [
    [ready ? String(days) : "—", "Days", "दिन"],
    [pad2(hours, ready), "Hours", "घंटे"],
    [pad2(minutes, ready), "Minutes", "मिनट"],
    [pad2(seconds, ready), "Seconds", "सेकंड"],
  ];
  return (
    <section className="mrm-deep relative overflow-hidden px-6 py-24 text-center sm:py-28">
      <SurfLine className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full opacity-60" />
      <Lighthouse className="pointer-events-none absolute -right-8 bottom-0 h-56 w-40 opacity-45 sm:right-4 sm:h-72 sm:w-52" />
      <div className="relative" data-tw-reveal>
        <p className="mrm-script text-5xl text-[color:var(--mrm-gold-lite)]">
          <TT en="Counting every tide" hi="हर लहर गिनते हुए" />
        </p>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-4 gap-3 sm:gap-5">
          {units.map(([v, en, hi]) => (
            <div key={en} className="mrm-count flex min-w-0 flex-col items-center rounded-2xl px-1.5 py-5 sm:px-4">
              <span className="mrm-serif mrm-glowtext text-[clamp(1.7rem,8vw,3.6rem)] font-semibold leading-none tabular-nums">
                {v}
              </span>
              <span className="mt-2 text-[8px] font-semibold uppercase tracking-[0.24em] text-[color:var(--mrm-shell)]/75 sm:text-[10px] sm:tracking-[0.28em]">
                <TT en={en} hi={hi} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
