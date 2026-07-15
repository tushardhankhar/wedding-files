"use client";

import { useEffect, useState } from "react";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { T, TT } from "../bilingual";
import { splitNames, longDate, clockTime } from "../format";
import { useGroupRsvp, useSelfRsvp } from "../use-rsvp";
import { useCountdown, pad2 } from "../use-countdown";

/* Original kolam-inspired symmetric geometry (not a copied sacred design). */
function Kolam({ className, draw }: { className?: string; draw?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={`${draw ? "k-draw" : ""} ${className ?? ""}`} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        {[0, 90, 180, 270].map((a) => (
          <path key={a} d="M60 60 C 60 40 78 34 88 44 C 98 54 92 72 72 72 C 66 72 62 66 60 60 Z" transform={`rotate(${a} 60 60)`} />
        ))}
        <circle cx="60" cy="60" r="34" strokeDasharray="2 6" />
        <circle cx="60" cy="60" r="6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <circle key={a} cx="60" cy="14" r="1.6" fill="currentColor" transform={`rotate(${a} 60 60)`} />
        ))}
      </g>
    </svg>
  );
}

export function KalyanamView(props: WebsiteViewProps) {
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
  const venues = events.filter((e) => e.venueName);
  const hasRsvp = Boolean(rsvp || selfRsvp || ownerPreview);
  const family = rsvp && chip ? chip : ownerPreview ? { en: "Sharma Family", hi: "शर्मा परिवार" } : null;
  const seal = names.split(" & ").map((n) => n[0]).join(" · ");
  const city = venues[0]?.venueAddress?.split(",").pop()?.trim();

  useEffect(() => {
    const t = setTimeout(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setEntered(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const links: Array<[string, string, string]> = [];
  if (milestones.length) links.push(["#story", "Story", "कहानी"]);
  if (familyMembers.length) links.push(["#family", "Family", "परिवार"]);
  if (events.length) links.push(["#ceremonies", "Ceremonies", "समारोह"]);
  if (venues.length) links.push(["#venue", "Venue", "स्थल"]);
  if (images.length) links.push(["#gallery", "Gallery", "गैलरी"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);

  return (
    <div className="kly" data-lang={lang}>
      {/* OPENING — kolam constructs */}
      {!entered ? (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-6 text-center" style={{ background: "var(--k-ivory)" }} onWheel={() => setEntered(true)} onTouchMove={() => setEntered(true)} role="dialog" aria-label="Invitation">
          <Kolam draw className="h-36 w-36 text-[color:var(--k-brass)]" />
          <p className="k-serif mt-8 text-[clamp(2rem,6vw,3.6rem)] leading-tight text-[color:var(--k-wood)]">
            {pair ? <>{pair[0]}<span className="mx-3 italic text-[color:var(--k-red)]">&amp;</span>{pair[1]}</> : names}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.5em] text-[color:var(--k-red)]"><TT en="Kalyanam" hi="कल्याणम" /></p>
          {countdownDate ? <p className="mt-3 text-[11px] uppercase tracking-[0.4em] text-[color:var(--k-ink-soft)]">{longDate(countdownDate, true)}{city ? ` · ${city}` : ""}</p> : null}
          <p className="mt-6 max-w-sm text-sm text-[color:var(--k-ink-soft)]"><TT en="With the blessings of our families" hi="हमारे परिवारों के आशीर्वाद सहित" /></p>
          <button type="button" onClick={() => setEntered(true)} className="mt-10 border border-[color:var(--k-brass)]/60 px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--k-brass)] transition-colors hover:bg-[color:var(--k-brass)] hover:text-white">
            <TT en="Enter the celebration" hi="उत्सव में प्रवेश करें" />
          </button>
        </div>
      ) : null}

      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[color:var(--k-wood)]/8 bg-[color:var(--k-ivory)]/92 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-5 py-3 sm:px-8">
          <span />
          <a href="#top" className="k-serif justify-self-center text-lg tracking-[0.2em] text-[color:var(--k-wood)]">{seal}</a>
          <div className="flex items-center justify-end gap-6">
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
              {links.map(([href, en, hi]) => (
                <a key={href} href={href} className="group flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--k-wood)]/70 transition-colors hover:text-[color:var(--k-wood)]">
                  <span className="h-1 w-1 rounded-full bg-[color:var(--k-turmeric)] opacity-0 transition-opacity group-hover:opacity-100" />
                  <TT en={en} hi={hi} />
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-1 md:flex">
              {(["en", "hi"] as const).map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={`px-1.5 text-[11px] font-semibold uppercase ${lang === l ? "text-[color:var(--k-turmeric)]" : "text-[color:var(--k-wood)]/40"}`}>{l === "en" ? "EN" : "हिं"}</button>)}
            </div>
            <button type="button" onClick={() => setMenu(true)} className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--k-brass)] md:hidden">Menu</button>
          </div>
        </div>
      </header>

      {menu ? (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 px-8 text-center duration-300 animate-in fade-in" style={{ background: "var(--k-ivory)" }} role="dialog" aria-modal="true">
          <Kolam className="absolute inset-x-0 top-10 mx-auto h-40 w-40 text-[color:var(--k-brass)] opacity-20" />
          <button type="button" onClick={() => setMenu(false)} className="absolute right-6 top-6 text-xs font-semibold uppercase tracking-widest text-[color:var(--k-brass)]">Close</button>
          {links.map(([href, en, hi]) => <a key={href} href={href} onClick={() => setMenu(false)} className="k-serif relative text-3xl text-[color:var(--k-wood)]"><TT en={en} hi={hi} /></a>)}
        </div>
      ) : null}

      {/* HERO — split architectural */}
      <section id="top" className="relative grid min-h-svh grid-cols-1 pt-16 lg:grid-cols-2">
        <div className="relative flex min-h-[40vh] items-center justify-center overflow-hidden" style={{ background: "linear-gradient(180deg,#356b3f,#22492f)" }}>
          <Kolam className="absolute h-[60%] w-[60%] text-[color:var(--k-turmeric)] opacity-30" />
          <p className="k-serif relative text-center text-6xl text-[color:var(--k-jasmine)]">✿</p>
        </div>
        <div className="flex items-center px-8 py-16 sm:px-14" style={{ background: "radial-gradient(90% 70% at 30% 20%, #fff 0%, transparent 60%), var(--k-ivory)" }}>
          <div>
            {pair ? (
              <h1 className="k-serif text-[clamp(2.6rem,7vw,5rem)] leading-[1.05] text-[color:var(--k-wood)]" data-tw-reveal>
                {pair[0]}<br /><span className="text-2xl uppercase tracking-[0.3em] text-[color:var(--k-red)]"><TT en="weds" hi="विवाह" /></span><br />{pair[1]}
              </h1>
            ) : <h1 className="k-serif text-[clamp(2.4rem,7vw,4.5rem)] text-[color:var(--k-wood)]">{names}</h1>}
            <div className="mt-6 h-px w-24 bg-[color:var(--k-brass)]" />
            {family ? (
              <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-[color:var(--k-ink-soft)]" data-tw-reveal>
                <T value={family} />, <TT en="we joyfully invite you to celebrate with us." hi="हम आपको सहर्ष आमंत्रित करते हैं।" />
              </p>
            ) : null}
            {countdownDate ? <p className="mt-4 text-[11px] uppercase tracking-[0.35em] text-[color:var(--k-brass)]">{longDate(countdownDate, true)}</p> : null}
          </div>
        </div>
      </section>

      {/* STORY — architectural grid */}
      {milestones.length > 0 ? (
        <section id="story" className="scroll-mt-16 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="text-center" data-tw-reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[color:var(--k-red)]"><TT en="Before the" hi="मुहूर्तम से" /></p>
              <h2 className="k-serif mt-1 text-[clamp(2rem,5vw,3.6rem)] text-[color:var(--k-wood)]"><TT en="Muhurtham" hi="पहले" /></h2>
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-[color:var(--k-brass)]/25 bg-[color:var(--k-brass)]/20 sm:grid-cols-2">
              {milestones.map((m, i) => (
                <div key={i} className="bg-[color:var(--k-ivory)] p-8" data-tw-reveal>
                  <p className="k-serif text-4xl text-[color:var(--k-brass)]/40">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="k-serif mt-2 text-2xl uppercase tracking-[0.08em] text-[color:var(--k-red)]"><T value={m.title} /></h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--k-ink-soft)]"><T value={m.text} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAMILY */}
      {familyMembers.length > 0 ? (
        <section id="family" className="scroll-mt-16 px-6 py-24 sm:px-10" style={{ background: "var(--k-ivory)" }}>
          <div className="mx-auto max-w-4xl">
            <div className="text-center" data-tw-reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[color:var(--k-red)]"><TT en="With blessings" hi="आशीर्वाद सहित" /></p>
              <h2 className="k-serif mt-1 text-[clamp(2rem,5vw,3.6rem)] text-[color:var(--k-wood)]"><TT en="Our Families" hi="हमारे परिवार" /></h2>
              <Kolam className="mx-auto mt-4 h-10 w-10 text-[color:var(--k-turmeric)]" />
            </div>
            <div className={`mt-14 grid gap-10 ${groomFamily.length && brideFamily.length ? "sm:grid-cols-2" : ""}`}>
              {groomFamily.length > 0 ? (
                <div className={`text-center ${brideFamily.length > 0 ? "sm:border-r sm:border-[color:var(--k-brass)]/25 sm:pr-10" : ""}`} data-tw-reveal>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:var(--k-brass)]"><TT en="Groom's Family" hi="वर पक्ष" /></p>
                  <div className="mt-6 space-y-5">
                    {groomFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="k-serif text-xl uppercase tracking-[0.06em] text-[color:var(--k-red)]"><T value={m.name} /></h3>
                        {m.relation ? <p className="mt-1 text-sm text-[color:var(--k-ink-soft)]"><T value={m.relation} /></p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {brideFamily.length > 0 ? (
                <div className="text-center" data-tw-reveal>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:var(--k-brass)]"><TT en="Bride's Family" hi="वधू पक्ष" /></p>
                  <div className="mt-6 space-y-5">
                    {brideFamily.map((m, i) => (
                      <div key={i}>
                        <h3 className="k-serif text-xl uppercase tracking-[0.06em] text-[color:var(--k-red)]"><T value={m.name} /></h3>
                        {m.relation ? <p className="mt-1 text-sm text-[color:var(--k-ink-soft)]"><T value={m.relation} /></p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* COUNTDOWN — brass rings */}
      {countdownDate ? <KlyCountdown dateIso={countdownDate} /> : null}

      {/* CEREMONIES — precise timing */}
      {events.length > 0 ? (
        <section id="ceremonies" className="scroll-mt-16 px-6 py-24 sm:px-10" style={{ background: "var(--k-ivory)" }}>
          <div className="mx-auto max-w-4xl">
            <div className="text-center" data-tw-reveal>
              <h2 className="k-serif text-[clamp(2rem,5vw,3.6rem)] text-[color:var(--k-wood)]"><TT en="The Ceremonies" hi="समारोह" /></h2>
              <Kolam className="mx-auto mt-4 h-10 w-10 text-[color:var(--k-turmeric)]" />
            </div>
            <div className="mt-14 space-y-6">
              {events.map((e, i) => {
                const primary = i === Math.floor(events.length / 2);
                return (
                  <article key={e.id} className={`grid items-center gap-6 border border-[color:var(--k-brass)]/25 p-8 sm:grid-cols-[auto_1fr] ${primary ? "bg-[color:var(--k-ivory)] shadow-[0_20px_50px_-30px_rgba(58,37,27,.4)]" : "bg-transparent"}`} data-tw-reveal>
                    <div className="text-center sm:w-40 sm:border-r sm:border-[color:var(--k-brass)]/25 sm:pr-6">
                      {e.startTime ? <p className={`k-serif leading-none text-[color:var(--k-red)] ${primary ? "text-5xl" : "text-3xl"}`}>{clockTime(e.startTime)}</p> : null}
                      {e.eventDate ? <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[color:var(--k-ink-soft)]">{longDate(e.eventDate, true)}</p> : null}
                    </div>
                    <div>
                      <h3 className={`k-serif uppercase tracking-[0.08em] text-[color:var(--k-wood)] ${primary ? "text-4xl" : "text-2xl"}`}><T value={{ en: e.name, hi: e.nameHi ?? undefined }} /></h3>
                      {e.venueName ? <p className="mt-1 text-sm text-[color:var(--k-ink-soft)]">{e.venueName}</p> : null}
                      {e.description ? <p className="mt-2 border-l-2 border-[color:var(--k-turmeric)] pl-3 text-sm font-medium text-[color:var(--k-leaf)]"><T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} /></p> : null}
                      {e.hostedByEnabled && e.hostedBy ? <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--k-ink-soft)]"><TT en="Hosted by" hi="मेज़बान" /> {e.hostedBy}</p> : null}
                      <div className="mt-4 flex flex-wrap gap-3">
                        {e.mapsUrl ? <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className="border border-[color:var(--k-wood)]/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--k-wood)]"><TT en="Map" hi="नक़्शा" /></a> : null}
                        {hasRsvp ? <a href="#rsvp" className="bg-[color:var(--k-red)] px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white"><TT en="RSVP" hi="उत्तर" /></a> : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* VENUE */}
      {venues.length > 0 ? (
        <section id="venue" className="scroll-mt-16 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="text-center" data-tw-reveal><h2 className="k-serif text-[clamp(2rem,5vw,3.4rem)] text-[color:var(--k-wood)]"><TT en="Where we gather" hi="जहाँ हम एकत्र होंगे" /></h2></div>
            <div className="mt-12 space-y-10">
              {venues.map((v) => (
                <div key={v.id} className="grid items-center gap-8 lg:grid-cols-[1fr_auto]" data-tw-reveal>
                  <div>
                    <h3 className="k-serif text-3xl uppercase tracking-[0.06em] text-[color:var(--k-red)]">{v.venueName}</h3>
                    {v.venueAddress ? <p className="mt-2 text-[color:var(--k-ink-soft)]">{v.venueAddress}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Arrival", "Parking", "Dining"].map((x, j) => (
                        <span key={x} className="border border-[color:var(--k-brass)]/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--k-brass)]">
                          <TT en={x} hi={["आगमन", "पार्किंग", "भोजन"][j]} />
                        </span>
                      ))}
                    </div>
                    {v.mapsUrl ? <a href={v.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block bg-[color:var(--k-leaf)] px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-white"><TT en="Open in maps" hi="मैप खोलें" /></a> : null}
                  </div>
                  <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-[color:var(--k-brass)]/40"><Kolam className="h-28 w-28 text-[color:var(--k-brass)] opacity-60" /></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* GALLERY */}
      {images.length > 0 ? (
        <section id="gallery" className="scroll-mt-16 px-6 py-24 sm:px-10" style={{ background: "var(--k-jasmine)" }}>
          <div className="mx-auto max-w-5xl">
            <div className="text-center" data-tw-reveal><h2 className="k-serif text-[clamp(2rem,5vw,3.4rem)] text-[color:var(--k-wood)]"><TT en="Moments in jasmine & gold" hi="चमेली और स्वर्ण के पल" /></h2></div>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {images.map((img, i) => (
                <figure key={i} className={`overflow-hidden border border-[color:var(--k-brass)]/25 ${i % 3 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-[3/4]"}`} data-tw-reveal>
                  {/* eslint-disable-next-line @next/next/no-img-element -- couple gallery URLs */}
                  <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* DETAILS */}
      {faqs.length > 0 ? (
        <section className="px-6 py-20 sm:px-10" style={{ background: "var(--k-ivory)" }}>
          <div className="mx-auto max-w-2xl">
            <div className="grid gap-8 sm:grid-cols-2">
              {faqs.map((f, i) => (
                <div key={i} data-tw-reveal>
                  <h3 className="k-serif text-lg uppercase tracking-[0.05em] text-[color:var(--k-red)]"><T value={f.q} /></h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--k-ink-soft)]"><T value={f.a} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      {hasRsvp ? (
        <section id="rsvp" className="scroll-mt-16 px-6 py-28 sm:px-10" style={{ background: "linear-gradient(180deg,#356b3f,#22492f)" }}>
          <div className="mx-auto max-w-3xl text-center text-[color:var(--k-jasmine)]">
            <Kolam className="mx-auto h-12 w-12 text-[color:var(--k-turmeric)]" />
            <h2 className="k-serif mt-4 text-[clamp(2.2rem,6vw,4rem)] leading-tight" data-tw-reveal><TT en="We await your presence" hi="हम आपकी प्रतीक्षा में हैं" /></h2>
            {family ? <p className="k-serif mt-2 text-xl italic text-[color:var(--k-turmeric)]" data-tw-reveal><T value={family} /></p> : null}
            <p className="mt-3 text-sm text-[color:var(--k-jasmine)]/75" data-tw-reveal><TT en="Please let us know which ceremonies you will join." hi="कृपया बताएँ कि आप किन समारोहों में आएँगे।" /></p>
            <div className="mt-12 text-left">
              {rsvp ? <KlyGroupRsvp slug={rsvp.slug} events={events} guests={rsvp.guests} initial={rsvp.statuses} /> : selfRsvp ? <KlySelfRsvp slug={selfRsvp.slug} events={selfRsvp.events} /> : <KlyRsvpDemo events={events} />}
            </div>
          </div>
        </section>
      ) : null}

      {/* FOOTER */}
      <footer className="px-6 py-16 text-center" style={{ background: "var(--k-red)" }}>
        <Kolam className="mx-auto h-20 w-20 text-[color:var(--k-turmeric)]" />
        <p className="k-serif mt-4 text-3xl text-[color:var(--k-jasmine)]">{names}</p>
        {dateLabel ? <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-[color:var(--k-turmeric)]">{dateLabel}</p> : null}
        {contacts.length ? <p className="mt-4 text-sm text-[color:var(--k-jasmine)]/70">{contacts.map((c) => `${c.name}${c.relation ? ` (${c.relation})` : ""} · ${c.phone}`).join("   ")}</p> : null}
        <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-[color:var(--k-jasmine)]/50"><TT en="Sacred · Timeless · Jashn" hi="पावन · कालातीत · जश्न" /></p>
        <JashnCredit className="mt-3 text-[color:var(--k-jasmine)]/40" />
      </footer>
    </div>
  );
}

/* ── RSVP ─────────────────────────────────────────────────────────────────── */
function KlyChoice({ on, tone, onClick, disabled, children }: { on: boolean; tone: "yes" | "no"; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  const idle = "border-[color:var(--k-jasmine)]/30 text-[color:var(--k-jasmine)]/70 hover:border-[color:var(--k-turmeric)]";
  const active = tone === "yes" ? "border-[color:var(--k-turmeric)] bg-[color:var(--k-turmeric)] text-[color:var(--k-wood)]" : "border-[color:var(--k-red)] bg-[color:var(--k-red)] text-white";
  return <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick} className={`flex-1 border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all ${on ? active : idle} ${disabled ? "cursor-default opacity-60" : ""}`}>{children}</button>;
}

function KlyGroupRsvp({ slug, events, guests, initial }: { slug: string; events: WebsiteViewProps["events"]; guests: { id: string; name: string }[]; initial: Record<string, Record<string, "attending" | "declined">> }) {
  const { state, error, saved, choose } = useGroupRsvp(slug, initial);
  return (
    <div className="space-y-10">
      {error ? <p className="text-center text-sm text-[color:var(--k-turmeric)]" role="alert">{error}</p> : null}
      {events.map((e) => (
        <div key={e.id}>
          <p className="text-center"><span className="k-serif text-2xl text-[color:var(--k-jasmine)]"><T value={{ en: e.name, hi: e.nameHi ?? undefined }} /></span>{e.startTime ? <span className="ml-3 text-sm text-[color:var(--k-turmeric)]">{clockTime(e.startTime)}</span> : null}</p>
          <div className="mx-auto mt-4 max-w-md space-y-3">
            {guests.map((g) => (
              <div key={g.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="k-serif w-24 shrink-0 text-lg">{g.name}</span>
                <div className="flex flex-1 gap-2">
                  <KlyChoice on={state[e.id]?.[g.id] === "attending"} tone="yes" onClick={() => choose(e.id, g.id, "attending")}><TT en="Attending" hi="आ रहे हैं" /></KlyChoice>
                  <KlyChoice on={state[e.id]?.[g.id] === "declined"} tone="no" onClick={() => choose(e.id, g.id, "declined")}><TT en="Unable to attend" hi="नहीं आ पाएँगे" /></KlyChoice>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {saved ? <p className="k-serif text-center text-2xl italic text-[color:var(--k-turmeric)]"><TT en="With joy, we look forward to welcoming you." hi="सहर्ष, हम आपके स्वागत की प्रतीक्षा करते हैं।" /></p> : null}
    </div>
  );
}

function KlySelfRsvp({ slug, events }: { slug: string; events: { id: string; name: string }[] }) {
  const r = useSelfRsvp(slug, events.map((e) => e.id));
  if (r.done) return <p className="k-serif text-center text-2xl italic text-[color:var(--k-turmeric)]"><TT en="With joy, we look forward to welcoming you." hi="सहर्ष, हम आपके स्वागत की प्रतीक्षा करते हैं।" /></p>;
  const field = "w-full border border-[color:var(--k-jasmine)]/30 bg-transparent px-4 py-3 text-[color:var(--k-jasmine)] placeholder:text-[color:var(--k-jasmine)]/40 focus:border-[color:var(--k-turmeric)] focus:outline-none";
  return (
    <div className="mx-auto max-w-md space-y-4">
      {r.error ? <p className="text-center text-sm text-[color:var(--k-turmeric)]" role="alert">{r.error}</p> : null}
      <input type="text" value={r.name} maxLength={120} onChange={(e) => r.setName(e.target.value)} placeholder="Your name" className={field} />
      <input type="number" min={1} max={50} value={r.size} onChange={(e) => r.setSize(Number(e.target.value))} className={field} />
      <div className="grid gap-2 sm:grid-cols-2">{events.map((e) => <KlyChoice key={e.id} on={r.selected.has(e.id)} tone="yes" onClick={() => r.toggle(e.id)}>{e.name}</KlyChoice>)}</div>
      <button type="button" onClick={r.submit} disabled={r.pending} className="w-full bg-[color:var(--k-turmeric)] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--k-wood)] disabled:opacity-60">{r.pending ? "…" : <TT en="Send our response" hi="उत्तर भेजें" />}</button>
    </div>
  );
}

function KlyRsvpDemo({ events }: { events: WebsiteViewProps["events"] }) {
  return (
    <div className="space-y-8">
      {events.slice(0, 2).map((e) => (
        <div key={e.id}>
          <p className="k-serif text-center text-2xl text-[color:var(--k-jasmine)]">{e.name}</p>
          <div className="mx-auto mt-4 flex max-w-md gap-2">
            <KlyChoice on={false} tone="yes" disabled><TT en="Attending" hi="आ रहे हैं" /></KlyChoice>
            <KlyChoice on={false} tone="no" disabled><TT en="Unable to attend" hi="नहीं" /></KlyChoice>
          </div>
        </div>
      ))}
      <p className="text-center text-sm italic text-[color:var(--k-jasmine)]/60"><TT en="Your guests will respond here." hi="आपके अतिथि यहाँ उत्तर देंगे।" /></p>
    </div>
  );
}

function KlyCountdown({ dateIso }: { dateIso: string }) {
  const { ready, days, hours, minutes, seconds } = useCountdown(dateIso, "06:42:00");
  // ring fill fraction per unit → an architectural progress arc
  const rings: Array<[string, string, string, number]> = [
    [ready ? String(days) : "—", "Days", "दिन", ready ? Math.min(1, days / 365) : 0],
    [pad2(hours, ready), "Hours", "घंटे", hours / 24],
    [pad2(minutes, ready), "Minutes", "मिनट", minutes / 60],
    [pad2(seconds, ready), "Seconds", "सेकंड", seconds / 60],
  ];
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <section className="px-6 py-24 text-center sm:px-10" style={{ background: "var(--k-ivory)" }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[color:var(--k-red)]" data-tw-reveal><TT en="Until the Muhurtham" hi="मुहूर्तम तक" /></p>
      <div className="mt-8 flex flex-wrap justify-center gap-5 sm:gap-10" data-tw-reveal>
        {rings.map(([v, en, hi, frac]) => (
          <div key={en} className="flex flex-col items-center">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--k-brass)" strokeOpacity="0.2" strokeWidth="3" />
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--k-turmeric)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C * (1 - (ready ? frac : 0))} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
              </svg>
              <span className="k-serif absolute inset-0 flex items-center justify-center text-3xl tabular-nums text-[color:var(--k-red)] sm:text-4xl">{v}</span>
            </div>
            <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:var(--k-ink-soft)]"><TT en={en} hi={hi} /></span>
          </div>
        ))}
      </div>
    </section>
  );
}
