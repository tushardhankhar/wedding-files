import { SkeletonPage } from "@/components/brand/skeleton";

// Share links card (with its form rows) followed by the group cards.
export default function Loading() {
  return <SkeletonPage cards={3} rows={3} />;
}
