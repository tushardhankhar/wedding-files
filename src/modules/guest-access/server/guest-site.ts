import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { mapEventRow, type EventRow, type WeddingEvent } from "@/modules/events/types";
import { readGuestSession, type GuestSession } from "./session";
import type { ExistingSelfRsvp } from "./share-rsvp";
import type { ExistingGroupRsvp } from "./group-rsvp";

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
      /** The family's saved headcount RSVP: eventId → { attending, partySize }.
       * Empty if no one in the family has answered yet. Shared by everyone who
       * opens the group's invite link. */
      groupRsvp: ExistingGroupRsvp;
    }
  | {
      mode: "share";
      label: string;
      shareLinkId: string;
      wedding: GuestWedding;
      events: WeddingEvent[];
      /** This respondent's saved self-RSVP, or null if they haven't answered —
       * lets the site prefill and offer an edit instead of a duplicate submit. */
      existingRsvp: ExistingSelfRsvp | null;
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
 * What `/w/[slug]` should do with the current guest session.
 *   ok       — render `data`.
 *   redirect — the session is valid but the URL uses a stale slug (the wedding
 *              was renamed after the link went out); send them to `slug`.
 *   none     — no session for this wedding; show the private-invitation wall.
 */
export type GuestSiteResult =
  | { status: "ok"; data: GuestSiteData }
  | { status: "redirect"; slug: string }
  | { status: "none" };

/** Is there a live wedding at this slug? Used only to disambiguate a mismatch. */
async function slugExists(slug: string): Promise<boolean> {
  const svc = createSupabaseServiceClient();
  const { data } = await svc
    .from("weddings")
    .select("id")
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();
  return data != null;
}

/**
 * ⭐ THE GATE. Loads exactly what the current guest session may see: a personal
 * group's invited events, or a broadcast share link's scoped events (+
 * self-RSVP). Uninvited events are never selected.
 *
 * The session is bound to a GROUP ID / SHARE LINK ID, never to a slug — those
 * ids each belong to exactly one wedding, so they are the authorization
 * authority and the slug is pure cosmetics. That is what lets a wedding be
 * renamed without stranding guests who already hold a session or a link.
 *
 * A slug mismatch is therefore a routing question, not an access one:
 *   - the requested slug is some OTHER live wedding → this guest has no session
 *     there, so `none` (exactly as before; no cross-tenant read is possible,
 *     since the query is keyed by the session's own ids).
 *   - the requested slug matches nothing → it is a stale name for the guest's
 *     own wedding, so `redirect` them to the current one.
 */
export async function loadGuestSite(slug: string): Promise<GuestSiteResult> {
  const session = await readGuestSession();
  if (!session) return { status: "none" };

  const data =
    session.kind === "share"
      ? await loadShareSite(session)
      : await loadGroupSite(session);
  if (!data) return { status: "none" };

  if (data.wedding.slug !== slug) {
    if (await slugExists(slug)) return { status: "none" };
    return { status: "redirect", slug: data.wedding.slug };
  }
  return { status: "ok", data };
}

async function loadGroupSite(
  session: Extract<GuestSession, { kind: "group" }>
): Promise<GuestSiteData | null> {
  const svc = createSupabaseServiceClient();

  const { data: group } = await svc
    .from("guest_groups")
    .select(`id, name, wedding_id, weddings!inner(${WEDDING_COLS})`)
    .eq("id", session.groupId)
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

  // The family's shared headcount RSVP (keyed by this group), if answered.
  const { data: rsvpRows } = await svc
    .from("group_rsvps")
    .select("event_id, attending, party_size")
    .eq("group_id", session.groupId);
  const groupRsvp: ExistingGroupRsvp = {};
  for (const r of (rsvpRows ?? []) as {
    event_id: string;
    attending: boolean;
    party_size: number;
  }[]) {
    groupRsvp[r.event_id] = { attending: r.attending, partySize: r.party_size };
  }

  return {
    mode: "group",
    label: group.name,
    wedding: toGuestWedding(group.weddings),
    events,
    groupRsvp,
  };
}

async function loadShareSite(
  session: Extract<GuestSession, { kind: "share" }>
): Promise<GuestSiteData | null> {
  const svc = createSupabaseServiceClient();

  const { data: link } = await svc
    .from("share_links")
    .select(`id, label, all_events, wedding_id, weddings!inner(${WEDDING_COLS})`)
    .eq("id", session.shareLinkId)
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

  // This respondent's saved RSVP (if any), to prefill + offer an edit.
  const { data: mine } = await svc
    .from("share_rsvps")
    .select("event_id, name, party_size")
    .eq("respondent_id", session.respondentId);
  const myRows = (mine ?? []) as {
    event_id: string;
    name: string;
    party_size: number;
  }[];
  const existingRsvp: ExistingSelfRsvp | null =
    myRows.length === 0
      ? null
      : {
          name: myRows[0].name,
          partySize: myRows[0].party_size,
          eventIds: myRows.map((r) => r.event_id),
        };

  return {
    mode: "share",
    label: link.label,
    shareLinkId: link.id,
    wedding: toGuestWedding(link.weddings),
    events,
    existingRsvp,
  };
}
