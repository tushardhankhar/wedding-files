import { notFound } from "next/navigation";
import { AD_CANVAS, AdSlideCard, findAdSlide } from "@/components/landing/ad-carousel";
import { HideDevOverlay } from "../../card/[themeId]/hide-dev-overlay";

/**
 * DEV-ONLY screenshot stage for one Meta carousel slide, alone on a canvas the
 * exact size of the export. `scripts/capture-ad-carousel.mjs` points headless
 * Chrome at each of these in turn.
 *
 * Wrapped in `.landing` because the phone mock draws on that scope's tokens.
 * Not part of the product: returns 404 outside development.
 */
export const dynamic = "force-dynamic";

export default async function AdSlideShotPage({
  params,
}: {
  params: Promise<{ slideId: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { slideId } = await params;
  const slide = findAdSlide(slideId);
  if (!slide) notFound();

  return (
    <div className="landing" style={{ width: AD_CANVAS.width, height: AD_CANVAS.height }}>
      <HideDevOverlay />
      <AdSlideCard slide={slide} />
    </div>
  );
}
