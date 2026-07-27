"use client";

import { useState } from "react";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { T, TT } from "../bilingual";
import { splitNames, longDate, clockTime, weekday, compactDate, gcalUrl } from "../format";
import {
  useGroupRsvp,
  useSelfRsvp,
  type ExistingSelfRsvp,
  type ExistingGroupRsvp,
} from "../use-rsvp";
import { useCountdown, pad2 } from "../use-countdown";

/* ── Decorative helpers ───────────────────────────────────────────────────── */

// A word that rises up from behind a mask on mount — the opening flourish.
function Rise({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="v-mask">
      <span className="v-rise" style={{ animationDelay: `${delay}ms` }}>{children}</span>
    </span>
  );
}

// Hanging monogram seal — a slowly rotating filigree ring around the initials.
// v-in (fade) and v-sway (rotate) live on separate elements so their `animation`
// shorthands don't clobber each other.
function VowSeal({ initials }: { initials: string }) {
  return (
    <div className="v-in mb-9 flex justify-center" style={{ animationDelay: "120ms" }}>
      <div className="v-sway flex flex-col items-center">
        <span className="h-9 w-px bg-[color:var(--v-champ)]" aria-hidden />
        <div className="relative mt-1.5 flex h-24 w-24 items-center justify-center">
          <svg className="v-spin absolute inset-0 h-full w-full" viewBox="0 0 100 100" fill="none" stroke="var(--v-champ)" aria-hidden>
            <circle cx="50" cy="50" r="47" strokeWidth="1" strokeDasharray="2 5" />
            <circle cx="50" cy="50" r="38" strokeWidth="0.8" />
          </svg>
          <span className="v-serif text-2xl tracking-[0.1em] text-[color:var(--v-olive)]">{initials}</span>
        </div>
      </div>
    </div>
  );
}

// Drifting champagne motes over the opening — deterministic so SSR stays stable.
const V_MOTES = [
  { l: "6%", s: 6, d: 17, x: "26px", delay: "0s" },
  { l: "18%", s: 4, d: 22, x: "-18px", delay: "3s" },
  { l: "31%", s: 7, d: 19, x: "34px", delay: "6s" },
  { l: "47%", s: 4, d: 25, x: "-24px", delay: "1.5s" },
  { l: "58%", s: 6, d: 20, x: "20px", delay: "8s" },
  { l: "71%", s: 5, d: 23, x: "-30px", delay: "4s" },
  { l: "84%", s: 7, d: 18, x: "22px", delay: "10s" },
  { l: "93%", s: 4, d: 26, x: "-16px", delay: "2s" },
] as const;

function VowDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {V_MOTES.map((m, i) => (
        <span
          key={i}
          className="v-dust"
          style={{ left: m.l, width: m.s, height: m.s, animationDuration: `${m.d}s`, animationDelay: m.delay, ["--dx" as string]: m.x }}
        />
      ))}
    </div>
  );
}

// A small self-drawing botanical sprig — a quiet ornament under section titles.
function VowSprig() {
  return (
    <svg className="v-draw mx-auto mt-6 h-6 w-40 text-[color:var(--v-champ)]" viewBox="0 0 160 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden>
      <line x1="0" y1="12" x2="60" y2="12" style={{ ["--len" as string]: 60 }} />
      <path d="M80 4 C86 8 86 16 80 20 C74 16 74 8 80 4 Z" style={{ ["--len" as string]: 44 }} />
      <line x1="100" y1="12" x2="160" y2="12" style={{ ["--len" as string]: 60 }} />
    </svg>
  );
}

