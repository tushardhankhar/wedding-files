import { notFound } from "next/navigation";
import { AD_POST_CANVAS, AdPostCard } from "@/components/landing/ad-post";
import { HideDevOverlay } from "../card/[themeId]/hide-dev-overlay";

/**
 * DEV-ONLY screenshot stage for the single-image Meta feed ad, alone on a canvas
 * the exact size of the export. `scripts/capture-ad-post.mjs` points headless
 * Chrome at this one URL.
 *
 * Wrapped in `.landing` because the phone mock draws on that scope's tokens.
 * Not part of the product: returns 404 outside development.
 */
export const dynamic = "force-dynamic";

export default async function AdPostShotPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="landing" style={{ width: AD_POST_CANVAS.width, height: AD_POST_CANVAS.height }}>
      <HideDevOverlay />
      <AdPostCard />
    </div>
  );
}
