import { NextResponse, type NextRequest } from "next/server";
import { resolveInviteToken } from "@/modules/guest-access/server/invite";
import {
  createGuestSessionValue,
  guestCookieOptions,
  GUEST_COOKIE,
  GUEST_TTL_SECONDS,
} from "@/modules/guest-access/server/session";

/**
 * Invitation landing. Verifies the token for this slug, mints a signed
 * HTTP-only guest session cookie (separate from the token), and redirects to
 * the wedding site. Invalid tokens redirect with ?invalid=1 and set no cookie.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  const { slug, token } = await params;
  const result = await resolveInviteToken(slug, token);

  const dest = new URL(`/w/${slug}`, req.url);
  if (!result) dest.searchParams.set("invalid", "1");

  const res = NextResponse.redirect(dest);
  if (result) {
    const value = await createGuestSessionValue(
      { groupId: result.groupId, weddingId: result.weddingId, slug },
      Math.floor(Date.now() / 1000)
    );
    res.cookies.set(GUEST_COOKIE, value, guestCookieOptions(GUEST_TTL_SECONDS));
  }
  return res;
}
