import Link from "next/link";
import { PhotoArt } from "./art";
import { SHOWCASE_THEMES } from "./data";

/* ── Emotional transition ─────────────────────────────────────────────────── */
export function BrandStatement() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--l-ivory)] px-5 py-28 sm:px-8">
      {/* marigold buds drifting in from the edges */}
      <span aria-hidden="true" className="absolute -left-8 top-16 text-7xl text-[color:var(--l-marigold)]/15">
        ❀
      </span>
      <span aria-hidden="true" className="absolute -right-6 bottom-20 text-8xl text-[color:var(--l-pink)]/12">
        ✿
      </span>

      <div className="mx-auto max-w-3xl text-center">
        <p
          className="l-display text-balance text-[clamp(1.9rem,4.4vw,3.2rem)] font-medium leading-tight text-[color:var(--l-wine)]"
          data-reveal
        >
          Indian celebrations were never meant to feel generic.
        </p>
        <div className="mx-auto mt-10 h-14 w-px bg-gradient-to-b from-[color:var(--l-gold)] to-transparent" aria-hidden="true" />
        <p
          className="l-display mt-8 text-[clamp(1.4rem,3vw,2.1rem)] leading-snug text-[color:var(--l-ink-soft)]"
          data-reveal
        >
          Every family.
          <br />
          Every ritual.
          <br />
          Every invitation.
          <br />
          <span className="italic text-[color:var(--l-pink)]">Personal.</span>
        </p>
      </div>
    </section>
  );
}

/* ── Live wedding experience preview ──────────────────────────────────────── */
function PhoneEvent({ name, date, time, venue }: { name: string; date: string; time: string; venue: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--l-line)] bg-white p-3">
      <div className="flex items-baseline justify-between">
        <p className="l-display text-[15px] font-semibold text-[color:var(--l-wine)]">{name}</p>
        <p className="text-[10px] font-semibold tabular-nums text-[color:var(--l-ink-soft)]">
          {date} · {time}
        </p>
      </div>
      <p className="mt-0.5 text-[11px] text-[color:var(--l-ink-soft)]">{venue}</p>
      <div className="mt-2 flex gap-1.5 text-[9px] font-semibold">
        <span className="rounded-full bg-[color:var(--l-ivory-2)] px-2 py-0.5 text-[color:var(--l-ink-soft)]">View Venue</span>
        <span className="rounded-full bg-[color:var(--l-ivory-2)] px-2 py-0.5 text-[color:var(--l-ink-soft)]">Add to Calendar</span>
        <span className="rounded-full bg-[color:var(--l-emerald)] px-2 py-0.5 text-white">RSVP</span>
      </div>
    </div>
  );
}

