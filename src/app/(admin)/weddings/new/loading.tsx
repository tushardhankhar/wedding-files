import { SkeletonPage } from "@/components/brand/skeleton";

// Occasion picker, then the create form.
export default function Loading() {
  return <SkeletonPage cards={2} rows={4} />;
}
