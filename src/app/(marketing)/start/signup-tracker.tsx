"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { trackSignUp } from "@/modules/self-serve/client/analytics";

/**
 * Announces a completed registration, once, then removes the flag from the URL.
 *
 * The signal has to arrive as a query param because the OTP verification runs
 * in a Server Action, where there is no dataLayer to push to — it can only
 * redirect. Stripping the param immediately afterwards matters: leaving it
 * would re-announce a signup on every refresh, and a shared or bookmarked URL
 * would keep manufacturing registrations that never happened.
 *
 * `replace`, not `push`, so Back doesn't return to the flagged URL and fire it
 * again. The ref guards against Strict Mode's double-invoked effect in
 * development, exactly as `SpaPageview` does.
 */
export function SignupTracker() {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackSignUp();
    router.replace("/start");
  }, [router]);

  return null;
}
