import { cn } from "@/lib/utils";

/**
 * Jashan ornament set — lotus emblem, paisley corner flourish, and a mandala
 * watermark. Strokes use `currentColor`, so color them with a text-* class.
 */

const PETAL = "M0 6 C 7 -1 7 -13 0 -21 C -7 -13 -7 -1 0 6 Z";

export function Lotus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-30 -24 60 34"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={cn("h-8 w-auto", className)}
      aria-hidden="true"
    >
      <path d={PETAL} />
      <path d={PETAL} transform="rotate(34 0 6)" />
      <path d={PETAL} transform="rotate(-34 0 6)" />
      <path d="M0 6 C 6 1 12 -6 15 -14" />
      <path d="M0 6 C 6 1 12 -6 15 -14" transform="scale(-1,1)" />
    </svg>
  );
}

export function Paisley({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      className={cn("h-10 w-10", className)}
      aria-hidden="true"
    >
      <path d="M8 36 C -2 28 -1 12 12 6 C 22 1 33 6 33 16 C 33 23 27 27 21 26 C 25 24 26 18 22 16 C 18 14 13 17 14 22 C 15 28 22 31 30 28" />
    </svg>
  );
}

/** Decorative radiating mandala watermark (see the `mandala` utility). */
export function Mandala({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("mandala pointer-events-none absolute rounded-full", className)}
    />
  );
}
