import { NextResponse, type NextRequest } from "next/server";
import { resolveInviteToken } from "@/modules/guest-access/server/invite";
import {
  createGuestSessionValue,
  guestCookieOptions,
  GUEST_COOKIE,
  GUEST_TTL_SECONDS,
} from "@/modules/guest-access/server/session";

/**
 * Invitation landing — a PERMANENT public contract. This path is printed into
 * WhatsApp threads months before the event, so it must stay mounted forever;
 * if the link shape ever changes, add the new one and keep this redirecting.
 *
 * Verifies the token (slug-independent — see `resolveInviteToken`), mints a
 * signed HTTP-only guest session cookie (separate from the token), and
 * redirects to the wedding's CURRENT url. Invalid tokens redirect with
 * ?invalid=1 and set no cookie.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  const { slug, token } = await params;
  const result = await resolveInviteToken(token);

  // On success go to the canonical slug, which may differ from the one baked
  // into this link if the wedding was renamed after it was sent. On failure we
  // have no wedding to name, so fall back to the slug the guest arrived with.
  const dest = new URL(`/w/${result?.slug ?? slug}`, req.url);
  if (!result) dest.searchParams.set("invalid", "1");

  const res = NextResponse.redirect(dest);
  if (result) {
    const value = await createGuestSessionValue(
      {
        kind: "group",
        groupId: result.groupId,
        weddingId: result.weddingId,
        slug: result.slug,
      },
      Math.floor(Date.now() / 1000)
    );
    res.cookies.set(GUEST_COOKIE, value, guestCookieOptions(GUEST_TTL_SECONDS));
  }
  return res;
}
