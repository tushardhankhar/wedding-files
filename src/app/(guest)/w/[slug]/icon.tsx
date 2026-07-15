import { ImageResponse } from "next/og";
import { loadSiteIdentity } from "@/modules/guest-access/server/guest-site";
import { getTheme } from "@/modules/website/themes/registry";

// A per-wedding favicon: the couple's initials in their theme's colours, so a
// shared link shows the couple — not the generic app logo — in the browser tab.
//
// Forced dynamic: same reasoning as opengraph-image.tsx — no request-time API
// and a dynamic [slug] segment mean this would otherwise render once and
// cache indefinitely, going stale after a theme/name change.
export const dynamic = "force-dynamic";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const identity = await loadSiteIdentity(slug);
  const theme = getTheme(identity?.themeId);
  const [bg, gold] = theme.swatch;
  const initials = identity?.initials ?? "U";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
          color: gold,
          fontSize: initials.length > 1 ? 30 : 40,
          fontWeight: 600,
          letterSpacing: 1,
          fontFamily: "serif",
          borderRadius: 12,
        }}
      >
        {initials}
      </div>
    ),
    { ...size }
  );
}
