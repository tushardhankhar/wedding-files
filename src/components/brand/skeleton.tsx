import { cn } from "@/lib/utils";

/** Shimmering placeholder block — the unit every route skeleton is built from. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("jn-skeleton rounded-md", className)} />;
}

/** The "← back" / meta row that sits at the top of every inner admin page. */
export function SkeletonTopRow() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

/** Eyebrow + title + one line of description. */
export function SkeletonHeading() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-full max-w-sm" />
    </div>
  );
}

/** Card-shaped block: title, description, and optionally some body rows. */
export function SkeletonCard({
  rows = 0,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-5", className)}>
      <Skeleton className="h-4 w-44" />
      <Skeleton className="mt-2.5 h-3.5 w-full max-w-xs" />
      {rows > 0 ? (
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: rows }, (_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Standard inner-page shell: top row, heading, then a stack of cards. Renders
 * the page frame instantly so only the data-bound parts appear to load.
 */
export function SkeletonPage({
  cards = 3,
  rows = 0,
  topRow = true,
}: {
  cards?: number;
  rows?: number;
  topRow?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6" aria-hidden>
      {topRow ? <SkeletonTopRow /> : null}
      <SkeletonHeading />
      {Array.from({ length: cards }, (_, i) => (
        <SkeletonCard key={i} rows={i === 0 ? rows : 0} />
      ))}
    </div>
  );
}
