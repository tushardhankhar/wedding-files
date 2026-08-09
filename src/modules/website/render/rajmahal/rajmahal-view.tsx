"use client";

import { useState } from "react";
import { gsap } from "gsap";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { T, TT } from "../bilingual";
import { focusStyles } from "../image-focus";
import { useCountdown, pad2 } from "../use-countdown";
import { splitNames, longDate, clockTime, gcalUrl } from "../format";
import { SmoothScroll } from "../experience/smooth-scroll";
import {
  useScrollScene,
  useRefreshOnLoad,
} from "../experience/use-scroll-scene";
import { Art } from "./art";
import {
  GoldRule,
  Crest,
  Cartouche,
  Bell,
  JaaliBand,
  CornerBracket,
} from "./ornaments";
import {
  RajmahalGroupRsvp,
  RajmahalSelfRsvp,
  RajmahalRsvpDemo,
} from "./rajmahal-rsvp";

/* ══════════════════════════════════════════════════════════════════════════
   THE GATEWAY — the hero.

   `gate-closed` and `gate-open` are two paintings of the SAME arch, and their
   stonework registers almost exactly (verified by differencing them: only the
   door leaves move). That single fact is what this scene is built on.

   So `gate-open` is laid down whole and never touched — it supplies the stone
   frame, the garden and the palace beyond. Over it sit two "leaves": copies of
   `gate-closed` each clipped to half the doorway and hinged on its outer edge.
   At rest they cover the aperture exactly and the composite reads as one closed
   gate. On scroll they swing inward and fade, and the garden is simply there
   behind them.

   The alternative — cross-dissolving the two whole plates — was rejected: the
   stone would ghost against itself for the length of the dissolve, and it is the
   one part of the image the eye is fixated on.

   Aperture measured off the paintings, not guessed. Keep these four numbers and
   the clip-paths in globals.css in agreement.
   ══════════════════════════════════════════════════════════════════════════ */

function Gateway({
  names,
  dateLabel,
  city,
  cta,
}: {
  names: string;
  dateLabel: string | null;
  city: string | null;
  cta: string;
}) {
  const pair = splitNames(names);

  const ref = useScrollScene<HTMLElement>(({ tier, scope }) => {
    const q = gsap.utils.selector(scope);
    const leaves = [...q(".rjm-leaf")];
    const stage = q(".rjm-gate-scene");
    const glow = q(".rjm-gate-glow");
    const copy = q(".rjm-hero-copy");
    const cue = q(".rjm-cue");

    if (tier === "still") {
      // No scrub at all: show the palace already open, at rest.
      gsap.set(leaves, { autoAlpha: 0 });
      gsap.set(glow, { autoAlpha: 0.45 });
      return;
    }

    // How far the camera pushes through the doorway. Phones get less: the same
    // scale on a narrow viewport crops the arch away before the doors have
    // finished opening, so the gesture reads as a zoom rather than an entrance.
    const push = tier === "full" ? 2.45 : 1.7;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scope,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
      },
      defaults: { ease: "none" },
    });

    tl.to(
      q(".rjm-leaf-l"),
      { rotationY: 74, duration: 0.55, ease: "power2.inOut" },
      0,
    )
      .to(
        q(".rjm-leaf-r"),
        { rotationY: -74, duration: 0.55, ease: "power2.inOut" },
        0,
      )
      // The leaves fade only after they have visibly turned, so the motion is
      // read as a swing rather than a dissolve.
      .to(leaves, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0.32)
      .to(glow, { autoAlpha: 1, duration: 0.45, ease: "power1.out" }, 0.12)
      .fromTo(
        stage,
        { scale: 1 },
        { scale: push, duration: 1, ease: "power1.in" },
        0,
      )
      .to(
        copy,
        { autoAlpha: 0, y: -36, duration: 0.3, ease: "power1.in" },
        0.04,
      )
      .to(cue, { autoAlpha: 0, duration: 0.12 }, 0);
  });

  return (
    <section ref={ref} className="rjm-hero" aria-label="Invitation">
      <div className="rjm-hero-stage">
        <div className="rjm-gate">
          <div className="rjm-gate-scene">
            {/* The open palace — stone frame, gardens, the palace beyond. */}
            <Art slot="gate-open" className="rjm-gate-plate" />
            {/* Warm light out of the doorway, behind the leaves. */}
            <div className="rjm-gate-glow" aria-hidden />
            {/* The doorway. Sits exactly on the measured aperture, and holds two
                copies of the cropped closed doors — each clipped to its half and
                hinged on its outer edge. */}
            <div className="rjm-doorway" aria-hidden>
              <Art slot="gate-doors" className="rjm-leaf rjm-leaf-l" />
              <Art slot="gate-doors" className="rjm-leaf rjm-leaf-r" />
            </div>
          </div>
        </div>

        <div className="rjm-hero-copy">
          <p className="rjm-hero-over">
            <TT en="Together with their families" hi="अपने परिवारों सहित" />
          </p>
          {pair ? (
            <h1 className="rjm-hero-names">
              <span>{pair[0]}</span>
              <span className="rjm-amp">&amp;</span>
              <span>{pair[1]}</span>
            </h1>
          ) : (
            <h1 className="rjm-hero-names">
              <span>{names}</span>
            </h1>
          )}
          <GoldRule className="rjm-hero-rule" />
          <p className="rjm-hero-date">
            {dateLabel}
            {city ? <span className="rjm-dot">·</span> : null}
            {city}
          </p>
          <a href={cta} className="rjm-hero-cta">
            <TT en="Step inside" hi="भीतर पधारें" />
          </a>
        </div>

        <div className="rjm-cue" aria-hidden>
          <span />
        </div>
      </div>

      {/* "Step inside" target: the last frame of the door sequence.
          An anchor rather than a click handler, so Lenis smooth-scrolls to it for
          free (`anchors: true`) and it still works with JS disabled. Anchor
          navigation aligns an element's top with the viewport top, so a marker
          sitting one viewport up from the hero's bottom edge lands exactly where
          the sticky stage runs out — doors fully open, camera all the way
          through — instead of skipping the animation entirely. */}
      <span id="rjm-inside" className="rjm-hero-end" aria-hidden />
    </section>
  );
}

