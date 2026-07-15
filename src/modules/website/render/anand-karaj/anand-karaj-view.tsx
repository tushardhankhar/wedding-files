"use client";

import { useEffect, useState } from "react";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
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

/* ── The marigold garland (toran) ──────────────────────────────────────────
 * A dense genda-phool garland built as ONE seamless tile, then repeated with
 * `background-repeat` so blossoms stay perfectly round at any width (an inline
 * stretched SVG would squash them into ovals). The drape meets its neighbours
 * at the same height on both edges, so the repeat is invisible. */
function toranTileUri(): string {
  const round = (n: number) => Math.round(n * 10) / 10;
  const blossom = (cx: number, cy: number, r: number) => {
    let petals = "";
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      petals += `<circle cx="${round(cx + r * 0.6 * Math.cos(a))}" cy="${round(cy + r * 0.6 * Math.sin(a))}" r="${round(r * 0.34)}" fill="#e5a63c"/>`;
    }
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f2a71b"/>${petals}<circle cx="${cx}" cy="${cy}" r="${round(r * 0.3)}" fill="#e07a12"/>`;
  };
  const leaves = (x: number, y: number) =>
    `<path d="M${x} ${y} q -5 5 -1 12 q 6 -6 1 -12" fill="#2f5a44"/><path d="M${x} ${y} q 5 5 1 12 q -6 -6 -1 -12" fill="#2f5a44"/>`;
  const strandAt = (x: number, tip: number) => {
    const top = round(16 + 44 * (x / 120) * (1 - x / 120)); // y on the drape at x
    return (
      `<line x1="${x}" y1="${top}" x2="${x}" y2="${tip - 6}" stroke="#2f5a44" stroke-width="1.6"/>` +
      leaves(x, top + 4) +
      blossom(x, round(top + (tip - top) * 0.45), 5.5) +
      blossom(x, tip, x === 60 ? 9 : 7)
    );
  };
  // marigolds threaded along the sagging rope (skip the last so tiles abut cleanly)
  let drape = "";
  const N = 9;
  for (let i = 0; i < N; i++) {
    const x = round((120 * i) / N);
    drape += blossom(x, round(16 + 44 * (i / N) * (1 - i / N)), 7.5);
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 116" width="120" height="116">` +
    `<path d="M0 16 Q60 38 120 16" fill="none" stroke="#2f5a44" stroke-width="2.4"/>` +
    `<path d="M0 15 Q60 37 120 15" fill="none" stroke="#c39a55" stroke-width="0.7" opacity="0.6"/>` +
    strandAt(30, 66) + strandAt(90, 70) + drape + strandAt(60, 100) +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
const TORAN_URI = toranTileUri();

/* Full-width marigold garland — sits inside an `.a-sway` wrapper so the whole
 * string breathes. Repeats horizontally at its natural aspect. */
function MarigoldToran({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ backgroundImage: `url("${TORAN_URI}")`, backgroundRepeat: "repeat-x", backgroundPosition: "top center", backgroundSize: "auto 100%" }}
    />
  );
}

/* A layered marigold rosette — a festive floral medallion (no symbolism). */
function MarigoldRosette({ className }: { className?: string }) {
  const rings = [
    { count: 16, tip: 42, w: 7, fill: "var(--a-marigold)", phase: 0 },
    { count: 12, tip: 31, w: 8, fill: "var(--a-kesari)", phase: 15 },
    { count: 10, tip: 20, w: 7, fill: "var(--a-gold-lite)", phase: 0 },
  ];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {rings.map((r, ri) =>
        Array.from({ length: r.count }).map((_, i) => {
          const ang = (i / r.count) * 360 + r.phase;
          return (
            <path
              key={`${ri}-${i}`}
              d={`M50 50 Q ${50 - r.w} ${50 - r.tip * 0.5} 50 ${50 - r.tip} Q ${50 + r.w} ${50 - r.tip * 0.5} 50 50 Z`}
              fill={r.fill}
              transform={`rotate(${ang} 50 50)`}
            />
          );
        })
      )}
      <circle cx="50" cy="50" r="9" fill="#e07a12" />
      <circle cx="50" cy="50" r="9" fill="none" stroke="var(--a-gold-lite)" strokeWidth="1" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * 2 * Math.PI;
        return <circle key={i} cx={(50 + 5 * Math.cos(a)).toFixed(1)} cy={(50 + 5 * Math.sin(a)).toFixed(1)} r="1.3" fill="#fff3cf" />;
      })}
    </svg>
  );
}

