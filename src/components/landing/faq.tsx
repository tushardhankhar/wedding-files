import { FAQS, GUARANTEE, NEXT_STEPS } from "./data";
import { BookNowButton } from "./book-now";

/**
 * The three blocks that stand between "this looks nice" and "I'll pay for it":
 * the promise if it goes wrong, the map of what happens after the button, and
 * the answers to the questions nobody sends an email to ask.
 *
 * Placed immediately before the pricing section on purpose. Objections are
 * cheap to hold while browsing and expensive the moment a number appears — a
 * visitor who reaches the price still wondering whether it's a subscription, who
 * builds the site, or what happens if their relatives can't use it doesn't ask,
 * they close the tab. Answering first means the price lands on a visitor who
 * has run out of reasons to leave.
 *
 * Built on native <details>, not a JS accordion: every answer is in the HTML on
 * first paint, so it's readable by search engines and by anyone whose bundle
 * hasn't executed, and it costs no hydration on the slow Android phones most of
 * this traffic arrives on.
 */

/* ── Risk reversal ────────────────────────────────────────────────────────── */
export function GuaranteeBand() {
  return (
    <section className="bg-[color:var(--l-ivory)] px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24">
      <div
        className="mx-auto max-w-3xl rounded-[26px] border border-[color:var(--l-emerald)]/25 bg-white p-7 text-center shadow-[0_28px_70px_-40px_rgba(8,127,91,.5)] sm:p-10"
        data-reveal
      >
        <span
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--l-emerald)]/10 text-2xl"
        >
          🛡️
        </span>
        <h2 className="l-display mt-5 text-balance text-[clamp(1.6rem,4vw,2.4rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
          {GUARANTEE.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[color:var(--l-ink-soft)]">
          {GUARANTEE.body}
        </p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {GUARANTEE.chips.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--l-line)] bg-[color:var(--l-ivory-2)] px-4 py-1.5 text-xs font-semibold text-[color:var(--l-wine)]"
            >
              <span aria-hidden="true" className="text-[color:var(--l-emerald)]">
                ✓
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── What happens after the button ────────────────────────────────────────── */
/**
 * A strip, not a section. This started as a full-width block with its own
 * heading and three cards — 814px of page for an answer that is only ever
 * wanted in one place: with a thumb hovering over a green button, wondering
 * what's on the other side of it. Read anywhere else it's filler; read directly
 * under the buy buttons it's the last thing standing between browsing and
 * paying. So it lives inside the pricing section now, at a third of the height.
 *
 * It also had to move because it read as a second, competing "how it works" a
 * few hundred pixels from the real one. Numbered steps beside numbered steps
 * makes a visitor wonder which process is the actual one.
 */
export function NextStepsStrip() {
  return (
    <div
      className="mt-10 rounded-[22px] border border-[color:var(--l-line)] bg-white p-6 sm:p-8"
      data-reveal
    >
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--l-gold)]">
        What happens when you tap the button
      </p>
      <ol className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-3">
        {NEXT_STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className="l-display mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[color:var(--l-wine)] text-[11px] font-semibold text-[color:var(--l-gold-lite)]">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight text-[color:var(--l-wine)]">
                {s.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--l-ink-soft)]">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────────── */
export function FaqSection() {
  // Mirrors the same source list into structured data, so the answers can win
  // the "is X a subscription" style queries outright instead of only helping
  // people already on the page.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section
      id="faq"
      className="scroll-mt-24 bg-[color:var(--l-ivory-2)] px-5 py-20 sm:px-8 sm:py-24"
    >
      <script
        type="application/ld+json"
        // Static, author-written content — no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl">
        <div className="text-center" data-reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--l-gold)]">
            Before you decide
          </p>
          <h2 className="l-display mt-2 text-balance text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
            Every question,{" "}
            <span className="italic text-[color:var(--l-pink)]">answered.</span>
          </h2>
        </div>

        <div className="mt-10 overflow-hidden rounded-[22px] border border-[color:var(--l-line)] bg-white">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group border-b border-[color:var(--l-line)] last:border-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-[color:var(--l-wine)] transition-colors hover:bg-[color:var(--l-ivory)] sm:px-7 sm:py-5 [&::-webkit-details-marker]:hidden">
                {q}
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[color:var(--l-line)] text-[color:var(--l-gold)] transition-transform duration-300 group-open:rotate-45"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1v10M1 6h10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </summary>
              <p className="px-5 pb-5 text-[15px] leading-relaxed text-[color:var(--l-ink-soft)] sm:px-7 sm:pb-6">
                {a}
              </p>
            </details>
          ))}
        </div>

        {/* A question answered is a visitor at their most convinced — and until
            now the only thing to do with that was keep scrolling. */}
        <div className="mt-8 flex flex-col items-center gap-2.5" data-reveal>
          <BookNowButton className="w-full px-8 py-4 text-sm sm:w-auto" />
          <p className="text-center text-[11px] text-[color:var(--l-ink-soft)]/80">
            Opens WhatsApp — no payment yet. Still unsure?{" "}
            <a
              href="#enquire"
              className="font-semibold text-[color:var(--l-wine)] underline underline-offset-2"
            >
              Ask us anything
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
