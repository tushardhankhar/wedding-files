import "server-only";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env.server";
import {
  hmacSha256Hex,
  timingSafeEqualHex,
  base64UrlEncodeString,
  base64UrlDecodeString,
} from "@/lib/crypto";

/**
 * Stateless guest session: a signed, HTTP-only cookie. The value is
 * `base64url(payload).hmac`. It is NOT the invitation token — it's minted after
 * the token is verified. Rotating GUEST_SESSION_SECRET invalidates all sessions.
 */
export const GUEST_COOKIE = "utsav_guest";
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type GuestSession =
  | { kind: "group"; groupId: string; weddingId: string; slug: string }
  | { kind: "share"; shareLinkId: string; weddingId: string; slug: string };

interface Payload {
  kind?: "group" | "share";
  groupId?: string;
  shareLinkId?: string;
  weddingId?: string;
  slug?: string;
  exp: number; // epoch seconds
}

/** Cookie attributes shared by set/clear. Secure only in production (http dev). */
export function guestCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Builds a signed cookie value for a verified guest session. */
export async function createGuestSessionValue(
  session: GuestSession,
  nowSeconds: number
): Promise<string> {
  const payload: Payload = { ...session, exp: nowSeconds + TTL_SECONDS };
  const body = base64UrlEncodeString(JSON.stringify(payload));
  const sig = await hmacSha256Hex(serverEnv.GUEST_SESSION_SECRET, body);
  return `${body}.${sig}`;
}

/** Verifies and decodes the guest session cookie, or null if invalid/expired. */
export async function readGuestSession(): Promise<GuestSession | null> {
  const raw = (await cookies()).get(GUEST_COOKIE)?.value;
  if (!raw) return null;

  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);

  const expected = await hmacSha256Hex(serverEnv.GUEST_SESSION_SECRET, body);
  if (!timingSafeEqualHex(sig, expected)) return null;

  try {
    const p = JSON.parse(base64UrlDecodeString(body)) as Payload;
    if (
      typeof p.exp !== "number" ||
      p.exp < Date.now() / 1000 ||
      !p.weddingId ||
      !p.slug
    ) {
      return null;
    }
    // Share session.
    if (p.kind === "share" && p.shareLinkId) {
      return {
        kind: "share",
        shareLinkId: p.shareLinkId,
        weddingId: p.weddingId,
        slug: p.slug,
      };
    }
    // Group session (kind may be absent on older cookies).
    if ((p.kind === "group" || !p.kind) && p.groupId) {
      return {
        kind: "group",
        groupId: p.groupId,
        weddingId: p.weddingId,
        slug: p.slug,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const GUEST_TTL_SECONDS = TTL_SECONDS;
