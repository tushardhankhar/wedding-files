import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/modules/auth/server/user";
import { UnauthorizedError } from "@/lib/errors";
import { slugify } from "@/lib/slug";
import {
  mapWeddingRow,
  type Wedding,
  type WeddingRow,
} from "../types";
import type { CreateWeddingInput, UpdateWeddingInput } from "../schema";

const COLUMNS =
  "id, owner_id, slug, title, partner_one_name, partner_two_name, event_date, config, theme_id, created_at, updated_at";

const UNIQUE_VIOLATION = "23505";

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
 * Creates a wedding owned by the current user. Generates a unique slug from the
 * title, retrying with a random suffix on collision. owner_id is set from the
 * verified session — never from client input.
 */
export async function createWedding(
  input: CreateWeddingInput
): Promise<Wedding> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const supabase = await createSupabaseServerClient();
  const base = slugify(input.title) || "wedding";

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`;
    const { data, error } = await supabase
      .from("weddings")
      .insert({
        owner_id: user.id,
        slug,
        title: input.title,
        partner_one_name: input.partnerOneName ?? null,
        partner_two_name: input.partnerTwoName ?? null,
        event_date: input.eventDate ?? null,
      })
      .select(COLUMNS)
      .single();

    if (!error) return mapWeddingRow(data as WeddingRow);
    if (error.code !== UNIQUE_VIOLATION) throw error;
    // else: slug taken, loop and try a new suffix
  }

  throw new Error("Could not generate a unique wedding URL. Please try again.");
}

/**
 * Updates an owned wedding's core details. RLS ensures a user can only update
 * their own rows; the id alone is sufficient scoping.
 */
export async function updateWedding(
  id: string,
  input: UpdateWeddingInput
): Promise<Wedding> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weddings")
    .update({
      title: input.title,
      partner_one_name: input.partnerOneName ?? null,
      partner_two_name: input.partnerTwoName ?? null,
      event_date: input.eventDate ?? null,
    })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return mapWeddingRow(data as WeddingRow);
}

/** Deletes an owned wedding (RLS-scoped). */
export async function deleteWedding(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("weddings").delete().eq("id", id);
  if (error) throw error;
}
