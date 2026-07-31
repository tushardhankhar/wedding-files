#!/usr/bin/env node
/**
 * Exports the Meta carousel ad — every slide in `src/components/landing/
 * ad-carousel.tsx` as a 1080×1080 PNG, in swipe order, ready to upload to Ads
 * Manager as a single carousel.
 *
 * The theme slides shoot the *live* /demo site inside the phone, so re-running
 * this after a theme change gives you an ad that matches the product.
 *
 * Usage (dev server must be running — `npm run dev`):
 *   node scripts/capture-ad-carousel.mjs                 # the whole deck
 *   node scripts/capture-ad-carousel.mjs 01-hook 09-cta  # just these slides
 *   node scripts/capture-ad-carousel.mjs --list          # slide ids, in order
 *   BASE_URL=http://localhost:3001 node scripts/capture-ad-carousel.mjs
 *   SCALE=3 node scripts/capture-ad-carousel.mjs         # 1620×1620 instead
 *   SETTLE_MS=8000 node scripts/capture-ad-carousel.mjs  # longer animation wait
 *
 * Output: public/landing/ads/carousel/<slide-id>.png
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capture, withChrome } from "./lib/chrome-shot.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "landing", "ads", "carousel");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const SCALE_OVERRIDE = process.env.SCALE ? Number(process.env.SCALE) : undefined;
/** Same 5s as the theme cards: the phone runs a real theme with entry animations. */
const SETTLE_MS = Number(process.env.SETTLE_MS ?? 5000);

/** Slide order and canvas come from the app, so the deck is defined in one place. */
async function loadManifest() {
  const res = await fetch(`${BASE_URL}/dev/ads`);
  if (!res.ok) {
    throw new Error(
      `GET ${BASE_URL}/dev/ads → ${res.status}. Is the dev server running (npm run dev) on ${BASE_URL}?`,
    );
  }
  return res.json();
}

async function main() {
  const argv = process.argv.slice(2);
  const wantsList = argv.includes("--list");
  const wanted = argv.filter((a) => !a.startsWith("--"));

  const { canvas, slides } = await loadManifest();

  if (wantsList) {
    console.log(`Canvas: ${canvas.width * canvas.scale}×${canvas.height * canvas.scale}\n\nSlides:`);
    for (const s of slides) {
      console.log(`  ${s.id.padEnd(16)} ${s.layout.padEnd(10)} ${s.headline.replace(/\n/g, " ")}`);
    }
    return;
  }

  const missing = wanted.filter((id) => !slides.some((s) => s.id === id));
  if (missing.length) {
    throw new Error(
      `Unknown slide id(s): ${missing.join(", ")}\nAvailable: ${slides.map((s) => s.id).join(", ")}`,
    );
  }
  const targets = wanted.length ? slides.filter((s) => wanted.includes(s.id)) : slides;

  const { width, height } = canvas;
  const scale = SCALE_OVERRIDE ?? canvas.scale;
  await mkdir(OUT_DIR, { recursive: true });

  await withChrome(async ({ cdp, sessionId, chrome }) => {
    console.log(`Chrome: ${chrome}`);
    console.log(
      `\ncarousel — ${width * scale}×${height * scale} (1:1)\n${path.relative(ROOT, OUT_DIR)}/`,
    );

    for (const slide of targets) {
      const url = `${BASE_URL}/dev/ad/${slide.id}`;
      const out = path.join(OUT_DIR, `${slide.id}.png`);
      const started = process.hrtime.bigint();
      const size = await capture({
        cdp, sessionId, url, out, width, height, scale, settleMs: SETTLE_MS,
        openWith: slide.openWith ?? undefined,
      });
      const secs = Number(process.hrtime.bigint() - started) / 1e9;
      console.log(
        `  ✓ ${slide.id.padEnd(16)} ${(size / 1024).toFixed(0).padStart(4)} KB  ${secs.toFixed(1)}s  ${slide.headline.replace(/\n/g, " ")}`,
      );
    }
  });

  console.log(
    `\nDone — ${targets.length} slide${targets.length === 1 ? "" : "s"} in ${path.relative(ROOT, OUT_DIR)}/` +
      `\nUpload in filename order; Ads Manager keeps the sequence.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n✗ ${err.message}`);
    process.exit(1);
  });
