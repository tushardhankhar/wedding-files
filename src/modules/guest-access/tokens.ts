import { randomToken, sha256Hex } from "@/lib/crypto";

/**
 * ⚠️ THE GUEST TOKEN CONTRACT — a one-way door.
 *
 * Every invitation and broadcast link ever sent is a bearer token sitting in
 * somebody's WhatsApp thread, months before the event. Nothing in this file can
 * change without invalidating all of them at once, so both functions are
 * deliberately trivial and live in exactly one place — the point is that there
 * is only ONE definition to protect, not that the logic is complex.
 *
 * Callers: `modules/guests/server/mutations.ts` (mint) and
 * `modules/guest-access/server/{invite,share}.ts` (resolve). Do not inline
 * `sha256Hex` for guest tokens anywhere else.
 *
 * If the algorithm ever genuinely must change, DO NOT edit `hashGuestToken` in
 * place. Add a second column, write both on mint, read new-then-old, backfill
 * from the persisted plaintext (`guest_groups.invite_token`,
 * `share_links.token`), and only then retire the old column.
 */

/** Bytes of entropy per guest token. 32 → 256 bits; brute force is not a threat. */
const TOKEN_BYTES = 32;

/** Mints a fresh guest link token. URL-safe, 256-bit. */
export function newGuestToken(): string {
  return randomToken(TOKEN_BYTES);
}

/**
 * The stored lookup key for a guest token. Frozen — see the file header.
 *
 * A plain unsalted digest is correct here (not a password KDF): the input is
 * already 256 bits of uniform randomness, so there is nothing to brute-force
 * and a slow hash would only add latency to every guest page load.
 */
export function hashGuestToken(token: string): Promise<string> {
  return sha256Hex(token);
}
