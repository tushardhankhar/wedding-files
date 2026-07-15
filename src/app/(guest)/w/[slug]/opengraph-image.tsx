import { ImageResponse } from "next/og";
import { loadSiteIdentity } from "@/modules/guest-access/server/guest-site";
import { getTheme, type ThemeCategory } from "@/modules/website/themes/registry";

// The link-share preview card (WhatsApp / iMessage / social): the couple's
// monogram, names and date on their theme's actual hero background, ink and
// accent colours (reusing --w-hero-bg/--w-hero-ink/--w-gold/--w-accent — the
// same tokens the live site's hero renders with) so every theme gets a
// distinct, on-brand card without one-off per-theme artwork. The divider is a
// plain rotated square, not the theme's Unicode glyph (--w-divider) — Satori's
// built-in font is missing glyphs like ✦/❖/✺, which render as tofu boxes.
//
// Forced dynamic: this route has no request-time API (no cookies/headers) and
// a dynamic [slug] segment with no generateStaticParams, so without this it
// gets rendered once and cached indefinitely — a couple changing their theme
// or names later would keep sharing a stale preview until redeploy.
export const dynamic = "force-dynamic";
export const alt = "You're invited";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAGLINE: Record<ThemeCategory, string> = {
  wedding: "Join the Jashn",
  "save-the-date": "Save the Date",
  "kids-birthday": "Let's Celebrate",
  "baby-shower": "With Love",
  housewarming: "You're Invited",
  party: "Let's Party",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const identity = await loadSiteIdentity(slug);
  const theme = getTheme(identity?.themeId);
  const vars = theme.vars as Record<string, string>;
  const [, gold, accent] = theme.swatch;
  const heroBg = vars["--w-hero-bg"] ?? theme.swatch[0];
  const ink = vars["--w-hero-ink"] ?? "#ffffff";
  const names = identity?.names ?? "You're invited";
  const monogram = identity?.monogram ?? "";
  // Long couple names need a smaller size to stay clear of the frame edges.
  const nameSize = names.length > 26 ? 60 : names.length > 18 ? 72 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 90px",
          background: heroBg,
          color: ink,
          fontFamily: "serif",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 168,
            height: 168,
            borderRadius: "50%",
            border: `2px solid ${gold}`,
            fontSize: 46,
            fontWeight: 600,
            letterSpacing: 2,
            color: gold,
            whiteSpace: "nowrap",
          }}
        >
          {monogram}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            width: 14,
            height: 14,
            background: accent,
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            marginTop: 26,
            fontSize: nameSize,
            fontWeight: 600,
            lineHeight: 1.15,
            color: ink,
            letterSpacing: 1,
          }}
        >
          {names}
        </div>
        {identity?.dateLabel ? (
          <div
            style={{
              marginTop: 20,
              fontSize: 30,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: gold,
            }}
          >
            {identity.dateLabel}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 8,
            fontSize: 22,
            opacity: 0.7,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: ink,
          }}
        >
          {TAGLINE[theme.category]}
        </div>
      </div>
    ),
    { ...size }
  );
}
