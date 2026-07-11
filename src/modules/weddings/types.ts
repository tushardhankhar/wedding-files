/**
 * Domain type for a wedding row. Kept hand-written for now; when the schema
 * stabilizes we can switch to generated Supabase types.
 */
export interface Wedding {
  id: string;
  createdBy: string; // admin who created it
  clientId: string | null; // assigned client (null until claimed)
  slug: string;
  title: string;
  name1: string | null;
  name2: string | null;
  eventDate: string | null; // ISO date (YYYY-MM-DD)
  config: Record<string, unknown>;
  themeId: string;
  createdAt: string;
  updatedAt: string;
}

/** Shape as stored in Postgres (snake_case), used only at the DB boundary. */
export interface WeddingRow {
  id: string;
  created_by: string;
  client_id: string | null;
  slug: string;
  title: string;
  name1: string | null;
  name2: string | null;
  event_date: string | null;
  config: Record<string, unknown>;
  theme_id: string;
  created_at: string;
  updated_at: string;
}

export function mapWeddingRow(row: WeddingRow): Wedding {
  return {
    id: row.id,
    createdBy: row.created_by,
    clientId: row.client_id,
    slug: row.slug,
    title: row.title,
    name1: row.name1,
    name2: row.name2,
    eventDate: row.event_date,
    config: row.config ?? {},
    themeId: row.theme_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
