import { cn } from "@/lib/utils";
import { IMAGES } from "./data";

/**
 * PhotoArt — an editorial photography slot.
 *
 * Every place the landing page wants wedding photography renders through this
 * component. If a licensed image is registered in IMAGES (data.ts) it renders
 * the real photograph; until then it renders a considered editorial gradient
 * composition in the same palette family, so the page ships beautiful and
 * legal, and upgrades photo-by-photo.
 */
const RECIPES: Record<string, { bg: string; glow?: string; motif?: string }> = {
  hero: {
    bg: "radial-gradient(90% 70% at 72% 18%, rgba(216,27,96,.42), transparent 60%), radial-gradient(70% 60% at 15% 85%, rgba(244,124,32,.34), transparent 60%), radial-gradient(120% 80% at 50% 115%, rgba(201,154,61,.30), transparent 55%), linear-gradient(168deg, #3b1022 0%, #58122f 48%, #2a0a18 100%)",
  },
  couple: {
    bg: "radial-gradient(80% 60% at 70% 25%, rgba(232,200,119,.35), transparent 60%), linear-gradient(160deg, #58122f 0%, #8e1838 55%, #3b1022 100%)",
    motif: "❀",
  },
  haldi: {
    bg: "radial-gradient(70% 60% at 30% 30%, rgba(255,244,200,.5), transparent 60%), linear-gradient(140deg, #f5a623 0%, #f47c20 60%, #e0448a 115%)",
    motif: "✿",
  },
  mehendi: {
    bg: "radial-gradient(70% 55% at 70% 25%, rgba(245,166,35,.4), transparent 60%), linear-gradient(140deg, #0a6b4e 0%, #087f5b 55%, #6aa84f 115%)",
    motif: "❁",
  },
  sangeet: {
    bg: "radial-gradient(80% 60% at 30% 20%, rgba(244,124,32,.42), transparent 60%), linear-gradient(150deg, #5a236e 0%, #a4256e 55%, #d81b60 110%)",
    motif: "✺",
  },
  mandap: {
    bg: "radial-gradient(75% 60% at 50% 15%, rgba(232,200,119,.4), transparent 60%), linear-gradient(170deg, #7a1226 0%, #8e1838 55%, #f47c20 130%)",
    motif: "❋",
  },
  maharaja: {
    bg: "radial-gradient(80% 60% at 50% 15%, rgba(201,154,61,.45), transparent 62%), linear-gradient(165deg, #40060f 0%, #7a1226 60%, #3b1022 100%)",
    motif: "✦",
  },
  jharokha: {
    bg: "radial-gradient(85% 55% at 50% 12%, rgba(255,230,201,.7), transparent 58%), radial-gradient(70% 55% at 50% 116%, rgba(223,147,166,.55), transparent 60%), linear-gradient(168deg, #fdeef0 0%, #f3c7d0 52%, #cf9fb6 120%)",
    motif: "❁",
  },
  mayura: {
    bg: "radial-gradient(85% 55% at 50% 12%, rgba(236,208,122,.6), transparent 58%), radial-gradient(70% 55% at 50% 118%, rgba(216,27,96,.42), transparent 60%), linear-gradient(168deg, #0e7a76 0%, #0a4a4a 55%, #063231 120%)",
    motif: "❋",
  },
  miramar: {
    bg: "radial-gradient(72% 46% at 50% 10%, rgba(232,213,172,.6), transparent 60%), radial-gradient(62% 42% at 84% 26%, rgba(150,175,208,.5), transparent 62%), radial-gradient(58% 40% at 14% 104%, rgba(217,154,162,.44), transparent 62%), linear-gradient(168deg, #FCF8F1 0%, #D3DFEE 52%, #16273F 130%)",
    motif: "⚓",
  },
  jodi: {
    bg: "radial-gradient(58% 34% at 22% 14%, rgba(246,220,226,.9), transparent 62%), radial-gradient(56% 32% at 84% 24%, rgba(239,199,211,.7), transparent 62%), radial-gradient(60% 36% at 50% 108%, rgba(168,30,88,.24), transparent 64%), linear-gradient(168deg, #FDFAF3 0%, #F5EDDC 60%, #EFC7D3 120%)",
    motif: "❁",
  },
  dak: {
    bg: "radial-gradient(70% 45% at 50% 8%, rgba(180,137,74,.4), transparent 60%), radial-gradient(60% 40% at 50% 116%, rgba(168,51,43,.34), transparent 60%), linear-gradient(168deg, #25324A 0%, #182233 55%, #0D131E 120%)",
    motif: "✉",
  },
  rajmahal: {
    bg: "radial-gradient(74% 46% at 50% 6%, rgba(231,205,142,.75), transparent 62%), radial-gradient(64% 42% at 50% 114%, rgba(124,34,48,.34), transparent 62%), linear-gradient(168deg, #E8CFA8 0%, #B98A46 52%, #3E2612 120%)",
    motif: "❖",
  },
  taqdeer: {
    bg: "radial-gradient(62% 40% at 50% 10%, rgba(201,164,76,.42), transparent 62%), radial-gradient(70% 46% at 50% 112%, rgba(84,19,44,.65), transparent 62%), linear-gradient(168deg, #54132C 0%, #2A0A17 52%, #0B0709 120%)",
    motif: "❖",
  },
  rajputana: {
    bg: "radial-gradient(80% 60% at 50% 20%, rgba(255,248,236,.65), transparent 62%), linear-gradient(160deg, #f3e6d2 0%, #dfa878 55%, #c96f3b 115%)",
    motif: "❖",
  },
  gulmohar: {
    bg: "radial-gradient(75% 55% at 70% 20%, rgba(252,227,200,.6), transparent 60%), linear-gradient(150deg, #d81b60 0%, #ee6f8f 55%, #fce3c8 130%)",
    motif: "❀",
  },
  punjabi: {
    bg: "radial-gradient(80% 60% at 45% 20%, rgba(255,255,255,.55), transparent 62%), linear-gradient(155deg, #fdf1dd 0%, #f5c25e 60%, #f5a623 115%)",
    motif: "✺",
  },
  south: {
    bg: "radial-gradient(80% 60% at 50% 18%, rgba(230,197,106,.5), transparent 62%), linear-gradient(165deg, #5c1620 0%, #7d2a1a 55%, #b8860b 125%)",
    motif: "✤",
  },
  vow: {
    bg: "radial-gradient(80% 60% at 50% 20%, rgba(255,255,255,.7), transparent 60%), linear-gradient(155deg, #f5f2ea 0%, #dde3d3 55%, #c9d4bf 115%)",
    motif: "❦",
  },
  overture: {
    bg: "radial-gradient(80% 60% at 50% 12%, rgba(201,162,63,.5), transparent 60%), linear-gradient(165deg, #124a37 0%, #0e3b2c 55%, #082018 120%)",
    motif: "✦",
  },
  muhurat: {
    bg: "radial-gradient(80% 60% at 50% 12%, rgba(201,162,63,.5), transparent 60%), linear-gradient(165deg, #6a132b 0%, #4a0d1f 55%, #2c0712 120%)",
    motif: "✦",
  },
  gulistan: {
    bg: "radial-gradient(85% 60% at 50% 14%, rgba(255,230,201,.7), transparent 58%), radial-gradient(70% 55% at 50% 118%, rgba(223,147,166,.5), transparent 60%), linear-gradient(168deg, #fdeef0 0%, #f2cdd4 55%, #cf9fb6 120%)",
    motif: "❀",
  },
  // "Experience" themes (non-wedding celebrations).
  afterparty: {
    bg: "radial-gradient(80% 60% at 28% 15%, rgba(124,58,237,.55), transparent 60%), radial-gradient(70% 60% at 82% 26%, rgba(236,72,153,.45), transparent 60%), linear-gradient(165deg, #16121f 0%, #09090b 100%)",
    motif: "⚡",
  },
  confetti: {
    bg: "radial-gradient(70% 55% at 28% 18%, rgba(96,165,250,.55), transparent 60%), radial-gradient(70% 60% at 80% 30%, rgba(251,113,133,.5), transparent 60%), linear-gradient(150deg, #facc15 0%, #a78bfa 125%)",
    motif: "★",
  },
  "little-miracle": {
    bg: "radial-gradient(90% 55% at 50% 118%, rgba(197,164,109,.45), transparent 55%), linear-gradient(180deg, #23263b 0%, #3a3d5a 100%)",
    motif: "☾",
  },
  "shubh-aarambh": {
    bg: "radial-gradient(70% 60% at 50% 30%, rgba(199,154,61,.55), transparent 62%), linear-gradient(165deg, #2C1108 0%, #5C2113 52%, #9C3B21 110%)",
    motif: "◇",
  },
};

