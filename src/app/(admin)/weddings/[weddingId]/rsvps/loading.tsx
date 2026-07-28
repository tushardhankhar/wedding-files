import { SkeletonPage } from "@/components/brand/skeleton";

// One response card per event.
export default function Loading() {
  return <SkeletonPage cards={3} />;
}
