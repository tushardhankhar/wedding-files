import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/modules/auth/server/user";
import { UnauthorizedError } from "@/lib/errors";
import { DEFAULT_THEME_ID } from "@/modules/website/themes/registry";
import { insertWithUniqueSlug } from "./slug";
import type { WebsiteConfig } from "@/modules/website/schema";
import {
  mapWeddingRow,
  type Wedding,
  type WeddingRow,
} from "../types";
import type { CreateWeddingInput, UpdateWeddingInput } from "../schema";

const COLUMNS =
  "id, created_by, client_id, slug, title, name1, name2, event_date, client_phone, config, theme_id, created_at, updated_at";

/**
 * Creates a wedding owned by the current user. The slug is generated from the
 * title by `insertWithUniqueSlug`, which retries on collision. created_by is
 * set from the verified session — never from client input.
 */
export async function createWedding(
  input: CreateWeddingInput
): Promise<Wedding> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();

  const supabase = await createSupabaseServerClient();

  const row = await insertWithUniqueSlug<WeddingRow>(input.title, (slug) =>
    supabase
      .from("weddings")
      .insert({
        created_by: user.id,
        slug,
        title: input.title,
        theme_id: input.themeId ?? DEFAULT_THEME_ID,
        name1: input.name1 ?? null,
        name2: input.name2 ?? null,
        event_date: input.eventDate ?? null,
        client_phone: input.clientPhone ?? null,
        // Countdown time (HH:MM) lives in config; event_date is date-only.
        config: input.eventTime ? { eventTime: input.eventTime } : {},
      })
      .select(COLUMNS)
      .single()
  );

  return mapWeddingRow(row);
}

/**
 * Updates a wedding's details. RLS scopes who may update (admin: any; client:
 * their own). The name and the client's phone are admin-only, so `title` and
 * `client_phone` are written only when `isAdmin` — and the DB trigger rejects
 * them otherwise regardless. Omitting them (rather than sending the unchanged
 * value) keeps a client's save from tripping that trigger.
 */
export async function updateWedding(
  id: string,
  input: UpdateWeddingInput,
  { isAdmin }: { isAdmin: boolean }
): Promise<Wedding> {
  const supabase = await createSupabaseServerClient();

  // Merge the countdown time into the stored config jsonb without wiping the
  // content the editor manages (hero/story/gallery/…).
  const { data: existing } = await supabase
    .from("weddings")
    .select("config")
    .eq("id", id)
    .single();
  const config = { ...((existing?.config ?? {}) as Record<string, unknown>) };
  if (input.eventTime) config.eventTime = input.eventTime;
  else delete config.eventTime;

  const patch: Record<string, unknown> = {
    name1: input.name1 ?? null,
    name2: input.name2 ?? null,
    event_date: input.eventDate ?? null,
    config,
  };
  if (isAdmin) {
    patch.title = input.title;
    patch.client_phone = input.clientPhone ?? null;
  }

  const { data, error } = await supabase
    .from("weddings")
    .update(patch)
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

/**
 * Sets the website theme. Admin-only (the DB name-lock trigger also rejects a
 * non-admin theme change); callers should gate on role for a clean message.
 */
export async function updateWeddingTheme(
  id: string,
  themeId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("weddings")
    .update({ theme_id: themeId })
    .eq("id", id);
  if (error) throw error;
}

/** Writes the website content config (jsonb). Editable by admin or client. */
export async function updateWeddingConfig(
  id: string,
  config: WebsiteConfig
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  // Shallow-merge onto the stored config so blocks the content editor doesn't
  // manage (e.g. theme-specific `experience.*`) are preserved rather than wiped
  // on every save. Incoming keys (hero/story/gallery/family/faq/footer) overwrite.
  const { data: existing } = await supabase
    .from("weddings")
    .select("config")
    .eq("id", id)
    .single();
  const prev = (existing?.config ?? {}) as Record<string, unknown>;
  const merged = { ...prev, ...config };
  const { error } = await supabase
    .from("weddings")
    .update({ config: merged })
    .eq("id", id);
  if (error) throw error;
}
