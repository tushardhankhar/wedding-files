import { cn } from "@/lib/utils";

/**
 * Inline ring in the current text colour — sized to sit next to a button label
 * so pending buttons read as *working*, not just re-worded.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-current/25 border-t-current",
        className
      )}
    />
  );
}