/* Floral medallion — a marigold rosette ringed by a slowly rotating filigree
 * band over a soft pulsing halo. */
function FloralMedallion({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className ?? ""}`}>
      <span aria-hidden="true" className="a-glow absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(242,167,27,0.5), transparent 68%)" }} />
      <svg viewBox="0 0 200 200" className="a-spin absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="100" cy="100" r="94" fill="none" stroke="var(--a-gold)" strokeWidth="1" strokeDasharray="2 7" opacity="0.7" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * 2 * Math.PI;
          return <line key={i} x1={100 + 82 * Math.cos(a)} y1={100 + 82 * Math.sin(a)} x2={100 + 90 * Math.cos(a)} y2={100 + 90 * Math.sin(a)} stroke="var(--a-gold)" strokeWidth="1.4" opacity="0.6" />;
        })}
      </svg>
      <MarigoldRosette className="relative h-[74%] w-[74%] drop-shadow-[0_2px_8px_rgba(224,122,18,0.35)]" />
    </div>
  );
}

/* Drifting marigold petals — a fixed, SSR-stable set (no runtime randomness). */
const PETALS = [
  { left: "8%", size: 12, dur: 13, delay: 0, drift: "18px" },
  { left: "22%", size: 8, dur: 17, delay: 4, drift: "-22px" },
  { left: "37%", size: 14, dur: 15, delay: 2, drift: "26px" },
  { left: "51%", size: 9, dur: 19, delay: 7, drift: "-14px" },
  { left: "64%", size: 13, dur: 14, delay: 1, drift: "20px" },
  { left: "78%", size: 8, dur: 18, delay: 5, drift: "-24px" },
  { left: "89%", size: 11, dur: 16, delay: 3, drift: "16px" },
  { left: "15%", size: 7, dur: 20, delay: 9, drift: "-18px" },
  { left: "70%", size: 10, dur: 21, delay: 6, drift: "22px" },
];
function PetalField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="a-petal"
          style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, ["--drift" as string]: p.drift }}
        />
      ))}
    </div>
  );
}

/* Ornamental gold divider — a foil hairline meeting a small marigold glyph. */
function AkaDivider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className ?? ""}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[color:var(--a-gold)] sm:w-24" />
      <span className="a-goldtext text-lg leading-none">✺</span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[color:var(--a-gold)] sm:w-24" />
    </div>
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
  const familyMembers = config.family?.members ?? [];
  const groomFamily = familyMembers.filter((m) => m.side !== "bride");
  const brideFamily = familyMembers.filter((m) => m.side === "bride");
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
  if (familyMembers.length) links.push(["#family", "Family", "परिवार"]);
  if (events.length) links.push(["#celebrations", "Celebrations", "आयोजन"]);
  links.push(["#ceremony", "The Ceremony", "समारोह"]);
  if (faqs.length) links.push(["#details", "Details", "विवरण"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);
  const seal = names.split(" & ").map((n) => n[0]).join(" & ");

  return (
    <div className="aka" data-lang={lang}>
      {/* OPENING — a garlanded doorway, warm & festive */}
      {!entered ? (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden px-6 text-center" style={{ background: "radial-gradient(120% 90% at 50% -5%, #fde3b8 0%, transparent 55%), var(--a-cream)" }} onWheel={() => setEntered(true)} onTouchMove={() => setEntered(true)} role="dialog" aria-label="Invitation">
          <div className="a-sway pointer-events-none absolute inset-x-0 top-0 origin-top">
            <MarigoldToran className="h-24 w-full sm:h-28" />
          </div>
          <PetalField />
          <FloralMedallion className="relative mt-10 h-28 w-28 sm:h-32 sm:w-32" />
          <p className="relative mt-8 text-[11px] font-semibold uppercase tracking-[0.5em] text-[color:var(--a-fuchsia)]"><TT en="Anand Karaj" hi="आनंद कारज" /></p>
          <p className="a-serif relative mt-4 text-[clamp(2.2rem,6.5vw,4rem)] leading-tight text-[color:var(--a-charcoal)]">
            {pair ? <>{pair[0]}<span className="a-goldtext mx-3 not-italic">&amp;</span>{pair[1]}</> : names}
          </p>
          {countdownDate ? <p className="relative mt-3 text-xs uppercase tracking-[0.4em] text-[color:var(--a-saffron)]">{longDate(countdownDate, true)}</p> : null}
          <p className="relative mt-6 max-w-sm text-sm text-[color:var(--a-ink-soft)]"><TT en="Together with our families, we invite you to share in our joy." hi="अपने परिवारों सहित, हम आपको अपनी ख़ुशी में सम्मिलित होने के लिए आमंत्रित करते हैं।" /></p>
          <button type="button" onClick={() => setEntered(true)} className="relative mt-10 bg-[color:var(--a-fuchsia)] px-12 py-3.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-white shadow-lg shadow-[color:var(--a-fuchsia)]/30 transition-transform hover:scale-105">
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

      {/* HERO — a garlanded, jewel-lit welcome */}
      <section id="top" className="relative flex min-h-svh items-center overflow-hidden px-6 pt-28 sm:px-10" style={{ background: "radial-gradient(80% 60% at 78% 18%, #fbdcae 0%, transparent 55%), radial-gradient(90% 70% at 10% 90%, rgba(194,24,91,0.12) 0%, transparent 55%), var(--a-cream)" }}>
        {/* swaying toran across the top */}
        <div className="a-sway pointer-events-none absolute inset-x-0 top-16 origin-top opacity-95">
          <MarigoldToran className="h-24 w-full sm:h-28" />
        </div>
        <PetalField />
        <div className="relative mx-auto w-full max-w-3xl pt-16 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[color:var(--a-fuchsia)]" data-tw-reveal><TT en="We're getting married" hi="हम विवाह कर रहे हैं" /></p>
          <h1 className="a-serif mt-4 text-[clamp(3rem,9vw,6rem)] leading-[0.98] text-[color:var(--a-charcoal)]" data-tw-reveal>
            <TT en="Two souls." hi="दो आत्माएँ।" /><br /><span className="a-goldtext"><TT en="One joyful path." hi="एक आनंदमय राह।" /></span>
          </h1>
          <p className="a-serif mt-6 text-[clamp(1.8rem,5vw,3rem)] tracking-[0.08em] text-[color:var(--a-burgundy)]" data-tw-reveal>{names}</p>
          {countdownDate ? <p className="mt-2 text-xs uppercase tracking-[0.35em] text-[color:var(--a-saffron)]" data-tw-reveal>{longDate(countdownDate, true)}</p> : null}
          <AkaDivider className="mt-8" />
          {family ? (
            <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[color:var(--a-ink-soft)]" data-tw-reveal>
              <T value={family} />, <TT en="we would be honoured to celebrate with you." hi="आपके साथ यह उत्सव मनाना हमारे लिए सम्मान की बात होगी।" />
            </p>
          ) : null}
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

      {/* FAMILY — a quiet, symmetrical groom's-side / bride's-side split */}
      {familyMembers.length > 0 ? (
        <section id="family" className="scroll-mt-20 px-6 py-24 sm:px-10" style={{ background: "var(--a-cream)" }}>
          <div className="mx-auto max-w-4xl">
            <div className="text-center" data-tw-reveal>
              <h2 className="a-serif text-[clamp(2rem,5vw,3.4rem)] leading-tight text-[color:var(--a-charcoal)]"><TT en="With the love of our families" hi="हमारे परिवारों के प्रेम सहित" /></h2>
              <AkaDivider className="mt-5" />
            </div>
            <div className={`mt-14 grid gap-12 ${groomFamily.length && brideFamily.length ? "md:grid-cols-2" : ""}`}>
              {groomFamily.length > 0 ? (
                <div className={`text-center ${brideFamily.length > 0 ? "md:border-r md:border-[color:var(--a-gold)]/30 md:pr-12" : ""}`} data-tw-reveal>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--a-saffron)]"><TT en="Groom's Family" hi="वर पक्ष" /></p>
                  <div className="mt-6 space-y-5">
                    {groomFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="a-serif text-xl text-[color:var(--a-burgundy)]"><T value={m.name} /></h3>
                        {m.relation ? <p className="mt-0.5 text-sm italic text-[color:var(--a-ink-soft)]"><T value={m.relation} /></p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {brideFamily.length > 0 ? (
                <div className="text-center" data-tw-reveal>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[color:var(--a-saffron)]"><TT en="Bride's Family" hi="वधू पक्ष" /></p>
                  <div className="mt-6 space-y-5">
                    {brideFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="a-serif text-xl text-[color:var(--a-burgundy)]"><T value={m.name} /></h3>
                        {m.relation ? <p className="mt-0.5 text-sm italic text-[color:var(--a-ink-soft)]"><T value={m.relation} /></p> : null}
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
      {countdownDate ? <AkaCountdown dateIso={countdownDate} /> : null}

      {/* EVENTS */}
      {events.length > 0 ? (
        <section id="celebrations" className="scroll-mt-20">
          <div className="px-6 py-16 text-center sm:px-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-[color:var(--a-fuchsia)]" data-tw-reveal><TT en="The festivities" hi="समारोह" /></p>
            <h2 className="a-serif mt-2 text-[clamp(2rem,5vw,3.6rem)] text-[color:var(--a-charcoal)]" data-tw-reveal><TT en="Celebrating together" hi="साथ मिलकर उत्सव" /></h2>
            <AkaDivider className="mt-5" />
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
              <AkaDivider className="mt-5" />
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
      <footer className="relative overflow-hidden px-6 pb-16 pt-8 text-center" style={{ background: "radial-gradient(90% 120% at 50% 0%, var(--a-burgundy) 0%, var(--a-deep) 100%)" }}>
        <div className="a-sway pointer-events-none absolute inset-x-0 top-0 origin-top opacity-90">
          <MarigoldToran className="h-20 w-full" />
        </div>
        <FloralMedallion className="relative mx-auto mt-24 h-24 w-24" />
        <p className="a-goldtext a-serif mt-6 text-4xl">{names}</p>
        {dateLabel ? <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-[color:var(--a-kesari)]">{dateLabel}</p> : null}
        {contacts.length ? <p className="mt-4 text-sm text-[color:var(--a-cream)]/70">{contacts.map((c) => `${c.name}${c.relation ? ` (${c.relation})` : ""} · ${c.phone}`).join("   ")}</p> : null}
        <AkaDivider className="mt-8" />
        <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-[color:var(--a-cream)]/50"><TT en="With love · Jashn" hi="प्रेम सहित · जश्न" /></p>
        <JashnCredit className="mt-3 text-[color:var(--a-cream)]/40" />
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
    <section className="px-6 py-24 text-center sm:px-10" style={{ background: "radial-gradient(80% 60% at 50% 0%, #fbdcae 0%, transparent 60%), var(--a-cream)" }}>
      <div data-tw-reveal>
        <JoiningPaths className="mx-auto h-16 w-28 opacity-80" />
        <p className="a-serif mx-auto mt-4 max-w-sm text-2xl italic text-[color:var(--a-charcoal)]"><TT en="Until we walk this path together" hi="जब तक हम यह राह साथ न चलें" /></p>
        <div className="mx-auto mt-8 flex max-w-xl items-stretch justify-center">
          {units.map(([v, en, hi]) => (
            <div key={en} className="flex flex-1 flex-col items-center border-[color:var(--a-gold)]/30 px-2 sm:px-4 [&:not(:last-child)]:border-r">
              <span className="a-goldtext a-serif text-[clamp(2.4rem,9vw,4.5rem)] leading-none tabular-nums">{v}</span>
              <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-[color:var(--a-fuchsia)] sm:text-[10px]"><TT en={en} hi={hi} /></span>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 h-1 max-w-md overflow-hidden rounded-full bg-[color:var(--a-gold)]/25">
          <span className="block h-full rounded-full bg-gradient-to-r from-[color:var(--a-saffron)] via-[color:var(--a-marigold)] to-[color:var(--a-fuchsia)] transition-[width] duration-1000" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  );
}
