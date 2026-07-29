import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapWeddingRow, type Wedding, type WeddingRow } from "../types";

const COLUMNS =
  "id, created_by, client_id, slug, title, name1, name2, event_date, client_phone, config, theme_id, created_at, updated_at";

/**
 * Lists the current user's weddings. RLS guarantees only owned rows are
 * returned — no explicit owner filter needed, but isolation does not depend on
 * remembering to add one.
 */
export async function listWeddings(): Promise<Wedding[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weddings")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as WeddingRow[]).map(mapWeddingRow);
}

/**
 * Fetches a single wedding by id. Returns null when it does not exist or is not
 * owned by the current user (RLS filters it out either way).
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getWeddingById(id: string): Promise<Wedding | null> {
  // A malformed id can never match a row — treat it as not-found rather than
  // letting Postgres raise an invalid-uuid error.
  if (!UUID_RE.test(id)) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weddings")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapWeddingRow(data as WeddingRow) : null;
}
