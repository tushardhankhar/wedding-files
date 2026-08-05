"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DEMO_EVENTS, DEMO_FAMILIES } from "./data";

/**
 * THE critical product explanation: pick a family, watch their invitation
 * change. Every event renders for every family — invited ones live, the rest
 * struck through and greyed — so the exclusion is seen, not just told.
 */
export function GuestPersonalisationDemo() {
  const [familyId, setFamilyId] = useState(DEMO_FAMILIES[0].id);
  const family = DEMO_FAMILIES.find((f) => f.id === familyId) ?? DEMO_FAMILIES[0];

  const hidden = DEMO_EVENTS.filter((e) => !family.eventIds.includes(e.id));

  return (
    <section className="bg-[color:var(--l-ivory)] px-5 py-24 sm:px-8" id="demo">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--l-gold)]">
            Why Jashn is different
          </p>
          <h2 className="l-display mt-2 text-balance text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
            One invitation link.
            <br />
            A different set of events
            <br />
            <span className="italic text-[color:var(--l-pink)]">
              for every guest.
            </span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--l-ink-soft)]">
            Your officemates don&apos;t need to see the Haldi. Your college
            friends don&apos;t need the family puja. Choose who sees what —
            pick a family below and watch the invitation change.
          </p>
        </div>

        {/* Family selector */}
        <div
          className="mt-10 flex flex-wrap justify-center gap-3"
          role="tablist"
          aria-label="Choose a guest family"
        >
          {DEMO_FAMILIES.map((f) => {
            const active = f.id === familyId;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={active}
                onClick={() => setFamilyId(f.id)}
                className={cn(
                  "rounded-full border px-6 py-3 text-sm font-semibold transition-all",
                  active
                    ? "border-transparent bg-[color:var(--l-wine)] text-[color:var(--l-gold-lite)] shadow-[0_12px_30px_-14px_rgba(59,16,34,.6)]"
                    : "border-[color:var(--l-line)] bg-white/60 text-[color:var(--l-ink-soft)] hover:border-[color:var(--l-gold)]"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Invitation preview */}
        <div
          key={family.id}
          className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-[color:var(--l-line)] bg-white p-6 shadow-[0_30px_70px_-30px_rgba(59,16,34,.35)] duration-500 animate-in fade-in zoom-in-[.985] sm:p-9"
        >
          <p className="l-script text-2xl text-[color:var(--l-gold)]">Namaste</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="l-display text-3xl font-semibold text-[color:var(--l-wine)]">
              {family.greeting}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {family.members.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-[color:var(--l-ivory-2)] px-3 py-1 text-xs font-medium text-[color:var(--l-ink-soft)]"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--l-gold)]">
            What the {family.label} actually sees
          </p>

          {/* Every event renders in the same grid, invited or not — the
              exclusion is the point, so it has to be visible without reading
              a caption. Hidden events go dashed, greyed and struck through
              right next to the ones that made the cut; a visitor reads the
              difference in one glance instead of having to find a footnote. */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {DEMO_EVENTS.map((e, i) => {
              const isInvited = family.eventIds.includes(e.id);
              return (
                <div
                  key={e.id}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-4 duration-500 animate-in fade-in slide-in-from-bottom-2",
                    isInvited
                      ? "border-[color:var(--l-line)] bg-[color:var(--l-ivory)]"
                      : "border-dashed border-[color:var(--l-line)] bg-[color:var(--l-ivory)]/50 opacity-55"
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {isInvited ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-1"
                      style={{ background: e.color }}
                    />
                  ) : null}
                  <div className="flex items-baseline justify-between gap-2 pl-2">
                    <p
                      className={cn(
                        "l-display text-xl font-semibold",
                        isInvited
                          ? "text-[color:var(--l-wine)]"
                          : "text-[color:var(--l-ink-soft)] line-through decoration-2"
                      )}
                    >
                      {e.name}{" "}
                      <span className="l-deva text-sm font-normal text-[color:var(--l-ink-soft)]">
                        {e.hi}
                      </span>
                    </p>
                    {isInvited ? (
                      <p className="text-xs font-semibold tabular-nums text-[color:var(--l-ink-soft)]">
                        {e.date} · {e.time}
                      </p>
                    ) : null}
                  </div>
                  {isInvited ? (
                    <>
                      <p className="mt-1 pl-2 text-sm text-[color:var(--l-ink-soft)]">{e.venue}</p>
                      <div className="mt-3 flex gap-2 pl-2">
                        <span className="rounded-full bg-[color:var(--l-emerald)]/10 px-3 py-1 text-[11px] font-semibold text-[color:var(--l-emerald)]">
                          RSVP
                        </span>
                        <span className="rounded-full border border-[color:var(--l-line)] px-3 py-1 text-[11px] font-medium text-[color:var(--l-ink-soft)]">
                          Directions
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 pl-2 text-[11px] font-medium text-[color:var(--l-ink-soft)]/70">
                      🔒 Not shown to the {family.label}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-center text-[13px] italic text-[color:var(--l-ink-soft)]">
            {hidden.length > 0
              ? `Not hidden, not blurred — for the ${family.label}, ${hidden
                  .map((e) => e.name)
                  .join(" & ")} simply isn't on their link.`
              : "The Kapoors are close family — they see every celebration."}
          </p>
        </div>

        {/* Absorbed from what used to be a separate 674px "Private by design"
            section further down the page. It was making this exact argument a
            second time, in prose, after this demo had already proved it
            interactively — and a claim restated is a claim weakened. The real
            guest URL and the terms are worth keeping, so they moved here, where
            the visitor has just watched the thing they describe happen. */}
        <div className="mt-10 text-center" data-reveal>
          <div className="mx-auto inline-flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-[color:var(--l-line)] bg-white px-5 py-3 shadow-sm">
            <span aria-hidden="true" className="text-[color:var(--l-gold)]">🔒</span>
            <code className="text-[13px] text-[color:var(--l-wine)]">
              jointhejashn.com/a-meera/g/
              <span className="font-semibold text-[color:var(--l-pink)]">7FK29</span>
            </code>
            <span className="rounded-full bg-[color:var(--l-ivory-2)] px-3 py-1 text-[11px] font-semibold text-[color:var(--l-ink-soft)]">
              Sharma Family only
            </span>
          </div>

          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              "Private link per family",
              "No guest account",
              "No app download",
              "Links can be revoked",
            ].map((p) => (
              <li
                key={p}
                className="rounded-full border border-[color:var(--l-line)] bg-white px-3.5 py-1.5 text-[11px] font-medium text-[color:var(--l-ink-soft)]"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
