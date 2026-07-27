import { SITE_DOMAIN, type ShowcaseTheme } from "@/components/landing/data";
import { PHONE_NATURAL, ThemePhone } from "@/components/landing/theme-card";

/**
 * Editorial social composition: the live theme on a phone at left, the theme's
 * name and details at right, over a wine backdrop tinted with the theme's own
 * palette. Screenshot-only — see `/dev/card/[themeId]?format=post`.
 *
 * Colour discipline: wine ground, gold accents, ivory text. The palette glows
 * behind the phone are the one place a theme's own colours come through.
 */

const OCCASION: Record<ShowcaseTheme["category"], string> = {
  wedding: "Wedding invitation",
  "save-the-date": "Save the Date",
  other: "Celebration invite",
};

/** Kept short on purpose — three lines is what reads at feed scale. */
const DETAILS = [
  "Bilingual site · EN + हिं",
  "Personalized invite link",
  "Events, RSVP, gallery & story",
];

/** Concentric hairlines with a ring of radial ticks — bounded, no CSS masking. */
function Mandala({ size, left, top }: { size: number; left: number; top: number }) {
  const c = size / 2;
  const gold = "rgba(232,200,119,0.42)";
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const rad = (i * Math.PI * 2) / 60;
    const [inner, outer] = [c * 0.62, c * 0.78];
    return {
      key: i,
      x1: c + Math.cos(rad) * inner,
      y1: c + Math.sin(rad) * inner,
      x2: c + Math.cos(rad) * outer,
      y2: c + Math.sin(rad) * outer,
    };
  });

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute"
      style={{ left, top }}
    >
      <defs>
        {/* Fades the motif out before it reaches the copy. An SVG mask, because
            CSS masks are dropped in this compositing path. */}
        <linearGradient id="mandala-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.35" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.9" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="mandala-mask">
          <rect width={size} height={size} fill="url(#mandala-fade)" />
        </mask>
      </defs>
      <g fill="none" stroke={gold} mask="url(#mandala-mask)">
        {[c * 0.96, c * 0.8, c * 0.6, c * 0.34].map((r) => (
          <circle key={r} cx={c} cy={c} r={r} strokeWidth={r > c * 0.9 ? 1 : 0.6} />
        ))}
        {ticks.map((t) => (
          <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={0.8} />
        ))}
      </g>
    </svg>
  );
}

export function SocialSplitCard({
  theme: t,
  width,
  height,
  pad,
  footer,
  phoneScale,
}: {
  theme: ShowcaseTheme;
  width: number;
  height: number;
  pad: number;
  footer: number;
  phoneScale: number;
}) {
  const phoneW = PHONE_NATURAL.width * phoneScale;
  const phoneH = PHONE_NATURAL.height * phoneScale;

  return (
    <div
      className="l-grain relative overflow-hidden"
      style={{ width, height, background: "linear-gradient(160deg, #2a0a18 0%, #1b0510 62%, #240816 100%)" }}
    >
      {/* Theme-tinted glows — the "content behind the theme" */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 50% at 22% 14%, ${t.palette[0]}66, transparent 62%),
                       radial-gradient(60% 45% at 92% 88%, ${t.palette[1]}4d, transparent 66%),
                       radial-gradient(50% 40% at 70% 8%, ${t.palette[2] ?? t.palette[0]}33, transparent 70%)`,
        }}
      />
      {/* Gold mandala behind the phone, drawn as SVG rather than a masked conic
          gradient: CSS masks get dropped in this compositing path, and an
          unmasked conic gradient sprays rays across the whole canvas. */}
      <Mandala size={680} left={pad + PHONE_NATURAL.width / 2 - 340} top={(height - footer) / 2 - 340} />

      {/* Hairline gold border, a little print-like */}
      <div
        aria-hidden="true"
        className="absolute rounded-[10px] border border-[color:var(--l-gold)]/25"
        style={{ inset: Math.round(pad / 2) }}
      />

      <div
        className="relative flex items-center"
        style={{ width, height: height - footer, padding: `${pad}px ${pad}px 0`, gap: 20 }}
      >
        {/* Left — the live theme */}
        <div style={{ width: phoneW, height: phoneH, flex: "none" }}>
          <div
            style={{
              width: PHONE_NATURAL.width,
              height: PHONE_NATURAL.height,
              transform: `scale(${phoneScale})`,
              transformOrigin: "top left",
            }}
          >
            <ThemePhone theme={t} capture />
          </div>
        </div>

        {/* Right — name and details */}
        <div className="flex flex-1 flex-col">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[color:var(--l-gold)]">
            {OCCASION[t.category]}
          </p>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:var(--l-ivory)]/55">
            {t.vibe}
          </p>
          <h2 className="l-display mt-1 text-[29px] leading-[1.08] font-semibold text-[color:var(--l-ivory)]">
            {t.name}
          </h2>
          <p className="l-script mt-1 text-[22px] leading-tight text-[color:var(--l-gold-lite)]">
            {t.tagline}
          </p>

          <span aria-hidden="true" className="mt-4 h-px w-14 bg-[color:var(--l-gold)]/60" />

          {/* the theme's palette */}
          <div className="mt-4 flex items-center gap-2">
            {t.palette.map((c) => (
              <span
                key={c}
                aria-hidden="true"
                className="size-[13px] rounded-full ring-1 ring-[color:var(--l-ivory)]/25"
                style={{ background: c }}
              />
            ))}
          </div>

          <ul className="mt-5 space-y-[7px]">
            {DETAILS.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 text-[14px] leading-snug text-[color:var(--l-ivory)]/80"
              >
                <span aria-hidden="true" className="mt-[6px] size-1 flex-none rounded-full bg-[color:var(--l-gold)]" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p
        className="absolute inset-x-0 text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-[color:var(--l-gold)]"
        style={{ bottom: Math.round(footer / 2) - 8 }}
      >
        {SITE_DOMAIN}
      </p>
    </div>
  );
}
