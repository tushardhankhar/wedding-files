#!/usr/bin/env node
/**
 * Captures the landing page's theme gallery cards as PNGs — phone frame, live
 * screen, notch, LIVE pill, name and tagline — one identically framed image per
 * theme, sized for Instagram or for a tight web asset.
 *
 * The headless-Chrome driving lives in scripts/lib/chrome-shot.mjs, shared with
 * the carousel-ad capture.
 *
 * Usage (dev server must be running — `npm run dev`):
 *   node scripts/capture-theme-cards.mjs                        # every theme, Instagram post (4:5)
 *   node scripts/capture-theme-cards.mjs maharaja mayura        # just these ids
 *   node scripts/capture-theme-cards.mjs --format=story         # 1080×1920
 *   node scripts/capture-theme-cards.mjs --format=all           # every format
 *   node scripts/capture-theme-cards.mjs --list                 # formats + theme ids
 *   BASE_URL=http://localhost:3001 node scripts/capture-theme-cards.mjs
 *   SCALE=3 node scripts/capture-theme-cards.mjs                # override the preset DPR
 *   SETTLE_MS=8000 node scripts/capture-theme-cards.mjs         # longer wait for entry animations
 *
 * Output: public/landing/theme-cards/<format>/<theme-id>.png
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { capture, withChrome } from "./lib/chrome-shot.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ROOT = path.join(ROOT, "public", "landing", "theme-cards");
const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
/** Overrides every preset's device pixel ratio when set. */
const SCALE_OVERRIDE = process.env.SCALE ? Number(process.env.SCALE) : undefined;
/**
 * Wall-clock pause after load, letting the theme's entry animations finish.
 * 2.5s still caught Jharokha's text mid-fade; 5s is clean across the set.
 */
const SETTLE_MS = Number(process.env.SETTLE_MS ?? 5000);

/** Reads the showcase list + format canvases from the dev server (single source of truth). */
async function loadManifest() {
  const res = await fetch(`${BASE_URL}/dev/cards`);
  if (!res.ok) {
    throw new Error(
      `GET ${BASE_URL}/dev/cards → ${res.status}. Is the dev server running (npm run dev) on ${BASE_URL}?`,
    );
  }
  return res.json();
}

async function main() {
  const argv = process.argv.slice(2);
  const formatArg = argv.find((a) => a.startsWith("--format="))?.split("=")[1];
  const wantsList = argv.includes("--list");
  const wanted = argv.filter((a) => !a.startsWith("--"));

  const { formats, themes, defaultFormat } = await loadManifest();

  if (wantsList) {
    console.log("Formats:");
    for (const [name, f] of Object.entries(formats)) {
      console.log(`  ${name.padEnd(8)} ${f.label}${name === defaultFormat ? "  (default)" : ""}`);
    }
    console.log(`\nThemes:\n  ${themes.map((t) => t.id).join("\n  ")}`);
    return;
  }

  const chosenFormats = formatArg === "all" ? Object.keys(formats) : [formatArg ?? defaultFormat];
  const unknownFormat = chosenFormats.find((f) => !formats[f]);
  if (unknownFormat) {
    throw new Error(`Unknown format "${unknownFormat}". Available: ${Object.keys(formats).join(", ")}, all`);
  }

  const missing = wanted.filter((id) => !themes.some((t) => t.id === id));
  if (missing.length) {
    throw new Error(
      `Unknown theme id(s): ${missing.join(", ")}\nAvailable: ${themes.map((t) => t.id).join(", ")}`,
    );
  }
  const targets = wanted.length ? themes.filter((t) => wanted.includes(t.id)) : themes;

  await withChrome(async ({ cdp, sessionId, chrome }) => {
    console.log(`Chrome: ${chrome}`);

    for (const format of chosenFormats) {
      const { width, height, scale: presetScale, label } = formats[format];
      const scale = SCALE_OVERRIDE ?? presetScale;
      const outDir = path.join(OUT_ROOT, format);
      await mkdir(outDir, { recursive: true });

      console.log(
        `\n${format} — ${label}${SCALE_OVERRIDE ? ` (forced @${scale}x → ${width * scale}×${height * scale})` : ""}\n${path.relative(ROOT, outDir)}/`,
      );

      for (const theme of targets) {
        const url = `${BASE_URL}/dev/card/${theme.id}?format=${format}`;
        const out = path.join(outDir, `${theme.id}.png`);
        const started = process.hrtime.bigint();
        const size = await capture({
          cdp, sessionId, url, out, width, height, scale, settleMs: SETTLE_MS,
        });
        const secs = Number(process.hrtime.bigint() - started) / 1e9;
        console.log(
          `  ✓ ${theme.id.padEnd(16)} ${(size / 1024).toFixed(0).padStart(4)} KB  ${secs.toFixed(1)}s  ${theme.name}`,
        );
      }
    }
  });

  const total = targets.length * chosenFormats.length;
  console.log(`\nDone — ${total} image${total === 1 ? "" : "s"} in ${path.relative(ROOT, OUT_ROOT)}/`);
}

main()
  // The CDP WebSocket and Chrome's stdio pipes keep the event loop alive after
  // the work is done, so exit deliberately rather than waiting for a drain.
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n✗ ${err.message}`);
    process.exit(1);
  });
