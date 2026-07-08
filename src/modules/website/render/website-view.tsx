"use client";

import { useState } from "react";
import type { WeddingEvent } from "@/modules/events/types";
import type { Theme } from "../themes/registry";
import type { WebsiteConfig, Localized } from "../schema";
import { TT } from "./bilingual";
import { Countdown } from "./countdown";
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
}: WebsiteViewProps) {
  const [lang, setLang] = useState<"en" | "hi">("en");

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
        <div className="links">
          {links.map(([href, en, hi]) => (
            <a href={href} key={href}>
              <TT en={en} hi={hi} />
            </a>
          ))}
        </div>
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
        </div>
      </nav>

      <Hero names={names} dateLabel={dateLabel} />
      {countdownDate ? <Countdown dateIso={countdownDate} /> : null}
      <Story config={config} />
      <Events events={events} />
      <Venue events={events} />
      <Gallery config={config} />
      <Family config={config} />
      <Faq config={config} />
      <Footer config={config} />
    </div>
  );
}
