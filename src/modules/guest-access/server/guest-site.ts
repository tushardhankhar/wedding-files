import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { mapEventRow, type EventRow, type WeddingEvent } from "@/modules/events/types";
import { readGuestSession, type GuestSession } from "./session";

const EVENT_COLS =
  "id, wedding_id, name, name_hi, event_date, start_time, venue_name, venue_address, maps_url, description, description_hi, hosted_by, hosted_by_enabled, sort_order, created_at, updated_at";

export interface GuestWedding {
  slug: string;
  title: string;
  name1: string | null;
  name2: string | null;
  eventDate: string | null;
  config: Record<string, unknown>;
  themeId: string;
}

type WeddingJoin = {
  slug: string;
  title: string;
  name1: string | null;
  name2: string | null;
  event_date: string | null;
  config: Record<string, unknown> | null;
  theme_id: string;
};

const WEDDING_COLS =
  "slug, title, name1, name2, event_date, config, theme_id";

export type GuestSiteData =
  | {
      mode: "group";
      label: string;
      wedding: GuestWedding;
      events: WeddingEvent[];
      guests: { id: string; name: string }[];
      rsvps: Record<string, Record<string, "attending" | "declined">>;
    }
  | {
      mode: "share";
      label: string;
      shareLinkId: string;
      wedding: GuestWedding;
      events: WeddingEvent[];
    };

function toGuestWedding(w: WeddingJoin): GuestWedding {
  return {
    slug: w.slug,
    title: w.title,
    name1: w.name1,
    name2: w.name2,
    eventDate: w.event_date,
    config: w.config ?? {},
    themeId: w.theme_id,
  };
}

/**
 * Public, session-free identity for a wedding site — just the couple's names,
 * initials, date and theme. Safe to expose by slug because these already appear
 * on the guest-facing site; it powers the per-wedding favicon, apple icon and
 * link-share (Open Graph) preview so a shared link carries the couple's
 * initials instead of the generic app logo. It selects NO gated data
 * (events/guests/RSVPs stay behind loadGuestSite's session gate).
 */
export interface SiteIdentity {
  names: string;
  /** Compact monogram for tiny surfaces, e.g. "AM". */
  initials: string;
  /** Spaced monogram for larger surfaces, e.g. "A & M". */
  monogram: string;
  dateLabel: string | null;
  themeId: string;
}

export async function loadSiteIdentity(
  slug: string
): Promise<SiteIdentity | null> {
  const svc = createSupabaseServiceClient();
  const { data } = await svc
    .from("weddings")
    .select("title, name1, name2, event_date, theme_id")
    .eq("slug", slug)
    .maybeSingle<{
      title: string;
      name1: string | null;
      name2: string | null;
      event_date: string | null;
      theme_id: string;
    }>();
  if (!data) return null;

  const one = data.name1?.trim();
  const two = data.name2?.trim();
  const parts = [one, two].filter((n): n is string => !!n);
  const letters =
    parts.length > 0
      ? parts.map((n) => n[0])
      : data.title
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0] ?? "");

  return {
    names: parts.length > 0 ? parts.join(" & ") : data.title,
    initials: letters.join("").toUpperCase(),
    monogram: letters.join(" & ").toUpperCase(),
    dateLabel: data.event_date
      ? new Date(`${data.event_date}T00:00:00`).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null,
    themeId: data.theme_id,
  };
}

function sortEvents(rows: EventRow[]): WeddingEvent[] {
  return rows.map(mapEventRow).sort((a, b) => {
    const d = (a.eventDate ?? "").localeCompare(b.eventDate ?? "");
    if (d !== 0) return d;
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });
}

/**
 * ⭐ THE GATE. Loads exactly what the current guest session may see for `slug`:
 * a personal group's invited events (+ members for RSVP), or a broadcast share
 * link's scoped events (+ self-RSVP). Uninvited events are never selected.
 */
export async function loadGuestSite(slug: string): Promise<GuestSiteData | null> {
  const session = await readGuestSession();
  if (!session || session.slug !== slug) return null;
  return session.kind === "share"
    ? loadShareSite(session, slug)
    : loadGroupSite(session, slug);
}

async function loadGroupSite(
  session: Extract<GuestSession, { kind: "group" }>,
  slug: string
): Promise<GuestSiteData | null> {
  const svc = createSupabaseServiceClient();

  const { data: group } = await svc
    .from("guest_groups")
    .select(`id, name, wedding_id, weddings!inner(${WEDDING_COLS})`)
    .eq("id", session.groupId)
    .eq("weddings.slug", slug)
    .maybeSingle<{ id: string; name: string; weddings: WeddingJoin }>();
  if (!group) return null;

  const { data: invites, error: invErr } = await svc
    .from("group_event_invites")
    .select(`events!inner(${EVENT_COLS})`)
    .eq("group_id", session.groupId);
  if (invErr) return null;
  const events = sortEvents(
    ((invites ?? []) as unknown as { events: EventRow }[]).map((r) => r.events)
  );

  const { data: memberRows } = await svc
    .from("guests")
    .select("id, name, is_primary")
    .eq("group_id", session.groupId);
  const guests = (memberRows ?? [])
    .map((g) => ({ id: g.id, name: g.name, isPrimary: g.is_primary }))
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
    .map(({ id, name }) => ({ id, name }));

  const rsvps: Record<string, Record<string, "attending" | "declined">> = {};
  if (guests.length > 0) {
    const { data: rsvpRows } = await svc
      .from("rsvps")
      .select("guest_id, event_id, status")
      .in(
        "guest_id",
        guests.map((g) => g.id)
      );
    for (const r of (rsvpRows ?? []) as {
      guest_id: string;
      event_id: string;
      status: "attending" | "declined";
    }[]) {
      (rsvps[r.event_id] ??= {})[r.guest_id] = r.status;
    }
  }

  return {
    mode: "group",
    label: group.name,
    wedding: toGuestWedding(group.weddings),
    events,
    guests,
    rsvps,
  };
}

async function loadShareSite(
  session: Extract<GuestSession, { kind: "share" }>,
  slug: string
): Promise<GuestSiteData | null> {
  const svc = createSupabaseServiceClient();

  const { data: link } = await svc
    .from("share_links")
    .select(`id, label, all_events, wedding_id, weddings!inner(${WEDDING_COLS})`)
    .eq("id", session.shareLinkId)
    .eq("weddings.slug", slug)
    .maybeSingle<{
      id: string;
      label: string;
      all_events: boolean;
      wedding_id: string;
      weddings: WeddingJoin;
    }>();
  if (!link) return null;

  let events: WeddingEvent[];
  if (link.all_events) {
    const { data } = await svc
      .from("events")
      .select(EVENT_COLS)
      .eq("wedding_id", link.wedding_id);
    events = sortEvents((data ?? []) as EventRow[]);
  } else {
    const { data } = await svc
      .from("share_link_events")
      .select(`events!inner(${EVENT_COLS})`)
      .eq("share_link_id", link.id);
    events = sortEvents(
      ((data ?? []) as unknown as { events: EventRow }[]).map((r) => r.events)
    );
  }

  return {
    mode: "share",
    label: link.label,
    shareLinkId: link.id,
    wedding: toGuestWedding(link.weddings),
    events,
  };
}
