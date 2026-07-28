import { SkeletonPage } from "@/components/brand/skeleton";

// The editor is the heaviest page in the shell — several long section cards.
export default function Loading() {
  return <SkeletonPage cards={4} rows={5} />;
}
