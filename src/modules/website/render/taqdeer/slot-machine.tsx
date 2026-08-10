"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { TT } from "../bilingual";
import { Lever, PayLineMark, Sunburst } from "./ornaments";
import { Cabinet } from "./cabinet";
import { useSlotSound } from "./use-slot-sound";

/* ══════════════════════════════════════════════════════════════════════════
   THE MACHINE.

   Three reels and a lever, built from DOM and CSS rather than video, so it is
   sharp on every screen, themable from the palette, and works from a 248px
   preview up to a desktop.

   HOW THE SPIN WORKS. Each reel is one strip of fixed-height cells inside an
   overflow-hidden window, and the whole spin is ONE keyframe animation per
   strip, from rest to its landing offset. That is deliberate: a rAF loop or a
   swap from "loop forever" to "decelerate" both risk a visible seam and both
   cost main-thread work every frame. One animation on `transform` alone stays
   on the compositor, is frame-exact, and cannot desync from the sound — which
   is scheduled against the same clock, in one call, at pull time.

   The easing does the mechanics: a kick back off the stopper, a long fast
   travel, then a decelerating arrival that overshoots by a fraction of a cell
   and settles back — which is what a sprung reel actually does. Distances are
   expressed in cell multiples of `--tqd-cell`, so the same numbers are correct
   at every breakpoint.
   ══════════════════════════════════════════════════════════════════════════ */

/** The rest glyph: at rest the three windows show a deco lozenge, not a date. */
const REST = "❖";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/**
 * Per-reel travel and timing. `revs` is how many whole times the strip passes
 * the window before landing, so reel 3 travels farthest as well as longest —
 * without that the three stops read as one stop played three times.
 *
 * Stops land at 1.90s, 2.67s and 3.45s. Those three numbers also live in the
 * cabinet's `tqd-jolt` keyframes (as 53%, 74% and 96% of 3.6s) — change one and
 * you must change the other, or the machine will shudder off the beat.
 */
const REELS = [
  { revs: 2, dur: 1.9, delay: 0 },
  { revs: 3, dur: 2.42, delay: 0.25 },
  { revs: 4, dur: 2.95, delay: 0.5 },
];
/** Total spin, including the beat after the last reel settles. */
const SPIN_MS = 3600;

/** A reel's cells (rest glyph first) plus where its answer sits among them. */
interface Strip {
  cells: string[];
  target: number;
}

function strip(values: string[], targetIndex: number): Strip {
  return { cells: [REST, ...values], target: targetIndex + 1 };
}

/** A day reel that reads like a real one — a spread of dates, including ours. */
function dayStrip(day: string): Strip {
  const pool = ["03", "06", "09", "12", "15", "18", "21", "24", "27", "30", "02", "23"];
  const rest = pool.filter((v) => v !== day).slice(0, 11);
  rest.splice(7, 0, day);
  return strip(rest, 7);
}

function monthStrip(month: string): Strip {
  return strip(MONTHS, Math.max(0, MONTHS.indexOf(month)));
}

/** Years either side of ours, so the reel looks like it could land elsewhere. */
function yearStrip(year: string): Strip {
  const y = Number(year);
  const values = Array.from({ length: 12 }, (_, i) => String(y - 5 + i));
  return strip(values, 5);
}

export interface SlotDate {
  day: string;
  month: string;
  year: string;
}

/** Splits the wedding date into the three things the reels carry. */
export function slotDateOf(iso: string | null): SlotDate | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTHS[d.getMonth()],
    year: String(d.getFullYear()),
  };
}

/* ── one drum ───────────────────────────────────────────────────────────────
   Just the window and the strip. The column's name is engraved on the cabinet's
   brass shoulder instead of sitting inside the bay, so it can be set at a size
   a guest can actually read. */
