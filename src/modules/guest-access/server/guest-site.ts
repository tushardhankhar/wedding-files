import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { mapEventRow, type EventRow, type WeddingEvent } from "@/modules/events/types";
import { readGuestSession } from "./session";

const EVENT_COLS =
  "id, wedding_id, name, name_hi, event_date, start_time, venue_name, venue_address, maps_url, description, description_hi, sort_order, created_at, updated_at";

export interface GuestWedding {
  slug: string;
  title: string;
  partnerOneName: string | null;
  partnerTwoName: string | null;
  eventDate: string | null;
  config: Record<string, unknown>;
  themeId: string;
}

export interface GuestSiteData {
  groupName: string;
  wedding: GuestWedding;
  events: WeddingEvent[]; // ONLY the events this group is invited to
}

interface GroupJoin {
  id: string;
  name: string;
  wedding_id: string;
  weddings: {
    slug: string;
    title: string;
    partner_one_name: string | null;
    partner_two_name: string | null;
    event_date: string | null;
    config: Record<string, unknown> | null;
    theme_id: string;
  };
}

/**
 * Loads exactly what the signed-in guest is allowed to see for `slug`:
 * the wedding's public content + ONLY the events their group is invited to.
 *
 * ⭐ THE GATE. The event query joins group_event_invites for the session's
 * group, so uninvited events are never selected — they cannot reach the client.
 * Returns null if there is no valid session for this slug.
 */
export async function loadGuestSite(slug: string): Promise<GuestSiteData | null> {
  const session = await readGuestSession();
  if (!session || session.slug !== slug) return null;

  const svc = createSupabaseServiceClient();

  // Re-verify the session's group still belongs to a wedding with this slug.
  const { data: group, error: groupErr } = await svc
    .from("guest_groups")
    .select(
      "id, name, wedding_id, weddings!inner(slug, title, partner_one_name, partner_two_name, event_date, config, theme_id)"
    )
    .eq("id", session.groupId)
    .eq("weddings.slug", slug)
    .maybeSingle<GroupJoin>();

  if (groupErr || !group) return null;

  // Invited events only.
  const { data: invites, error: invErr } = await svc
    .from("group_event_invites")
    .select(`events!inner(${EVENT_COLS})`)
    .eq("group_id", session.groupId);

  if (invErr) return null;

  const rows = ((invites ?? []) as unknown as { events: EventRow }[]).map(
    (r) => r.events
  );
  const events = rows
    .map(mapEventRow)
    .sort((a, b) => {
      const d = (a.eventDate ?? "").localeCompare(b.eventDate ?? "");
      if (d !== 0) return d;
      return (a.startTime ?? "").localeCompare(b.startTime ?? "");
    });

  const w = group.weddings;
  return {
    groupName: group.name,
    wedding: {
      slug: w.slug,
      title: w.title,
      partnerOneName: w.partner_one_name,
      partnerTwoName: w.partner_two_name,
      eventDate: w.event_date,
      config: w.config ?? {},
      themeId: w.theme_id,
    },
    events,
  };
}