/* ── shared section furniture ─────────────────────────────────────────────── */

function SectionHead({
  over,
  title,
}: {
  over: { en: string; hi: string };
  title: { en: string; hi: string };
}) {
  return (
    <div className="rjm-head" data-tw-reveal>
      <Crest className="rjm-head-crest" />
      <p className="rjm-over">
        <T value={over} />
      </p>
      <h2 className="rjm-title">
        <T value={title} />
      </h2>
      <GoldRule className="rjm-head-rule" />
    </div>
  );
}

/**
 * A painted layer that drifts against the scroll. Depth is the only thing
 * separating these from stickers — an elephant that scrolls at page speed reads
 * as a picture of an elephant, one that lags reads as standing further away.
 */
function Parallax({
  slot,
  depth = 40,
  className = "",
}: {
  slot: Parameters<typeof Art>[0]["slot"];
  /** Pixels of counter-scroll across the element's travel. Bigger = further. */
  depth?: number;
  className?: string;
}) {
  const ref = useScrollScene<HTMLDivElement>(({ tier, scope }) => {
    if (tier === "still") return;
    const d = tier === "full" ? depth : depth * 0.45;
    gsap.fromTo(
      scope.firstElementChild,
      { yPercent: 0 },
      {
        yPercent: -d,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  return (
    <div ref={ref} className={`rjm-para ${className}`}>
      <Art slot={slot} className="rjm-para-img" />
    </div>
  );
}

/**
 * The procession. The two elephants face each other, so scrolling walks them
 * TOWARDS one another — a baraat converging on the marriage — and they meet
 * around the point the section is centred in the viewport.
 *
 * The walk and the gait are deliberately on different elements. GSAP owns
 * `xPercent` on the outer node; the CSS bob owns `translateY` on the inner one.
 * Putting both on the same element makes them fight over `transform`, and the
 * later declaration silently wins (the same trap that froze a Mayura ornament at
 * opacity 0).
 */
function Procession() {
  const ref = useScrollScene<HTMLDivElement>(({ tier, scope }) => {
    if (tier === "still") return;
    const q = gsap.utils.selector(scope);
    // How far each elephant travels, as a % of its own width. Phones get less —
    // the section is narrower, so the same percentage would collide them.
    const d = tier === "full" ? 34 : 16;
    const trigger = {
      trigger: scope,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    };
    gsap.fromTo(
      q(".rjm-eleph-l"),
      { xPercent: -d },
      { xPercent: d, ease: "none", scrollTrigger: trigger },
    );
    gsap.fromTo(
      q(".rjm-eleph-r"),
      { xPercent: d },
      { xPercent: -d, ease: "none", scrollTrigger: trigger },
    );
  });

  return (
    <div ref={ref} className="rjm-procession" aria-hidden>
      <div className="rjm-eleph rjm-eleph-l">
        <span className="rjm-eleph-bob">
          <Art slot="elephant-left" className="rjm-eleph-img" />
        </span>
      </div>
      <div className="rjm-eleph rjm-eleph-r">
        <span className="rjm-eleph-bob rjm-eleph-bob-b">
          <Art slot="elephant-right" className="rjm-eleph-img" />
        </span>
      </div>
    </div>
  );
}

/**
 * The couple in the jharokha balcony.
 *
 * Three layers of the same two paintings, and the ORDER is the whole trick:
 * balcony, then couple, then the balcony AGAIN clipped to the balustrade down.
 * That third pass is what puts the couple genuinely inside the architecture —
 * they stand on the deck and the railing passes in front of their legs. With a
 * single flat plate they could only ever be pasted on top of the rail, which is
 * why the first version looked like they were standing through it.
 *
 * The whole assembly parallaxes as ONE unit. Any relative motion between the
 * couple and the railing would immediately break the illusion, so nothing here
 * moves independently.
 */
function Jharokha() {
  const ref = useScrollScene<HTMLDivElement>(({ tier, scope }) => {
    if (tier === "still") return;
    const d = tier === "full" ? 5 : 2.5;
    gsap.fromTo(
      scope,
      { yPercent: d },
      {
        yPercent: -d,
        ease: "none",
        scrollTrigger: {
          // The section, not `scope`: scope is what we're moving, and using a
          // moving element as its own trigger feeds its displacement back into
          // the start/end calculation.
          trigger: scope.closest(".rjm-couple") ?? scope,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  return (
    <div ref={ref} className="rjm-jharokha">
      {/* Lamplight from inside the palace, so the balcony reads as set into a
          lit wall rather than floating on the page. */}
      <span className="rjm-jharokha-wall" aria-hidden />
      <Art slot="jharokha" className="rjm-jharokha-img" />
      <Art slot="couple" className="rjm-couple-img" />
      <Art slot="jharokha" className="rjm-jharokha-rail" />
      <span className="rjm-jharokha-shadow" aria-hidden />
    </div>
  );
}

/**
 * The RSVP gateway — the hero's doors, reprised at a quarter of the size.
 *
 * Costs no new bytes: both layers are already decoded from the hero, so this is
 * a cache hit. Unlike the hero it is NOT scrubbed — it plays once when the
 * section arrives, because by this point the guest is reading a form, and tying
 * the doors to the scrollbar would leave them stuck half-open while someone
 * fills in a headcount.
 */
function RsvpGate() {
  const ref = useScrollScene<HTMLDivElement>(({ tier, scope }) => {
    const q = gsap.utils.selector(scope);
    const leaves = [...q(".rjm-leaf")];
    if (tier === "still") {
      gsap.set(leaves, { autoAlpha: 0 });
      return;
    }
    gsap
      .timeline({
        scrollTrigger: { trigger: scope, start: "top 78%", once: true },
      })
      .to(
        q(".rjm-leaf-l"),
        { rotationY: 72, duration: 1.5, ease: "power3.inOut" },
        0,
      )
      .to(
        q(".rjm-leaf-r"),
        { rotationY: -72, duration: 1.5, ease: "power3.inOut" },
        0,
      )
      .to(leaves, { autoAlpha: 0, duration: 0.7, ease: "power1.in" }, 0.85)
      .to(q(".rjm-gate-glow"), { autoAlpha: 1, duration: 1.1 }, 0.3);
  });

  return (
    <div ref={ref} className="rjm-rsvp-gate" aria-hidden>
      <div className="rjm-gate">
        <div className="rjm-gate-scene">
          <Art slot="gate-open" className="rjm-gate-plate" />
          <div className="rjm-gate-glow" />
          <div className="rjm-doorway">
            <Art slot="gate-doors" className="rjm-leaf rjm-leaf-l" />
            <Art slot="gate-doors" className="rjm-leaf rjm-leaf-r" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The story timeline. A gold rule draws itself down the milestones as you scroll
 * — the thread of the story being laid, rather than a list already finished.
 *
 * The fill is scrubbed rather than revealed, so scrolling back up unwinds it.
 * Each milestone's marker lights when the fill passes it, which is done in CSS
 * off the fill's own height rather than with a trigger per row: with a long
 * story that would be one ScrollTrigger per milestone, all recalculating on
 * every resize.
 */
function StoryTimeline({
  milestones,
}: {
  milestones: NonNullable<
    NonNullable<WebsiteViewProps["config"]["story"]>["milestones"]
  >;
}) {
  const ref = useScrollScene<HTMLOListElement>(({ tier, scope }) => {
    const fill = scope.querySelector(".rjm-timeline-fill");
    if (!fill) return;
    if (tier === "still") {
      gsap.set(fill, { scaleY: 1 });
      return;
    }
    gsap.fromTo(
      fill,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          // Starts when the list reaches the lower third and completes as its
          // end clears the middle — so the line is always drawing just ahead of
          // whichever milestone is being read.
          start: "top 70%",
          end: "bottom 55%",
          scrub: 0.5,
        },
      },
    );
  });

  return (
    <ol ref={ref} className="rjm-timeline">
      <span className="rjm-timeline-fill" aria-hidden />
      {milestones.map((m, i) => (
        <li key={i} className="rjm-mile" data-tw-reveal>
          <span className="rjm-mile-dot" aria-hidden />
          {m.when ? <p className="rjm-mile-date">{m.when}</p> : null}
          <h3 className="rjm-mile-title">
            <T value={m.title} />
          </h3>
          <p className="rjm-mile-body">
            <T value={m.text} />
          </p>
        </li>
      ))}
    </ol>
  );
}

/* A site-wide drifting-petal layer was built here and removed. On an ivory
   ground, pale gold petals at any opacity that did not obscure body text read as
   smudges on the screen rather than as falling flowers — and petals raining over
   every section is the exact wedding-template cliche this theme is meant to
   avoid. The toran painting already sheds petals, in the one place where they
   belong. Please don't add it back. */

/* ══════════════════════════════════════════════════════════════════════════ */
export function RajmahalView({
  theme,
  names,
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
  const [menu, setMenu] = useState(false);
  useRefreshOnLoad();

  const pair = splitNames(names);
  const milestones = config.story?.milestones ?? [];
  const familyMembers = config.family?.members ?? [];
  const groomFamily = familyMembers.filter((m) => m.side !== "bride");
  const brideFamily = familyMembers.filter((m) => m.side === "bride");
  const images = config.gallery?.images ?? [];
  const faqs = config.faq?.items ?? [];
  const contacts = config.footer?.contacts ?? [];
  const hashtag = config.footer?.hashtag;
  const tagline = config.hero?.tagline;
  const venueEvents = events.filter((e) => e.venueName || e.venueAddress);
  const hasRsvp = Boolean(
    (rsvp && rsvp.events.length > 0) || selfRsvp || ownerPreview,
  );

  const city = (() => {
    for (const e of events) {
      if (e.venueAddress) {
        const parts = e.venueAddress.split(",");
        return parts[parts.length - 1].trim();
      }
      if (e.venueName) return e.venueName;
    }
    return null;
  })();

  const family =
    rsvp && chip
      ? chip
      : ownerPreview
        ? { en: "Honoured Guests", hi: "सम्मानित अतिथिगण" }
        : null;

  const links: Array<[string, string, string]> = [];
  if (milestones.length) links.push(["#story", "Our Story", "हमारी कहानी"]);
  if (familyMembers.length) links.push(["#family", "Families", "परिवार"]);
  if (events.length) links.push(["#events", "Celebrations", "आयोजन"]);
  if (images.length) links.push(["#gallery", "Gallery", "गैलरी"]);
  if (venueEvents.length) links.push(["#venue", "Venue", "स्थान"]);
  if (faqs.length) links.push(["#faq", "Questions", "प्रश्न"]);
  if (hasRsvp) links.push(["#rsvp", "RSVP", "उत्तर"]);

  // "Step inside" plays the guest THROUGH the gateway rather than skipping past
  // it. It used to jump straight to #rsvp, which threw away the one moment the
  // whole theme is built around.
  const heroCta = "#rjm-inside";

  return (
    <SmoothScroll>
      {/* `style={theme.vars}` is load-bearing: without it none of the --rjm-*
          custom properties exist on the DOM and every colour silently falls back. */}
      <div className="rjm" data-lang={lang} style={theme.vars}>
        <nav className="rjm-nav">
          <a href="#top" className="rjm-nav-mark">
            {pair ? `${pair[0][0]} · ${pair[1][0]}` : names.slice(0, 1)}
          </a>
          {links.length > 0 ? (
            <>
              <button
                type="button"
                className="rjm-nav-toggle"
                aria-expanded={menu}
                aria-controls="rjm-menu"
                onClick={() => setMenu((v) => !v)}
              >
                <span aria-hidden>☰</span>
                <span className="sr-only">Menu</span>
              </button>
              <div
                id="rjm-menu"
                className={menu ? "rjm-nav-links open" : "rjm-nav-links"}
              >
                {links.map(([href, en, hi]) => (
                  <a key={href} href={href} onClick={() => setMenu(false)}>
                    <TT en={en} hi={hi} />
                  </a>
                ))}
              </div>
            </>
          ) : null}
          <button
            type="button"
            className="rjm-lang"
            onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
          >
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
        </nav>

        <span id="top" />
        <Gateway
          names={names}
          dateLabel={dateLabel}
          city={city}
          cta={heroCta}
        />

        {/* ── The invitation proper — the palace, seen from the garden ── */}
        <section id="invitation" className="rjm-invite">
          <div className="rjm-toran" aria-hidden>
            <Art slot="toran" className="rjm-toran-img" />
          </div>
          <div className="rjm-invite-inner">
            <div className="rjm-head" data-tw-reveal>
              <Crest className="rjm-head-crest" />
              <p className="rjm-over">
                <TT en="You are invited" hi="आप सादर आमंत्रित हैं" />
              </p>
              {tagline ? (
                <p className="rjm-tagline">
                  <T value={tagline} />
                </p>
              ) : null}
              <GoldRule className="rjm-head-rule" />
            </div>
            {/* The peacock lives INSIDE this wrapper, not in a strip after
                `.rjm-invite-inner`. That strip was a sibling of a `z-index: 1`
                element, so both birds were painted underneath the palace — and
                its negative left/right offsets pushed them outside the section's
                `overflow: hidden`, which clipped what little showed. */}
            <div className="rjm-palace-wrap">
              <Parallax slot="palace" depth={26} className="rjm-palace" />
              <Parallax
                slot="peacock-side"
                depth={14}
                className="rjm-peacock-side"
              />
            </div>
          </div>
        </section>

        {/* ── The couple, in the jharokha ── */}
        <section className="rjm-couple">
          <div className="rjm-couple-inner" data-tw-reveal>
            <Jharokha />
            <div className="rjm-couple-copy">
              <Crest className="rjm-head-crest" />
              <p className="rjm-over">
                <TT en="The bride & groom" hi="वर एवं वधू" />
              </p>
              {pair ? (
                <h2 className="rjm-couple-names">
                  <span>{pair[0]}</span>
                  <span className="rjm-amp">&amp;</span>
                  <span>{pair[1]}</span>
                </h2>
              ) : (
                <h2 className="rjm-couple-names">{names}</h2>
              )}
              <GoldRule className="rjm-head-rule" />
              <p className="rjm-couple-date">{dateLabel}</p>
            </div>
          </div>
        </section>

        {/* ── Our story — the procession ── */}
        {milestones.length > 0 ? (
          <section id="story" className="rjm-story">
            <SectionHead
              over={{ en: "How we arrived here", hi: "हम यहाँ तक कैसे पहुँचे" }}
              title={{ en: "Our Story", hi: "हमारी कहानी" }}
            />
            <Procession />
            <StoryTimeline milestones={milestones} />
          </section>
        ) : null}

        {/* ── Countdown ── */}
        {countdownDate ? <RajmahalCountdown dateIso={countdownDate} /> : null}

        {/* ── Celebrations ── */}
        {events.length > 0 ? (
          <section id="events" className="rjm-events">
            <SectionHead
              over={{ en: "The celebrations", hi: "समारोह" }}
              title={{ en: "Join us", hi: "हमारे साथ" }}
            />
            <EventsGrid events={events} siteTitle={names} />
          </section>
        ) : null}

        {/* ── Gallery ── */}
        {images.length > 0 ? (
          <section id="gallery" className="rjm-gallery">
            <SectionHead
              over={{ en: "Moments", hi: "पल" }}
              title={{ en: "Gallery", hi: "गैलरी" }}
            />
            <div className="rjm-gallery-grid">
              {images.map((img, i) => {
                const f = focusStyles(img.focus);
                return (
                  <figure key={i} className="rjm-photo" data-tw-reveal>
                    <div className="rjm-photo-frame">
                      <div className="rjm-photo-zoom" style={f.zoom}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- guest-uploaded photo, sized by its frame */}
                        <img
                          src={img.url}
                          alt={img.caption?.en ?? ""}
                          style={f.image}
                          loading="lazy"
                        />
                      </div>
                    </div>
                    {img.caption ? (
                      <figcaption>
                        <T value={img.caption} />
                      </figcaption>
                    ) : null}
                  </figure>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ── Venue ── */}
        {venueEvents.length > 0 ? (
          <section id="venue" className="rjm-venue">
            <SectionHead
              over={{ en: "Where to find us", hi: "कहाँ पधारें" }}
              title={{ en: "Venue", hi: "स्थान" }}
            />
            <div className="rjm-venue-grid">
              {venueEvents.map((e) => {
                const q = [e.venueName, e.venueAddress]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <div key={e.id} className="rjm-venue-card" data-tw-reveal>
                    <CornerBracket className="rjm-corner rjm-corner-tl" />
                    <CornerBracket className="rjm-corner rjm-corner-tr" />
                    <CornerBracket className="rjm-corner rjm-corner-bl" />
                    <CornerBracket className="rjm-corner rjm-corner-br" />
                    <h3>{e.name}</h3>
                    {e.venueName ? (
                      <p className="rjm-venue-name">{e.venueName}</p>
                    ) : null}
                    {e.venueAddress ? (
                      <p className="rjm-venue-addr">{e.venueAddress}</p>
                    ) : null}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rjm-link"
                    >
                      <TT en="Open in Maps" hi="मैप में खोलें" />
                    </a>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ── Families ── */}
        {familyMembers.length > 0 ? (
          <section id="family" className="rjm-family">
            {/* The fanned peacock earns a proper feature here rather than being
                a decoration squeezed into a corner: it is perfectly symmetrical,
                and it crowns a section that is itself symmetrical — two families,
                side by side. */}
            <div className="rjm-family-crest" aria-hidden>
              <Art slot="peacock-fan" className="rjm-family-peacock" />
            </div>
            <SectionHead
              over={{ en: "With the blessings of", hi: "आशीर्वाद सहित" }}
              title={{ en: "Our Families", hi: "हमारे परिवार" }}
            />
            <div className="rjm-family-grid">
              {[groomFamily, brideFamily]
                .filter((side) => side.length > 0)
                .map((side, i) => (
                  <div key={i} className="rjm-family-side" data-tw-reveal>
                    {side.map((m, j) => (
                      <p key={j} className="rjm-family-member">
                        <span className="rjm-family-name">
                          <T value={m.name} />
                        </span>
                        {m.relation ? (
                          <span className="rjm-family-rel">
                            <T value={m.relation} />
                          </span>
                        ) : null}
                      </p>
                    ))}
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        {/* ── FAQ ── */}
        {faqs.length > 0 ? (
          <section id="faq" className="rjm-faq">
            <SectionHead
              over={{ en: "Good to know", hi: "जानने योग्य" }}
              title={{ en: "Questions", hi: "प्रश्न" }}
            />
            <div className="rjm-faq-list">
              {faqs.map((f, i) => (
                <details key={i} className="rjm-faq-item" data-tw-reveal>
                  <summary>
                    <T value={f.q} />
                  </summary>
                  <div className="rjm-faq-a">
                    <T value={f.a} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── RSVP — the doors reopen ── */}
        {hasRsvp ? (
          <section id="rsvp" className="rjm-rsvp">
            <div className="rjm-rsvp-wash" aria-hidden />
            <RsvpGate />
            <SectionHead
              over={{ en: "The doors are open", hi: "द्वार खुले हैं" }}
              title={{ en: "Will you join us?", hi: "क्या आप आएँगे?" }}
            />
            {family ? (
              <p className="rjm-rsvp-family">
                <T value={family} />
              </p>
            ) : null}
            <div className="rjm-rsvp-body">
              {rsvp && rsvp.events.length > 0 ? (
                <RajmahalGroupRsvp data={rsvp} />
              ) : selfRsvp ? (
                <RajmahalSelfRsvp data={selfRsvp} />
              ) : (
                <RajmahalRsvpDemo events={events} />
              )}
            </div>
          </section>
        ) : null}

        <footer className="rjm-foot">
          <JaaliBand className="rjm-foot-jaali" id="rjm-foot-jaali" />
          <div className="rjm-foot-inner">
            <Bell className="rjm-foot-bell" />
            {pair ? (
              <p className="rjm-foot-names">
                {pair[0]} <span className="rjm-amp">&amp;</span> {pair[1]}
              </p>
            ) : (
              <p className="rjm-foot-names">{names}</p>
            )}
            {dateLabel ? <p className="rjm-foot-date">{dateLabel}</p> : null}
            {hashtag ? <p className="rjm-foot-tag">{hashtag}</p> : null}
            {contacts.length > 0 ? (
              <div className="rjm-foot-contacts">
                {contacts.map((c, i) => (
                  <a key={i} href={`tel:${c.phone}`} className="rjm-link">
                    {c.name} · {c.phone}
                  </a>
                ))}
              </div>
            ) : null}
            <GoldRule className="rjm-foot-rule" />
            <JashnCredit className="rjm-foot-credit" />
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}

/* ── countdown ────────────────────────────────────────────────────────────── */
function RajmahalCountdown({ dateIso }: { dateIso: string }) {
  const { days, hours, minutes, seconds, ready } = useCountdown(dateIso);
  const units: Array<[string, string, number]> = [
    ["Days", "दिन", days],
    ["Hours", "घंटे", hours],
    ["Minutes", "मिनट", minutes],
    ["Seconds", "सेकंड", seconds],
  ];
  return (
    <section className="rjm-count" data-tw-reveal>
      <p className="rjm-over">
        <TT en="The muhurat approaches" hi="मुहूर्त निकट है" />
      </p>
      <div className="rjm-count-row">
        {units.map(([en, hi, v]) => (
          <div key={en} className="rjm-count-cell">
            <Cartouche className="rjm-count-plate" />
            <span className="rjm-count-num">{pad2(v, ready)}</span>
            <span className="rjm-count-label">
              <TT en={en} hi={hi} />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The celebrations, each in its own archway, lit one after another as the row
 * arrives — a corridor of lamps being walked past rather than a grid appearing.
 *
 * Only `.rjm-event-arch` is animated. The cards themselves carry
 * `[data-tw-reveal]`, whose shared CSS animation already owns their `animation`
 * and `transform`; a GSAP tween on the same node would fight it and one of the
 * two would silently lose.
 */
function EventsGrid({
  events,
  siteTitle,
}: {
  events: WeddingEvent[];
  siteTitle: string;
}) {
  const ref = useScrollScene<HTMLDivElement>(({ tier, scope }) => {
    const arches = scope.querySelectorAll(".rjm-event-arch");
    if (!arches.length) return;
    if (tier === "still") {
      gsap.set(arches, { opacity: 1 });
      return;
    }
    gsap.fromTo(
      arches,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.14,
        scrollTrigger: { trigger: scope, start: "top 76%", once: true },
      },
    );
  });

  return (
    <div ref={ref} className="rjm-events-grid">
      {events.map((e) => (
        <EventArch key={e.id} event={e} siteTitle={siteTitle} />
      ))}
    </div>
  );
}

/* ── one celebration, in a lit archway ────────────────────────────────────── */
function EventArch({
  event,
  siteTitle,
}: {
  event: WeddingEvent;
  siteTitle: string;
}) {
  const cal = gcalUrl(event, siteTitle);
  const time = clockTime(event.startTime);
  return (
    <article className="rjm-event" data-tw-reveal>
      <div className="rjm-event-arch" aria-hidden />
      <div className="rjm-event-body">
        <h3 className="rjm-event-name">{event.name}</h3>
        {event.eventDate ? (
          <p className="rjm-event-date">{longDate(event.eventDate)}</p>
        ) : null}
        {time ? <p className="rjm-event-time">{time}</p> : null}
        {event.venueName ? (
          <p className="rjm-event-venue">{event.venueName}</p>
        ) : null}
        {event.venueAddress ? (
          <p className="rjm-event-addr">{event.venueAddress}</p>
        ) : null}
        {cal ? (
          <a
            href={cal}
            target="_blank"
            rel="noopener noreferrer"
            className="rjm-link"
          >
            <TT en="Add to calendar" hi="कैलेंडर में जोड़ें" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
