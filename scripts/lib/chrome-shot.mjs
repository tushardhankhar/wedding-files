/**
 * Headless-Chrome screenshotting over the DevTools protocol, shared by the
 * capture scripts (`capture-theme-cards.mjs`, `capture-ad-carousel.mjs`).
 *
 * Drives the Chrome already installed on this machine: no Playwright/Puppeteer
 * download, no extra dependencies. One browser serves every shot, so a full
 * sweep costs seconds per image rather than minutes.
 */

import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

export async function findChrome() {
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

// ── Minimal CDP client ──────────────────────────────────────────────────────
// Just enough of the protocol to navigate and screenshot. Chrome's CLI
// --screenshot flag can't be used here: it needs --virtual-time-budget to wait
// for animations, and virtual time never advances while Next's dev HMR socket is
// open, so every shot stalled for two minutes.

export class Cdp {
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

/**
 * Runs `fn({ cdp, sessionId, chrome })` against a throwaway headless Chrome and
 * always tears it down — including the temp profile — afterwards.
 */
export async function withChrome(fn) {
  const chrome = await findChrome();
  const profileDir = await mkdtemp(path.join(tmpdir(), "shot-"));
  const { proc, cdp, sessionId } = await launchChrome(chrome, profileDir);

  try {
    return await fn({ cdp, sessionId, chrome });
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
}

/**
 * Clicks the first element matching `selector` inside any same-origin iframe on
 * the page, polling until it appears. Used to open the themes that gate their
 * content behind a tap, so the shot shows the invitation and not the gate.
 *
 * A direct `.click()` rather than a synthesised mouse event: it lands on the
 * element regardless of where the iframe sits on the canvas, and React's
 * onClick handles it the same way.
 */
async function clickInFrame({ cdp, sessionId, selector, timeoutMs = 8000 }) {
  const expression = `(async () => {
    const deadline = Date.now() + ${timeoutMs};
    while (Date.now() < deadline) {
      for (const frame of document.querySelectorAll("iframe")) {
        let el = null;
        try { el = frame.contentDocument?.querySelector(${JSON.stringify(selector)}); } catch {}
        if (el) { el.click(); return true; }
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    return false;
  })()`;

  const { result } = await cdp.send(
    "Runtime.evaluate",
    { expression, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (result?.value !== true) {
    throw new Error(`Never found "${selector}" inside the phone to click`);
  }
}

/**
 * Navigates to `url` at `width`×`height` CSS px and writes a PNG of exactly
 * width×scale by height×scale to `out`. `settleMs` is wall-clock, because the
 * themes' entry animations are too — and it is waited out *after* any `openWith`
 * click, so the reveal that click triggers has finished animating.
 */
export async function capture({ cdp, sessionId, url, out, width, height, scale, settleMs, openWith }) {
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    { width, height, deviceScaleFactor: scale, mobile: false },
    sessionId,
  );

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url }, sessionId);
  await loaded;
  if (openWith) await clickInFrame({ cdp, sessionId, selector: openWith });
  await sleep(settleMs);

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
