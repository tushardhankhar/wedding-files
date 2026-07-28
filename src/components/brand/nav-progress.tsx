"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

/**
 * A tiny module-level store of "how many navigations are in flight". It lives
 * outside React so the reporters (one <LinkHint /> per link, plus a popstate
 * listener) can be anywhere in the tree while a single bar renders in the
 * shell. Refs are counted because hovering off one link onto another can leave
 * two pending states overlapping for a frame.
 */
let inFlight = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const isNavigating = () => inFlight > 0;
const serverSnapshot = () => false;

/** Reporters call this on both edges: `true` when pending, `false` on cleanup. */
export function markNavigating(on: boolean) {
  inFlight = Math.max(0, inFlight + (on ? 1 : -1));
  emit();
}

function clearNavigating() {
  if (inFlight === 0) return;
  inFlight = 0;
  emit();
}

/**
 * The shell's navigation indicator: a gold bar sweeping across the top of the
 * viewport whenever a route change is in flight. Mounted once, in the admin
 * layout, so it survives the page swap underneath it.
 */
export function NavProgress() {
  const navigating = useSyncExternalStore(
    subscribe,
    isNavigating,
    serverSnapshot
  );
  const pathname = usePathname();

  // A committed pathname means the new route (or its loading.tsx fallback) is
  // on screen — whatever was in flight is done, so drop the count to zero.
  // Individual reporters may still fire their `false` edge afterwards; the
  // clamp in markNavigating absorbs that.
  useEffect(clearNavigating, [pathname]);

  // Browser back/forward never goes through <Link>, so useLinkStatus can't see
  // it. This is the one case we have to detect by hand.
  useEffect(() => {
    const onPopState = () => markNavigating(true);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Safety net: a popstate that resolves to the same pathname (a hash change,
  // say) never trips the effect above, and a bar that runs forever is worse
  // than no bar at all.
  useEffect(() => {
    if (!navigating) return;
    const timer = setTimeout(clearNavigating, 10_000);
    return () => clearTimeout(timer);
  }, [navigating]);

  return (
    <>
      <div aria-hidden className="jn-navbar" data-pending={navigating || undefined}>
        <span />
      </div>
      {/* Kept out of the clipped bar so it is announced, not just painted. */}
      <div className="sr-only" role="status" aria-live="polite">
        {navigating ? "Loading page" : ""}
      </div>
    </>
  );
}
