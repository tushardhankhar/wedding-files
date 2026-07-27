"use client";

import { useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import type { Theme } from "../themes/registry";
import type { WebsiteConfig, Localized } from "../schema";
import { TT } from "./bilingual";
import { Countdown } from "./countdown";
import { GroupRsvp, type GroupRsvpData } from "./rsvp-controls";
import { SelfRsvp, type SelfRsvpData } from "./self-rsvp";
import {
  Hero,
  Story,
  Events,
  Venue,
  Gallery,
  Family,
  Faq,
  Footer,
} from "./sections";

export interface WebsiteViewProps {
  theme: Theme;
  names: string;
  initials: string;
  dateLabel: string | null;
  countdownDate: string | null;
  events: WeddingEvent[];
  config: WebsiteConfig;
  /** Nav chip — the signed-in guest group, or a preview label. */
  chip?: Localized | null;
  /** Present on the personal guest site → the family's headcount RSVP. */
  rsvp?: GroupRsvpData;
  /** Present on a broadcast/share site → self-RSVP form. */
  selfRsvp?: SelfRsvpData;
  /** Owner preview → show the "guests will RSVP here" hint on events. */
  ownerPreview?: boolean;
}

export function WebsiteView({
  theme,
  names,
  initials,
  dateLabel,
  countdownDate,
  events,
  config,
  chip,
  rsvp,
  selfRsvp,
  ownerPreview,
}: WebsiteViewProps) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [menuOpen, setMenuOpen] = useState(false);

  const hasVenue = events.some((e) => e.venueName || e.venueAddress);
  const links: Array<[string, string, string]> = [];
  if ((config.story?.milestones?.length ?? 0) > 0)
    links.push(["#story", "Story", "कहानी"]);
  if (events.length > 0) links.push(["#events", "Events", "आयोजन"]);
  if (hasVenue) links.push(["#venue", "Venue", "स्थान"]);
  if ((config.gallery?.images?.length ?? 0) > 0)
    links.push(["#gallery", "Gallery", "गैलरी"]);
  if ((config.faq?.items?.length ?? 0) > 0)
    links.push(["#faq", "FAQ", "प्रश्न"]);

  return (
    <div className="wsite" data-lang={lang} style={theme.vars}>
      <nav className="w-nav">
        <span className="mono">{initials}</span>
        {links.length > 0 ? (
          <div className={menuOpen ? "links open" : "links"} id="w-menu">
            {links.map(([href, en, hi]) => (
              <a href={href} key={href} onClick={() => setMenuOpen(false)}>
                <TT en={en} hi={hi} />
              </a>
            ))}
          </div>
        ) : null}
        <div className="right">
          {chip ? (
            <span className="w-chip">
              👋 <TT en={chip.en} hi={chip.hi} />
            </span>
          ) : null}
          <div className="langtoggle">
            <button
              type="button"
              className={lang === "en" ? "on" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={lang === "hi" ? "on" : ""}
              onClick={() => setLang("hi")}
            >
              हिं
            </button>
          </div>
          {links.length > 0 ? (
            <button
              type="button"
              className="burger"
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="w-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          ) : null}
        </div>
      </nav>

      <div className="w-pattern" aria-hidden="true" />
      <Hero names={names} dateLabel={dateLabel} ornament={theme.heroMotif} />
      {countdownDate ? <Countdown dateIso={countdownDate} /> : null}
      <Story config={config} />
      <Events events={events} previewHint={ownerPreview} />
      {rsvp ? <GroupRsvp {...rsvp} /> : null}
      {selfRsvp ? <SelfRsvp {...selfRsvp} /> : null}
      <Venue events={events} />
      <Gallery config={config} />
      <Family config={config} />
      <Faq config={config} />
      <Footer config={config} />
    </div>
  );
}
