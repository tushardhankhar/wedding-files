import { notFound } from "next/navigation";
import { SHOWCASE_THEMES, SITE_DOMAIN } from "@/components/landing/data";
import {
  CARD_NATURAL,
  DEFAULT_FORMAT,
  SHOT_FORMATS,
  ThemeCard,
  cardScaleFor,
  isShotFormat,
} from "@/components/landing/theme-card";
import { HideDevOverlay } from "./hide-dev-overlay";
import { SocialSplitCard } from "./social-split-card";

/**
 * DEV-ONLY screenshot stage. Renders one landing-gallery theme card, alone, on a
 * fixed-size ivory canvas so `scripts/capture-theme-cards.mjs` can point headless
 * Chrome at it and get an identically framed PNG for every theme.
 *
 * `?format=` picks the canvas — see SHOT_FORMATS for the Instagram sizes.
 *
 * Not part of the product: returns 404 outside development.
 */
export const dynamic = "force-dynamic";

export default async function ThemeCardShotPage({
  params,
  searchParams,
}: {
  params: Promise<{ themeId: string }>;
  searchParams: Promise<{ format?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { themeId } = await params;
  const { format: requested } = await searchParams;
  const theme = SHOWCASE_THEMES.find((t) => t.id === themeId);
  if (!theme) notFound();

  const format = isShotFormat(requested) ? requested : DEFAULT_FORMAT;
  const preset = SHOT_FORMATS[format];
  const { width, height, pad, footer } = preset;

  // Split layouts get their own composition; the rest centre the gallery card.
  if (preset.layout === "split") {
    return (
      <div className="landing">
        <HideDevOverlay />
        <SocialSplitCard
          theme={theme}
          width={width}
          height={height}
          pad={pad}
          footer={footer}
          phoneScale={preset.phoneScale}
        />
      </div>
    );
  }

  const scale = cardScaleFor(format);

  return (
    <div className="landing">
      <HideDevOverlay />
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ width, height, padding: `${pad}px ${pad}px ${pad + footer}px` }}
      >
        {/* Scaled to the canvas, never re-laid-out: the card renders at its
            natural 272px width so text metrics match the live gallery exactly. */}
        <div
          style={{
            width: CARD_NATURAL.width * scale,
            height: CARD_NATURAL.height * scale,
          }}
        >
          <div
            style={{
              width: CARD_NATURAL.width,
              height: CARD_NATURAL.height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <ThemeCard theme={theme} capture />
          </div>
        </div>

        {footer > 0 && (
          <p
            className="absolute inset-x-0 text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-[color:var(--l-gold)]"
            style={{ bottom: Math.round(footer / 2) - 8 }}
          >
            {SITE_DOMAIN}
          </p>
        )}
      </div>
    </div>
  );
}
