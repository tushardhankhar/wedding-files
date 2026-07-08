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

export interface GuestSession {
  groupId: string;
  weddingId: string;
  slug: string;
}

interface Payload extends GuestSession {
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
    const payload = JSON.parse(base64UrlDecodeString(body)) as Payload;
    if (
      typeof payload.exp !== "number" ||
      payload.exp < Date.now() / 1000 ||
      !payload.groupId ||
      !payload.weddingId ||
      !payload.slug
    ) {
      return null;
    }
    return {
      groupId: payload.groupId,
      weddingId: payload.weddingId,
      slug: payload.slug,
    };
  } catch {
    return null;
  }
}

export const GUEST_TTL_SECONDS = TTL_SECONDS;
