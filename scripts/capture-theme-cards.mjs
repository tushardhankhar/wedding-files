#!/usr/bin/env node
/**
 * Captures the landing page's theme gallery cards as PNGs — phone frame, live
 * screen, notch, LIVE pill, name and tagline — one identically framed image per
 * theme, sized for Instagram or for a tight web asset.
 *
 * Drives the Chrome already installed on this machine over the DevTools
 * protocol: no Playwright/Puppeteer download, no extra dependencies. One browser
 * serves every shot, so a full sweep costs seconds per image rather than minutes.
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

import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

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

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await stat(candidate);
      return candidate;
    } catch {
      // try the next one
    }
  }
  throw new Error(
    `No Chrome found. Set CHROME_PATH to a Chromium-based browser binary.\nLooked in:\n  ${CHROME_CANDIDATES.join("\n  ")}`,
  );
}

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

// ── Minimal CDP client ──────────────────────────────────────────────────────
// Just enough of the protocol to navigate and screenshot. Chrome's CLI
// --screenshot flag can't be used here: it needs --virtual-time-budget to wait
// for animations, and virtual time never advances while Next's dev HMR socket is
// open, so every shot stalled for two minutes.

class Cdp {
  #ws;
  #nextId = 1;
  #pending = new Map();
  #listeners = new Map();

  static async connect(url) {
    const cdp = new Cdp();
    cdp.#ws = new WebSocket(url);
    cdp.#ws.addEventListener("message", (event) => cdp.#onMessage(event.data));
    await new Promise((resolve, reject) => {
      cdp.#ws.addEventListener("open", resolve, { once: true });
      cdp.#ws.addEventListener("error", () => reject(new Error("CDP socket failed")), { once: true });
    });
    return cdp;
  }

  #onMessage(raw) {
    const msg = JSON.parse(raw);
    if (msg.id) {
      const entry = this.#pending.get(msg.id);
      if (!entry) return;
      this.#pending.delete(msg.id);
      if (msg.error) entry.reject(new Error(`${entry.method}: ${msg.error.message}`));
      else entry.resolve(msg.result);
      return;
    }
    for (const fn of this.#listeners.get(msg.method) ?? []) fn(msg.params);
  }

  send(method, params = {}, sessionId) {
    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject, method });
      this.#ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }

  /** Resolves on the next occurrence of `method`, or rejects after `timeoutMs`. */
  once(method, timeoutMs = 30_000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(method, handler);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      const handler = (params) => {
        clearTimeout(timer);
        this.off(method, handler);
        resolve(params);
      };
      this.on(method, handler);
    });
  }

  on(method, fn) {
    const list = this.#listeners.get(method) ?? [];
    list.push(fn);
    this.#listeners.set(method, list);
  }

  off(method, fn) {
    const list = this.#listeners.get(method) ?? [];
    this.#listeners.set(
      method,
      list.filter((f) => f !== fn),
    );
  }

  close() {
    this.#ws.close();
  }
}

/** Launches headless Chrome and returns a CDP session on a fresh tab. */
async function launchChrome(chrome, profileDir) {
  const proc = spawn(
    chrome,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-timer-throttling",
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  // Chrome prints "DevTools listening on ws://..." to stderr once it's ready.
  const wsUrl = await new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk;
      const match = buffer.match(/ws:\/\/\S+/);
      if (match) {
        proc.stderr.off("data", onData);
        resolve(match[0]);
      }
    };
    proc.stderr.on("data", onData);
    proc.once("exit", (code) => reject(new Error(`Chrome exited early (code ${code}):\n${buffer}`)));
    setTimeout(() => reject(new Error(`Chrome never reported a DevTools endpoint:\n${buffer}`)), 30_000);
  });

  const cdp = await Cdp.connect(wsUrl);
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  await cdp.send("Page.enable", {}, sessionId);

  return { proc, cdp, sessionId };
}

async function capture({ cdp, sessionId, url, out, width, height, scale }) {
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    { width, height, deviceScaleFactor: scale, mobile: false },
    sessionId,
  );

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url }, sessionId);
  await loaded;
  // Entry animations are wall-clock, so wait in wall-clock too.
  await sleep(SETTLE_MS);

  const { data } = await cdp.send(
    "Page.captureScreenshot",
    { format: "png", captureBeyondViewport: false, optimizeForSpeed: false },
    sessionId,
  );
  await writeFile(out, Buffer.from(data, "base64"));

  const { size } = await stat(out);
  if (size < 5_000) throw new Error(`${path.basename(out)} looks blank (${size} bytes)`);
  return size;
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

  const chrome = await findChrome();
  const profileDir = await mkdtemp(path.join(tmpdir(), "theme-card-shot-"));
  const { proc, cdp, sessionId } = await launchChrome(chrome, profileDir);
  console.log(`Chrome: ${chrome}`);

  try {
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
        const size = await capture({ cdp, sessionId, url, out, width, height, scale });
        const secs = Number(process.hrtime.bigint() - started) / 1e9;
        console.log(
          `  ✓ ${theme.id.padEnd(16)} ${(size / 1024).toFixed(0).padStart(4)} KB  ${secs.toFixed(1)}s  ${theme.name}`,
        );
      }
    }
  } finally {
    cdp.close();
    proc.kill();
    // Chrome keeps writing to its profile as it shuts down, so wait for exit and
    // retry the delete. A leftover temp dir must never fail a good sweep.
    await once(proc, "exit").catch(() => undefined);
    await rm(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 }).catch(
      () => console.warn(`  (left behind temp profile ${profileDir})`),
    );
  }

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
