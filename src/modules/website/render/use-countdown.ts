"use client";

import { useEffect, useState } from "react";

/**
 * Headless countdown: ticks every second to the wedding moment and returns the
 * split units. `ready` is false until mounted (avoids SSR/hydration skew — the
 * server renders "—" placeholders). Each theme renders its own segments.
 */
export function useCountdown(dateIso: string, time = "20:00:00") {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const target = new Date(`${dateIso}T${time}`).getTime();
  const ready = now !== null;
  const s = ready ? Math.max(0, Math.floor((target - now) / 1000)) : 0;

  return {
    ready,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    totalSeconds: s,
  };
}

/** "—" until ready, else the number zero-padded to 2 digits. */
export function pad2(v: number, ready: boolean): string {
  return ready ? String(v).padStart(2, "0") : "—";
}
