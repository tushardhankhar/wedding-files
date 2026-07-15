"use client";

import { useState } from "react";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { T, TT } from "../bilingual";
import { splitNames, longDate, clockTime, compactDate, gcalUrl } from "../format";
import { useGroupRsvp, useSelfRsvp } from "../use-rsvp";
import { useCountdown, pad2 } from "../use-countdown";

/* A big abstract Gulmohar bloom — fashion-campaign floral, not stock. */
function Bloom({ className, colors = ["#F05243", "#E31364", "#FF9E1B"] }: { className?: string; colors?: string[] }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((a, i) => (
        <path
          key={a}
          d="M50 50 C 40 22 60 22 50 4 C 40 22 60 22 50 50 Z"
          transform={`rotate(${a} 50 50)`}
          fill={colors[i % colors.length]}
          opacity={0.92}
        />
      ))}
      <circle cx="50" cy="50" r="9" fill="#FF9E1B" />
      <circle cx="50" cy="50" r="4" fill="#24151D" opacity="0.5" />
    </svg>
  );
}

const EVENT_BG = [
  "linear-gradient(150deg, #ff9e1b 0%, #f05243 120%)", // marigold
  "linear-gradient(150deg, #287a4d 0%, #e31364 140%)", // leaf + pink
  "linear-gradient(150deg, #702963 0%, #e31364 130%)", // electric plum
  "linear-gradient(150deg, #f05243 0%, #fff7ea 160%)", // coral + cream
  "linear-gradient(150deg, #24151d 0%, #e31364 150%)", // ink + hot pink
];
const EVENT_INK = ["#24151d", "#fff7ea", "#fff7ea", "#24151d", "#fff7ea"];

const NAV_ACCENT = ["#E31364", "#F05243", "#FF9E1B", "#287A4D", "#702963", "#F23838"];

