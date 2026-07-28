"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { markNavigating } from "./nav-progress";

type Hint = "dot" | "veil" | "none";

/**
 * Must be rendered *inside* a <Link> — that's how useLinkStatus finds the
 * navigation it belongs to. Does two jobs: feeds the shell's <NavProgress />
 * bar, and paints a local cue on the thing that was actually clicked.
 */
function LinkHint({ variant }: { variant: Hint }) {
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (!pending) return;
    markNavigating(true);
    return () => markNavigating(false);
  }, [pending]);

  // "none" still reports to the bar — it just draws nothing locally, for links
  // whose layout (a flex row, say) can't spare the reserved space.
  if (variant === "none") return null;

  return (
    <span
      aria-hidden
      className={variant === "dot" ? "jn-hint" : "jn-veil"}
      data-pending={pending || undefined}
    />
  );
}

type LinkProps = React.ComponentProps<typeof Link> & { hint?: Hint };

/**
 * Inline text link (breadcrumbs, "← Back to dashboard") that grows a pulsing
 * dot while its destination loads.
 */
export function NavLink({ children, hint = "dot", ...props }: LinkProps) {
  return (
    <Link {...props}>
      {children}
      <LinkHint variant={hint} />
    </Link>
  );
}

/**
 * Block-level link wrapping a card. Lays a veil + spinner over the card that
 * was clicked, so the click clearly landed even before the route swaps.
 */
export function NavCardLink({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  // rounded-xl matches <Card>, so the veil's `border-radius: inherit` lines up.
  return (
    <Link {...props} className={cn("relative block rounded-xl", className)}>
      {children}
      <LinkHint variant="veil" />
    </Link>
  );
}
