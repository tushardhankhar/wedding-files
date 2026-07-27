import { NextResponse } from "next/server";
import { SHOWCASE_THEMES } from "@/components/landing/data";
import { DEFAULT_FORMAT, SHOT_FORMATS } from "@/components/landing/theme-card";

/**
 * DEV-ONLY manifest for the theme-card screenshot script: which cards exist and
 * the canvas of each capture format. Keeps `scripts/capture-theme-cards.mjs`
 * from duplicating the showcase list or the Instagram dimensions.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json({
    defaultFormat: DEFAULT_FORMAT,
    formats: SHOT_FORMATS,
    themes: SHOWCASE_THEMES.map((t) => ({ id: t.id, name: t.name, demo: t.demo })),
  });
}
