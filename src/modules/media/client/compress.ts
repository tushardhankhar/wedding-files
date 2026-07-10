/**
 * Client-side image normalization.
 *
 * Couples upload whatever comes off their phone or camera; we downscale and
 * re-encode to WebP in the browser BEFORE upload. This keeps uploads small
 * (5–10× smaller, so they succeed on hotel wifi), strips the need for any
 * server-side image pipeline, and hands R2 a finished file. The themes crop to
 * fill (`object-cover`), so we never need a specific aspect ratio — only a sane
 * maximum size and good compression.
 */

/** Longest-edge cap in pixels. 2000px covers full-bleed hero use on retina. */
const MAX_EDGE = 2000;
const WEBP_QUALITY = 0.82;

/** Types we re-encode. Animated GIFs are passed through so animation survives. */
const RECODABLE = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
/** Types accepted as-is (no canvas re-encode). */
const PASSTHROUGH = new Set(["image/gif"]);

export type CompressResult = { blob: Blob; contentType: string };

export class UnsupportedImageError extends Error {}

/**
 * Returns a normalized blob ready for upload. Throws `UnsupportedImageError`
 * for anything that isn't a supported image.
 */
export async function compressImage(file: File): Promise<CompressResult> {
  if (PASSTHROUGH.has(file.type)) {
    return { blob: file, contentType: file.type };
  }
  if (!RECODABLE.has(file.type)) {
    throw new UnsupportedImageError(
      "Please choose a JPG, PNG, WEBP, AVIF or GIF image."
    );
  }

  // `imageOrientation: "from-image"` bakes in EXIF rotation so phone photos
  // aren't sideways after we drop the metadata.
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { blob: file, contentType: file.type };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );

  // Some browsers can't encode WebP and hand back null (or a PNG). Fall back to
  // the original file so the upload still works.
  if (!blob) return { blob: file, contentType: file.type };
  return { blob, contentType: blob.type || "image/webp" };
}
