import { notFound } from "next/navigation";
import { AD_THEMES_CANVAS, AdThemesCard } from "@/components/landing/ad-themes";
import { HideDevOverlay } from "../card/[themeId]/hide-dev-overlay";

/**
 * DEV-ONLY screenshot stage for the "range of themes" single-image ad, alone
 * on a canvas the exact size of the export. Mirrors `/dev/ad-post`.
 *
 * Wrapped in `.landing` because the phone mocks draw on that scope's tokens.
 * Not part of the product: returns 404 outside development.
 */
export const dynamic = "force-dynamic";

export default async function AdThemesShotPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="landing" style={{ width: AD_THEMES_CANVAS.width, height: AD_THEMES_CANVAS.height }}>
      <HideDevOverlay />
      <AdThemesCard />
    </div>
  );
}
