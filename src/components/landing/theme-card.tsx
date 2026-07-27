import Link from "next/link";
import type { ShowcaseTheme } from "./data";

/**
 * The card's natural, unscaled box: 272px wide (the gallery column) by the sum
 * of the phone frame (1 + 8 + 520 + 8 + 1) plus the label block (24 + 15 + 4 +
 * 32 + 28). Social formats scale the card to fit their canvas from these.
 */
export const CARD_NATURAL = { width: 272, height: 641 } as const;

/**
 * Capture presets. `width`/`height` are CSS pixels for the headless window and
 * `scale` is the device pixel ratio, so the PNG lands on exactly
 * width×scale by height×scale — Instagram's native sizes, no post-resize.
 *
 * `pad` is the minimum breathing room around the card; `footer` reserves space
 * for the domain line on the social formats. `scripts/capture-theme-cards.mjs`
 * reads all of this via /dev/cards, so framing stays identical theme to theme.
 */
export const SHOT_FORMATS = {
  /** Tight crop of just the card — website assets, docs, quick shares. */
  card: {
    width: 328, height: 704, scale: 2, pad: 24, footer: 0, layout: "stack",
    label: "656×1408 · tight card",
  },
  /** Instagram feed portrait, 4:5 — the one to post. Phone left, copy right. */
  post: {
    width: 540, height: 675, scale: 2, pad: 22, footer: 44, layout: "split", phoneScale: 1,
    label: "1080×1350 · Instagram post (4:5)",
  },
  /** Instagram feed square, 1:1. */
  square: {
    width: 540, height: 540, scale: 2, pad: 26, footer: 40, layout: "stack",
    label: "1080×1080 · Instagram square (1:1)",
  },
  /** Instagram / WhatsApp story & reel, 9:16. */
  story: {
    width: 540, height: 960, scale: 2, pad: 40, footer: 72, layout: "stack",
    label: "1080×1920 · Story / Reel (9:16)",
  },
} as const;

export type ShotFormat = keyof typeof SHOT_FORMATS;

export const DEFAULT_FORMAT: ShotFormat = "post";

export function isShotFormat(value: string | undefined): value is ShotFormat {
  return !!value && value in SHOT_FORMATS;
}

/** Largest whole-card scale that fits the format's canvas, capped at 1.6×. */
export function cardScaleFor(format: ShotFormat) {
  const { width, height, pad, footer } = SHOT_FORMATS[format];
  return Math.min(
    (width - pad * 2) / CARD_NATURAL.width,
    (height - pad * 2 - footer) / CARD_NATURAL.height,
    1.6,
  );
}

/** Dimensions of the phone frame alone, shadow excluded. */
export const PHONE_NATURAL = { width: 266, height: 538 } as const;

/**
 * The iPhone frame around a live guest site: notch, side buttons, LIVE pill and
 * the real /demo iframe. Reused by the gallery card and the split social card,
 * so there's exactly one phone mock in the codebase.
 */
export function ThemePhone({
  theme: t,
  capture = false,
}: {
  theme: ShowcaseTheme;
  capture?: boolean;
}) {
  return (
    <div className="group relative rounded-[2.5rem] border border-black/10 bg-[#0d0710] p-2 shadow-[0_44px_90px_-32px_rgba(59,16,34,.6)] ring-1 ring-white/5">
      {/* side buttons */}
      <span aria-hidden="true" className="absolute -left-[3px] top-24 h-12 w-[3px] rounded-l bg-black/30" />
      <span aria-hidden="true" className="absolute -right-[3px] top-20 h-8 w-[3px] rounded-r bg-black/30" />

      <div
        className="relative h-[520px] w-[248px] overflow-hidden rounded-[2rem] bg-[color:var(--l-ivory)]"
        // Behind the iframe, the theme's own base colour instead of ivory: a
        // scaled capture leaves sub-pixel slivers at the rounded corners, and a
        // matching backdrop makes them invisible on light and dark themes alike.
        style={capture ? { background: t.palette[0] } : undefined}
      >
        {/* notch */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-2 z-30 h-5 w-20 -translate-x-1/2 rounded-full bg-black"
        />
        {/* live status pill */}
        <span className="absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-[#37d67a]" />
          Live
        </span>

        {/* the actual guest site, rendered live and non-interactive */}
        <iframe
          src={`/demo/${t.demo}?embed=1`}
          title={`${t.name} theme — live preview`}
          loading={capture ? "eager" : "lazy"}
          scrolling="no"
          tabIndex={-1}
          aria-hidden="true"
          // Rounded on the iframe itself, not just clipped by the parent: under a
          // fractional transform the iframe composites on its own layer and its
          // square corners otherwise show through as light slivers.
          className="pointer-events-none absolute inset-0 h-full w-full rounded-[2rem] border-0"
        />

        {/* tap-the-screen affordance → opens the full demo in a new tab */}
        {!capture && (
          <Link
            href={`/demo/${t.demo}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open the ${t.name} theme live demo (opens in a new tab)`}
            className="absolute inset-0 z-20 flex items-end justify-center bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <span className="mb-7 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[color:var(--l-wine)] shadow-lg">
              Open live demo →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * A single theme gallery card: iPhone frame around the live guest site, with
 * the theme's vibe, name and tagline beneath it.
 *
 * Shared by the landing gallery and the dev capture route
 * (`/dev/card/[themeId]`), so marketing screenshots can never drift from what
 * visitors actually see. In `capture` mode the interactive bits are dropped —
 * a hover overlay and a "Live preview" button read as broken inside a still
 * image — and the iframe loads eagerly so the screenshot isn't blank.
 */
export function ThemeCard({
  theme: t,
  capture = false,
}: {
  theme: ShowcaseTheme;
  capture?: boolean;
}) {
  return (
    <div className="flex w-[272px] flex-col items-center">
      <ThemePhone theme={t} capture={capture} />

      {/* Theme name + vibe, below the phone */}
      <div className="mt-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--l-gold)]">
          {t.vibe}
        </p>
        <h3 className="l-display mt-1 text-2xl font-semibold text-[color:var(--l-wine)]">
          {t.name}
        </h3>
        <p className="l-script text-lg text-[color:var(--l-pink)]">{t.tagline}</p>
      </div>

      {!capture && (
        <>
          {/* palette + explicit Live preview button */}
          <div className="mt-3 flex items-center gap-2">
            {t.palette.map((c) => (
              <span
                key={c}
                aria-hidden="true"
                className="size-3 rounded-full border border-[color:var(--l-line)]"
                style={{ background: c }}
              />
            ))}
          </div>
          <Link
            href={`/demo/${t.demo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--l-line)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--l-wine)] shadow-[0_10px_24px_-16px_rgba(59,16,34,.5)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--l-gold)]"
          >
            <span aria-hidden="true" className="text-[color:var(--l-pink)]">▶</span>
            Live preview
          </Link>
        </>
      )}
    </div>
  );
}
