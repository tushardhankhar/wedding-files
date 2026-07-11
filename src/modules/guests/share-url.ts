import { env } from "@/lib/env";

/**
 * Builds the absolute broadcast-link URL for a wedding slug + share token.
 * Uses only the public `NEXT_PUBLIC_SITE_URL`, so it is safe to call from both
 * server actions and client components.
 */
export function shareUrl(slug: string, token: string): string {
  const base = env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/w/${slug}/share/${token}`;
}
