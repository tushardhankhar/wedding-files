"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

/**
 * Announces client-side navigation to the tag layer as `spa_pageview`.
 *
 * Needed because a pageview tag fires once per document load, and this app never
 * reloads: going from `/` to `/demo/royal` is a router transition, so without
 * this the whole demo funnel — and any "visited a demo" retargeting audience —
 * collapses into a single pageview on the landing page.
 *
 * GTM ships a History Change trigger for exactly this, and it is the wrong tool
 * here. It fires on hash changes too, and this site's entire nav is in-page
 * anchors (`#themes`, `#how-it-works`, `#pricing`, `#enquire`), so every nav
 * click would have counted as a pageview on the page that matters most. It also
 * catches the `replaceState` the App Router performs around initial load, which
 * double-counts the first page. Both failure modes are silent and would have
 * quietly inflated the numbers the ad spend gets judged on.
 *
 * `usePathname()` sidesteps both: it excludes the hash and the query string, so
 * it changes only on real route changes and this fires exactly once per one.
 */
export function SpaPageview() {
  const pathname = usePathname();
  /** Last path announced. `null` means "nothing yet", which is not the same as "". */
  const announced = useRef<string | null>(null);

  useEffect(() => {
    // The first run is the document load, which the pageview tag on GTM's
    // Initialization trigger has already counted. Record it, announce nothing —
    // otherwise every entry to the site is two pageviews.
    if (announced.current === null) {
      announced.current = pathname;
      return;
    }
    // React runs effects twice in development's Strict Mode; the ref makes the
    // second pass a no-op rather than a duplicate event.
    if (announced.current === pathname) return;

    announced.current = pathname;
    // `page_path` is safe to send from here and nowhere else: this component only
    // ever mounts inside `(marketing)/`, whose paths are all public marketing
    // pages. A guest invitation URL identifies a real couple and their guest
    // list, and those routes sit outside this group and load no tags at all.
    sendGTMEvent({ event: "spa_pageview", page_path: pathname });
  }, [pathname]);

  return null;
}
