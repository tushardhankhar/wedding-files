import { SkeletonPage } from "@/components/brand/skeleton";

// Add-event form, then one card per celebration.
export default function Loading() {
  return <SkeletonPage cards={3} rows={4} />;
}
