/**
 * Domain type for a wedding row. Kept hand-written for now; when the schema
 * stabilizes we can switch to generated Supabase types.
 */
export interface Wedding {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  partnerOneName: string | null;
  partnerTwoName: string | null;
  eventDate: string | null; // ISO date (YYYY-MM-DD)
  config: Record<string, unknown>;
  themeId: string;
  createdAt: string;
  updatedAt: string;
}

/** Shape as stored in Postgres (snake_case), used only at the DB boundary. */
export interface WeddingRow {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  partner_one_name: string | null;
  partner_two_name: string | null;
  event_date: string | null;
  config: Record<string, unknown>;
  theme_id: string;
  created_at: string;
  updated_at: string;
}

export function mapWeddingRow(row: WeddingRow): Wedding {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    title: row.title,
    partnerOneName: row.partner_one_name,
    partnerTwoName: row.partner_two_name,
    eventDate: row.event_date,
    config: row.config ?? {},
    themeId: row.theme_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
