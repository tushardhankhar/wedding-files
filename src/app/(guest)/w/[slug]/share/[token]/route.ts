import { NextResponse, type NextRequest } from "next/server";
import { resolveShareToken } from "@/modules/guest-access/server/share";
import {
  createGuestSessionValue,
  guestCookieOptions,
  GUEST_COOKIE,
  GUEST_TTL_SECONDS,
} from "@/modules/guest-access/server/session";

/**
 * Shareable/broadcast landing. Verifies the share token for this slug, mints a
 * share-scoped guest session cookie, and redirects to the wedding site.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  const { slug, token } = await params;
  const result = await resolveShareToken(slug, token);

  const dest = new URL(`/w/${slug}`, req.url);
  if (!result) dest.searchParams.set("invalid", "1");

  const res = NextResponse.redirect(dest);
  if (result) {
    const value = await createGuestSessionValue(
      {
        kind: "share",
        shareLinkId: result.shareLinkId,
        weddingId: result.weddingId,
        slug,
      },
      Math.floor(Date.now() / 1000)
    );
    res.cookies.set(GUEST_COOKIE, value, guestCookieOptions(GUEST_TTL_SECONDS));
  }
  return res;
}