export function ExperiencePreview() {
  return (
    <section
      id="experience"
      className="l-grain relative scroll-mt-24 overflow-hidden px-5 py-28 sm:px-8"
      style={{
        background:
          "radial-gradient(80% 60% at 50% 0%, rgba(142,24,56,.5), transparent 60%), linear-gradient(180deg, #3b1022 0%, #2a0a18 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <h2 className="l-display text-balance text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-tight text-[color:var(--l-ivory)]">
            This isn&apos;t a form.
            <br />
            It&apos;s their{" "}
            <span className="italic text-[color:var(--l-gold-lite)]">first moment</span> at your
            celebration.
          </h2>
        </div>

        <div className="relative mt-16 flex justify-center">
          {/* floating editorial photos around the device */}
          <PhotoArt
            slot="haldi"
            caption="Haldi morning"
            className="l-float absolute -left-4 top-10 hidden h-44 w-36 rounded-2xl shadow-2xl lg:block xl:left-28"
          />
          <PhotoArt
            slot="sangeet"
            caption="Sangeet night"
            className="l-float absolute -right-4 top-40 hidden h-48 w-40 rounded-2xl shadow-2xl [animation-delay:1.6s] lg:block xl:right-28"
          />
          <PhotoArt
            slot="mandap"
            caption="The mandap"
            className="l-float absolute bottom-0 left-10 hidden h-36 w-44 rounded-2xl shadow-2xl [animation-delay:3s] xl:block"
          />

          {/* device */}
          <div className="relative w-[300px] rounded-[2.6rem] border border-white/15 bg-[#160812] p-2.5 shadow-[0_60px_120px_-40px_rgba(0,0,0,.9)]" data-reveal>
            <span aria-hidden="true" className="absolute left-1/2 top-4 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/60" />
            <div className="max-h-[560px] overflow-hidden rounded-[2rem] bg-[color:var(--l-ivory)]">
              {/* mini hero */}
              <div className="l-grain relative px-5 pb-6 pt-9 text-center" style={{ background: "linear-gradient(170deg, #3b1022, #58122f)" }}>
                <p className="l-script text-lg text-[color:var(--l-gold-lite)]">Together forever</p>
                <p className="l-display text-2xl font-semibold text-white">Aarav &amp; Meera</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/70">12 December 2026</p>
              </div>
              <div className="space-y-3 px-4 py-4">
                <div className="rounded-xl bg-[color:var(--l-ivory-2)] p-3 text-center">
                  <p className="l-display text-base font-semibold text-[color:var(--l-wine)]">Namaste Sharma Family</p>
                  <p className="mt-0.5 text-[11px] italic text-[color:var(--l-ink-soft)]">
                    “We can&apos;t imagine celebrating without you.”
                  </p>
                </div>
                {/* countdown */}
                <div className="flex justify-center gap-2">
                  {[
                    ["124", "Days"],
                    ["08", "Hours"],
                    ["32", "Mins"],
                  ].map(([v, l]) => (
                    <div key={l} className="w-16 rounded-lg border border-[color:var(--l-gold)]/40 bg-white py-1.5 text-center">
                      <p className="l-display text-lg font-semibold tabular-nums text-[color:var(--l-wine)]">{v}</p>
                      <p className="text-[8px] uppercase tracking-widest text-[color:var(--l-ink-soft)]">{l}</p>
                    </div>
                  ))}
                </div>
                <PhoneEvent name="Sangeet" date="11 Dec" time="7:00 PM" venue="The Leela Palace" />
                <PhoneEvent name="Wedding" date="12 Dec" time="6:30 PM" venue="The Grand Courtyard" />
                <PhoneEvent name="Reception" date="13 Dec" time="8:00 PM" venue="The Imperial Ballroom" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Wedding themes ───────────────────────────────────────────────────────── */
export function ThemeShowcase() {
  return (
    <section id="themes" className="scroll-mt-24 overflow-hidden bg-[color:var(--l-ivory)] py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl" data-reveal>
          <h2 className="l-display text-balance text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
            A designer theme for
            <br />
            <span className="italic text-[color:var(--l-purple)]">every celebration.</span>
          </h2>
          <p className="mt-4 text-[15px] text-[color:var(--l-ink-soft)]">
            Weddings, birthdays, baby showers, housewarmings &amp; more — tap any theme to explore a live, interactive invitation.
          </p>
        </div>
      </div>

      <div className="l-gallery mt-12 px-5 sm:px-8 lg:px-[max(2rem,calc((100vw-72rem)/2))]">
        {SHOWCASE_THEMES.map((t) => (
          <Link
            key={t.id}
            href={`/demo/${t.demo}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Preview the ${t.name} theme on a live demo celebration (opens in a new tab)`}
            className="group relative block h-[500px] w-[80vw] overflow-hidden rounded-[26px] sm:w-[400px]"
          >
            <PhotoArt
              slot={t.art}
              className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 transition-transform duration-500 group-hover:-translate-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">{t.vibe}</p>
              <h3 className="l-display mt-1 text-3xl font-semibold text-white">{t.name}</h3>
              <p className="l-script mt-1 text-xl text-[color:var(--l-gold-lite)]">{t.tagline}</p>
              <div className="mt-3 flex items-center gap-2">
                {t.palette.map((c) => (
                  <span key={c} className="size-3.5 rounded-full border border-white/40" style={{ background: c }} />
                ))}
                <span className="ml-auto rounded-full border border-white/40 px-3.5 py-1.5 text-[11px] font-semibold text-white opacity-0 transition-opacity duration-300 group-focus-visible:opacity-100 group-hover:opacity-100">
                  Preview theme →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-6 px-5 text-center text-xs text-[color:var(--l-ink-soft)] sm:px-8">
        Swipe to explore · every theme is bilingual and fully yours
      </p>
    </section>
  );
}
