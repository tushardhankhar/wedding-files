#!/usr/bin/env node
/**
 * Exports the 16:9 premium billboard defined in
 * `src/components/landing/ad-billboard.tsx` as a PNG. Mirrors
 * `capture-ad-themes.mjs` exactly — same manifest, same Chrome harness.
 *
 * Usage (dev server must be running — `npm run dev`):
 *   node scripts/capture-ad-billboard.mjs
 *   BASE_URL=http://localhost:3001 node scripts/capture-ad-billboard.mjs
 *   SCALE=3 node scripts/capture-ad-billboard.mjs
 *   SETTLE_MS=8000 node scripts/capture-ad-billboard.mjs   # 3 live phones settling
 *
 * Output: public/landing/ads/billboard/billboard-1680x945.png
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capture, withChrome } from "./lib/chrome-shot.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "landing", "ads", "billboard");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const SCALE_OVERRIDE = process.env.SCALE ? Number(process.env.SCALE) : undefined;
/** Three live themes to settle. */
const SETTLE_MS = Number(process.env.SETTLE_MS ?? 6000);

async function loadCanvas() {
  const res = await fetch(`${BASE_URL}/dev/ads`);
  if (!res.ok) {
    throw new Error(
      `GET ${BASE_URL}/dev/ads → ${res.status}. Is the dev server running (npm run dev) on ${BASE_URL}?`,
    );
  }
  const { billboard } = await res.json();
  if (!billboard?.canvas) throw new Error("Manifest has no `billboard.canvas` — is ad-billboard.tsx exporting it?");
  return billboard.canvas;
}

async function main() {
  const canvas = await loadCanvas();
  const { width, height } = canvas;
  const scale = SCALE_OVERRIDE ?? canvas.scale;
  await mkdir(OUT_DIR, { recursive: true });

  const out = path.join(OUT_DIR, `billboard-${width * scale}x${height * scale}.png`);

  await withChrome(async ({ cdp, sessionId, chrome }) => {
    console.log(`Chrome: ${chrome}`);
    console.log(`\nbillboard ad — ${width * scale}×${height * scale} (16:9)`);

    const started = process.hrtime.bigint();
    const size = await capture({
      cdp, sessionId, url: `${BASE_URL}/dev/ad-billboard`, out, width, height, scale, settleMs: SETTLE_MS,
    });
    const secs = Number(process.hrtime.bigint() - started) / 1e9;
    console.log(
      `  ✓ ${path.relative(ROOT, out)}  ${(size / 1024).toFixed(0)} KB  ${secs.toFixed(1)}s`,
    );
  });

  console.log("\nDone. Upload as a 16:9 premium billboard.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n✗ ${err.message}`);
    process.exit(1);
  });
