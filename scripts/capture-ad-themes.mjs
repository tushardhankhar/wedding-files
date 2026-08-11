#!/usr/bin/env node
/**
 * Exports the "range of themes" single-image ad defined in
 * `src/components/landing/ad-themes.tsx` as a 1080×1350 PNG. Mirrors
 * `capture-ad-post.mjs` exactly — same manifest, same Chrome harness.
 *
 * Usage (dev server must be running — `npm run dev`):
 *   node scripts/capture-ad-themes.mjs
 *   BASE_URL=http://localhost:3001 node scripts/capture-ad-themes.mjs
 *   SCALE=3 node scripts/capture-ad-themes.mjs
 *   SETTLE_MS=8000 node scripts/capture-ad-themes.mjs   # 5 live phones settling
 *
 * Output: public/landing/ads/themes/themes-4x5.png
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capture, withChrome } from "./lib/chrome-shot.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "landing", "ads", "themes");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const SCALE_OVERRIDE = process.env.SCALE ? Number(process.env.SCALE) : undefined;
/** Longer than the single-phone post by default: five live themes to settle. */
const SETTLE_MS = Number(process.env.SETTLE_MS ?? 6000);

async function loadCanvas() {
  const res = await fetch(`${BASE_URL}/dev/ads`);
  if (!res.ok) {
    throw new Error(
      `GET ${BASE_URL}/dev/ads → ${res.status}. Is the dev server running (npm run dev) on ${BASE_URL}?`,
    );
  }
  const { themes } = await res.json();
  if (!themes?.canvas) throw new Error("Manifest has no `themes.canvas` — is ad-themes.tsx exporting it?");
  return themes.canvas;
}

async function main() {
  const canvas = await loadCanvas();
  const { width, height } = canvas;
  const scale = SCALE_OVERRIDE ?? canvas.scale;
  await mkdir(OUT_DIR, { recursive: true });

  const out = path.join(OUT_DIR, "themes-4x5.png");

  await withChrome(async ({ cdp, sessionId, chrome }) => {
    console.log(`Chrome: ${chrome}`);
    console.log(`\nthemes-range feed ad — ${width * scale}×${height * scale} (4:5)`);

    const started = process.hrtime.bigint();
    const size = await capture({
      cdp, sessionId, url: `${BASE_URL}/dev/ad-themes`, out, width, height, scale, settleMs: SETTLE_MS,
    });
    const secs = Number(process.hrtime.bigint() - started) / 1e9;
    console.log(
      `  ✓ ${path.relative(ROOT, out)}  ${(size / 1024).toFixed(0)} KB  ${secs.toFixed(1)}s`,
    );
  });

  console.log("\nDone. Upload as a single-image ad.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n✗ ${err.message}`);
    process.exit(1);
  });
