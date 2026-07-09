import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteConfig } from "../schema";
import type { HeroMotif } from "../themes/registry";
import { T, TT } from "./bilingual";
import { RsvpControls, type RsvpData } from "./rsvp-controls";
import { HeroOrnament } from "./hero-ornament";

/** Section divider with the theme's glyph (set via the --w-divider token). */
export function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <i />
    </div>
  );
}

function formatWhen(dateIso: string | null, time: string | null): string {
  if (!dateIso) return "";
  const d = new Date(`${dateIso}T00:00:00`);
  const date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (!time) return date;
  const [h, m] = time.split(":");
  const t = new Date();
  t.setHours(Number(h), Number(m));
  return `${date} · ${t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

// ── Hero ─────────────────────────────────────────────────────────────────
export function Hero({
  names,
  dateLabel,
  ornament,
}: {
  names: string;
  dateLabel: string | null;
  ornament: HeroMotif;
}) {
  return (
    <header className="w-hero">
      <HeroOrnament variant={ornament} />
      <p className="invited">
        <TT en="Together with their families" hi="अपने परिवारों सहित" />
      </p>
      <h1>{names}</h1>
      {dateLabel ? <p className="date">{dateLabel}</p> : null}
      <div className="flourish">✦</div>
    </header>
  );
}

// ── Story ────────────────────────────────────────────────────────────────
export function Story({ config }: { config: WebsiteConfig }) {
  const milestones = config.story?.milestones ?? [];
  if (milestones.length === 0) return null;
  return (
    <section id="story" className="band-alt">
      <div className="wrap">
        <p className="eyebrow center">
          <TT en="Our Story" hi="हमारी कहानी" />
        </p>
        <h2 className="h-sec center">
          <TT en="How it all began" hi="यह सब कैसे शुरू हुआ" />
        </h2>
        <Divider />
        <div className="timeline">
          {milestones.map((m, i) => (
            <div className="milestone" key={i}>
              <p className="when">{m.when}</p>
              <h3>
                <T value={m.title} />
              </h3>
              <p>
                <T value={m.text} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Events (invite-gated upstream; this only renders what it's given) ──────
export function Events({
  events,
  rsvp,
  previewHint,
}: {
  events: WeddingEvent[];
  rsvp?: RsvpData;
  previewHint?: boolean;
}) {
  if (events.length === 0) return null;
  return (
    <section id="events">
      <div className="wrap">
        <p className="eyebrow center">
          <TT en="Celebrations" hi="आयोजन" />
        </p>
        <h2 className="h-sec center">
          <TT en="You're invited to" hi="आप आमंत्रित हैं" />
        </h2>
        <Divider />
        <p className="note">
          <TT
            en="These are the celebrations your family is invited to."
            hi="आपके परिवार को इन आयोजनों में आमंत्रित किया गया है।"
          />
        </p>
        <div className="events">
          {events.map((e) => (
            <div className="event" key={e.id}>
              <h3>
                <T value={{ en: e.name, hi: e.nameHi ?? undefined }} />
              </h3>
              {formatWhen(e.eventDate, e.startTime) || e.venueName ? (
                <p className="meta">
                  {[formatWhen(e.eventDate, e.startTime), e.venueName]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {e.description ? (
                <p className="dress">
                  <T value={{ en: e.description, hi: e.descriptionHi ?? undefined }} />
                </p>
              ) : null}
              {rsvp ? (
                <RsvpControls
                  slug={rsvp.slug}
                  eventId={e.id}
                  guests={rsvp.guests}
                  initial={rsvp.statuses[e.id] ?? {}}
                />
              ) : null}
              <div className="row">
                {previewHint && !rsvp ? (
                  <span className="text-note">
                    <TT
                      en="Your guests will RSVP here"
                      hi="आपके मेहमान यहाँ उत्तर देंगे"
                    />
                  </span>
                ) : null}
                {e.mapsUrl ? (
                  <a
                    className="w-btn"
                    href={e.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TT en="Directions" hi="दिशा" />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Venue (derived from events that have a location) ───────────────────────
export function Venue({ events }: { events: WeddingEvent[] }) {
  const withVenue = events.filter((e) => e.venueName || e.venueAddress);
  if (withVenue.length === 0) return null;
  return (
    <section id="venue" className="band-alt">
      <div className="wrap">
        <p className="eyebrow center">
          <TT en="Getting There" hi="कैसे पहुँचें" />
        </p>
        <h2 className="h-sec center">
          <TT en="Venues" hi="स्थान" />
        </h2>
        <Divider />
        <div className="venue">
          {withVenue.map((e) => (
            <div className="vcard" key={e.id}>
              <div className="vmap" />
              <div className="vb">
                <h3>{e.venueName ?? e.name}</h3>
                {e.venueAddress ? <p>{e.venueAddress}</p> : null}
                {e.mapsUrl ? (
                  <a
                    className="w-btn w-btn-gold"
                    href={e.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TT en="Open in Maps" hi="मैप खोलें" />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Gallery ────────────────────────────────────────────────────────────────
export function Gallery({ config }: { config: WebsiteConfig }) {
  const images = config.gallery?.images ?? [];
  if (images.length === 0) return null;
  return (
    <section id="gallery">
      <div className="wrap">
        <p className="eyebrow center">
          <TT en="Moments" hi="पल" />
        </p>
        <h2 className="h-sec center">
          <TT en="Gallery" hi="गैलरी" />
        </h2>
        <Divider />
        <div className="gallery">
          {images.map((img, i) => (
            <div
              className="photo"
              key={i}
              style={{ backgroundImage: `url(${img.url})` }}
            >
              {img.caption ? (
                <span>
                  <T value={img.caption} />
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Family ───────────────────────────────────────────────────────────────
export function Family({ config }: { config: WebsiteConfig }) {
  const groups = config.family?.groups ?? [];
  if (groups.length === 0) return null;
  return (
    <section id="family" className="band-alt">
      <div className="wrap">
        <p className="eyebrow center">
          <TT en="With Blessings" hi="आशीर्वाद सहित" />
        </p>
        <h2 className="h-sec center">
          <TT en="Our Families" hi="हमारे परिवार" />
        </h2>
        <Divider />
        <div className="families">
          {groups.map((g, i) => (
            <div className="family" key={i}>
              <h3>
                <T value={g.name} />
              </h3>
              {g.members ? (
                <p>
                  <T value={g.members} />
                </p>
              ) : null}
              {g.relation ? (
                <p>
                  <T value={g.relation} />
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────
export function Faq({ config }: { config: WebsiteConfig }) {
  const items = config.faq?.items ?? [];
  if (items.length === 0) return null;
  return (
    <section id="faq">
      <div className="wrap">
        <p className="eyebrow center">
          <TT en="Good to Know" hi="जानने योग्य" />
        </p>
        <h2 className="h-sec center">
          <TT en="FAQ" hi="प्रश्न" />
        </h2>
        <Divider />
        <div className="faq">
          {items.map((it, i) => (
            <details key={i} open={i === 0}>
              <summary>
                <T value={it.q} />
              </summary>
              <p>
                <T value={it.a} />
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────
export function Footer({ config }: { config: WebsiteConfig }) {
  const hashtag = config.footer?.hashtag;
  const contacts = config.footer?.contacts ?? [];
  return (
    <footer className="w-foot">
      <p className="eyebrow" style={{ color: "var(--w-gold-lite)" }}>
        <TT en="See you there" hi="मिलते हैं" />
      </p>
      {hashtag ? <p className="hash">#{hashtag.replace(/^#/, "")}</p> : null}
      {contacts.length > 0 ? (
        <div className="contacts">
          {contacts.map((c, i) => (
            <span key={i}>📞 {c.name} · {c.phone}</span>
          ))}
        </div>
      ) : null}
      <small>
        <TT en="Made with love · Utsav" hi="प्रेम से बनाया गया · उत्सव" />
      </small>
    </footer>
  );
}
