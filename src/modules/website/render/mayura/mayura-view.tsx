"use client";

import { useEffect, useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { T, TT } from "../bilingual";
import { focusStyles } from "../image-focus";
import { MotionProvider } from "../experience/motion";
import { useCountdown, pad2 } from "../use-countdown";
import {
  MandalaArch,
  Finial,
  HeadFlourish,
  Ganesha,
  Mandala,
  Lotus,
  Kalash,
  Diya,
  PeacockFeather,
  MarigoldToran,
  GoldDivider,
  CornerVine,
  Peacock,
  HangingLamp,
  MandapScene,
  Couple,
  FeatherFall,
  CeremonyIcon,
} from "./ornaments";
import {
  MayuraGroupRsvp,
  MayuraSelfRsvp,
  MayuraRsvpDemo,
} from "./mayura-rsvp";

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

/* ══════════════════════════════════════════════════════════════════════════ */
export function MayuraView({
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
    <MotionProvider>
      <div className="myr" data-lang={lang} style={theme.vars}>
        {/* peacock feathers drift over the whole site */}
        <FeatherFall className="pointer-events-none fixed inset-0 z-[3] overflow-hidden" />

        {/* ── NAVIGATION ─────────────────────────────────────────────────── */}
        <header
          className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
            scrolled ? "myr-nav-on" : "bg-transparent"
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
            <a href="#top" className="myr-script text-2xl text-[color:var(--myr-teal)]" aria-label={names}>
              {pair ? `${pair[0][0]} & ${pair[1][0]}` : names}
            </a>
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
              {links.map(([href, en, hi]) => (
                <a key={href} href={href} className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--myr-ink)] transition-colors hover:text-[color:var(--myr-pink)]">
                  <TT en={en} hi={hi} />
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-1 lg:flex">
                {(["en", "hi"] as const).map((l) => (
                  <button key={l} type="button" onClick={() => setLang(l)}
                    className={`px-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors ${lang === l ? "text-[color:var(--myr-pink)]" : "text-[color:var(--myr-ink-soft)] hover:text-[color:var(--myr-teal)]"}`}>
                    {l === "en" ? "EN" : "हिं"}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setMenu(true)} className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--myr-teal)] lg:hidden" aria-expanded={menu}>
                Menu
              </button>
            </div>
          </div>
        </header>

        {menu ? (
          <div className="fixed inset-0 z-[70] flex flex-col bg-[color:var(--myr-ivory)] p-6 duration-300 animate-in fade-in" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="flex items-center justify-between">
              <span className="myr-script text-3xl text-[color:var(--myr-teal)]">{pair ? `${pair[0][0]} & ${pair[1][0]}` : names}</span>
              <button type="button" onClick={() => setMenu(false)} className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--myr-teal)]">Close</button>
            </div>
            <nav className="mt-16 flex flex-col items-center gap-8" aria-label="Primary mobile">
              {links.map(([href, en, hi], i) => (
                <a key={href} href={href} onClick={() => setMenu(false)} className="myr-serif text-3xl text-[color:var(--myr-teal)] duration-500 animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: `${90 + i * 70}ms` }}>
                  <TT en={en} hi={hi} />
                </a>
              ))}
              <div className="mt-4 flex gap-3">
                {(["en", "hi"] as const).map((l) => (
                  <button key={l} type="button" onClick={() => setLang(l)}
                    className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-widest ${lang === l ? "border-[color:var(--myr-gold)] text-[color:var(--myr-pink)]" : "border-[color:var(--myr-ink-soft)]/30 text-[color:var(--myr-ink-soft)]"}`}>
                    {l === "en" ? "English" : "हिंदी"}
                  </button>
                ))}
              </div>
            </nav>
            <div className="mx-auto mt-auto"><GoldDivider className="w-52" /></div>
          </div>
        ) : null}

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section id="top" className="myr-hero relative flex min-h-svh flex-col overflow-hidden">
          <div className="myr-frameline pointer-events-none absolute inset-2.5 z-[1] sm:inset-4" />
          <MandalaArch className="pointer-events-none absolute inset-x-1 top-1 bottom-0 z-0 h-full w-[calc(100%-0.5rem)] opacity-90" />
          <MarigoldToran className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 w-full" />
          <Finial className="myr-fade pointer-events-none absolute left-1/2 top-2 z-10 h-20 w-20 -translate-x-1/2 sm:top-3 sm:h-24 sm:w-24" />
          <CornerVine className="pointer-events-none absolute left-3 top-3 z-[2] h-14 w-14 opacity-70 sm:left-5 sm:top-5 sm:h-20 sm:w-20" />
          <CornerVine className="pointer-events-none absolute right-3 top-3 z-[2] h-14 w-14 -scale-x-100 opacity-70 sm:right-5 sm:top-5 sm:h-20 sm:w-20" />
          <Peacock side="left" className="myr-sway pointer-events-none absolute left-0 top-[15%] z-10 h-[40vh] w-[33vw] max-h-[500px] max-w-[250px] origin-top sm:h-[58vh] sm:w-[38vw]" />
          <Peacock side="right" className="myr-sway-alt pointer-events-none absolute right-0 top-[15%] z-10 h-[40vh] w-[33vw] max-h-[500px] max-w-[250px] origin-top sm:h-[58vh] sm:w-[38vw]" />

          <div className="relative z-20 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-8 pb-8 pt-28 text-center sm:pt-32">
            <div className="myr-fade" style={{ animationDelay: "0.5s" }}>
              <Ganesha className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
            <p className="myr-sans myr-fade mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-[color:var(--myr-teal)]/85" style={{ animationDelay: "0.9s" }}>
              <TT en="Together with their families" hi="अपने परिवारों सहित" />
            </p>
            <p className="myr-sans myr-fade mt-2 text-[0.7rem] uppercase tracking-[0.34em] text-[color:var(--myr-ink-soft)]" style={{ animationDelay: "1.05s" }}>
              <TT en="invite you to the wedding of" hi="आपको विवाह में आमंत्रित करते हैं" />
            </p>

            <div className="myr-fade mt-3" style={{ animationDelay: "1.2s" }}>
              <h1 className="myr-names myr-foil text-[clamp(3rem,16vw,6rem)] leading-[1]">
                {pair ? (
                  <>
                    {pair[0]} <span className="myr-amp">&amp;</span> {pair[1]}
                  </>
                ) : (
                  names
                )}
              </h1>
            </div>

            <div className="myr-fade mt-4 flex w-full max-w-sm items-center justify-center" style={{ animationDelay: "1.5s" }}>
              <GoldDivider className="w-64" />
            </div>

            {dateLabel ? (
              <p className="myr-serif myr-fade mt-4 text-[clamp(1.1rem,4.5vw,1.6rem)] font-semibold uppercase tracking-[0.16em] text-[color:var(--myr-teal)]" style={{ animationDelay: "1.65s" }}>
                {dateLabel}
              </p>
            ) : null}
            {city ? (
              <p className="myr-sans myr-fade mt-1 text-xs uppercase tracking-[0.4em] text-[color:var(--myr-ink-soft)]" style={{ animationDelay: "1.75s" }}>
                {city}
              </p>
            ) : null}

            <a href={heroCta} className="myr-btn myr-fade mt-7" style={{ animationDelay: "1.9s" }}>
              <TT en="Celebrate with us" hi="हमारे साथ जश्न मनाइए" />
            </a>

            {/* golden mandap + couple scene */}
            <div className="myr-scene myr-fade relative mt-8 w-full max-w-md" style={{ animationDelay: "2.1s" }}>
              <div className="myr-scene-sky relative aspect-[5/4] w-full overflow-hidden rounded-t-[999px]">
                <MandapScene className="absolute inset-0 h-full w-full" />
                <Couple className="absolute inset-x-0 bottom-0 mx-auto h-[64%] w-auto" />
              </div>
            </div>
          </div>

          <HangingLamp className="myr-lantern pointer-events-none absolute bottom-4 left-2 z-10 h-28 w-14 origin-top sm:left-5 sm:h-36 sm:w-16" />
          <HangingLamp className="myr-lantern-alt pointer-events-none absolute bottom-4 right-2 z-10 h-28 w-14 origin-top sm:right-5 sm:h-36 sm:w-16" />
        </section>

        {/* ── GUEST WELCOME ──────────────────────────────────────────────── */}
        {family ? (
          <section className="myr-ivory relative px-6 py-24 sm:py-28">
            <div className="myr-ribbon absolute inset-x-0 top-0" />
            <CornerVine className="absolute left-4 top-8 h-16 w-16 opacity-70" />
            <CornerVine className="absolute right-4 top-8 h-16 w-16 -scale-x-100 opacity-70" />
            <CornerVine className="absolute bottom-4 left-4 h-16 w-16 -scale-y-100 opacity-70" />
            <CornerVine className="absolute bottom-4 right-4 h-16 w-16 -scale-100 opacity-70" />
            <div className="mx-auto max-w-2xl text-center" data-tw-reveal>
              <p className="myr-script text-5xl text-[color:var(--myr-pink)]">
                <TT en="Namaste" hi="नमस्ते" />
              </p>
              <h2 className="myr-serif mt-2 text-[clamp(2rem,6vw,3.4rem)] text-[color:var(--myr-teal)]">
                <T value={family} />
              </h2>
              <div className="mx-auto mt-5 flex justify-center"><GoldDivider className="w-56" /></div>
              <p className="myr-serif mx-auto mt-6 max-w-xl text-xl italic leading-relaxed text-[color:var(--myr-ink)]">
                <TT
                  en="With immense joy and the blessings of our families, we invite you to join us as we begin our forever."
                  hi="अपार हर्ष और परिवारों के आशीर्वाद सहित, हम आपको अपने साथ इस नई शुरुआत में सम्मिलित होने के लिए आमंत्रित करते हैं।"
                />
              </p>
              {rsvp && chip ? (
                <p className="myr-serif mt-6 text-lg uppercase tracking-[0.24em] text-[color:var(--myr-pink)]">
                  <T value={chip} />
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* ── OUR STORY ──────────────────────────────────────────────────── */}
        {milestones.length > 0 ? (
          <section id="story" className="myr-ivory2 relative scroll-mt-16 overflow-hidden px-6 py-24 sm:py-28">
            <Mandala className="myr-spin pointer-events-none absolute -right-24 top-10 h-72 w-72 opacity-[0.14]" />
            <div className="mx-auto max-w-4xl">
              <SectionHead over={{ en: "Our Chronicle", hi: "गाथा" }} title={{ en: "Our Love Story", hi: "हमारी प्रेम कहानी" }} />
              <div className="relative mt-16 space-y-16">
                <span aria-hidden className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[color:var(--myr-gold)]/50 to-transparent lg:block" />
                {milestones.map((m, i) => (
                  <div key={i} className={`relative lg:w-[46%] ${i % 2 ? "lg:ml-auto lg:text-left" : "lg:text-right"}`} data-tw-reveal>
                    <div className={`mb-3 flex ${i % 2 ? "lg:justify-start" : "lg:justify-end"} justify-center`}>
                      <PeacockFeather className="h-10 w-6" />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--myr-pink)]">{m.when}</p>
                    <h3 className="myr-serif mt-2 text-3xl text-[color:var(--myr-teal)]"><T value={m.title} /></h3>
                    <p className="mt-3 leading-relaxed text-[color:var(--myr-ink)]"><T value={m.text} /></p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── FAMILIES ───────────────────────────────────────────────────── */}
        {familyMembers.length > 0 ? (
          <section id="family" className="myr-tint relative scroll-mt-16 px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-4xl">
              <SectionHead over={{ en: "With Blessings", hi: "आशीर्वाद सहित" }} title={{ en: "Our Families", hi: "हमारे परिवार" }} />
              <div className="mt-8 flex justify-center"><Kalash className="h-20 w-16" /></div>
              <div className={`mt-10 grid gap-12 ${groomFamily.length && brideFamily.length ? "md:grid-cols-2" : ""}`}>
                {[{ list: groomFamily, en: "Groom's Family", hi: "वर पक्ष", border: brideFamily.length > 0 }, { list: brideFamily, en: "Bride's Family", hi: "वधू पक्ष", border: false }]
                  .filter((g) => g.list.length > 0)
                  .map((g) => (
                    <div key={g.en} className={`text-center ${g.border ? "md:border-r md:border-[color:var(--myr-gold)]/30 md:pr-12" : ""}`} data-tw-reveal>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--myr-pink)]">
                        <TT en={g.en} hi={g.hi} />
                      </p>
                      <div className="mt-5 space-y-4">
                        {g.list.map((m, i) => (
                          <div key={i}>
                            <h3 className="myr-serif text-xl text-[color:var(--myr-teal)]"><T value={m.name} /></h3>
                            {m.relation ? <p className="mt-0.5 text-sm italic text-[color:var(--myr-ink-soft)]"><T value={m.relation} /></p> : null}
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
        {countdownDate ? <MayuraCountdown dateIso={countdownDate} time={config.eventTime} /> : null}

        {/* ── CELEBRATIONS — royal invitation cards ──────────────────────── */}
        {events.length > 0 ? (
          <section id="celebrations" className="myr-ivory2 relative scroll-mt-16 px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-5xl">
              <SectionHead over={{ en: "The Celebrations", hi: "आयोजन" }} title={{ en: "Wedding Events", hi: "विवाह समारोह" }} />
              {!ownerPreview && rsvp ? (
                <p className="mx-auto mt-4 max-w-md text-center text-sm italic text-[color:var(--myr-ink-soft)]">
                  <TT en="Only the celebrations chosen for your family appear here." hi="यहाँ केवल वही आयोजन हैं जो आपके परिवार के लिए चुने गए हैं।" />
                </p>
              ) : null}
              <div className="mt-14 grid gap-8 sm:grid-cols-2">
                {events.map((e, i) => {
                  const cal = gcalUrl(e, names);
                  return (
                    <article key={e.id} className="myr-event group relative overflow-hidden rounded-3xl px-7 py-8" data-tw-reveal style={{ animationDelay: `${(i % 2) * 0.08}s` }}>
                      <CornerVine className="pointer-events-none absolute right-2 top-2 h-14 w-14 opacity-40" />
                      <div className="myr-event-icon mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                        <CeremonyIcon name={e.name} className="h-9 w-9" />
                      </div>
                      <h3 className="myr-serif mt-4 text-center text-3xl text-[color:var(--myr-teal)]">
                        <T value={{ en: e.name, hi: e.nameHi ?? undefined }} />
                      </h3>
                      <div className="mt-3 flex justify-center"><GoldDivider className="w-40" /></div>
                      <div className="mt-4 space-y-1.5 text-center text-[11px] uppercase tracking-[0.26em] text-[color:var(--myr-pink)]">
                        {e.eventDate ? <p>{longDate(e.eventDate)}</p> : null}
                        {timeLabel(e.startTime) ? <p className="text-[color:var(--myr-ink-soft)]">{timeLabel(e.startTime)}</p> : null}
                        {e.venueName ? <p className="myr-serif text-base normal-case tracking-normal text-[color:var(--myr-ink)]">{e.venueName}</p> : null}
                      </div>
                      {e.description ? (
                        <p className="myr-serif mt-3 text-center text-base italic leading-relaxed text-[color:var(--myr-ink)]">
                          <T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} />
                        </p>
                      ) : null}
                      {e.hostedByEnabled && e.hostedBy ? (
                        <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:var(--myr-ink-soft)]">
                          <TT en="Hosted by" hi="मेज़बान" /> {e.hostedBy}
                        </p>
                      ) : null}
                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {e.mapsUrl ? (
                          <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="myr-chip">
                            <TT en="View venue" hi="स्थान देखें" />
                          </a>
                        ) : null}
                        {cal ? (
                          <a href={cal} target="_blank" rel="noopener noreferrer" className="myr-chip">
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
          <section id="gallery" className="myr-ivory relative scroll-mt-16 px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-5xl">
              <SectionHead over={{ en: "The Collection", hi: "संग्रह" }} title={{ en: "Our Portraits", hi: "हमारे चित्र" }} />
              <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {images.map((img, i) => {
                  const span = i % 5 === 0 ? "col-span-2 lg:col-span-2 aspect-[3/2]" : "aspect-[3/4]";
                  const fs = focusStyles(img.focus);
                  return (
                    <figure key={i} className={`myr-frame group relative overflow-hidden rounded-2xl ${span}`} data-tw-reveal>
                      <div className="h-full w-full" style={fs.zoom}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- couple-provided gallery URLs */}
                        <img src={img.url} alt="" loading="lazy" style={fs.image} className="h-full w-full object-cover transition-transform duration-[2.2s] ease-out group-hover:scale-[1.05]" />
                      </div>
                      {img.caption ? (
                        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[color:var(--myr-teal-3)]/75 to-transparent px-3 pb-2 pt-8 text-[11px] uppercase tracking-[0.18em] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
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
          <section id="details" className="myr-ivory2 relative scroll-mt-16 px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-3xl">
              <SectionHead over={{ en: "For Our Guests", hi: "अतिथियों हेतु" }} title={{ en: "Details & Blessings", hi: "विवरण एवं आशीर्वाद" }} />
              <div className="mt-8 flex justify-center"><Lotus className="h-12 w-20" /></div>
              <div className="mt-8 space-y-8">
                {faqs.map((f, i) => (
                  <div key={i} className="myr-card-light rounded-2xl px-6 py-5" data-tw-reveal>
                    <h3 className="myr-serif text-xl text-[color:var(--myr-teal)]"><T value={f.q} /></h3>
                    <p className="mt-2 leading-relaxed text-[color:var(--myr-ink)]"><T value={f.a} /></p>
                  </div>
                ))}
              </div>
              {contacts.length > 0 ? (
                <div className="mt-12 text-center" data-tw-reveal>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[color:var(--myr-pink)]">
                    <TT en="With love, reach us at" hi="स्नेह सहित, संपर्क करें" />
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-x-8 gap-y-2">
                    {contacts.map((c, i) => (
                      <p key={i} className="myr-serif text-lg text-[color:var(--myr-teal)]">
                        {c.name}
                        {c.relation ? <span className="text-[color:var(--myr-ink-soft)]"> ({c.relation})</span> : null}
                        <span className="text-[color:var(--myr-ink-soft)]"> · {c.phone}</span>
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
          <section id="rsvp" className="myr-deep relative scroll-mt-16 overflow-hidden px-6 py-24 sm:py-32">
            <MarigoldToran className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full opacity-90" />
            <div className="relative mx-auto max-w-3xl">
              <div className="text-center" data-tw-reveal>
                <p className="myr-script text-5xl text-[color:var(--myr-gold-lite)]">
                  <TT en="Will you join us?" hi="क्या आप पधारेंगे?" />
                </p>
                <p className="myr-serif mt-4 text-lg italic text-[color:var(--myr-champagne)]/85">
                  <TT en="Your presence would make our celebration complete." hi="आपकी उपस्थिति हमारे उत्सव को पूर्ण बनाएगी।" />
                </p>
                <div className="mt-6 flex justify-center"><GoldDivider className="w-56" /></div>
              </div>
              <div className="mt-12">
                {rsvp ? (
                  <MayuraGroupRsvp slug={rsvp.slug} events={events} existing={rsvp.existing} onSaved={() => {}} />
                ) : selfRsvp ? (
                  <MayuraSelfRsvp slug={selfRsvp.slug} events={selfRsvp.events} existing={selfRsvp.existing} onSaved={() => {}} />
                ) : (
                  <MayuraRsvpDemo events={events} />
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <footer className="myr-deep relative overflow-hidden px-6 py-20 text-center">
          <div className="myr-ribbon absolute inset-x-0 top-0" />
          <div className="relative">
            <div className="mx-auto mb-6 flex justify-center"><Diya className="h-16 w-20" /></div>
            <p className="myr-names myr-foil text-[clamp(2.4rem,10vw,4rem)]">
              {pair ? `${pair[0]} & ${pair[1]}` : names}
            </p>
            {hashtag ? <p className="myr-script mt-2 text-3xl text-[color:var(--myr-gold-lite)]">#{hashtag.replace(/^#/, "")}</p> : null}
            {dateLabel ? <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-[color:var(--myr-champagne)]/60">{dateLabel}</p> : null}
            {quote ? (
              <p className="myr-serif mx-auto mt-6 max-w-md text-lg italic text-[color:var(--myr-champagne)]/80">
                &ldquo;<T value={quote} />&rdquo;
              </p>
            ) : null}
            <p className="mt-10 text-[9px] uppercase tracking-[0.3em] text-[color:var(--myr-champagne)]/40">
              <TT en="Crafted with love · Jashn" hi="प्रेम से बनाया गया · जश्न" />
            </p>
            <JashnCredit className="mt-3 text-[color:var(--myr-gold-lite)]/50" />
          </div>
        </footer>
      </div>
    </MotionProvider>
  );
}

/* ── a reusable ornamented section heading ────────────────────────────────── */
function SectionHead({ over, title }: { over: { en: string; hi: string }; title: { en: string; hi: string } }) {
  return (
    <div className="text-center" data-tw-reveal>
      <div className="mx-auto mb-4 flex justify-center"><HeadFlourish className="h-8 w-48" /></div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-[color:var(--myr-pink)]">
        <TT en={over.en} hi={over.hi} />
      </p>
      <h2 className="myr-serif mt-2 text-[clamp(2rem,6vw,3.6rem)] text-[color:var(--myr-teal)]">
        <TT en={title.en} hi={title.hi} />
      </h2>
      <div className="mx-auto mt-4 flex justify-center"><GoldDivider className="w-56" /></div>
    </div>
  );
}

/* ── a glowing ceremonial countdown ───────────────────────────────────────── */
function MayuraCountdown({ dateIso, time }: { dateIso: string; time?: string }) {
  const { ready, days, hours, minutes, seconds } = useCountdown(dateIso, time ? `${time}:00` : undefined);
  const units: Array<[string, string, string]> = [
    [ready ? String(days) : "—", "Days", "दिन"],
    [pad2(hours, ready), "Hours", "घंटे"],
    [pad2(minutes, ready), "Minutes", "मिनट"],
    [pad2(seconds, ready), "Seconds", "सेकंड"],
  ];
  return (
    <section className="myr-deep relative overflow-hidden px-6 py-24 text-center sm:py-28">
      <MarigoldToran className="pointer-events-none absolute inset-x-0 top-0 h-14 w-full opacity-90" />
      <div className="relative" data-tw-reveal>
        <p className="myr-script text-5xl text-[color:var(--myr-gold-lite)]">
          <TT en="Counting every moment" hi="हर पल गिनते हुए" />
        </p>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-4 gap-3 sm:gap-5">
          {units.map(([v, en, hi]) => (
            <div key={en} className="myr-count flex flex-col items-center rounded-2xl px-2 py-5 sm:px-4">
              <span className="myr-serif myr-glowtext text-[clamp(2rem,9vw,4rem)] font-semibold leading-none tabular-nums">{v}</span>
              <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-[color:var(--myr-champagne)]/75 sm:text-[10px]">
                <TT en={en} hi={hi} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