function Reel({
  strip: s,
  index,
  running,
  runId,
}: {
  strip: Strip;
  index: number;
  running: boolean;
  runId: number;
}) {
  const { revs, dur, delay } = REELS[index];
  const steps = revs * s.cells.length + s.target;
  // Enough copies that the landing cell — and the cell after it, which shows as
  // a sliver below the pay line — both exist.
  const copies = revs + 2;
  const cells: string[] = [];
  for (let c = 0; c < copies; c++) cells.push(...s.cells);

  return (
    <div className="tqd-window">
      <div
        // Remounting on each pull is what restarts the animation, and it is the
        // only reliable way to replay a keyframe animation from the top.
        key={runId}
        className="tqd-strip"
        data-run={running ? "1" : "0"}
        style={{
          "--tqd-land": `calc(var(--tqd-cell) * -${steps})`,
          "--tqd-dur": `${dur}s`,
          "--tqd-delay": `${delay}s`,
        } as CSSProperties}
      >
        {cells.map((v, i) => (
          <span className="tqd-cell" key={i} aria-hidden={i > 0}>
            {v}
          </span>
        ))}
      </div>
      <span className="tqd-window-glass" aria-hidden="true" />
      <span className="tqd-window-smear" data-run={running ? "1" : "0"} aria-hidden="true" />
    </div>
  );
}

