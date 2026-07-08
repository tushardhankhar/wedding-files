"use client";

import { useEffect, useState } from "react";
import { TT } from "./bilingual";

const pad = (n: number) => String(n).padStart(2, "0");

/** Live countdown to the wedding date. Renders "—" until mounted (no SSR skew). */
export function Countdown({ dateIso }: { dateIso: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0); // async initial → no cascading render
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const target = new Date(`${dateIso}T20:00:00`).getTime();
  const diff = now === null ? null : Math.max(0, target - now);
  const s = diff === null ? null : Math.floor(diff / 1000);

  const tiles: Array<[string, string, string]> =
    s === null
      ? [
          ["—", "Days", "दिन"],
          ["—", "Hours", "घंटे"],
          ["—", "Mins", "मिनट"],
          ["—", "Secs", "सेकंड"],
        ]
      : [
          [String(Math.floor(s / 86400)), "Days", "दिन"],
          [pad(Math.floor((s % 86400) / 3600)), "Hours", "घंटे"],
          [pad(Math.floor((s % 3600) / 60)), "Mins", "मिनट"],
          [pad(s % 60), "Secs", "सेकंड"],
        ];

  return (
    <div className="w-count">
      <div className="cd-row">
        {tiles.map(([val, en, hi], i) => (
          <div className="cd" key={i}>
            <b>{val}</b>
            <span>
              <TT en={en} hi={hi} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
