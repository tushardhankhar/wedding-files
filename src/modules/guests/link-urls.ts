import { env } from "@/lib/env";

/**
 * ⚠️ THE GUEST LINK URL SHAPE — the second one-way door (see
 * `modules/guest-access/tokens.ts` for the first).
 *
 * These two functions are the ONLY place a guest-facing link is spelled out.
 * The strings they return are copied into WhatsApp and live there for months,
 * so the origin and the path shape are a permanent public contract:
 *
 *   - Changing `NEXT_PUBLIC_SITE_URL` (a domain move) breaks every link already
 *     sent. Keep every origin the app has ever published alive and redirecting;
 *     never retire an old deployment domain.
 *   - Changing the path breaks every link already sent. If a new shape is
 *     needed, ADD it and keep `/w/[slug]/invite/[token]` and
 *     `/w/[slug]/share/[token]` mounted forever as permanent redirects.
 *
 * Both are recoverable rather than fatal only because the plaintext tokens are
 * persisted (`guest_groups.invite_token`, `share_links.token`), so links can be
 * re-rendered in a new shape and re-sent. Do not remove that persistence.
 *
 * `NEXT_PUBLIC_SITE_URL` is statically inlined by Next, so these are safe to
 * call from Server Actions and Client Components alike.
 */

function origin(): string {
  return env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

/**
 * A family's personal invitation link. The `slug` is cosmetic — it makes the
 * link recognisable in a chat thread — and is NOT part of the lookup, so a
 * wedding can be renamed without breaking links already in circulation.
 */
export function inviteUrl(slug: string, token: string): string {
  return `${origin()}/w/${slug}/invite/${token}`;
}

/** A wedding's broadcast link. Same cosmetic-slug rule as {@link inviteUrl}. */
export function shareUrl(slug: string, token: string): string {
  return `${origin()}/w/${slug}/share/${token}`;
}