export function PhotoArt({
  slot,
  className,
  caption,
}: {
  /** Recipe key + image registry key (see IMAGES in data.ts). */
  slot: string;
  className?: string;
  caption?: string;
}) {
  const image = IMAGES[slot];
  const recipe = RECIPES[slot] ?? RECIPES.couple;

  return (
    <div
      data-image-slot={slot}
      className={cn("l-grain relative overflow-hidden", className)}
      style={image ? undefined : { background: recipe.bg }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- licensed asset slot, sized by container
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          {/* dotted texture + centred motif keep placeholders intentional */}
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,.14) 1px, transparent 1.6px) 0 0/22px 22px",
            }}
          />
          {recipe.motif ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center text-5xl text-white/25"
            >
              {recipe.motif}
            </span>
          ) : null}
        </>
      )}
      {caption ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-3 py-1 text-[11px] tracking-wide text-white backdrop-blur-sm">
          {caption}
        </span>
      ) : null}
    </div>
  );
}

/** A sparse field of rising marigold & rani-pink petals. Pure CSS, reduced-motion safe. */
export function PetalField({
  count = 10,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute bottom-[-14px] block"
          style={{
            left: `${(i * 9.7 + 4) % 100}%`,
            width: i % 3 === 0 ? 10 : 7,
            height: i % 3 === 0 ? 10 : 7,
            borderRadius: i % 2 ? "50% 0 50% 50%" : "50%",
            background:
              i % 3 === 0
                ? "var(--l-marigold)"
                : i % 3 === 1
                  ? "var(--l-gold-lite)"
                  : "var(--l-pink)",
            opacity: 0,
            animation: `utsav-float ${12 + (i % 5) * 3.5}s linear ${i * 1.4}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
