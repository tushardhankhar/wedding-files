"use client";

import { useState } from "react";
import type { WebsiteViewProps } from "../website-view";
import { T, TT } from "../bilingual";
import { splitNames, longDate, clockTime, weekday, compactDate, gcalUrl } from "../format";
import { useGroupRsvp, useSelfRsvp } from "../use-rsvp";
import { useCountdown, pad2 } from "../use-countdown";

export function VowView(props: WebsiteViewProps) {
  const { names, dateLabel, countdownDate, events, config, chip, rsvp, selfRsvp, ownerPreview } = props;
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [menu, setMenu] = useState(false);

  const pair = splitNames(names);
  const milestones = config.story?.milestones ?? [];
  const images = config.gallery?.images ?? [];
  const contacts = config.footer?.contacts ?? [];
  const venues = events.filter((e) => e.venueName);
  const hasRsvp = Boolean(rsvp || selfRsvp || ownerPreview);
  const family = rsvp && chip ? chip : ownerPreview ? { en: "Sharma Family", hi: "शर्मा परिवार" } : null;
  const initials = names.split(" & ").map((n) => n[0]).join(" / ");
  const city = venues[0]?.venueAddress?.split(",").pop()?.trim();

  const links: Array<[string, string, string]> = [];
  if (milestones.length) links.push(["#story", "Story", "कहानी"]);
  if (events.length) links.push(["#weekend", "Weekend", "आयोजन"]);
  if (venues.length) links.push(["#location", "Location", "स्थान"]);
  if (images.length) links.push(["#gallery", "Gallery", "गैलरी"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);

  return (
    <div className="vow" data-lang={lang}>
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-black/8 bg-[color:var(--v-white)]/92 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="v-serif text-lg tracking-[0.3em]">{initials}</a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {links.map(([href, en, hi]) => <a key={href} href={href} className="text-[11px] font-medium uppercase tracking-[0.25em] text-black/60 transition-colors hover:text-black"><TT en={en} hi={hi} /></a>)}
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
        <div className="fixed inset-0 z-[70] flex flex-col justify-center gap-6 bg-[color:var(--v-white)] px-8 duration-300 animate-in fade-in" role="dialog" aria-modal="true">
          <button type="button" onClick={() => setMenu(false)} className="absolute right-6 top-6 text-xs font-medium uppercase tracking-widest">Close</button>
          {links.map(([href, en, hi]) => <a key={href} href={href} onClick={() => setMenu(false)} className="v-serif text-5xl"><TT en={en} hi={hi} /></a>)}
        </div>
      ) : null}

      {/* OPENING / HERO — huge names + vertical photo, B&W → colour */}
      <section id="top" className="relative px-6 pb-16 pt-32 sm:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-black/50" data-tw-reveal><TT en="The wedding of" hi="विवाह" /></p>
          <div className="mt-6 flex items-center justify-center gap-3 sm:gap-8">
            <h1 className="v-serif text-[clamp(3rem,13vw,10rem)] font-medium leading-none tracking-tight" data-tw-reveal>{pair ? pair[0] : names}</h1>
            {pair ? (
              <>
                <div className="hidden h-64 w-24 shrink-0 overflow-hidden sm:block lg:h-96 lg:w-40" data-tw-reveal>
                  <div data-vcolor className="h-full w-full" style={{ background: "linear-gradient(150deg,#7e9278,#354438 70%,#181818)" }} />
                </div>
                <h1 className="v-serif text-[clamp(3rem,13vw,10rem)] font-medium leading-none tracking-tight" data-tw-reveal>{pair[1]}</h1>
              </>
            ) : null}
          </div>
          <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.4em] text-black/60" data-tw-reveal>{longDate(countdownDate, true) || dateLabel}{city ? ` · ${city}` : ""}</p>
          <p className="v-serif mt-4 text-2xl italic text-black/70" data-tw-reveal><TT en="We saved you a seat." hi="हमने आपके लिए एक जगह रखी है।" /></p>
          {hasRsvp ? <a href="#rsvp" className="mt-8 inline-block border border-black px-8 py-4 text-[11px] font-medium uppercase tracking-[0.3em] transition-colors hover:bg-black hover:text-white"><TT en="Open invitation" hi="निमंत्रण खोलें" /></a> : null}
        </div>
      </section>

      {/* HERO STATEMENT — colourising band */}
      <section className="relative overflow-hidden">
        <div data-vcolor className="relative flex min-h-[70vh] items-center justify-center" style={{ background: "linear-gradient(160deg,#354438 0%,#7e9278 60%,#d8c2a0 120%)" }}>
          <div className="px-6 text-center">
            <h2 className="v-serif text-[clamp(2.8rem,9vw,7rem)] font-medium leading-[0.95] text-white" data-tw-reveal>
              <TT en="Forever" hi="हमेशा" /><br /><TT en="starts" hi="यहीं से" /><br /><span className="italic"><TT en="here." hi="शुरू।" /></span>
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
          <p className="v-serif mt-10 text-[clamp(1.4rem,3.4vw,2.2rem)] italic leading-relaxed text-black/80">
            <TT
              en="“I choose the ordinary mornings, the difficult days, and every version of the life we are yet to build.”"
              hi="“मैं चुनता हूँ वे साधारण सुबहें, वे कठिन दिन, और उस जीवन का हर रूप जिसे हम अभी बनाना बाक़ी है।”"
            />
          </p>
          <p className="v-script mt-6 text-3xl text-[color:var(--v-sage)]">{names}</p>
        </div>
      </section>

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
              {rsvp ? <VowGroupRsvp slug={rsvp.slug} events={events} guests={rsvp.guests} initial={rsvp.statuses} date={countdownDate} /> : selfRsvp ? <VowSelfRsvp slug={selfRsvp.slug} events={selfRsvp.events} date={countdownDate} /> : <VowRsvpDemo events={events} />}
            </div>
          </div>
        </section>
      ) : null}

      {/* FOOTER */}
      <footer className="bg-[color:var(--v-black)] px-6 py-16 text-center text-[color:var(--v-white)]">
        <p className="v-serif text-4xl font-medium">{names}</p>
        <p className="v-script mt-2 text-3xl text-[color:var(--v-champ)]">{compactDate(countdownDate, ".") || dateLabel}</p>
        {contacts.length ? <p className="mt-6 text-sm text-white/55">{contacts.map((c) => `${c.name} · ${c.phone}`).join("   ")}</p> : null}
        <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-white/40"><TT en="Forever starts here · Jashan" hi="हमेशा यहीं से · जश्न" /></p>
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

