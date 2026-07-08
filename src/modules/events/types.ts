export interface WeddingEvent {
  id: string;
  weddingId: string;
  name: string;
  eventDate: string | null; // YYYY-MM-DD
  startTime: string | null; // HH:MM(:SS)
  venueName: string | null;
  venueAddress: string | null;
  mapsUrl: string | null;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventRow {
  id: string;
  wedding_id: string;
  name: string;
  event_date: string | null;
  start_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  maps_url: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function mapEventRow(row: EventRow): WeddingEvent {
  return {
    id: row.id,
    weddingId: row.wedding_id,
    name: row.name,
    eventDate: row.event_date,
    startTime: row.start_time,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    mapsUrl: row.maps_url,
    description: row.description,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
