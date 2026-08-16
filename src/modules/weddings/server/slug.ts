import { slugify } from "@/lib/slug";

const UNIQUE_VIOLATION = "23505";
const MAX_ATTEMPTS = 5;

function randomSuffix(): string {
  // 4 URL-safe chars derived from Web Crypto — enough to break slug collisions.
  const buf = new Uint8Array(3);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/[+/=]/g, "")
    .toLowerCase()
    .slice(0, 4);
}

/**
 * Inserts a wedding under a slug derived from its title, retrying with a random
 * suffix when the globally-unique `slug` collides.
 *
 * The loop lives here because there are now two ways a wedding is born and they
 * use different clients: the planner's create form (user-scoped, RLS-checked)
 * and self-serve activation (service-role, after payment). Both need identical
 * slug behaviour, and a second hand-rolled copy of a retry loop is exactly the
 * kind of thing that drifts.
 *
 * `insert` receives a candidate slug and returns Supabase's `{ data, error }`
 * as-is, so each caller keeps its own client, columns and row shape. Typed as
 * `PromiseLike` because a PostgREST query builder is a thenable, not a Promise
 * — it has no `.catch`, and demanding one would reject every real call site.
 */
export async function insertWithUniqueSlug<T>(
  title: string,
  insert: (
    slug: string
  ) => PromiseLike<{ data: T | null; error: { code?: string } | null }>
): Promise<T> {
  const base = slugify(title) || "invite";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`;
    const { data, error } = await insert(slug);

    if (!error && data) return data;
    if (error && error.code !== UNIQUE_VIOLATION) throw error;
    // else: slug taken, loop and try a new suffix
  }

  throw new Error("Could not generate a unique invitation URL. Please try again.");
}