export function VowView(props: WebsiteViewProps) {
  const { names, dateLabel, countdownDate, events, config, chip, rsvp, selfRsvp, ownerPreview } = props;
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [menu, setMenu] = useState(false);

  const pair = splitNames(names);
  const milestones = config.story?.milestones ?? [];
  const familyMembers = config.family?.members ?? [];
  const groomFamily = familyMembers.filter((m) => m.side !== "bride");
  const brideFamily = familyMembers.filter((m) => m.side === "bride");
  const images = config.gallery?.images ?? [];
  const contacts = config.footer?.contacts ?? [];
  const venues = events.filter((e) => e.venueName);
  const hasRsvp = Boolean(rsvp || selfRsvp || ownerPreview);
  const family = rsvp && chip ? chip : ownerPreview ? { en: "Sharma Family", hi: "शर्मा परिवार" } : null;
  const initials = names.split(" & ").map((n) => n[0]).join(" / ");
  const sealInitials = pair ? `${pair[0]?.[0] ?? ""} & ${pair[1]?.[0] ?? ""}` : names.slice(0, 2);
  const city = venues[0]?.venueAddress?.split(",").pop()?.trim();

  const links: Array<[string, string, string]> = [];
  if (milestones.length) links.push(["#story", "Story", "कहानी"]);
  if (familyMembers.length) links.push(["#family", "Family", "परिवार"]);
  if (events.length) links.push(["#weekend", "Weekend", "आयोजन"]);
  if (venues.length) links.push(["#location", "Location", "स्थान"]);
  if (images.length) links.push(["#gallery", "Gallery", "गैलरी"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);

  return (
    <div className="vow" data-lang={lang}>
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-black/8 bg-[color:var(--v-white)]/92 backdrop-blur-sm">
        {/* pt clears the notch / dynamic island when saved to a home screen */}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
          <a href="#top" className="v-serif shrink-0 text-base tracking-[0.24em] sm:text-lg sm:tracking-[0.3em]">{initials}</a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {links.map(([href, en, hi]) => <a key={href} href={href} className="v-link text-[11px] font-medium uppercase tracking-[0.25em] text-black/60 transition-colors hover:text-black"><TT en={en} hi={hi} /></a>)}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 md:flex">
              {(["en", "hi"] as const).map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={`px-1.5 text-[11px] font-medium uppercase ${lang === l ? "text-black" : "text-black/35"}`}>{l === "en" ? "EN" : "हिं"}</button>)}
            </div>
            <button type="button" onClick={() => setMenu(true)} className="text-[11px] font-medium uppercase tracking-[0.25em] md:hidden">Menu</button>
          </div>
        </div>
      </header>

      {menu ? (
        <div className="fixed inset-0 z-[70] flex flex-col justify-center gap-5 overflow-y-auto bg-[color:var(--v-white)] px-8 py-24 duration-300 animate-in fade-in" role="dialog" aria-modal="true">
          <button type="button" onClick={() => setMenu(false)} className="absolute right-6 top-[max(1.5rem,env(safe-area-inset-top))] text-xs font-medium uppercase tracking-widest">Close</button>
          {links.map(([href, en, hi]) => <a key={href} href={href} onClick={() => setMenu(false)} className="v-serif text-[clamp(2.25rem,11vw,3rem)] leading-tight"><TT en={en} hi={hi} /></a>)}
          {/* The desktop bar hides its language switch below md — without this,
            * phone guests have no way to read the site in Hindi. */}
          <div className="mt-6 flex items-center gap-5 border-t border-black/10 pt-6">
            {(["en", "hi"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} className={`text-xs font-medium uppercase tracking-[0.25em] ${lang === l ? "text-black underline underline-offset-4" : "text-black/40"}`}>
                {l === "en" ? "English" : "हिंदी"}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* OPENING / HERO — huge names + vertical photo, B&W → colour */}
      <section id="top" className="relative overflow-hidden px-6 pb-20 pt-28 sm:px-10">
        <VowDust />
        {/* soft champagne halo behind the monogram */}
        <div className="pointer-events-none absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full opacity-50" style={{ background: "radial-gradient(circle, var(--v-champ), transparent 70%)", filter: "blur(48px)" }} aria-hidden />
        <div className="relative mx-auto max-w-6xl text-center">
          <VowSeal initials={sealInitials} />
          <p className="v-in flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em] text-black/50 sm:gap-4 sm:text-[11px] sm:tracking-[0.4em]" style={{ animationDelay: "260ms" }}>
            <span className="h-px w-5 bg-black/25 sm:w-8" aria-hidden /><TT en="The wedding of" hi="विवाह" /><span className="h-px w-5 bg-black/25 sm:w-8" aria-hidden />
          </p>
          {/* Below sm the names stack with an ampersand between them — set side by
            * side they overflow any phone. From sm up they flank the portrait. */}
          <div className="mt-6 flex flex-col items-center gap-1 sm:mt-7 sm:flex-row sm:justify-center sm:gap-8">
            <h1 className="v-name v-serif w-full text-[clamp(2.5rem,15vw,10rem)] font-medium leading-[1.05] tracking-tight sm:w-auto sm:text-[clamp(3rem,12vw,10rem)] sm:leading-none"><Rise delay={340}>{pair ? pair[0] : names}</Rise></h1>
            {pair ? (
              <>
                <span className="flex items-center gap-3 py-1 sm:hidden" aria-hidden>
                  <span className="h-px w-9 bg-[color:var(--v-champ)]" />
                  <span className="v-serif text-xl italic text-[color:var(--v-sage)]">&amp;</span>
                  <span className="h-px w-9 bg-[color:var(--v-champ)]" />
                </span>
                <div className="relative hidden h-64 w-24 shrink-0 overflow-hidden sm:block lg:h-96 lg:w-40" data-tw-reveal>
                  <span className="pointer-events-none absolute inset-1 z-10 border border-[color:var(--v-champ)]/70" aria-hidden />
                  {images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- couple hero portrait
                    <img src={images[0].url} alt="" data-vcolor className="h-full w-full object-cover" />
                  ) : (
                    <div data-vcolor className="h-full w-full" style={{ background: "linear-gradient(150deg,#7e9278,#354438 70%,#181818)" }} />
                  )}
                </div>
                <h1 className="v-name v-serif w-full text-[clamp(2.5rem,15vw,10rem)] font-medium leading-[1.05] tracking-tight sm:w-auto sm:text-[clamp(3rem,12vw,10rem)] sm:leading-none"><Rise delay={520}>{pair[1]}</Rise></h1>
              </>
            ) : null}
          </div>
          <p className="v-in mt-7 text-[10px] font-medium uppercase tracking-[0.24em] text-black/60 sm:mt-8 sm:text-[11px] sm:tracking-[0.4em]" style={{ animationDelay: "700ms" }}>{longDate(countdownDate, true) || dateLabel}{city ? ` · ${city}` : ""}</p>
          <p className="v-script v-in mt-4 text-[clamp(1.65rem,7vw,3rem)] leading-[1.15] text-[color:var(--v-sage)]" style={{ animationDelay: "820ms" }}><TT en="We saved you a seat." hi="हमने आपके लिए एक जगह रखी है।" /></p>
          {hasRsvp ? <a href="#rsvp" className="v-btn v-in mt-8 inline-block border border-black px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.25em] sm:mt-9 sm:px-9 sm:py-4 sm:text-[11px] sm:tracking-[0.3em]" style={{ animationDelay: "940ms" }}><TT en="Open invitation" hi="निमंत्रण खोलें" /></a> : null}
          <div className="v-in mt-12 flex flex-col items-center gap-3 text-[10px] font-medium uppercase tracking-[0.3em] text-black/40 sm:mt-16" style={{ animationDelay: "1100ms" }} aria-hidden>
            <TT en="Scroll" hi="नीचे" />
            <span className="v-cue-line block h-10 w-px bg-black/30" />
          </div>
        </div>
      </section>

      {/* HERO STATEMENT — colourising band */}
      <section className="relative overflow-hidden">
        <div data-vcolor className="relative flex min-h-[70vh] items-center justify-center" style={{ background: "linear-gradient(160deg,#354438 0%,#7e9278 60%,#d8c2a0 120%)" }}>
          <div className="px-6 text-center">
            <h2 className="v-serif text-[clamp(2.8rem,9vw,7rem)] font-medium leading-[0.95] text-white" data-tw-reveal>
              <TT en="Forever" hi="हमेशा" /><br /><TT en="starts" hi="यहीं से" /><br /><span className="v-foil italic"><TT en="here." hi="शुरू।" /></span>
            </h2>
            <p className="mt-6 text-sm uppercase tracking-[0.3em] text-white/80" data-tw-reveal>{names}</p>
            {family ? <p className="mx-auto mt-4 max-w-md text-white/85" data-tw-reveal><T value={family} />, <TT en="we would love for you to be there." hi="हम चाहते हैं कि आप वहाँ हों।" /></p> : null}
          </div>
        </div>
      </section>

      {/* STORY — in their own words */}
      {milestones.length > 0 ? (
        <section id="story" className="scroll-mt-20 px-6 py-28 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="text-center" data-tw-reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-black/50"><TT en="In their" hi="उन्हीं के" /></p>
              <h2 className="v-serif mt-1 text-[clamp(2.2rem,6vw,4rem)] font-medium"><TT en="own words" hi="शब्दों में" /></h2>
            </div>
            <div className="mt-16 space-y-14">
              {milestones.map((m, i) => (
                <div key={i} className={`max-w-xl ${i % 2 ? "ml-auto text-right" : ""}`} data-tw-reveal>
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/45">{m.when}</p>
                  <h3 className="v-serif mt-1 text-2xl font-medium">{typeof m.title === "object" ? <T value={m.title} /> : m.title}</h3>
                  <p className="v-serif mt-3 text-2xl italic leading-snug text-black/75">“<T value={m.text} />”</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* VOWS — editable placeholder */}
      <section className="border-y border-black/10 px-6 py-28 sm:px-10">
        <div className="mx-auto max-w-2xl text-center" data-tw-reveal>
          <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-black/50"><TT en="A few words" hi="कुछ शब्द" /></p>
          <h2 className="v-serif mt-1 text-[clamp(2rem,5vw,3.2rem)] font-medium"><TT en="before forever" hi="हमेशा से पहले" /></h2>
          <VowSprig />
          <p className="v-serif mt-8 text-[clamp(1.4rem,3.4vw,2.2rem)] italic leading-relaxed text-black/80">
            <TT
              en="“I choose the ordinary mornings, the difficult days, and every version of the life we are yet to build.”"
              hi="“मैं चुनता हूँ वे साधारण सुबहें, वे कठिन दिन, और उस जीवन का हर रूप जिसे हम अभी बनाना बाक़ी है।”"
            />
          </p>
          <p className="v-script mt-6 text-4xl text-[color:var(--v-sage)]">{names}</p>
        </div>
      </section>

      {/* FAMILY */}
      {familyMembers.length > 0 ? (
        <section id="family" className="scroll-mt-20 border-t border-black/10 px-6 py-28 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="text-center" data-tw-reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-black/50"><TT en="With the blessings of" hi="आशीर्वाद सहित" /></p>
              <h2 className="v-serif mt-1 text-[clamp(2rem,5vw,3.2rem)] font-medium"><TT en="our families" hi="हमारे परिवार" /></h2>
            </div>
            <div className={`mt-16 grid gap-12 ${groomFamily.length && brideFamily.length ? "sm:grid-cols-2 sm:divide-x sm:divide-black/12" : ""}`}>
              {groomFamily.length > 0 ? (
                <div className="text-center sm:px-8" data-tw-reveal>
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/45"><TT en="Groom's Family" hi="वर पक्ष" /></p>
                  <div className="mt-6 space-y-4">
                    {groomFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="v-serif text-xl font-medium"><T value={m.name} /></h3>
                        {m.relation ? <p className="mt-0.5 text-sm italic text-black/55"><T value={m.relation} /></p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {brideFamily.length > 0 ? (
                <div className="text-center sm:px-8" data-tw-reveal>
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/45"><TT en="Bride's Family" hi="वधू पक्ष" /></p>
                  <div className="mt-6 space-y-4">
                    {brideFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="v-serif text-xl font-medium"><T value={m.name} /></h3>
                        {m.relation ? <p className="mt-0.5 text-sm italic text-black/55"><T value={m.relation} /></p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* COUNTDOWN — minimal */}
      {countdownDate ? <VowCountdown dateIso={countdownDate} /> : null}

      {/* EVENTS — the wedding weekend */}
      {events.length > 0 ? (
        <section id="weekend" className="scroll-mt-20 px-6 py-28 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="text-center" data-tw-reveal>
              <h2 className="v-serif text-[clamp(2.2rem,6vw,4rem)] font-medium"><TT en="The Wedding Weekend" hi="विवाह सप्ताहांत" /></h2>
            </div>
            <div className="mt-16 divide-y divide-black/12">
              {events.map((e) => {
                const cal = gcalUrl(e, names);
                return (
                  <div key={e.id} className="group grid gap-4 py-8 sm:grid-cols-[1fr_2fr_auto] sm:items-baseline" data-tw-reveal>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/45">{weekday(e.eventDate)}</p>
                      {e.startTime ? <p className="v-serif text-3xl font-medium">{clockTime(e.startTime)}</p> : null}
                    </div>
                    <div>
                      <h3 className="v-serif text-3xl font-medium"><T value={{ en: e.name, hi: e.nameHi ?? undefined }} /></h3>
                      {e.venueName ? <p className="mt-1 text-sm uppercase tracking-[0.15em] text-black/60">{e.venueName}</p> : null}
                      {e.description ? <p className="mt-1 text-sm italic text-black/55"><T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} /></p> : null}
                      {e.hostedByEnabled && e.hostedBy ? <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-black/45"><TT en="Hosted by" hi="मेज़बान" /> {e.hostedBy}</p> : null}
                    </div>
                    <div className="flex gap-4 text-[11px] font-medium uppercase tracking-[0.2em]">
                      {e.mapsUrl ? <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="border-b border-black/30 pb-0.5 hover:border-black"><TT en="Directions" hi="दिशा" /></a> : null}
                      {cal ? <a href={cal} target="_blank" rel="noopener noreferrer" className="border-b border-black/30 pb-0.5 hover:border-black"><TT en="Calendar" hi="कैलेंडर" /></a> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* LOCATION */}
      {venues.length > 0 ? (
        <section id="location" className="scroll-mt-20 px-6 py-28 sm:px-10" style={{ background: "var(--v-olive)" }}>
          <div className="mx-auto max-w-4xl text-[color:var(--v-white)]">
            <h2 className="v-serif text-[clamp(2.4rem,7vw,5rem)] font-medium leading-none" data-tw-reveal><TT en="Meet us" hi="हमसे मिलिए" /> <span className="italic text-[color:var(--v-champ)]">{city ? `in ${city}` : "there"}</span></h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {["Stay", "Arrive", "Celebrate"].map((x, i) => (
                <div key={x} data-tw-reveal>
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[color:var(--v-champ)]"><TT en={x} hi={["ठहरें", "पहुँचें", "जश्न"][i]} /></p>
                  <p className="mt-2 text-sm text-white/70">{venues[i]?.venueName ?? venues[0]?.venueName}</p>
                </div>
              ))}
            </div>
            {venues[0]?.mapsUrl ? <a href={venues[0].mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-10 inline-block border border-[color:var(--v-champ)] px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[color:var(--v-champ)] transition-colors hover:bg-[color:var(--v-champ)] hover:text-[color:var(--v-olive)]"><TT en="Open in maps" hi="मैप खोलें" /></a> : null}
          </div>
        </section>
      ) : null}

      {/* GALLERY */}
      {images.length > 0 ? (
        <section id="gallery" className="scroll-mt-20 px-6 py-28 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end justify-between" data-tw-reveal>
              <h2 className="v-serif text-[clamp(2rem,6vw,4rem)] font-medium"><TT en="Us," hi="हम," /> <span className="italic"><TT en="lately" hi="इन दिनों" /></span></h2>
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-black/40">01 / {String(images.length).padStart(2, "0")}</span>
            </div>
            <div className="mt-12 space-y-16">
              {images.map((img, i) => (
                <figure key={i} className={i % 3 === 0 ? "" : "mx-auto max-w-2xl"} data-tw-reveal>
                  <div className={`overflow-hidden ${i % 3 === 0 ? "aspect-[16/9]" : "aspect-[4/5]"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- couple gallery URLs */}
                    <img src={img.url} alt="" loading="lazy" data-vcolor className="h-full w-full object-cover" />
                  </div>
                  <figcaption className="mt-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.25em] text-black/50">
                    <span>{img.caption ? <T value={img.caption} /> : names}</span>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {hasRsvp ? (
        <section id="rsvp" className="scroll-mt-20 border-t border-black/10 px-6 py-28 sm:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="v-serif text-[clamp(2.4rem,7vw,4.5rem)] font-medium leading-none" data-tw-reveal><TT en="Will we" hi="क्या हम" /> <span className="italic"><TT en="see you there?" hi="आपसे मिलेंगे?" /></span></h2>
            {family ? <p className="mt-4 text-sm uppercase tracking-[0.3em] text-black/55" data-tw-reveal><T value={family} /></p> : null}
            <div className="mt-14 text-left">
              {rsvp ? <VowGroupRsvp slug={rsvp.slug} events={events} existing={rsvp.existing} date={countdownDate} /> : selfRsvp ? <VowSelfRsvp slug={selfRsvp.slug} events={selfRsvp.events} existing={selfRsvp.existing} date={countdownDate} /> : <VowRsvpDemo events={events} />}
            </div>
          </div>
        </section>
      ) : null}

      {/* FOOTER */}
      <footer className="bg-[color:var(--v-black)] px-6 py-16 text-center text-[color:var(--v-white)]">
        <p className="v-serif text-4xl font-medium">{names}</p>
        <p className="v-script v-foil mt-2 text-4xl">{compactDate(countdownDate, ".") || dateLabel}</p>
        {contacts.length ? <p className="mt-6 text-sm text-white/55">{contacts.map((c) => `${c.name}${c.relation ? ` (${c.relation})` : ""} · ${c.phone}`).join("   ")}</p> : null}
        <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-white/40"><TT en="Forever starts here · Jashn" hi="हमेशा यहीं से · जश्न" /></p>
        <JashnCredit className="mt-3 text-white/35" />
      </footer>
    </div>
  );
}

/* ── RSVP ─────────────────────────────────────────────────────────────────── */
function VowChoice({ on, tone, onClick, disabled, children }: { on: boolean; tone: "yes" | "no"; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  const idle = "border-black/25 text-black/60 hover:border-black";
  const active = tone === "yes" ? "border-black bg-black text-white" : "border-[color:var(--v-grey)] bg-[color:var(--v-grey)] text-white";
  return <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick} className={`flex-1 border px-4 py-3 text-[11px] font-medium uppercase tracking-[0.2em] transition-all ${on ? active : idle} ${disabled ? "cursor-default opacity-60" : ""}`}>{children}</button>;
}

function VowGroupRsvp({ slug, events, existing, date }: { slug: string; events: WebsiteViewProps["events"]; existing: ExistingGroupRsvp; date: string | null }) {
  const r = useGroupRsvp(slug, events, existing);
  const numField = "w-20 border border-black/25 bg-transparent px-3 py-2 text-center focus:border-black focus:outline-none";

  if (r.done) {
    const summary = events.filter((e) => r.entries[e.id]?.attending).map((e) => `${e.name}: ${r.entries[e.id].partySize}`).join(" · ");
    return (
      <div className="space-y-3 text-center">
        <p className="v-serif text-3xl italic"><TT en="We can't wait to see you." hi="हमें आपका इंतज़ार है।" /><span className="mt-2 block text-base not-italic tracking-[0.3em] text-black/50">{compactDate(date, ".")}</span></p>
        <p className="text-sm text-black/50">{summary || <TT en="Not attending" hi="नहीं आ रहे" />}</p>
        <button type="button" onClick={r.edit} className="text-[11px] uppercase tracking-[0.3em] text-black/50 underline underline-offset-4 hover:text-black"><TT en="Edit my RSVP" hi="उत्तर बदलें" /></button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {r.error ? <p className="text-center text-sm text-[color:var(--v-grey)]" role="alert">{r.error}</p> : null}
      {events.map((e) => {
        const en = r.entries[e.id] ?? { attending: true, partySize: 1 };
        return (
          <div key={e.id}>
            <h3 className="v-serif text-2xl font-medium"><T value={{ en: e.name, hi: e.nameHi ?? undefined }} /></h3>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <VowChoice on={en.attending} tone="yes" onClick={() => r.setAttending(e.id, true)}><TT en="Yes, with love" hi="जी, प्रेम सहित" /></VowChoice>
              <VowChoice on={!en.attending} tone="no" onClick={() => r.setAttending(e.id, false)}><TT en="Unable to attend" hi="नहीं आ पाएँगे" /></VowChoice>
              {en.attending ? (
                <label className="flex items-center gap-2 text-sm text-black/60">
                  <TT en="How many?" hi="कितने?" />
                  <input type="number" min={1} max={50} value={en.partySize} onChange={(ev) => r.setSize(e.id, Number(ev.target.value))} className={numField} />
                </label>
              ) : null}
            </div>
          </div>
        );
      })}
      <button type="button" onClick={r.submit} disabled={r.pending} className="w-full bg-black px-6 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-white disabled:opacity-60">{r.pending ? "…" : r.saved ? <TT en="Save changes" hi="बदलाव सहेजें" /> : <TT en="Send RSVP" hi="उत्तर भेजें" />}</button>
    </div>
  );
}

function VowSelfRsvp({ slug, events, existing, date }: { slug: string; events: { id: string; name: string }[]; existing?: ExistingSelfRsvp | null; date: string | null }) {
  const r = useSelfRsvp(slug, events.map((e) => e.id), existing);
  if (r.done) return (
    <div className="space-y-3 text-center">
      <p className="v-serif text-center text-3xl italic"><TT en="We can't wait to see you." hi="हमें आपका इंतज़ार है।" /><span className="mt-2 block text-base not-italic tracking-[0.3em] text-black/50">{compactDate(date, ".")}</span></p>
      <p className="text-sm text-black/50">{r.savedRsvp?.name} · {r.savedRsvp?.partySize} <TT en="guest(s)" hi="अतिथि" /></p>
      <button type="button" onClick={r.edit} className="text-[11px] uppercase tracking-[0.3em] text-black/50 underline underline-offset-4 hover:text-black"><TT en="Edit my RSVP" hi="उत्तर बदलें" /></button>
    </div>
  );
  const field = "w-full border-b border-black/30 bg-transparent px-1 py-3 focus:border-black focus:outline-none";
  return (
    <div className="mx-auto max-w-md space-y-5">
      {r.error ? <p className="text-center text-sm text-[color:var(--v-grey)]" role="alert">{r.error}</p> : null}
      <input type="text" value={r.name} maxLength={120} onChange={(e) => r.setName(e.target.value)} placeholder="Your name" className={field} />
      <input type="number" min={1} max={50} value={r.size} onChange={(e) => r.setSize(Number(e.target.value))} className={field} />
      <div className="grid gap-2 sm:grid-cols-2">{events.map((e) => <VowChoice key={e.id} on={r.selected.has(e.id)} tone="yes" onClick={() => r.toggle(e.id)}>{e.name}</VowChoice>)}</div>
      <button type="button" onClick={r.submit} disabled={r.pending} className="w-full bg-black px-6 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-white disabled:opacity-60">{r.pending ? "…" : r.savedRsvp ? <TT en="Save changes" hi="बदलाव सहेजें" /> : <TT en="Send RSVP" hi="उत्तर भेजें" />}</button>
    </div>
  );
}

function VowRsvpDemo({ events }: { events: WebsiteViewProps["events"] }) {
  return (
    <div className="space-y-8">
      {events.slice(0, 2).map((e) => (
        <div key={e.id}>
          <h3 className="v-serif text-2xl font-medium">{e.name}</h3>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <VowChoice on tone="yes" disabled><TT en="Yes, with love" hi="जी, प्रेम सहित" /></VowChoice>
            <VowChoice on={false} tone="no" disabled><TT en="Unable to attend" hi="नहीं" /></VowChoice>
            <span className="border border-black/25 px-4 py-2 text-sm text-black/50"><TT en="2 guests" hi="2 अतिथि" /></span>
          </div>
        </div>
      ))}
      <p className="text-center text-sm italic text-black/50"><TT en="Your families will RSVP with a headcount here." hi="आपके परिवार यहाँ संख्या के साथ उत्तर देंगे।" /></p>
    </div>
  );
}

function VowCountdown({ dateIso }: { dateIso: string }) {
  const { ready, days, hours, minutes, seconds } = useCountdown(dateIso, "16:00:00");
  const units: Array<[string, string, string]> = [
    [ready ? String(days) : "—", "Days", "दिन"],
    [pad2(hours, ready), "Hrs", "घंटे"],
    [pad2(minutes, ready), "Min", "मिनट"],
    [pad2(seconds, ready), "Sec", "सेकंड"],
  ];
  return (
    <section className="px-6 py-28 text-center sm:px-10" data-tw-reveal>
      <p className="mb-10 text-[11px] font-medium uppercase tracking-[0.4em] text-black/45"><TT en="Counting the days" hi="दिन गिनते हुए" /></p>
      <div className="mx-auto flex max-w-2xl items-center justify-center">
        {units.map(([v, en, hi], i) => (
          <div key={en} className="flex items-center">
            <div className="flex flex-col items-center px-3 sm:px-8">
              <span className="v-serif text-[clamp(2.6rem,10vw,5.5rem)] font-medium leading-none tabular-nums">{v}</span>
              <span className="mt-3 text-[10px] font-medium uppercase tracking-[0.35em] text-black/45"><TT en={en} hi={hi} /></span>
            </div>
            {i < units.length - 1 ? <span className="v-pulse v-serif -mt-6 text-[clamp(2rem,7vw,4rem)] leading-none text-[color:var(--v-champ)]">·</span> : null}
          </div>
        ))}
      </div>
      <p className="v-serif mt-10 text-xl italic text-black/60"><TT en="until forever." hi="हमेशा तक।" /></p>
    </section>
  );
}