function VowGroupRsvp({ slug, events, guests, initial, date }: { slug: string; events: WebsiteViewProps["events"]; guests: { id: string; name: string }[]; initial: Record<string, Record<string, "attending" | "declined">>; date: string | null }) {
  const { state, error, saved, choose } = useGroupRsvp(slug, initial);
  return (
    <div className="space-y-12">
      {error ? <p className="text-center text-sm text-[color:var(--v-grey)]" role="alert">{error}</p> : null}
      {events.map((e) => (
        <div key={e.id}>
          <h3 className="v-serif text-2xl font-medium"><T value={{ en: e.name, hi: e.nameHi ?? undefined }} /></h3>
          <div className="mt-4 space-y-3">
            {guests.map((g) => (
              <div key={g.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="w-28 shrink-0 text-sm uppercase tracking-[0.15em] text-black/70">{g.name}</span>
                <div className="flex flex-1 gap-2">
                  <VowChoice on={state[e.id]?.[g.id] === "attending"} tone="yes" onClick={() => choose(e.id, g.id, "attending")}><TT en="Yes, with love" hi="जी, प्रेम सहित" /></VowChoice>
                  <VowChoice on={state[e.id]?.[g.id] === "declined"} tone="no" onClick={() => choose(e.id, g.id, "declined")}><TT en="Unable to attend" hi="नहीं आ पाएँगे" /></VowChoice>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {saved ? <p className="v-serif text-center text-3xl italic"><TT en="We can't wait to see you." hi="हमें आपका इंतज़ार है।" /><span className="mt-2 block text-base not-italic tracking-[0.3em] text-black/50">{compactDate(date, ".")}</span></p> : null}
    </div>
  );
}

function VowSelfRsvp({ slug, events, date }: { slug: string; events: { id: string; name: string }[]; date: string | null }) {
  const r = useSelfRsvp(slug, events.map((e) => e.id));
  if (r.done) return <p className="v-serif text-center text-3xl italic"><TT en="We can't wait to see you." hi="हमें आपका इंतज़ार है।" /><span className="mt-2 block text-base not-italic tracking-[0.3em] text-black/50">{compactDate(date, ".")}</span></p>;
  const field = "w-full border-b border-black/30 bg-transparent px-1 py-3 focus:border-black focus:outline-none";
  return (
    <div className="mx-auto max-w-md space-y-5">
      {r.error ? <p className="text-center text-sm text-[color:var(--v-grey)]" role="alert">{r.error}</p> : null}
      <input type="text" value={r.name} maxLength={120} onChange={(e) => r.setName(e.target.value)} placeholder="Your name" className={field} />
      <input type="number" min={1} max={50} value={r.size} onChange={(e) => r.setSize(Number(e.target.value))} className={field} />
      <div className="grid gap-2 sm:grid-cols-2">{events.map((e) => <VowChoice key={e.id} on={r.selected.has(e.id)} tone="yes" onClick={() => r.toggle(e.id)}>{e.name}</VowChoice>)}</div>
      <button type="button" onClick={r.submit} disabled={r.pending} className="w-full bg-black px-6 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-white disabled:opacity-60">{r.pending ? "…" : <TT en="Send RSVP" hi="उत्तर भेजें" />}</button>
    </div>
  );
}

function VowRsvpDemo({ events }: { events: WebsiteViewProps["events"] }) {
  return (
    <div className="space-y-8">
      {events.slice(0, 2).map((e) => (
        <div key={e.id}>
          <h3 className="v-serif text-2xl font-medium">{e.name}</h3>
          <div className="mt-4 flex gap-2">
            <VowChoice on={false} tone="yes" disabled><TT en="Yes, with love" hi="जी, प्रेम सहित" /></VowChoice>
            <VowChoice on={false} tone="no" disabled><TT en="Unable to attend" hi="नहीं" /></VowChoice>
          </div>
        </div>
      ))}
      <p className="text-center text-sm italic text-black/50"><TT en="Your guests will RSVP here." hi="आपके मेहमान यहाँ उत्तर देंगे।" /></p>
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
      <div className="mx-auto flex max-w-2xl items-stretch justify-center divide-x divide-black/15">
        {units.map(([v, en, hi]) => (
          <div key={en} className="flex flex-1 flex-col items-center px-2 sm:px-6">
            <span className="v-serif text-[clamp(2.6rem,10vw,5.5rem)] font-medium leading-none tabular-nums">{v}</span>
            <span className="mt-3 text-[10px] font-medium uppercase tracking-[0.35em] text-black/45"><TT en={en} hi={hi} /></span>
          </div>
        ))}
      </div>
      <p className="v-serif mt-8 text-xl italic text-black/60"><TT en="until forever." hi="हमेशा तक।" /></p>
    </section>
  );
}
