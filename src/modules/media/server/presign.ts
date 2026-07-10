"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/modules/auth/server/user";
import { getR2, publicUrl } from "./r2";

/**
 * Image content types we accept for direct upload. The uploader re-encodes to
 * WebP client-side, so `image/webp` is the common case; the rest are allowed so
 * a raw drop still works if the browser skips re-encoding.
 */
const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
  "image/gif": "gif",
};

const PRESIGN_TTL_SECONDS = 60;

export type PresignResult =
  | { ok: true; uploadUrl: string; publicUrl: string }
  | { ok: false; error: string };

/** A short, URL-safe random id for the object key. */
function randomId(): string {
  const buf = new Uint8Array(12);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Issues a presigned PUT URL for a gallery photo on a wedding the caller may
 * edit. Authorization is enforced two ways: the caller must be authenticated,
 * and the wedding must be visible to their RLS-scoped client (admins see all,
 * clients see only their own). The service-role client is never used here.
 *
 * The final object key is server-chosen — never trusted from the client — so a
 * caller can only ever write under `weddings/<their wedding>/gallery/`.
 */
export async function createUploadUrlAction(
  weddingId: string,
  contentType: string
): Promise<PresignResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const ext = CONTENT_TYPE_EXT[contentType];
  if (!ext) return { ok: false, error: "Unsupported image type." };

  // RLS access check: the row is returned only if this user may see this
  // wedding. No row → not allowed (or it doesn't exist) → deny.
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .maybeSingle();
  if (error || !data) return { ok: false, error: "You can't edit this wedding." };

  let r2;
  try {
    r2 = getR2();
  } catch {
    return { ok: false, error: "Photo uploads aren't configured yet." };
  }

  const key = `weddings/${weddingId}/gallery/${randomId()}.${ext}`;
  try {
    const uploadUrl = await getSignedUrl(
      r2.client,
      new PutObjectCommand({
        Bucket: r2.config.R2_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: PRESIGN_TTL_SECONDS }
    );
    return { ok: true, uploadUrl, publicUrl: publicUrl(key) };
  } catch {
    return { ok: false, error: "Could not start the upload. Please try again." };
  }
}
