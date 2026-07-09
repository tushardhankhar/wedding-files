import { ImageResponse } from "next/og";
import { loadSiteIdentity } from "@/modules/guest-access/server/guest-site";
import { getTheme } from "@/modules/website/themes/registry";

// The link-share preview card (WhatsApp / iMessage / social): the couple's
// monogram, names and date on their theme's colours.
export const alt = "Wedding invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const identity = await loadSiteIdentity(slug);
  const theme = getTheme(identity?.themeId);
  const [bg, gold] = theme.swatch;
  const names = identity?.names ?? "You're invited";
  const monogram = identity?.monogram ?? "";

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
          background: bg,
          color: gold,
          fontFamily: "serif",
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
            whiteSpace: "nowrap",
          }}
        >
          {monogram}
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 84,
            fontWeight: 600,
            color: "#ffffff",
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
            }}
          >
            {identity.dateLabel}
          </div>
        ) : null}
        <div
          style={{
            marginTop: 8,
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Join the Utsav
        </div>
      </div>
    ),
    { ...size }
  );
}
