import { notFound } from "next/navigation";
import { AD_BILLBOARD_CANVAS, AdBillboardCard } from "@/components/landing/ad-billboard";
import { HideDevOverlay } from "../card/[themeId]/hide-dev-overlay";

/**
 * DEV-ONLY screenshot stage for the 970×250 billboard banner, alone on a
 * canvas the exact size of the export. Mirrors `/dev/ad-themes`.
 *
 * Wrapped in `.landing` because the phone mocks draw on that scope's tokens.
 * Not part of the product: returns 404 outside development.
 */
export const dynamic = "force-dynamic";

export default async function AdBillboardShotPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="landing" style={{ width: AD_BILLBOARD_CANVAS.width, height: AD_BILLBOARD_CANVAS.height }}>
      <HideDevOverlay />
      <AdBillboardCard />
    </div>
  );
}
