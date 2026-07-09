"use client";

import { useEffect, useState } from "react";
import type { WebsiteViewProps } from "../website-view";
import { T, TT } from "../bilingual";
import { splitNames, longDate, clockTime } from "../format";
import { useGroupRsvp, useSelfRsvp } from "../use-rsvp";
import { useCountdown, pad2 } from "../use-countdown";

/* Two saffron paths that slowly join — the theme's quiet signature. */
function JoiningPaths({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className={`a-draw ${className ?? ""}`} aria-hidden="true">
      <path d="M20 8 C 20 50 60 60 100 90" stroke="var(--a-saffron)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M180 8 C 180 50 140 60 100 90" stroke="var(--a-gold)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="100" cy="90" r="4" fill="var(--a-saffron)" />
      <circle cx="100" cy="90" r="9" stroke="var(--a-saffron)" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

const EVENT_TONE = [
  { bg: "linear-gradient(160deg,#f6e3df,#fff8e8)", ink: "#641e32", accent: "var(--a-rose)" }, // mehendi rose+cream
  { bg: "linear-gradient(160deg,#641e32,#3a1220)", ink: "#fff8e8", accent: "var(--a-kesari)" }, // sangeet burgundy
  { bg: "linear-gradient(160deg,#fff8e8,#f5e6c8)", ink: "#302925", accent: "var(--a-saffron)" }, // anand karaj cream+saffron (calm)
  { bg: "linear-gradient(160deg,#315c48,#243f33)", ink: "#fff8e8", accent: "var(--a-gold)" }, // reception forest+gold
];

export function AnandKarajView(props: WebsiteViewProps) {
  const { names, dateLabel, countdownDate, events, config, chip, rsvp, selfRsvp, ownerPreview } = props;
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [entered, setEntered] = useState(false);
  const [menu, setMenu] = useState(false);

  const pair = splitNames(names);
  const milestones = config.story?.milestones ?? [];
  const familyGroups = config.family?.groups ?? [];
  const faqs = config.faq?.items ?? [];
  const images = config.gallery?.images ?? [];
  const contacts = config.footer?.contacts ?? [];
  const hasRsvp = Boolean(rsvp || selfRsvp || ownerPreview);
  const family = rsvp && chip ? chip : ownerPreview ? { en: "Sharma Family", hi: "शर्मा परिवार" } : null;

  useEffect(() => {
    const t = setTimeout(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setEntered(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const links: Array<[string, string, string]> = [];
  if (milestones.length) links.push(["#story", "Our Story", "हमारी कहानी"]);
  if (events.length) links.push(["#celebrations", "Celebrations", "आयोजन"]);
  links.push(["#ceremony", "The Ceremony", "समारोह"]);
  if (familyGroups.length || faqs.length) links.push(["#details", "Details", "विवरण"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);
  const seal = names.split(" & ").map((n) => n[0]).join(" & ");

  return (
    <div className="aka" data-lang={lang}>
      {/* OPENING — calm, paths joining */}
      {!entered ? (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-6 text-center" style={{ background: "var(--a-cream)" }} onWheel={() => setEntered(true)} onTouchMove={() => setEntered(true)} role="dialog" aria-label="Invitation">
          <JoiningPaths className="h-32 w-52" />
          <p className="a-serif mt-8 text-[clamp(2rem,6vw,3.6rem)] leading-tight text-[color:var(--a-charcoal)]">
            {pair ? <>{pair[0]}<span className="mx-3 italic text-[color:var(--a-saffron)]">&amp;</span>{pair[1]}</> : names}
          </p>
          {countdownDate ? <p className="mt-3 text-xs uppercase tracking-[0.4em] text-[color:var(--a-saffron)]">{longDate(countdownDate, true)}</p> : null}
          <p className="mt-6 max-w-sm text-sm text-[color:var(--a-ink-soft)]"><TT en="Together with our families, we invite you to share in our joy." hi="अपने परिवारों सहित, हम आपको अपनी ख़ुशी में सम्मिलित होने के लिए आमंत्रित करते हैं।" /></p>
          <button type="button" onClick={() => setEntered(true)} className="mt-10 border border-[color:var(--a-saffron)]/60 px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--a-saffron)] transition-colors hover:bg-[color:var(--a-saffron)] hover:text-white">
            <TT en="Enter" hi="प्रवेश करें" />
          </button>
        </div>
      ) : null}

      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[color:var(--a-charcoal)]/8 bg-[color:var(--a-cream)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#top" className="a-serif text-lg tracking-[0.2em] text-[color:var(--a-charcoal)]">{seal}</a>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {links.map(([href, en, hi]) => (
              <a key={href} href={href} className="group flex flex-col items-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--a-charcoal)]/70 transition-colors hover:text-[color:var(--a-charcoal)]">
                <TT en={en} hi={hi} />
                <span className="mt-1 h-1 w-1 rounded-full bg-[color:var(--a-saffron)] opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 md:flex">
              {(["en", "hi"] as const).map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={`px-1.5 text-[11px] font-semibold uppercase ${lang === l ? "text-[color:var(--a-saffron)]" : "text-[color:var(--a-charcoal)]/40"}`}>{l === "en" ? "EN" : "हिं"}</button>)}
            </div>
            <button type="button" onClick={() => setMenu(true)} className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--a-saffron)] md:hidden">Menu</button>
          </div>
        </div>
      </header>

      {menu ? (
        <div className="fixed inset-0 z-[70] flex flex-col justify-center gap-6 px-8 duration-300 animate-in slide-in-from-right" style={{ background: "var(--a-cream)" }} role="dialog" aria-modal="true">
          <button type="button" onClick={() => setMenu(false)} className="absolute right-6 top-6 text-xs font-semibold uppercase tracking-widest text-[color:var(--a-saffron)]">Close</button>
          {links.map(([href, en, hi]) => <a key={href} href={href} onClick={() => setMenu(false)} className="a-serif text-3xl text-[color:var(--a-charcoal)]"><TT en={en} hi={hi} /></a>)}
        </div>
      ) : null}

      {/* HERO — warm morning */}
      <section id="top" className="relative flex min-h-svh items-center px-6 pt-24 sm:px-10" style={{ background: "radial-gradient(90% 70% at 70% 20%, #fdeccb 0%, transparent 60%), var(--a-cream)" }}>
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="a-serif text-[clamp(2.8rem,8vw,5.5rem)] leading-[1.02] text-[color:var(--a-charcoal)]" data-tw-reveal>
              <TT en="Two souls." hi="दो आत्माएँ।" /><br /><span className="italic text-[color:var(--a-saffron)]"><TT en="One path." hi="एक राह।" /></span>
            </h1>
            <p className="a-serif mt-6 text-2xl tracking-[0.1em] text-[color:var(--a-burgundy)]" data-tw-reveal>{names}</p>
            {countdownDate ? <p className="mt-2 text-xs uppercase tracking-[0.35em] text-[color:var(--a-ink-soft)]" data-tw-reveal>{longDate(countdownDate, true)}</p> : null}
            {family ? (
              <p className="mt-8 max-w-md text-[15px] leading-relaxed text-[color:var(--a-ink-soft)]" data-tw-reveal>
                <T value={family} />, <TT en="we would be honoured to celebrate with you." hi="आपके साथ यह उत्सव मनाना हमारे लिए सम्मान की बात होगी।" />
              </p>
            ) : null}
          </div>
          <div className="relative mx-auto w-full max-w-sm" data-tw-reveal>
            <div className="m-grain relative flex h-96 items-center justify-center overflow-hidden rounded-[14rem] rounded-b-2xl border border-[color:var(--a-gold)]/40" style={{ background: "linear-gradient(180deg,#fdeccb,#e9c98a)" }}>
              <JoiningPaths className="h-40 w-64 opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* STORY — curved path */}
      {milestones.length > 0 ? (
        <section id="story" className="scroll-mt-20 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-3xl text-center" data-tw-reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[color:var(--a-saffron)]"><TT en="Our journey" hi="हमारा सफ़र" /></p>
            <h2 className="a-serif mt-2 text-[clamp(2rem,5vw,3.6rem)] leading-tight text-[color:var(--a-charcoal)]"><TT en="How we found our way here" hi="हम यहाँ तक कैसे पहुँचे" /></h2>
          </div>
          <div className="relative mx-auto mt-16 max-w-2xl">
            <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[color:var(--a-saffron)]/50 to-transparent" />
            <div className="space-y-16">
              {milestones.map((m, i) => (
                <div key={i} className={`relative w-[86%] sm:w-1/2 ${i % 2 ? "ml-auto pl-8 text-left" : "pr-8 text-right"}`} data-tw-reveal>
                  <span aria-hidden="true" className={`absolute top-2 h-2.5 w-2.5 rounded-full bg-[color:var(--a-saffron)] ${i % 2 ? "-left-1.5" : "-right-1.5"}`} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--a-saffron)]">{m.when}</p>
                  <h3 className="a-serif mt-1 text-2xl text-[color:var(--a-burgundy)]"><T value={m.title} /></h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--a-ink-soft)]"><T value={m.text} /></p>
                </div>
              ))}
            </div>
            <p className="a-serif mt-16 text-center text-3xl italic text-[color:var(--a-charcoal)]" data-tw-reveal><TT en="And then, there was us." hi="और फिर, हम थे।" /></p>
          </div>
        </section>
      ) : null}

      {/* FAMILY */}
      {familyGroups.length > 0 ? (
        <section className="px-6 py-24 sm:px-10" style={{ background: "var(--a-cream)" }}>
          <div className="mx-auto max-w-4xl">
            <div className="text-center" data-tw-reveal>
              <h2 className="a-serif text-[clamp(2rem,5vw,3.4rem)] leading-tight text-[color:var(--a-charcoal)]"><TT en="With the love of our families" hi="हमारे परिवारों के प्रेम सहित" /></h2>
            </div>
            <div className="mt-14 grid gap-12 md:grid-cols-2">
              {familyGroups.map((g, i) => (
                <div key={i} className={`text-center ${i === 0 ? "md:border-r md:border-[color:var(--a-gold)]/30 md:pr-12" : ""}`} data-tw-reveal>
                  <h3 className="a-serif text-2xl text-[color:var(--a-burgundy)]"><T value={g.name} /></h3>
                  {g.members ? <p className="mt-2 text-[15px] text-[color:var(--a-charcoal)]"><T value={g.members} /></p> : null}
                  {g.relation ? <p className="mt-1 text-sm italic text-[color:var(--a-ink-soft)]"><T value={g.relation} /></p> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* COUNTDOWN */}
      {countdownDate ? <AkaCountdown dateIso={countdownDate} /> : null}

      {/* EVENTS */}
      {events.length > 0 ? (
        <section id="celebrations" className="scroll-mt-20">
          <div className="px-6 py-16 text-center sm:px-10">
            <h2 className="a-serif text-[clamp(2rem,5vw,3.6rem)] text-[color:var(--a-charcoal)]" data-tw-reveal><TT en="Celebrating together" hi="साथ मिलकर उत्सव" /></h2>
          </div>
          {events.map((e, i) => {
            const t = EVENT_TONE[i % EVENT_TONE.length];
            return (
              <article key={e.id} className="px-6 py-20 sm:px-10" style={{ background: t.bg, color: t.ink }}>
                <div className="mx-auto max-w-3xl text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.4em]" style={{ color: t.accent }} data-tw-reveal>{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="a-serif mt-3 text-[clamp(2.4rem,7vw,4.5rem)] leading-none" data-tw-reveal><T value={{ en: e.name, hi: e.nameHi ?? undefined }} /></h3>
                  <div className="mt-6 space-y-1 text-sm uppercase tracking-[0.2em]" data-tw-reveal>
                    {e.startTime ? <p className="a-serif text-2xl tracking-normal" style={{ color: t.accent }}>{clockTime(e.startTime)}</p> : null}
                    {e.eventDate ? <p>{longDate(e.eventDate, true)}</p> : null}
                    {e.venueName ? <p className="opacity-80">{e.venueName}</p> : null}
                  </div>
                  {e.description ? <p className="a-serif mx-auto mt-5 max-w-lg text-lg italic opacity-85" data-tw-reveal><T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} /></p> : null}
                  <div className="mt-8 flex flex-wrap justify-center gap-3" data-tw-reveal>
                    {e.mapsUrl ? <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="border px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest" style={{ borderColor: t.accent, color: t.accent }}><TT en="Directions" hi="दिशा" /></a> : null}
                    {hasRsvp ? <a href="#rsvp" className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest" style={{ background: t.accent, color: t.bg.includes("cream") || i % 4 === 2 ? "#302925" : "#fff8e8" }}><TT en="RSVP" hi="उत्तर दें" /></a> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {/* CEREMONY + DETAILS */}
      <section id="ceremony" className="scroll-mt-20 px-6 py-24 sm:px-10" style={{ background: "var(--a-cream)" }}>
        <div className="mx-auto max-w-2xl">
          <div className="text-center" data-tw-reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[color:var(--a-saffron)]"><TT en="For our guests" hi="अतिथियों के लिए" /></p>
            <h2 className="a-serif mt-2 text-[clamp(2rem,5vw,3.4rem)] text-[color:var(--a-charcoal)]"><TT en="The Anand Karaj" hi="आनंद कारज" /></h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-[color:var(--a-ink-soft)]">
              <TT en="Our wedding ceremony will be an Anand Karaj. We warmly welcome guests of every faith to join us — a few gentle notes below to help you feel at home." hi="हमारा विवाह आनंद कारज के रूप में होगा। हम सभी धर्मों के अतिथियों का हार्दिक स्वागत करते हैं — नीचे कुछ सहज सूचनाएँ आपकी सुविधा के लिए हैं।" />
            </p>
          </div>
          {faqs.length > 0 ? (
            <div className="mt-12 space-y-8" id="details">
              {faqs.map((f, i) => (
                <div key={i} className="border-l-2 border-[color:var(--a-saffron)]/50 pl-5" data-tw-reveal>
                  <h3 className="a-serif text-xl text-[color:var(--a-burgundy)]"><T value={f.q} /></h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[color:var(--a-ink-soft)]"><T value={f.a} /></p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* GALLERY */}
      {images.length > 0 ? (
        <section className="px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="text-center" data-tw-reveal>
              <h2 className="a-serif text-[clamp(2rem,5vw,3.4rem)] text-[color:var(--a-charcoal)]"><TT en="The people who brought us here" hi="वे लोग जो हमें यहाँ लाए" /></h2>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
              {images.map((img, i) => (
                <figure key={i} className={`overflow-hidden rounded-2xl ${i % 4 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[3/4]"}`} data-tw-reveal>
                  {/* eslint-disable-next-line @next/next/no-img-element -- couple gallery URLs */}
                  <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {hasRsvp ? (
        <section id="rsvp" className="scroll-mt-20 px-6 py-28 sm:px-10" style={{ background: "linear-gradient(180deg,#fff8e8,#f5e6c8)" }}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="a-serif text-[clamp(2.2rem,6vw,4rem)] leading-tight text-[color:var(--a-charcoal)]" data-tw-reveal><TT en="Will you walk this day with us?" hi="क्या आप यह दिन हमारे साथ बिताएँगे?" /></h2>
            {family ? <p className="a-serif mt-3 text-xl italic text-[color:var(--a-burgundy)]" data-tw-reveal><T value={family} /></p> : null}
            <p className="mt-3 text-[15px] text-[color:var(--a-ink-soft)]" data-tw-reveal><TT en="We would be honoured by your presence." hi="आपकी उपस्थिति हमारे लिए सम्मान होगी।" /></p>
            <div className="mt-12 text-left">
              {rsvp ? <AkaGroupRsvp slug={rsvp.slug} events={events} guests={rsvp.guests} initial={rsvp.statuses} /> : selfRsvp ? <AkaSelfRsvp slug={selfRsvp.slug} events={selfRsvp.events} /> : <AkaRsvpDemo events={events} />}
            </div>
          </div>
        </section>
      ) : null}

      {/* FOOTER */}
      <footer className="px-6 py-16 text-center" style={{ background: "var(--a-burgundy)" }}>
        <JoiningPaths className="mx-auto h-20 w-32 opacity-90" />
        <p className="a-serif mt-4 text-3xl text-[color:var(--a-cream)]">{names}</p>
        {dateLabel ? <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-[color:var(--a-kesari)]">{dateLabel}</p> : null}
        {contacts.length ? <p className="mt-4 text-sm text-[color:var(--a-cream)]/70">{contacts.map((c) => `${c.name} · ${c.phone}`).join("   ")}</p> : null}
        <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-[color:var(--a-cream)]/50"><TT en="With love · Utsav" hi="प्रेम सहित · उत्सव" /></p>
      </footer>
    </div>
  );
}

/* ── RSVP ─────────────────────────────────────────────────────────────────── */
function AkaChoice({ on, tone, onClick, disabled, children }: { on: boolean; tone: "yes" | "no"; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  const idle = "border-[color:var(--a-gold)]/50 text-[color:var(--a-charcoal)]/70 hover:border-[color:var(--a-saffron)]";
  const active = tone === "yes" ? "border-[color:var(--a-saffron)] bg-[color:var(--a-saffron)] text-white" : "border-[color:var(--a-burgundy)] bg-[color:var(--a-burgundy)] text-[color:var(--a-cream)]";
  return <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick} className={`flex-1 border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all ${on ? active : idle} ${disabled ? "cursor-default opacity-60" : ""}`}>{children}</button>;
}

function AkaGroupRsvp({ slug, events, guests, initial }: { slug: string; events: WebsiteViewProps["events"]; guests: { id: string; name: string }[]; initial: Record<string, Record<string, "attending" | "declined">> }) {
  const { state, error, saved, choose } = useGroupRsvp(slug, initial);
  return (
    <div className="space-y-12">
      {error ? <p className="text-center text-sm text-[color:var(--a-burgundy)]" role="alert">{error}</p> : null}
      {events.map((e) => (
        <div key={e.id}>
          <h3 className="a-serif text-center text-2xl text-[color:var(--a-charcoal)]"><T value={{ en: e.name, hi: e.nameHi ?? undefined }} /></h3>
          <div className="mx-auto mt-4 max-w-md space-y-3">
            {guests.map((g) => (
              <div key={g.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="a-serif w-24 shrink-0 text-lg text-[color:var(--a-charcoal)]">{g.name}</span>
                <div className="flex flex-1 gap-2">
                  <AkaChoice on={state[e.id]?.[g.id] === "attending"} tone="yes" onClick={() => choose(e.id, g.id, "attending")}><TT en="Yes, with joy" hi="जी, सहर्ष" /></AkaChoice>
                  <AkaChoice on={state[e.id]?.[g.id] === "declined"} tone="no" onClick={() => choose(e.id, g.id, "declined")}><TT en="Unable to attend" hi="नहीं आ पाएँगे" /></AkaChoice>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {saved ? <p className="a-serif text-center text-2xl italic text-[color:var(--a-burgundy)]"><TT en="Thank you. Your love means more than we can say." hi="धन्यवाद। आपका प्रेम शब्दों से परे है।" /></p> : null}
    </div>
  );
}

function AkaSelfRsvp({ slug, events }: { slug: string; events: { id: string; name: string }[] }) {
  const r = useSelfRsvp(slug, events.map((e) => e.id));
  if (r.done) return <p className="a-serif text-center text-2xl italic text-[color:var(--a-burgundy)]"><TT en="Thank you. Your love means more than we can say." hi="धन्यवाद। आपका प्रेम शब्दों से परे है।" /></p>;
  const field = "w-full border border-[color:var(--a-gold)]/50 bg-transparent px-4 py-3 text-[color:var(--a-charcoal)] placeholder:text-[color:var(--a-ink-soft)] focus:border-[color:var(--a-saffron)] focus:outline-none";
  return (
    <div className="mx-auto max-w-md space-y-4">
      {r.error ? <p className="text-center text-sm text-[color:var(--a-burgundy)]" role="alert">{r.error}</p> : null}
      <input type="text" value={r.name} maxLength={120} onChange={(e) => r.setName(e.target.value)} placeholder="Your name" className={field} />
      <input type="number" min={1} max={50} value={r.size} onChange={(e) => r.setSize(Number(e.target.value))} className={field} />
      <div className="grid gap-2 sm:grid-cols-2">{events.map((e) => <AkaChoice key={e.id} on={r.selected.has(e.id)} tone="yes" onClick={() => r.toggle(e.id)}>{e.name}</AkaChoice>)}</div>
      <button type="button" onClick={r.submit} disabled={r.pending} className="w-full bg-[color:var(--a-saffron)] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60">{r.pending ? "…" : <TT en="Send our response" hi="उत्तर भेजें" />}</button>
    </div>
  );
}

function AkaRsvpDemo({ events }: { events: WebsiteViewProps["events"] }) {
  return (
    <div className="space-y-8">
      {events.slice(0, 2).map((e) => (
        <div key={e.id}>
          <h3 className="a-serif text-center text-2xl text-[color:var(--a-charcoal)]">{e.name}</h3>
          <div className="mx-auto mt-4 flex max-w-md gap-2">
            <AkaChoice on={false} tone="yes" disabled><TT en="Yes, with joy" hi="जी, सहर्ष" /></AkaChoice>
            <AkaChoice on={false} tone="no" disabled><TT en="Unable to attend" hi="नहीं आ पाएँगे" /></AkaChoice>
          </div>
        </div>
      ))}
      <p className="text-center text-sm italic text-[color:var(--a-ink-soft)]"><TT en="Your guests will respond here." hi="आपके अतिथि यहाँ उत्तर देंगे।" /></p>
    </div>
  );
}

function AkaCountdown({ dateIso }: { dateIso: string }) {
  const { ready, days, hours, minutes, seconds } = useCountdown(dateIso);
  const total = 400;
  const pct = Math.max(0, Math.min(100, ((total - days) / total) * 100));
  const units: Array<[string, string, string]> = [
    [ready ? String(days) : "—", "Days", "दिन"],
    [pad2(hours, ready), "Hours", "घंटे"],
    [pad2(minutes, ready), "Minutes", "मिनट"],
    [pad2(seconds, ready), "Seconds", "सेकंड"],
  ];
  return (
    <section className="px-6 py-24 text-center sm:px-10" style={{ background: "var(--a-cream)" }}>
      <div data-tw-reveal>
        <p className="a-serif mx-auto max-w-sm text-2xl italic text-[color:var(--a-charcoal)]"><TT en="Until we walk this path together" hi="जब तक हम यह राह साथ न चलें" /></p>
        <div className="mx-auto mt-8 flex max-w-xl items-stretch justify-center">
          {units.map(([v, en, hi]) => (
            <div key={en} className="flex flex-1 flex-col items-center border-[color:var(--a-gold)]/30 px-2 sm:px-4 [&:not(:last-child)]:border-r">
              <span className="a-serif text-[clamp(2.4rem,9vw,4.5rem)] leading-none text-[color:var(--a-burgundy)] tabular-nums">{v}</span>
              <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-[color:var(--a-saffron)] sm:text-[10px]"><TT en={en} hi={hi} /></span>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 h-px max-w-md bg-[color:var(--a-gold)]/30">
          <span className="block h-full bg-[color:var(--a-saffron)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  );
}
