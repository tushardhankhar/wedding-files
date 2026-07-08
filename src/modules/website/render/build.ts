import type { Wedding } from "@/modules/weddings/types";
import type { WeddingEvent } from "@/modules/events/types";
import { parseWebsiteConfig } from "../schema";

/**
 * Derives the renderer's props from a wedding + its events. Shared by the owner
 * Preview and (later) the live guest site, so both render identically.
 */
export function buildSiteProps(wedding: Wedding, events: WeddingEvent[]) {
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
