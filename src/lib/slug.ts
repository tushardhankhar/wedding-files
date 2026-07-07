/**
 * Turns a title into a URL-safe slug used as the public wedding path segment
 * (/w/[slug]). Uniqueness is enforced by the DB; the mutation layer appends a
 * short random suffix on collision.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