export function GulmoharView(props: WebsiteViewProps) {
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
  const hashtag = config.footer?.hashtag;
  const venues = events.filter((e) => e.venueName);
  const hasRsvp = Boolean(rsvp || selfRsvp || ownerPreview);
  const family = rsvp && chip ? chip : ownerPreview ? { en: "Sharma Family", hi: "शर्मा परिवार" } : null;

  const links: Array<[string, string, string]> = [];
  if (milestones.length) links.push(["#story", "Our Thing", "हमारी कहानी"]);
  if (familyMembers.length) links.push(["#family", "The Fam", "परिवार"]);
  if (events.length) links.push(["#party", "The Party", "आयोजन"]);
  if (images.length) links.push(["#looks", "The Looks", "गैलरी"]);
  if (venues.length) links.push(["#place", "The Place", "स्थान"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP!", "उत्तर"]);

  const initials = names.split(" & ").map((n) => n[0]).join(" + ");

  return (
    <div className="gul" data-lang={lang}>
      {/* NAV — floating editorial pill */}
      <header className="fixed inset-x-0 top-4 z-40 px-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-[color:var(--g-ink)]/10 bg-[color:var(--g-cream)]/90 py-2 pl-5 pr-2 shadow-[0_10px_30px_-16px_rgba(36,21,29,.4)] backdrop-blur-md">
          <a href="#top" className="g-serif text-lg font-semibold italic text-[color:var(--g-pink)]">{initials}</a>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {links.map(([href, en, hi], i) => (
              <a key={href} href={href} className="text-[11px] font-bold uppercase tracking-widest transition-colors" style={{ color: "var(--g-ink)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = NAV_ACCENT[i % NAV_ACCENT.length])}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--g-ink)")}>
                <TT en={en} hi={hi} />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 md:flex">
              {(["en", "hi"] as const).map((l) => (
                <button key={l} type="button" onClick={() => setLang(l)}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${lang === l ? "bg-[color:var(--g-pink)] text-white" : "text-[color:var(--g-ink)]/50"}`}>
                  {l === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setMenu(true)} className="rounded-full bg-[color:var(--g-pink)] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white md:hidden">Menu</button>
          </div>
        </div>
      </header>

      {menu ? (
        <div className="fixed inset-0 z-[70] flex flex-col justify-center gap-6 bg-[color:var(--g-pink)] p-8 duration-300 animate-in fade-in md:hidden" role="dialog" aria-modal="true">
          <button type="button" onClick={() => setMenu(false)} className="absolute right-6 top-6 text-sm font-bold uppercase tracking-widest text-white">Close</button>
          {links.map(([href, en, hi], i) => (
            <a key={href} href={href} onClick={() => setMenu(false)} className="g-serif text-5xl font-semibold italic"
              style={{ color: ["#FFD8DA", "#FF9E1B", "#FFF7EA", "#FFD8DA", "#FF9E1B"][i % 5] }}>
              <TT en={en} hi={hi} />
            </a>
          ))}
          <div className="mt-4 flex gap-3">
            {(["en", "hi"] as const).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} className="rounded-full border border-white/60 px-4 py-1.5 text-xs font-bold uppercase text-white">
                {l === "en" ? "English" : "हिंदी"}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* OPENING / HERO — colour + huge type + blooms cutting across */}
      <section id="top" className="relative overflow-hidden px-6 pb-24 pt-32 sm:px-10" style={{ background: "var(--g-pink)" }}>
        <Bloom className="g-spin absolute -right-16 -top-10 h-72 w-72 opacity-90" />
        <Bloom className="absolute -bottom-16 -left-12 h-56 w-56 opacity-80" colors={["#FF9E1B", "#FFD8DA", "#F05243"]} />
        <div className="relative mx-auto max-w-5xl text-[color:var(--g-cream)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em]" data-tw-reveal>
            <TT en="We're getting married!" hi="हम शादी कर रहे हैं!" />
          </p>
          {pair ? (
            <div className="mt-4">
              <h1 className="g-serif text-[clamp(3.5rem,15vw,11rem)] font-semibold leading-[0.86]" data-tw-reveal>{pair[0]}</h1>
              <div className="my-1 flex items-center gap-4" data-tw-reveal>
                <span className="g-serif text-[clamp(2rem,6vw,4rem)] italic text-[color:var(--g-marigold)]">&amp;</span>
                <span className="h-2 flex-1 rounded-full bg-[color:var(--g-marigold)]" style={{ animation: "gul-wipe 1s ease-out both" }} />
              </div>
              <h1 className="g-serif text-right text-[clamp(3.5rem,15vw,11rem)] font-semibold leading-[0.86]" data-tw-reveal>{pair[1]}</h1>
            </div>
          ) : (
            <h1 className="g-serif mt-4 text-[clamp(3rem,12vw,9rem)] font-semibold leading-[0.9]">{names}</h1>
          )}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4" data-tw-reveal>
            <div>
              <p className="g-serif text-3xl italic">{compactDate(countdownDate) || dateLabel}</p>
              {venues[0]?.venueName ? <p className="text-xs font-bold uppercase tracking-[0.3em]">{venues[0].venueName}</p> : null}
            </div>
            <p className="max-w-xs text-sm text-[color:var(--g-blush)]">
              <TT en="…and you're absolutely invited." hi="…और आप ज़रूर आमंत्रित हैं।" />
            </p>
          </div>
          {hasRsvp ? (
            <a href="#rsvp" className="mt-10 inline-block rounded-full bg-[color:var(--g-cream)] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[color:var(--g-pink)] transition-transform hover:-translate-y-0.5">
              <TT en="Let's celebrate" hi="चलो जश्न मनाएँ" />
            </a>
          ) : null}
        </div>
      </section>

      {/* GUEST WELCOME */}
      {family ? (
        <section className="px-6 py-24 sm:px-10" style={{ background: "var(--g-marigold)" }}>
          <div className="mx-auto max-w-4xl text-[color:var(--g-ink)]">
            <p className="g-serif text-[clamp(2.5rem,9vw,6rem)] font-semibold leading-none" data-tw-reveal>
              <TT en="Hey," hi="अरे," />
            </p>
            <p className="g-serif text-[clamp(2.5rem,9vw,6rem)] font-semibold leading-none text-[color:var(--g-plum)]" data-tw-reveal>
              <T value={family} />!
            </p>
            <p className="g-serif mt-8 max-w-xl text-2xl italic leading-snug" data-tw-reveal>
              <TT en="We saved you a spot on the dance floor." hi="हमने डांस फ़्लोर पर आपके लिए जगह रखी है।" />
            </p>
            {rsvp && rsvp.guests.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2" data-tw-reveal>
                {rsvp.guests.map((g, i) => (
                  <span key={g.id} className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ background: NAV_ACCENT[i % NAV_ACCENT.length] }}>{g.name}</span>
                ))}
              </div>
            ) : null}
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em]" data-tw-reveal>
              <TT en="Here are the celebrations with your name on them ↓" hi="यहाँ हैं आपके नाम वाले आयोजन ↓" />
            </p>
          </div>
        </section>
      ) : null}

      {/* STORY — magazine couple interview */}
      {milestones.length > 0 ? (
        <section id="story" className="scroll-mt-24 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <h2 className="g-serif text-center text-[clamp(2.5rem,8vw,5.5rem)] font-semibold leading-none text-[color:var(--g-pink)]" data-tw-reveal>
              <TT en="How did" hi="यह सब" /> <span className="italic text-[color:var(--g-plum)]"><TT en="this happen?" hi="कैसे हुआ?" /></span>
            </h2>
            <div className="mt-16 space-y-12">
              {milestones.map((m, i) => (
                <div key={i} className={`flex flex-col gap-3 ${i % 2 ? "items-end text-right" : "items-start"}`} data-tw-reveal>
                  <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white" style={{ background: NAV_ACCENT[i % NAV_ACCENT.length] }}>{m.when}</span>
                  <h3 className="g-serif text-3xl font-semibold text-[color:var(--g-ink)]"><T value={m.title} /></h3>
                  <p className="g-serif max-w-lg text-2xl italic leading-snug text-[color:var(--g-ink)]/80">“<T value={m.text} />”</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAMILY — the people who made this happen */}
      {familyMembers.length > 0 ? (
        <section id="family" className="scroll-mt-24 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <h2 className="g-serif text-center text-[clamp(2.5rem,8vw,5.5rem)] font-semibold leading-none text-[color:var(--g-pink)]" data-tw-reveal>
              <TT en="With love from" hi="प्रेम सहित" /> <span className="italic text-[color:var(--g-plum)]"><TT en="our families" hi="हमारे परिवार" /></span>
            </h2>
            <div className={`mt-16 grid gap-12 ${groomFamily.length && brideFamily.length ? "sm:grid-cols-2" : ""}`}>
              {groomFamily.length > 0 ? (
                <div data-tw-reveal>
                  <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white" style={{ background: "var(--g-pink)" }}>
                    <TT en="Groom's Family" hi="वर पक्ष" />
                  </span>
                  <div className="mt-6 space-y-4">
                    {groomFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="g-serif text-2xl font-semibold text-[color:var(--g-ink)]"><T value={m.name} /></h3>
                        {m.relation ? <p className="text-sm italic text-[color:var(--g-ink)]/60"><T value={m.relation} /></p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {brideFamily.length > 0 ? (
                <div data-tw-reveal>
                  <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white" style={{ background: "var(--g-plum)" }}>
                    <TT en="Bride's Family" hi="वधू पक्ष" />
                  </span>
                  <div className="mt-6 space-y-4">
                    {brideFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="g-serif text-2xl font-semibold text-[color:var(--g-ink)]"><T value={m.name} /></h3>
                        {m.relation ? <p className="text-sm italic text-[color:var(--g-ink)]/60"><T value={m.relation} /></p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* COUNTDOWN */}
      {countdownDate ? <GulCountdown dateIso={countdownDate} /> : null}

      {/* EVENTS — festival posters */}
      {events.length > 0 ? (
        <section id="party" className="scroll-mt-24">
          <div className="px-6 py-16 text-center sm:px-10">
            <h2 className="g-serif text-[clamp(2.5rem,8vw,5rem)] font-semibold text-[color:var(--g-pink)]" data-tw-reveal>
              <TT en="The Party Plan" hi="जश्न का कार्यक्रम" />
            </h2>
          </div>
          {events.map((e, i) => {
            const cal = gcalUrl(e, names);
            const ink = EVENT_INK[i % EVENT_INK.length];
            return (
              <article key={e.id} className="relative overflow-hidden px-6 py-24 sm:px-10" style={{ background: EVENT_BG[i % EVENT_BG.length], color: ink }}>
                <Bloom className="absolute -right-10 top-6 h-40 w-40 opacity-40" colors={["#fff", "#FFD8DA", "#FF9E1B"]} />
                <div className="relative mx-auto max-w-5xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-80" data-tw-reveal>{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="g-serif text-[clamp(3rem,12vw,8rem)] font-semibold uppercase leading-[0.85]" data-tw-reveal>
                    <T value={{ en: e.name, hi: e.nameHi ?? undefined }} />
                  </h3>
                  {e.description ? (
                    <p className="g-serif mt-4 max-w-lg text-2xl italic leading-snug" data-tw-reveal><T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} /></p>
                  ) : null}
                  <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3" data-tw-reveal>
                    {e.eventDate ? (
                      <div><dt className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70"><TT en="When" hi="कब" /></dt><dd className="mt-1 font-semibold">{longDate(e.eventDate)}{e.startTime ? ` · ${clockTime(e.startTime)}` : ""}</dd></div>
                    ) : null}
                    {e.venueName ? (
                      <div><dt className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70"><TT en="Where" hi="कहाँ" /></dt><dd className="mt-1 font-semibold">{e.venueName}</dd></div>
                    ) : null}
                  </dl>
                  <div className="mt-8 flex flex-wrap gap-3" data-tw-reveal>
                    {e.mapsUrl ? <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest" style={{ borderColor: ink, color: ink }}><TT en="Map" hi="नक़्शा" /></a> : null}
                    {cal ? <a href={cal} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest" style={{ borderColor: ink, color: ink }}><TT en="Calendar" hi="कैलेंडर" /></a> : null}
                    {hasRsvp ? <a href="#rsvp" className="rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest" style={{ background: ink, color: EVENT_BG[i % EVENT_BG.length].includes("#24151d") ? "#e31364" : "#fff" }}>RSVP</a> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {/* GALLERY — horizontal editorial wall */}
      {images.length > 0 ? (
        <section id="looks" className="scroll-mt-24 overflow-hidden py-24" style={{ background: "var(--g-plum)" }}>
          <div className="px-6 sm:px-10">
            <h2 className="g-serif max-w-2xl text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-none text-[color:var(--g-cream)]" data-tw-reveal>
              <TT en="Proof we actually" hi="सबूत कि हम सच में" /> <span className="italic text-[color:var(--g-marigold)]"><TT en="like each other." hi="एक-दूसरे को पसंद करते हैं।" /></span>
            </h2>
          </div>
          <div className="mt-12 flex gap-5 overflow-x-auto px-6 pb-6 sm:px-10" style={{ scrollSnapType: "x mandatory" }}>
            {images.map((img, i) => (
              <figure key={i} className="shrink-0" style={{ scrollSnapAlign: "center" }}>
                <div className="relative h-[62vh] w-[78vw] overflow-hidden rounded-2xl sm:w-[420px]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- couple gallery URLs */}
                  <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="g-serif absolute left-4 top-3 text-5xl font-semibold text-white/90 drop-shadow">{String(i + 1).padStart(2, "0")}</span>
                </div>
                {img.caption ? <figcaption className="mt-3 max-w-[420px] text-sm font-semibold text-[color:var(--g-cream)]"><T value={img.caption} /></figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* VENUE */}
      {venues.length > 0 ? (
        <section id="place" className="scroll-mt-24 px-6 py-24 sm:px-10" style={{ background: "var(--g-coral)" }}>
          <div className="mx-auto max-w-4xl text-[color:var(--g-cream)]">
            <h2 className="g-serif text-[clamp(2.5rem,9vw,6rem)] font-semibold leading-none" data-tw-reveal>
              <TT en="Where's" hi="कहाँ है" /> <span className="italic"><TT en="the party?" hi="जश्न?" /></span>
            </h2>
            <div className="mt-10 space-y-8">
              {venues.map((v) => (
                <div key={v.id} data-tw-reveal>
                  <h3 className="g-serif text-3xl font-semibold">{v.venueName}</h3>
                  {v.venueAddress ? <p className="mt-1 text-[color:var(--g-blush)]">{v.venueAddress}</p> : null}
                  {v.mapsUrl ? (
                    <a href={v.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-[color:var(--g-cream)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[color:var(--g-coral)]">
                      <TT en="Take me there →" hi="मुझे वहाँ ले चलो →" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {hasRsvp ? (
        <section id="rsvp" className="scroll-mt-24 px-6 py-28 sm:px-10" style={{ background: "var(--g-ink)" }}>
          <div className="mx-auto max-w-3xl text-[color:var(--g-cream)]">
            <h2 className="g-serif text-[clamp(2.8rem,10vw,6.5rem)] font-semibold leading-none" data-tw-reveal>
              <TT en="So…" hi="तो…" />
              <br /><span className="italic text-[color:var(--g-pink)]"><TT en="are you coming or what?" hi="आ रहे हैं या नहीं?" /></span>
            </h2>
            <div className="mt-14">
              {rsvp ? <GulGroupRsvp slug={rsvp.slug} events={events} guests={rsvp.guests} initial={rsvp.statuses} family={family} /> : selfRsvp ? <GulSelfRsvp slug={selfRsvp.slug} events={selfRsvp.events} /> : <GulRsvpDemo events={events} />}
            </div>
          </div>
        </section>
      ) : null}

      {/* FOOTER */}
      <footer className="px-6 py-16 text-center sm:px-10" style={{ background: "var(--g-pink)" }}>
        <Bloom className="mx-auto h-20 w-20" colors={["#FFF7EA", "#FF9E1B", "#FFD8DA"]} />
        <p className="g-serif mt-4 text-4xl font-semibold text-[color:var(--g-cream)]">{names}</p>
        {hashtag ? <p className="g-script text-3xl text-[color:var(--g-marigold)]">#{hashtag.replace(/^#/, "")}</p> : null}
        {contacts.length ? <p className="mt-4 text-sm text-[color:var(--g-blush)]">{contacts.map((c) => `${c.name}${c.relation ? ` (${c.relation})` : ""} · ${c.phone}`).join("   ")}</p> : null}
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--g-cream)]/70"><TT en="Made with joy · Jashn" hi="ख़ुशी से बनाया गया · जश्न" /></p>
        <JashnCredit className="mt-3 text-[color:var(--g-cream)]/55" />
      </footer>
    </div>
  );
}

/* ── RSVP controls ────────────────────────────────────────────────────────── */
function GulChoice({ on, tone, onClick, disabled, children }: { on: boolean; tone: "yes" | "no"; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  const base = "flex-1 rounded-full border-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-all";
  const idle = "border-[color:var(--g-cream)]/30 text-[color:var(--g-cream)]/70 hover:border-[color:var(--g-cream)]";
  const active = tone === "yes" ? "border-[color:var(--g-marigold)] bg-[color:var(--g-marigold)] text-[color:var(--g-ink)]" : "border-[color:var(--g-plum)] bg-[color:var(--g-plum)] text-white";
  return <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick} className={`${base} ${on ? active : idle} ${disabled ? "cursor-default opacity-60" : ""}`}>{children}</button>;
}

function GulGroupRsvp({ slug, events, guests, initial, family }: { slug: string; events: WebsiteViewProps["events"]; guests: { id: string; name: string }[]; initial: Record<string, Record<string, "attending" | "declined">>; family: { en: string; hi?: string } | null }) {
  const { state, error, saved, choose } = useGroupRsvp(slug, initial);
  return (
    <div className="space-y-12">
      {error ? <p className="text-sm text-[color:var(--g-marigold)]" role="alert">{error}</p> : null}
      {events.map((e) => (
        <div key={e.id}>
          <h3 className="g-serif text-3xl font-semibold text-[color:var(--g-cream)]"><T value={{ en: e.name, hi: e.nameHi ?? undefined }} /></h3>
          <div className="mt-4 space-y-3">
            {guests.map((g) => (
              <div key={g.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="g-serif w-28 shrink-0 text-lg italic">{g.name}</span>
                <div className="flex flex-1 gap-2">
                  <GulChoice on={state[e.id]?.[g.id] === "attending"} tone="yes" onClick={() => choose(e.id, g.id, "attending")}><TT en="Absolutely" hi="बिल्कुल" /></GulChoice>
                  <GulChoice on={state[e.id]?.[g.id] === "declined"} tone="no" onClick={() => choose(e.id, g.id, "declined")}><TT en="Dancing from home" hi="घर से नाचूँगा" /></GulChoice>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {saved ? <p className="g-serif text-2xl italic text-[color:var(--g-marigold)]"><TT en="Yesss. We've got you" hi="बढ़िया! हमने नोट कर लिया" />{family ? `, ${family.en}` : ""}. <TT en="See you on the dance floor." hi="डांस फ़्लोर पर मिलते हैं।" /></p> : null}
    </div>
  );
}

function GulSelfRsvp({ slug, events }: { slug: string; events: { id: string; name: string }[] }) {
  const r = useSelfRsvp(slug, events.map((e) => e.id));
  if (r.done) return <p className="g-serif text-3xl italic text-[color:var(--g-marigold)]"><TT en="Yesss! See you on the dance floor 💃" hi="बढ़िया! डांस फ़्लोर पर मिलते हैं 💃" /></p>;
  const field = "w-full rounded-full border-2 border-[color:var(--g-cream)]/30 bg-transparent px-5 py-3 text-[color:var(--g-cream)] placeholder:text-[color:var(--g-cream)]/40 focus:border-[color:var(--g-marigold)] focus:outline-none";
  return (
    <div className="max-w-xl space-y-5">
      {r.error ? <p className="text-sm text-[color:var(--g-marigold)]" role="alert">{r.error}</p> : null}
      <input type="text" value={r.name} maxLength={120} onChange={(e) => r.setName(e.target.value)} placeholder="Your name" className={field} />
      <input type="number" min={1} max={50} value={r.size} onChange={(e) => r.setSize(Number(e.target.value))} className={field} />
      <div className="grid gap-2 sm:grid-cols-2">
        {events.map((e) => <GulChoice key={e.id} on={r.selected.has(e.id)} tone="yes" onClick={() => r.toggle(e.id)}>{e.name}</GulChoice>)}
      </div>
      <button type="button" onClick={r.submit} disabled={r.pending} className="w-full rounded-full bg-[color:var(--g-marigold)] px-6 py-4 text-sm font-bold uppercase tracking-widest text-[color:var(--g-ink)] disabled:opacity-60">{r.pending ? "…" : <TT en="Count me in!" hi="मुझे गिनो!" />}</button>
    </div>
  );
}

function GulRsvpDemo({ events }: { events: WebsiteViewProps["events"] }) {
  return (
    <div className="space-y-10">
      {events.slice(0, 2).map((e) => (
        <div key={e.id}>
          <h3 className="g-serif text-3xl font-semibold text-[color:var(--g-cream)]">{e.name}</h3>
          <div className="mt-4 flex gap-2">
            <GulChoice on={false} tone="yes" disabled><TT en="Absolutely" hi="बिल्कुल" /></GulChoice>
            <GulChoice on={false} tone="no" disabled><TT en="Dancing from home" hi="घर से" /></GulChoice>
          </div>
        </div>
      ))}
      <p className="text-sm italic text-[color:var(--g-cream)]/60"><TT en="Your guests will RSVP right here." hi="आपके मेहमान यहीं उत्तर देंगे।" /></p>
    </div>
  );
}

/* ── Countdown — bold festival-ticket tiles ────────────────────────────────── */
function GulCountdown({ dateIso }: { dateIso: string }) {
  const { ready, days, hours, minutes, seconds } = useCountdown(dateIso);
  const tiles: Array<[string, string, string, string]> = [
    [ready ? String(days) : "—", "Days", "दिन", "#E31364"],
    [pad2(hours, ready), "Hours", "घंटे", "#F05243"],
    [pad2(minutes, ready), "Mins", "मिनट", "#FF9E1B"],
    [pad2(seconds, ready), "Secs", "सेकंड", "#287A4D"],
  ];
  return (
    <section className="px-6 py-24 text-center sm:px-10" style={{ background: "var(--g-plum)" }}>
      <p className="g-serif mx-auto max-w-md text-3xl italic leading-tight text-[color:var(--g-cream)]" data-tw-reveal>
        <TT en="Until we lose our voices" hi="जब तक हमारी आवाज़ न बैठ जाए" />
      </p>
      <div className="mx-auto mt-10 flex max-w-3xl justify-center gap-3 sm:gap-5" data-tw-reveal>
        {tiles.map(([v, en, hi, bg]) => (
          <div key={en} className="flex-1 rounded-2xl py-6 text-[color:var(--g-cream)] shadow-[0_16px_36px_-18px_rgba(0,0,0,.5)]" style={{ background: bg }}>
            <span className="g-serif block text-[clamp(2.2rem,9vw,4.5rem)] font-semibold leading-none tabular-nums">{v}</span>
            <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.25em] opacity-90"><TT en={en} hi={hi} /></span>
          </div>
        ))}
      </div>
    </section>
  );
}
