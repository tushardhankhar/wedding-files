import type { WeddingEvent } from "@/modules/events/types";
import { parseWebsiteConfig } from "../schema";

/** The wedding fields the renderer needs — satisfied by both the owner's full
 * Wedding and the guest's trimmed GuestWedding. */
export interface SiteWedding {
  title: string;
  partnerOneName: string | null;
  partnerTwoName: string | null;
  eventDate: string | null;
  config: Record<string, unknown>;
}

/**
 * Derives the renderer's props from a wedding + its events. Shared by the owner
 * Preview and the live guest site, so both render identically.
 */
export function buildSiteProps(wedding: SiteWedding, events: WeddingEvent[]) {
  const one = wedding.partnerOneName?.trim();
  const two = wedding.partnerTwoName?.trim();

  const names = one && two ? `${one} & ${two}` : wedding.title;
  const initials = (
    one && two
      ? `${one[0]} & ${two[0]}`
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
