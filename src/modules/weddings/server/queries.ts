import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapWeddingRow, type Wedding, type WeddingRow } from "../types";

const COLUMNS =
  "id, created_by, client_id, slug, title, partner_one_name, partner_two_name, event_date, config, theme_id, created_at, updated_at";

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
export async function getWeddingById(id: string): Promise<Wedding | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("weddings")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapWeddingRow(data as WeddingRow) : null;
}
