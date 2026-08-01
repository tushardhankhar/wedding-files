import { NextResponse } from "next/server";
import { AD_CANVAS, AD_SLIDES } from "@/components/landing/ad-carousel";
import { AD_POST_CANVAS } from "@/components/landing/ad-post";

/**
 * DEV-ONLY manifest for the paid-social screenshot scripts: the slide order and
 * both export canvases, so neither `scripts/capture-ad-carousel.mjs` nor
 * `scripts/capture-ad-post.mjs` restates a size the components already define.
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
    post: { canvas: AD_POST_CANVAS },
  });
}
