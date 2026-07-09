import { cn } from "@/lib/utils";

/**
 * JOIN THE JASHAN — brand mark.
 *
 * The monogram is a garland-U: two symmetric strokes (two families) swag down
 * and meet at a single gold bead, with marigold buds at the open ends — the
 * movement of a wedding toran. Works from 16px favicon to hero scale.
 */
export function UtsavMonogram({
  className,
  stroke = "var(--l-gold-lite)",
  bud = "var(--l-marigold)",
}: {
  className?: string;
  stroke?: string;
  bud?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <g stroke={stroke} strokeWidth={3.4} strokeLinecap="round">
        <path d="M14 11 C 14 24.5, 17.5 33, 24 34" />
        <path d="M34 11 C 34 24.5, 30.5 33, 24 34" />
      </g>
      <circle cx="14" cy="8" r="2.6" fill={bud} />
      <circle cx="34" cy="8" r="2.6" fill={bud} />
      <circle cx="24" cy="39.4" r="2.2" fill={stroke} />
    </svg>
  );
}

/**
 * Full lockup: [ U ] Join the / Jashan. `tone` flips it for dark vs light
 * grounds; `compact` drops the "Join the" eyebrow.
 */
export function UtsavLogo({
  tone = "light",
  compact = false,
  className,
}: {
  /** "light" = light lettering for dark grounds; "dark" = wine lettering. */
  tone?: "light" | "dark";
  compact?: boolean;
  className?: string;
}) {
  const ink = tone === "light" ? "text-[color:var(--l-ivory)]" : "text-[color:var(--l-wine)]";
  const eyebrow =
    tone === "light" ? "text-[color:var(--l-gold-lite)]" : "text-[color:var(--l-gold)]";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <UtsavMonogram
        className="h-9 w-9"
        stroke={tone === "light" ? "var(--l-gold-lite)" : "var(--l-gold)"}
      />
      <span className="flex flex-col leading-none">
        {!compact ? (
          <span
            className={cn(
              "text-[9px] font-semibold uppercase tracking-[0.32em]",
              eyebrow
            )}
          >
            Join the
          </span>
        ) : null}
        <span className={cn("l-display text-[22px] font-semibold tracking-wide", ink)}>
          Jashan
        </span>
      </span>
    </span>
  );
}
