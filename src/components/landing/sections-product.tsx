import Link from "next/link";
import { PhotoArt, PetalField } from "./art";
import { PRICE, PLAN_INCLUDES, COMING_SOON, REALITY_NOTES, CONTACT_EMAIL } from "./data";
import { UtsavLogo, UtsavMonogram } from "./logo";
import { CountUp } from "./count-up";

/* ── Features — editorial, alternating ────────────────────────────────────── */
function FeatureRow({
  eyebrow,
  title,
  text,
  visual,
  flip,
}: {
  eyebrow: string;
  title: string;
  text: string;
  visual: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}
      data-reveal
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[color:var(--l-gold)]">
          {eyebrow}
        </p>
        <h3 className="l-display mt-2 text-3xl font-semibold leading-tight text-[color:var(--l-wine)]">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[color:var(--l-ink-soft)]">{text}</p>
      </div>
      <div>{visual}</div>
    </div>
  );
}

const rsvpBars = [
  { name: "Sangeet", a: 42, b: 48 },
  { name: "Wedding", a: 176, b: 200 },
  { name: "Reception", a: 231, b: 260 },
];

export function FeatureStory() {
  return (
    <section className="bg-[color:var(--l-ivory-2)] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center" data-reveal>
          <h2 className="l-display text-balance text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
            Everything your guests need.
            <br />
            <span className="italic text-[color:var(--l-emerald)]">Nothing they don&apos;t.</span>
          </h2>
        </div>

        <div className="mt-16 space-y-20">
          <FeatureRow
            eyebrow="Personal family invitations"
            title="Welcome every household by name."
            text="A Sharma-family link greets the Sharmas — with every invited member listed, from Dadi to the youngest cousin."
            visual={
              <div className="mx-auto max-w-sm rounded-2xl border border-[color:var(--l-line)] bg-white p-6 shadow-[0_24px_50px_-24px_rgba(59,16,34,.3)]">
                <p className="l-script text-xl text-[color:var(--l-gold)]">Namaste</p>
                <p className="l-display text-2xl font-semibold text-[color:var(--l-wine)]">Sharma Family</p>
                <ul className="mt-4 space-y-2">
                  {["Rajesh", "Neetu", "Rohan", "Riya"].map((m) => (
                    <li key={m} className="flex items-center gap-2.5 text-sm text-[color:var(--l-ink-soft)]">
                      <span className="size-1.5 rounded-full bg-[color:var(--l-marigold)]" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            }
          />

          <FeatureRow
            flip
            eyebrow="Event-level privacy"
            title="Every guest sees only their invited celebrations."
            text="Tick the events each household is invited to. Everything else never reaches their screen — not hidden, simply never sent."
            visual={
              <div className="mx-auto max-w-sm rounded-2xl border border-[color:var(--l-line)] bg-white p-6 shadow-[0_24px_50px_-24px_rgba(59,16,34,.3)]">
                <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--l-ink-soft)]">
                  Sharma Family · invited to
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ["Haldi", false],
                    ["Mehendi", false],
                    ["Sangeet", true],
                    ["Wedding", true],
                    ["Reception", true],
                  ].map(([name, on]) => (
                    <span
                      key={String(name)}
                      className={
                        on
                          ? "rounded-full bg-[color:var(--l-emerald)]/12 px-3.5 py-1.5 text-xs font-semibold text-[color:var(--l-emerald)]"
                          : "rounded-full border border-dashed border-[color:var(--l-line)] px-3.5 py-1.5 text-xs text-[color:var(--l-ink-soft)]/60 line-through"
                      }
                    >
                      {on ? "✓ " : ""}
                      {String(name)}
                    </span>
                  ))}
                </div>
              </div>
            }
          />

          <FeatureRow
            eyebrow="RSVP, event by event"
            title="Know exactly who's coming to everything in between."
            text="Every event has its own headcount — updated the moment a family responds, from the smallest puja to the big day."
            visual={
              <div className="mx-auto max-w-sm space-y-4 rounded-2xl border border-[color:var(--l-line)] bg-white p-6 shadow-[0_24px_50px_-24px_rgba(59,16,34,.3)]">
                {rsvpBars.map((r) => (
                  <div key={r.name}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-[color:var(--l-wine)]">{r.name}</span>
                      <span className="tabular-nums text-[color:var(--l-ink-soft)]">
                        {r.a} / {r.b} attending
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[color:var(--l-ivory-2)]">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-[color:var(--l-marigold)] to-[color:var(--l-pink)]"
                        style={{ width: `${(r.a / r.b) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            }
          />
        </div>

        {/* trio of lighter features */}
        <div className="mt-20 grid gap-5 md:grid-cols-3" data-reveal>
          <div className="rounded-2xl border border-[color:var(--l-line)] bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--l-gold)]">
              Built for WhatsApp
            </p>
            <p className="mt-2 text-sm text-[color:var(--l-ink-soft)]">
              Share a beautiful private invitation in seconds.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl rounded-bl-sm bg-[color:var(--l-emerald)]/10 px-4 py-2.5 text-sm text-[color:var(--l-emerald)]">
              <span className="size-2 rounded-full bg-[color:var(--l-emerald)]" />
              jointhejashn.com/a-meera/…
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--l-line)] bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--l-gold)]">
              English + Hindi
            </p>
            <p className="mt-2 text-sm text-[color:var(--l-ink-soft)]">
              Celebrate in the language that feels like home.
            </p>
            <p className="l-display mt-4 text-lg text-[color:var(--l-wine)]">You&apos;re invited</p>
            <p className="l-deva text-lg text-[color:var(--l-pink)]">आप सादर आमंत्रित हैं</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--l-line)] bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--l-gold)]">
              Every detail, one place
            </p>
            <p className="mt-2 text-sm text-[color:var(--l-ink-soft)]">
              Countdowns, venues, maps, galleries, timelines and FAQs.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Countdown", "Venues", "Maps", "Gallery", "Timeline", "FAQs"].map((c) => (
                <span key={c} className="rounded-full bg-[color:var(--l-ivory-2)] px-3 py-1 text-[11px] font-medium text-[color:var(--l-ink-soft)]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── For couples ──────────────────────────────────────────────────────────── */
export function CouplesSection() {
  return (
    <section id="for-couples" className="scroll-mt-24 bg-[color:var(--l-ivory)] px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <PhotoArt slot="couple" className="h-[420px] rounded-[26px] shadow-[0_36px_80px_-32px_rgba(59,16,34,.5)]" />
        <div data-reveal>
          <h2 className="l-display text-balance text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
            No designer. No developer.
            <br />
            <span className="italic text-[color:var(--l-pink)]">Just you, in a few minutes.</span>
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[color:var(--l-ink-soft)]">
            Add your names, your story, your events and photos yourself — pick a
            theme you love and it all comes together into one beautiful, private
            invitation you can share the same day.
          </p>
          <ul className="mt-6 space-y-2.5">
            {[
              "Add your own names, dates and events.",
              "Invite each family to only their events.",
              "Share one private link on WhatsApp.",
            ].map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-[color:var(--l-ink)]">
                <span className="text-[color:var(--l-gold)]">✦</span>
                {p}
              </li>
            ))}
          </ul>
          <Link
            href="/demo/royal"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-[color:var(--l-wine)] px-8 py-4 text-sm font-semibold text-[color:var(--l-gold-lite)] transition-transform hover:-translate-y-0.5"
          >
            See a live demo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── For planners ─────────────────────────────────────────────────────────── */
const PLANNER_STATS: [number, string][] = [
  [742, "Invited guests"],
  [612, "Responded"],
  [532, "Wedding attendees"],
  [418, "Sangeet attendees"],
  [72, "Airport pickups"],
  [42, "Vegetarian"],
  [6, "Jain meals"],
  [26, "Children"],
];

export function PlannerSection() {
  return (
    <section
      id="for-planners"
      className="l-grain relative scroll-mt-24 overflow-hidden px-5 py-28 sm:px-8"
      style={{
        background:
          "radial-gradient(70% 50% at 80% 0%, rgba(90,35,110,.45), transparent 60%), linear-gradient(180deg, #2a0a18 0%, #3b1022 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl" data-reveal>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--l-gold-lite)]">
              For event planners
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--l-gold-lite)]/40 bg-[color:var(--l-gold-lite)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--l-gold-lite)]">
              <span className="size-1.5 rounded-full bg-[color:var(--l-gold-lite)]" />
              Coming soon
            </span>
          </div>
          <h2 className="l-display mt-3 text-balance text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-tight text-[color:var(--l-ivory)]">
            Still managing 600 guests in Excel and WhatsApp?
          </h2>
          <p className="l-display mt-4 text-xl italic text-[color:var(--l-gold-lite)]">
            A guest operating system for Indian celebrations — in the works.
          </p>
        </div>

        {/* dashboard mock */}
        <div className="mt-12 rounded-[24px] border border-white/12 bg-white/[0.05] p-5 backdrop-blur-sm sm:p-7" data-reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="l-display text-xl font-semibold text-white">Aarav &amp; Meera</p>
            <p className="text-xs text-white/60">130 RSVP responses pending</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PLANNER_STATS.map(([v, l]) => (
              <div key={l} className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
                <p className="l-display text-2xl font-semibold tabular-nums text-[color:var(--l-gold-lite)]">
                  <CountUp value={v} />
                </p>
                <p className="mt-0.5 text-[11px] text-white/65">{l}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* per-event attendance */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/55">
                Event attendance
              </p>
              <div className="mt-3 space-y-3">
                {[
                  ["Haldi", 260, 742],
                  ["Mehendi", 288, 742],
                  ["Sangeet", 418, 742],
                  ["Wedding", 532, 742],
                  ["Reception", 486, 742],
                ].map(([name, v, max]) => (
                  <div key={String(name)} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-white/75">{String(name)}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-[color:var(--l-saffron)] to-[color:var(--l-pink)]"
                        style={{ width: `${(Number(v) / Number(max)) * 100}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs tabular-nums text-white/70">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* household table */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/55">
                Guest households
              </p>
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                {[
                  ["Sharma Family", "4 guests", "Confirmed", true],
                  ["Kapoor Family", "6 guests", "2 pending", false],
                  ["Aarav's Office", "12 guests", "Confirmed", true],
                ].map(([name, n, status, ok]) => (
                  <div key={String(name)} className="flex items-center justify-between border-b border-white/8 px-4 py-2.5 text-xs last:border-0">
                    <span className="font-medium text-white/85">{String(name)}</span>
                    <span className="text-white/55">{String(n)}</span>
                    <span className={ok ? "text-[#7dd8ac]" : "text-[color:var(--l-saffron)]"}>{String(status)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-2xl" data-reveal>
          <p className="text-[15px] leading-relaxed text-white/75">
            A dashboard with every invitation, RSVP and headcount at a glance —
            plus dietary and logistics — is on the way, built for planners
            managing multi-event Indian celebrations.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Privacy ──────────────────────────────────────────────────────────────── */
export function PrivacySection() {
  return (
    <section className="bg-[color:var(--l-ivory-2)] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-3xl text-center" data-reveal>
        <div className="relative mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--l-gold)]/50 bg-[color:var(--l-ivory)]">
          <UtsavMonogram className="h-9 w-9" stroke="var(--l-gold)" bud="var(--l-pink)" />
        </div>
        <h2 className="l-display text-balance text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
          Private by design.
          <br />
          <span className="italic text-[color:var(--l-emerald)]">Personal by nature.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-[color:var(--l-ink-soft)]">
          Celebration details shouldn&apos;t be public pages floating around the
          internet. Every guest arrives through their own private link.
        </p>

        <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-full border border-[color:var(--l-line)] bg-white py-2.5 pl-5 pr-2.5 shadow-sm">
          <span aria-hidden="true" className="text-[color:var(--l-gold)]">🔒</span>
          <code className="text-sm text-[color:var(--l-wine)]">
            jointhejashn.com/a-meera/g/<span className="font-semibold text-[color:var(--l-pink)]">7FK29</span>
          </code>
          <span className="rounded-full bg-[color:var(--l-ivory-2)] px-3 py-1.5 text-[11px] font-semibold text-[color:var(--l-ink-soft)]">
            Sharma Family only
          </span>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            "Private guest links",
            "Event-level visibility",
            "No public guest directory",
            "No guest account",
            "No app download",
            "Links can be revoked",
          ].map((p) => (
            <span key={p} className="rounded-full border border-[color:var(--l-line)] bg-white px-4 py-1.5 text-xs font-medium text-[color:var(--l-ink-soft)]">
              {p}
            </span>
          ))}
        </div>

        <p className="l-display mt-8 text-lg italic text-[color:var(--l-wine)]">
          “Your guests only see what you&apos;ve invited them to see.”
        </p>
      </div>
    </section>
  );
}

/* ── Built around reality ─────────────────────────────────────────────────── */
export function RealitySection() {
  return (
    <section className="bg-[color:var(--l-ivory)] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="l-display text-center text-[clamp(1.8rem,4vw,2.8rem)] font-semibold text-[color:var(--l-wine)]" data-reveal>
          Built around how Indian celebrations{" "}
          <span className="italic text-[color:var(--l-marigold)]">actually work.</span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REALITY_NOTES.map((note, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-[color:var(--l-line)] bg-white p-7 text-center shadow-[0_20px_44px_-26px_rgba(59,16,34,.3)]"
              data-reveal
            >
              <span aria-hidden="true" className="text-xl text-[color:var(--l-gold)]">✦</span>
              <blockquote className="l-display mt-3 text-lg leading-snug text-[color:var(--l-wine)]">
                {note}
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing — one simple price ───────────────────────────────────────────── */
export function PricingPreview() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-[color:var(--l-ivory-2)] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto max-w-xl text-center" data-reveal>
          <h2 className="l-display text-balance text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
            One price.{" "}
            <span className="italic text-[color:var(--l-pink)]">Everything included.</span>
          </h2>
          <p className="mt-4 text-[15px] text-[color:var(--l-ink-soft)]">
            No tiers, no add-ons, no surprises — the whole invitation for one flat price.
          </p>
        </div>

        {/* the offer card, styled like an invitation */}
        <article
          className="relative mt-12 overflow-hidden rounded-[26px] bg-[color:var(--l-wine)] p-8 text-[color:var(--l-ivory)] shadow-[0_40px_90px_-32px_rgba(59,16,34,.8)] sm:p-10"
          data-reveal
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 rounded-[20px] border border-[color:var(--l-gold-lite)]/35"
          />
          <div className="relative text-center">
            <p className="l-script text-2xl text-[color:var(--l-gold-lite)]">Your celebration invitation</p>
            <p className="l-display mt-2 text-6xl font-semibold tabular-nums">{PRICE}</p>
            <p className="mt-2 text-sm text-white/70">one-time · per celebration</p>
          </div>

          <ul className="relative mx-auto mt-8 grid max-w-lg gap-2.5 sm:grid-cols-2">
            {PLAN_INCLUDES.map((pt) => (
              <li key={pt} className="flex items-start gap-2.5 text-sm text-white/90">
                <span className="mt-0.5 text-[color:var(--l-gold-lite)]">✦</span>
                {pt}
              </li>
            ))}
          </ul>

          <div className="relative mt-9 text-center">
            <Link
              href="/demo/royal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-[color:var(--l-ivory)] px-9 py-4 text-sm font-semibold text-[color:var(--l-wine)] shadow-[0_18px_44px_-14px_rgba(0,0,0,.5)] transition-transform hover:-translate-y-0.5"
            >
              See a live demo
            </Link>
          </div>

          {/* coming-soon extras — clearly not part of the price yet */}
          <div className="relative mt-8 border-t border-white/12 pt-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--l-gold-lite)]/40 bg-[color:var(--l-gold-lite)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--l-gold-lite)]">
                Coming soon
              </span>
              {COMING_SOON.map((c) => (
                <span key={c} className="rounded-full border border-white/15 px-3.5 py-1.5 text-[11px] font-medium text-white/60">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

/* ── Final CTA ────────────────────────────────────────────────────────────── */
export function FinalCta() {
  return (
    <section
      className="l-grain relative overflow-hidden px-5 py-32 text-center sm:px-8"
      style={{
        background:
          "radial-gradient(80% 70% at 25% 10%, rgba(245,166,35,.5), transparent 55%), radial-gradient(80% 70% at 80% 90%, rgba(216,27,96,.55), transparent 55%), linear-gradient(160deg, #8e1838 0%, #b91d4e 55%, #d84315 120%)",
      }}
      data-image-slot="finale"
    >
      <PetalField count={14} />
      <div className="relative mx-auto max-w-2xl" data-reveal>
        <p className="l-script text-3xl text-[color:var(--l-gold-lite)]">See it for yourself</p>
        <h2 className="l-display mt-4 text-balance text-[clamp(2.2rem,5.6vw,4.2rem)] font-semibold leading-tight text-white">
          Your invitation, live in minutes — just ₹1,599.
        </h2>
        <p className="mt-5 text-base text-white/85">
          Open a real celebration built on Jashn and see exactly what your guests
          will experience.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/demo/royal"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[color:var(--l-ivory)] px-8 py-4 text-sm font-semibold text-[color:var(--l-wine)] shadow-[0_18px_44px_-14px_rgba(0,0,0,.5)] transition-transform hover:-translate-y-0.5"
          >
            See a live demo
          </Link>
          <a
            href="#how-it-works"
            className="rounded-full border border-white/50 px-8 py-4 text-sm font-semibold text-white transition-colors hover:border-white"
          >
            How it works
          </a>
        </div>
        <p className="mt-6 text-xs tracking-wide text-white/70">
          No app. No guest signup. Just one beautiful link.
        </p>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────────── */
const FOOTER_COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Themes", href: "#themes" },
      { label: "Pricing", href: "#pricing" },
      { label: "See a live demo", href: "/demo/royal" },
    ],
  },
  {
    title: "For Planners",
    links: [
      { label: "Planner tools (soon)", href: "#for-planners" },
      { label: "Partner with us", href: "#enquire" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "#enquire" },
      { label: "Email us", href: `mailto:${CONTACT_EMAIL}` },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="bg-[color:var(--l-wine-deep)] px-5 pb-10 pt-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <UtsavLogo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              Make your own Indian celebration invitation — bilingual, private, and
              ready to share in minutes. ₹1,599.
            </p>
            <div className="mt-5 space-y-1 text-sm">
              <p className="text-white/45">Questions? Say hello.</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-[color:var(--l-gold-lite)] transition-colors hover:text-white"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_COLS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--l-gold-lite)]/80">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Join the Jashn
          </p>
          <p className="text-xs text-white/45">Made with celebration in India 🪔</p>
        </div>
      </div>
    </footer>
  );
}
