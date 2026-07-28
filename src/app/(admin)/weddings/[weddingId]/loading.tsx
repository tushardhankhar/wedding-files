import {
  Skeleton,
  SkeletonCard,
  SkeletonTopRow,
} from "@/components/brand/skeleton";

// The hub: back row, the section cards (events / content / guests / RSVPs),
// then the details form.
export default function Loading() {
  return (
    <div className="mx-auto max-w-xl space-y-6" aria-hidden>
      <SkeletonTopRow />
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
      <div className="rounded-xl border bg-card p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3.5 w-48" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
