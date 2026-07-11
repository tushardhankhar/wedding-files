"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Reactive prefers-reduced-motion, SSR-safe (server snapshot = false). */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

/**
 * Auto-playing explainer of the whole product in four beats:
 * build the site → group your guests → choose their events → send on WhatsApp.
 * A phone mockup swaps scenes in sync with a highlighted step list + progress
 * bar. Only runs while on-screen; respects prefers-reduced-motion (no
 * auto-advance, no entrance animation — still fully clickable).
 */

type Step = { n: string; title: string; hint: string };

const STEPS: Step[] = [
  { n: "01", title: "Build your site", hint: "Add your names, story, events and photos — yourself, in minutes." },
  { n: "02", title: "Group your guests", hint: "Sort families and friends into simple groups." },
  { n: "03", title: "Choose their events", hint: "Each group sees only the events they're invited to." },
  { n: "04", title: "Send on WhatsApp", hint: "One private link per group — guests just tap and RSVP." },
];

const STEP_MS = 3800;

export function ProcessFlow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Advance while visible; re-created on every `active` change so a manual
  // click also restarts the dwell timer.
  useEffect(() => {
    if (!inView || reduced) return;
    const t = setTimeout(
      () => setActive((a) => (a + 1) % STEPS.length),
      STEP_MS
    );
    return () => clearTimeout(t);
  }, [inView, reduced, active]);

  // Entrance-animation class string (empty under reduced motion).
  const anim = reduced
    ? ""
    : "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500";

  return (
    <section
      id="how-it-works"
      ref={rootRef}
      className="scroll-mt-24 bg-[color:var(--l-ivory-2)] px-5 py-24 sm:px-8"
    >
      <div className="mx-auto max-w-xl text-center" data-reveal>
        <h2 className="l-display text-balance text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-tight text-[color:var(--l-wine)]">
          You make it. You share it.
          <br />
          <span className="italic text-[color:var(--l-marigold)]">Beautifully simple.</span>
        </h2>
        <p className="mt-4 text-[15px] text-[color:var(--l-ink-soft)]">
          From your details to a private invitation in a guest&apos;s hand — in four steps.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
        {/* Steps */}
        <ol className="order-2 space-y-2.5 lg:order-1">
          {STEPS.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.n}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={on ? "step" : undefined}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                    on
                      ? "border-[color:var(--l-gold)]/50 bg-white shadow-[0_18px_40px_-24px_rgba(59,16,34,.35)]"
                      : "border-transparent hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        on
                          ? "bg-[color:var(--l-wine)] text-[color:var(--l-gold-lite)]"
                          : "bg-[color:var(--l-ivory-2)] text-[color:var(--l-ink-soft)]"
                      }`}
                    >
                      {s.n}
                    </span>
                    <div>
                      <p className="l-display text-lg font-semibold leading-tight text-[color:var(--l-wine)]">
                        {s.title}
                      </p>
                      <p
                        className={`mt-0.5 text-sm text-[color:var(--l-ink-soft)] ${
                          on ? "" : "hidden sm:block"
                        }`}
                      >
                        {s.hint}
                      </p>
                    </div>
                  </div>
                  {on ? (
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-[color:var(--l-ivory-2)]">
                      <span
                        key={active}
                        className={`pf-bar block h-full w-full rounded-full bg-gradient-to-r from-[color:var(--l-marigold)] to-[color:var(--l-pink)] ${
                          reduced ? "" : "pf-bar-run"
                        }`}
                        style={{ animationDuration: `${STEP_MS}ms` }}
                      />
                    </div>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>

        {/* Phone */}
        <div className="order-1 mx-auto w-[300px] max-w-full lg:order-2">
          <div className="relative rounded-[2.6rem] border border-white/15 bg-[#160812] p-2.5 shadow-[0_50px_110px_-40px_rgba(59,16,34,.7)]">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-4 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/60"
            />
            <div className="h-[480px] overflow-hidden rounded-[2rem] bg-[color:var(--l-ivory)]">
              <div key={active} className={reduced ? "h-full" : "h-full animate-in fade-in duration-500"}>
                <Scene active={active} anim={anim} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The four phone scenes ───────────────────────────────────────────────── */
function Scene({ active, anim }: { active: number; anim: string }) {
  if (active === 0) return <SceneBuild anim={anim} />;
  if (active === 1) return <SceneGroups anim={anim} />;
  if (active === 2) return <SceneEvents anim={anim} />;
  return <SceneSend anim={anim} />;
}

function SceneBuild({ anim }: { anim: string }) {
  return (
    <div className="flex h-full flex-col">
      <div
        className="l-grain px-5 pb-6 pt-9 text-center"
        style={{ background: "linear-gradient(170deg,#3b1022,#58122f)" }}
      >
        <p className={`l-script text-lg text-[color:var(--l-gold-lite)] ${anim}`}>
          Together forever
        </p>
        <p className={`l-display text-2xl font-semibold text-white ${anim}`} style={{ animationDelay: "90ms" }}>
          Aarav <span className="italic text-[color:var(--l-pink)]">&amp;</span> Meera
        </p>
        <p className={`mt-1 text-[10px] uppercase tracking-[0.22em] text-white/70 ${anim}`} style={{ animationDelay: "180ms" }}>
          12 December 2026
        </p>
      </div>
      <div className="flex-1 space-y-2.5 px-4 py-4">
        <div
          className={`h-24 rounded-xl ${anim}`}
          style={{ animationDelay: "260ms", background: "linear-gradient(135deg,var(--l-marigold),var(--l-pink))" }}
        />
        {[["Sangeet", "11 Dec · 7:00 PM"], ["Wedding", "12 Dec · 6:30 PM"]].map(([n, d], i) => (
          <div
            key={n}
            className={`flex items-baseline justify-between rounded-xl border border-[color:var(--l-line)] bg-white p-3 ${anim}`}
            style={{ animationDelay: `${340 + i * 90}ms` }}
          >
            <p className="l-display text-sm font-semibold text-[color:var(--l-wine)]">{n}</p>
            <p className="text-[10px] tabular-nums text-[color:var(--l-ink-soft)]">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneGroups({ anim }: { anim: string }) {
  const groups: [string, string[]][] = [
    ["Sharma Family", ["Rajesh", "Neetu", "Rohan", "Riya"]],
    ["Kapoor Family", ["Vikram", "Simran", "Aanya"]],
    ["Aarav's Office", ["A table of 12"]],
  ];
  return (
    <div className="h-full space-y-3 bg-[color:var(--l-ivory)] px-4 py-5">
      <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-[color:var(--l-ink-soft)]">
        Your guest groups
      </p>
      {groups.map(([name, members], i) => (
        <div
          key={name}
          className={`rounded-xl border border-[color:var(--l-line)] bg-white p-3 ${anim}`}
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <p className="l-display text-sm font-semibold text-[color:var(--l-wine)]">{name}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {members.map((m) => (
              <span key={m} className="rounded-full bg-[color:var(--l-ivory-2)] px-2 py-0.5 text-[10px] text-[color:var(--l-ink-soft)]">
                {m}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SceneEvents({ anim }: { anim: string }) {
  const rows: [string, boolean][] = [
    ["Haldi", false],
    ["Mehendi", false],
    ["Sangeet", true],
    ["Wedding", true],
    ["Reception", true],
  ];
  return (
    <div className="h-full bg-[color:var(--l-ivory)] px-4 py-5">
      <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-[color:var(--l-ink-soft)]">
        Sharma Family · invited to
      </p>
      <div className="mt-4 space-y-2">
        {rows.map(([n, on], i) => (
          <div
            key={n}
            className={`flex items-center justify-between rounded-xl border p-3 ${anim} ${
              on
                ? "border-[color:var(--l-emerald)]/40 bg-[color:var(--l-emerald)]/10"
                : "border-dashed border-[color:var(--l-line)] bg-white"
            }`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <span className={`text-sm font-medium ${on ? "text-[color:var(--l-wine)]" : "text-[color:var(--l-ink-soft)]/60"}`}>
              {n}
            </span>
            <span
              className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${
                on ? "justify-end bg-[color:var(--l-emerald)]" : "justify-start bg-[color:var(--l-line)]"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneSend({ anim }: { anim: string }) {
  return (
    <div className="flex h-full flex-col bg-[#0b141a] px-4 py-5">
      <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-white/50">
        WhatsApp
      </p>
      <div className="mt-auto space-y-2">
        <div className={`ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-[#005c4b] p-3 ${anim}`}>
          <p className="text-[13px] leading-snug text-white">
            Namaste Sharma Family 🙏 You&apos;re invited to our celebrations!
          </p>
          <div className="mt-2 rounded-lg bg-white/10 p-2.5">
            <p className="text-[11px] font-semibold text-[color:var(--l-gold-lite)]">Aarav &amp; Meera</p>
            <p className="mt-0.5 text-[10px] text-white/70">jointhejashn.com/aarav-meera/…</p>
          </div>
          <p className="mt-1 text-right text-[9px] text-[#8fb0a0]">12:18 AM ✓✓</p>
        </div>
        <p className={`text-center text-[10px] text-white/40 ${anim}`} style={{ animationDelay: "220ms" }}>
          Each family gets their own private link.
        </p>
      </div>
    </div>
  );
}
