/**
 * Sanitizes a `next` redirect target coming from a URL query param. Only allows
 * same-origin absolute PATHS (must start with a single "/"), defeating
 * open-redirect attempts like `//evil.com` or `https://evil.com`. Falls back to
 * `/dashboard` for anything else.
 */
export function sanitizeNextPath(
  next: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  return next;
}
