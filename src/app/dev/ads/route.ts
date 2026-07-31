import { NextResponse } from "next/server";
import { AD_CANVAS, AD_SLIDES } from "@/components/landing/ad-carousel";

/**
 * DEV-ONLY manifest for the carousel screenshot script: the slide order and the
 * export canvas, so `scripts/capture-ad-carousel.mjs` never restates the deck.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json({
    canvas: AD_CANVAS,
    slides: AD_SLIDES.map((s) => ({
      id: s.id,
      layout: s.layout,
      headline: s.headline,
      openWith: s.openWith ?? null,
    })),
  });
}
