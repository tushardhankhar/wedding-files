#!/usr/bin/env node
/**
 * Exports the single-image Meta feed ad defined in
 * `src/components/landing/ad-post.tsx` as a 1080×1350 PNG — the one creative to
 * upload for a single-image ad, as opposed to the nine-card carousel that
 * `capture-ad-carousel.mjs` produces.
 *
 * The phone in it frames the *live* /demo site, so re-running this after a theme
 * change gives you an ad that matches the product.
 *
 * Usage (dev server must be running — `npm run dev`):
 *   node scripts/capture-ad-post.mjs
 *   BASE_URL=http://localhost:3001 node scripts/capture-ad-post.mjs
 *   SCALE=3 node scripts/capture-ad-post.mjs         # 1620×2025 instead
 *   SETTLE_MS=8000 node scripts/capture-ad-post.mjs  # longer animation wait
 *
 * Output: public/landing/ads/post/feed-4x5.png
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capture, withChrome } from "./lib/chrome-shot.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "landing", "ads", "post");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const SCALE_OVERRIDE = process.env.SCALE ? Number(process.env.SCALE) : undefined;
/** Same 5s as the theme cards: the phone runs a real theme with entry animations. */
const SETTLE_MS = Number(process.env.SETTLE_MS ?? 5000);

/** The canvas comes from the component, so the size is defined in one place. */
async function loadCanvas() {
  const res = await fetch(`${BASE_URL}/dev/ads`);
  if (!res.ok) {
    throw new Error(
      `GET ${BASE_URL}/dev/ads → ${res.status}. Is the dev server running (npm run dev) on ${BASE_URL}?`,
    );
  }
  const { post } = await res.json();
  if (!post?.canvas) throw new Error("Manifest has no `post.canvas` — is ad-post.tsx exporting it?");
  return post.canvas;
}

async function main() {
  const canvas = await loadCanvas();
  const { width, height } = canvas;
  const scale = SCALE_OVERRIDE ?? canvas.scale;
  await mkdir(OUT_DIR, { recursive: true });

  const out = path.join(OUT_DIR, "feed-4x5.png");

  await withChrome(async ({ cdp, sessionId, chrome }) => {
    console.log(`Chrome: ${chrome}`);
    console.log(`\nsingle feed ad — ${width * scale}×${height * scale} (4:5)`);

    const started = process.hrtime.bigint();
    const size = await capture({
      cdp, sessionId, url: `${BASE_URL}/dev/ad-post`, out, width, height, scale, settleMs: SETTLE_MS,
    });
    const secs = Number(process.hrtime.bigint() - started) / 1e9;
    console.log(
      `  ✓ ${path.relative(ROOT, out)}  ${(size / 1024).toFixed(0)} KB  ${secs.toFixed(1)}s`,
    );
  });

  console.log(
    "\nDone. Upload as a single-image ad; set the CTA button in Ads Manager" +
      "\n(the creative's arrow points at it, so any label works).",
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n✗ ${err.message}`);
    process.exit(1);
  });