/* ── the machine ───────────────────────────────────────────────────────────── */
export function SlotMachine({
  date,
  monogram,
  auto,
  onRevealed,
  children,
}: {
  date: SlotDate;
  /** The couple's initials, engraved on the cabinet's maker's plate. */
  monogram: string;
  /**
   * Pull the lever by itself, shortly after mount, and stay silent doing it.
   * The landing page's phone previews and the owner's preview both need this:
   * nobody can pull a lever inside a non-interactive screenshot, so without it
   * the machine would sit at rest and the date would never appear.
   */
  auto?: boolean;
  /** Fired once the last reel has settled — the page's reveal moment. */
  onRevealed?: () => void;
  /** The announcement, rendered directly beneath the machine once it exists. */
  children?: ReactNode;
}) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "revealed">("idle");
  const [runId, setRunId] = useState(0);
  const [pull, setPull] = useState(0);
  const [throwing, setThrowing] = useState(false);
  const [from, setFrom] = useState(0);
  // An automatic pull is not a gesture, so it has no business making noise.
  const [muted, setMuted] = useState(auto === true);
  const sound = useSlotSound(muted);

  const drag = useRef<{ y0: number; step: number } | null>(null);
  /** Set when the pointer gesture has already answered a press (see onClick). */
  const handled = useRef(false);
  const timers = useRef<number[]>([]);
  const stage = useRef<HTMLDivElement | null>(null);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  /* Pointer parallax. Written straight to CSS custom properties through a ref:
     a tilt that re-rendered three reels' worth of DOM on every pointermove
     would be the one thing on this page that misses 60fps. Skipped for coarse
     pointers (there is no hover to follow) and under reduced motion. */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--tqd-tilt-x", `${(-y * 3.2).toFixed(2)}deg`);
      el.style.setProperty("--tqd-tilt-y", `${(x * 4.6).toFixed(2)}deg`);
      el.style.setProperty("--tqd-shift", `${(x * 14).toFixed(1)}px`);
    };
    const onLeave = () => {
      el.style.setProperty("--tqd-tilt-x", "0deg");
      el.style.setProperty("--tqd-tilt-y", "0deg");
      el.style.setProperty("--tqd-shift", "0px");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const spin = useCallback(
    (releasedAt: number) => {
      if (phase === "spinning") return;

      timers.current.forEach(clearTimeout);
      timers.current = [];

      // 48° is the arm's full travel — see `tqd-throw` and the Lever's own
      // `pull * 48`; all three must agree or the hand-off jumps.
      setFrom(releasedAt * 48);
      setPull(0);
      setThrowing(true);
      setPhase("spinning");
      setRunId((n) => n + 1);

      // One scheduling call for the whole spin, against the audio clock — so
      // every clunk stays welded to the reel it belongs to.
      sound.click(3);
      sound.clunk(REELS[0].dur + REELS[0].delay, 0.85);
      sound.clunk(REELS[1].dur + REELS[1].delay, 1);
      sound.clunk(REELS[2].dur + REELS[2].delay, 1.3);
      sound.chime(SPIN_MS / 1000);

      timers.current.push(
        window.setTimeout(() => setThrowing(false), 1000),
        window.setTimeout(() => {
          setPhase("revealed");
          onRevealed?.();
        }, SPIN_MS)
      );
    },
    [phase, sound, onRevealed]
  );

  /* The self-pulling lever for previews. Fired from a timer rather than the
     effect body so it never counts as a render-phase state update, and guarded
     by a ref so a re-render cannot pull it twice. */
  const autoPulled = useRef(false);
  useEffect(() => {
    if (!auto || autoPulled.current) return;
    autoPulled.current = true;
    const id = window.setTimeout(() => spin(1), 900);
    return () => clearTimeout(id);
  }, [auto, spin]);

  /* ── the pull gesture ──────────────────────────────────────────────────── */
  function onDown(e: React.PointerEvent) {
    if (phase === "spinning") return;
    // Record the gesture FIRST. setPointerCapture throws for a pointer the
    // browser doesn't consider active, and when it ran first that exception
    // discarded the drag before it existed — the lever then swallowed the press
    // and did nothing at all. Capture is a nicety; the gesture is not.
    drag.current = { y0: e.clientY, step: 0 };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no capture — the drag still tracks, it just stops at the element edge */
    }
  }

  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const next = Math.min(1, Math.max(0, (e.clientY - d.y0) / 96));
    setPull(next);
    // The ratchet: one tick per quarter of travel, pitched up as it goes.
    const step = Math.floor(next * 4);
    if (step > d.step) {
      d.step = step;
      sound.click(step);
    }
  }

  function onUp() {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    // Tell the click handler the press is already dealt with, so the two paths
    // never both fire for one press.
    handled.current = true;
    // A tap is a pull: nobody should have to discover the drag to use this.
    if (pull >= 0.42 || d.step === 0) spin(pull);
    else setPull(0);
  }

  const revealed = phase === "revealed";
  const day = dayStrip(date.day);
  const month = monthStrip(date.month);
  const year = yearStrip(date.year);

  return (
    <div className="tqd-stage" ref={stage} data-phase={phase}>
      {/* the light the cabinet stands in (the vignette that closes on it lives on
          the hero, which is the only box big enough to hold it) */}
      <Sunburst className="tqd-burst" />

      {/* .tqd-camera owns the push-in, .tqd-machine owns the tilt, .tqd-cab owns
          the jolt — three transform owners, so none of them clobbers another. */}
      <div className="tqd-camera">
        <div className="tqd-machine">
          {/* THE CABINET. The casting is one lit SVG (see cabinet.tsx); the
              spinning drums are DOM, laid into the aperture it leaves open. The
              two are tied together by percentages derived from the SVG's own
              viewBox — see `.tqd-aperture` in globals.css. */}
          <div className="tqd-cab" data-run={phase === "idle" ? "0" : "1"} key={`cab-${runId}`}>
            <Cabinet className="tqd-cab-art" monogram={monogram} />

            {/* the column names, engraved on the cabinet's brass shoulder rail */}
            <div className="tqd-shoulder" aria-hidden="true">
              <span className="tqd-shoulder-label">
                <TT en="Day" hi="दिन" />
              </span>
              <span className="tqd-shoulder-label">
                <TT en="Month" hi="माह" />
              </span>
              <span className="tqd-shoulder-label">
                <TT en="Year" hi="वर्ष" />
              </span>
            </div>

            {/* the drums, seen through the aperture in the casting */}
            <div className="tqd-aperture">
              <div className="tqd-bay-glass">
                <Reel strip={day} index={0} running={phase !== "idle"} runId={runId} />
                <Reel strip={month} index={1} running={phase !== "idle"} runId={runId} />
                <Reel strip={year} index={2} running={phase !== "idle"} runId={runId} />
              </div>
              {/* the shadow the casting throws onto the drums, and the pay line */}
              <span className="tqd-aperture-shade" aria-hidden="true" />
              <span className="tqd-payline" aria-hidden="true">
                <PayLineMark className="tqd-payline-mark" />
                <PayLineMark className="tqd-payline-mark" flip />
              </span>
            </div>

            {/* the award card, engraved on the panel below the reels */}
            <span className="tqd-award" aria-hidden="true">
              <TT en="Fortune favours the two of us" hi="तक़दीर हमारे साथ है" />
            </span>
          </div>

          {/* the lever, mounted on the cabinet's right flank */}
          <button
            type="button"
            className="tqd-lever-btn"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onClick={() => {
              // The safety net. The pointer gesture above normally answers a
              // press and flags it here, so this does nothing. It matters when
              // there is no gesture to answer it: keyboard and assistive-tech
              // activation, and any environment that delivers `click` without
              // pointer events. Gating this on `detail === 0` (keyboard only)
              // meant the lever silently did nothing in exactly those cases.
              if (handled.current) {
                handled.current = false;
                return;
              }
              if (phase !== "spinning") spin(0);
            }}
            aria-label={
              revealed ? "Pull the lever again" : "Pull the lever to reveal the date"
            }
            disabled={phase === "spinning"}
          >
            <Lever className="tqd-lever" pull={pull} throwing={throwing} from={from} />
          </button>
        </div>
      </div>

      {/* The prompt, before the pull only. It unmounts on the pull rather than
          hiding, because anything left standing here pushes the reveal — the
          whole point of the machine — below the fold. */}
      {phase === "idle" ? (
        <div className="tqd-prompt">
          <p className="tqd-hint">
            <span className="tqd-hint-arrow" aria-hidden="true">
              ⟶
            </span>
            <TT en="Pull the lever" hi="लीवर खींचिए" />
          </p>
        </div>
      ) : null}

      {/* THE REVEAL SLOT. The caller's announcement lands here, directly under
          the machine — and only once it exists, so it reserves no space while
          the reels are still at rest. */}
      {children}

      {/* a restrained burst — gold, brief, and only ever once per pull */}
      {revealed ? (
        <span className="tqd-sparks" aria-hidden="true" key={`sparks-${runId}`}>
          {Array.from({ length: 22 }).map((_, i) => {
            // Deterministic, so the server and the client agree and no
            // Math.random() ever reaches a render path.
            const a = (i * 137.508) % 360;
            const dist = 34 + ((i * 53) % 46);
            return (
              <i
                key={i}
                className={i % 5 === 0 ? "tqd-spark tqd-spark-star" : "tqd-spark"}
                style={{
                  "--tqd-sx": `${(Math.cos((a * Math.PI) / 180) * dist).toFixed(1)}%`,
                  "--tqd-sy": `${(Math.sin((a * Math.PI) / 180) * dist * 0.62 - 18).toFixed(1)}%`,
                  "--tqd-sd": `${0.9 + (i % 7) * 0.13}s`,
                  "--tqd-sdelay": `${(i % 9) * 0.05}s`,
                } as CSSProperties}
              />
            );
          })}
        </span>
      ) : null}

      {/* quiet chrome, kept below the announcement */}
      <div className="tqd-chrome">
        {revealed ? (
          <p className="tqd-hint-again">
            <TT
              en="However you pull it, it lands on the same day."
              hi="जितनी बार खींचिए, वही दिन आएगा।"
            />
          </p>
        ) : null}
        <button
          type="button"
          className="tqd-mute"
          onClick={() => setMuted((m) => !m)}
          aria-pressed={muted}
        >
          {muted ? (
            <TT en="Sound off" hi="ध्वनि बंद" />
          ) : (
            <TT en="Sound on" hi="ध्वनि चालू" />
          )}
        </button>
      </div>
    </div>
  );
}
