"use client";

import { useEffect } from "react";

/**
 * Hides the Next.js dev-tools badge on the screenshot stage — and inside the
 * same-origin demo iframe, whose own document carries a second badge that would
 * otherwise sit right on top of the theme.
 *
 * Scoped to this route on purpose: `devIndicators: false` in next.config would
 * take the badge away from normal development too.
 */
const HIDE_CSS = "nextjs-portal { display: none !important; }";
const STYLE_ID = "theme-card-shot-hide-dev";

function inject(doc: Document | null | undefined) {
  if (!doc?.head || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = HIDE_CSS;
  doc.head.append(style);
}

export function HideDevOverlay() {
  useEffect(() => {
    // The iframe document (and its badge) arrive after us, so re-apply for a
    // short while rather than once. Bounded so the page can still go idle.
    let ticks = 0;
    const apply = () => {
      inject(document);
      for (const frame of document.querySelectorAll("iframe")) {
        try {
          inject(frame.contentDocument);
        } catch {
          // cross-origin frame — nothing to do
        }
      }
      if (++ticks > 60) clearInterval(timer);
    };
    apply();
    const timer = setInterval(apply, 100);
    return () => clearInterval(timer);
  }, []);

  return null;
}
