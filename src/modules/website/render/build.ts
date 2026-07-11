import type { WeddingEvent } from "@/modules/events/types";
import { parseWebsiteConfig } from "../schema";

/** The wedding fields the renderer needs — satisfied by both the owner's full
 * Wedding and the guest's trimmed GuestWedding. */
export interface SiteWedding {
  title: string;
  name1: string | null;
  name2: string | null;
  eventDate: string | null;
  config: Record<string, unknown>;
}

/**
 * Derives the renderer's props from a wedding + its events. Shared by the owner
 * Preview and the live guest site, so both render identically.
 */
export function buildSiteProps(wedding: SiteWedding, events: WeddingEvent[]) {
  const one = wedding.name1?.trim();
  const two = wedding.name2?.trim();

  // Subject-aware: 2 names → "A & B", 1 name → "A", 0 → the title. Single-name
  // themes (birthday child, family) no longer fall back to the title.
  const nameParts = [one, two].filter((n): n is string => !!n);
  const names = nameParts.length > 0 ? nameParts.join(" & ") : wedding.title;
  const initials = (
    nameParts.length === 2
      ? `${nameParts[0][0]} & ${nameParts[1][0]}`
      : nameParts.length === 1
        ? nameParts[0].charAt(0)
        : wedding.title
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0] ?? "")
            .join(" & ")
  ).toUpperCase();

  const dateLabel = wedding.eventDate
    ? new Date(`${wedding.eventDate}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return {
    names,
    initials,
    dateLabel,
    countdownDate: wedding.eventDate,
    events,
    config: parseWebsiteConfig(wedding.config),
  };
}
