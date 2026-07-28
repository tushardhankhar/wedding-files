"use client";

import { m } from "motion/react";
import type { WeddingEvent } from "@/modules/events/types";
import type { WebsiteViewProps } from "../website-view";
import { JashnCredit } from "../jashn-credit";
import { MotionProvider } from "../experience/motion";
import { FloatingParticles } from "../experience/floating-particles";
import { FlipCountdown } from "../experience/flip-countdown";
import { resolveArtwork } from "../artwork-placement";
import { GulistanScene } from "./scene";
import {
  ArchFrame,
  Ganesha,
  FloralCascade,
  CrownPendant,
  Lantern,
  PetalFall,
} from "./ornaments";

/* ── helpers (shared shape with the other Save-the-Date themes) ───────────── */
function cityOf(events: WeddingEvent[]): string | null {
  for (const e of events) {
    if (e.venueAddress) {
      const parts = e.venueAddress.split(",");
      return parts[parts.length - 1].trim();
    }
    if (e.venueName) return e.venueName;
  }
  return null;
}

function weekdayOf(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  });
}

/** All-day Google Calendar link for the date. */
function gcalUrl(iso: string | null, title: string): string | null {
  if (!iso) return null;
  const start = iso.replace(/-/g, "");
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const end = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${start}/${end}`;
}

const RISE = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
};

/* ══════════════════════════════════════════════════════════════════════════ */
export function GulistanView(props: WebsiteViewProps) {
  const { names, dateLabel, countdownDate, events, config, theme } = props;
  const city = cityOf(events);
  const weekday = weekdayOf(countdownDate);
  const calUrl = gcalUrl(countdownDate, `Save the Date — ${names}`);
  const nameParts = names.split(" & ");
  const quote =
    config.hero?.tagline?.en?.trim() ||
    "Two hearts, two families, one beautiful beginning.";
  // The couple on the balcony is part of this scene, so they stay unless the
  // client switches the illustration off; an upload stands in for them.
  const illustration = resolveArtwork(config.artwork, theme.supports.artwork);

  return (
    <MotionProvider>
      <div style={theme.vars} className="glt relative flex min-h-dvh flex-col">
        {/* drifting rose petals + ambient gold motes over everything */}
        <PetalFall className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" />
        {/* Gold motes: halved in count and slowed. With 34 of them plus ten
            petals the page had two competing particle systems. */}
        <FloatingParticles
          colors={["#e8cd7e", "#fff4d0"]}
          density={2}
          maxCount={16}
          minR={0.3}
          maxR={1.2}
          speed={0.07}
        />

        {/* the cusped arch frame drawn behind the content */}
        <ArchFrame className="pointer-events-none absolute inset-x-1 top-2 bottom-2 z-0 h-[calc(100%-1rem)] w-[calc(100%-0.5rem)]" />

        {/* Corner rose sprays. Deliberately small: 26vw (was 42vw, which ate
            84% of a phone's width and ran straight through the headline). They
            sit BELOW the veil in the stack, so the type always wins. */}
        <FloralCascade
          side="left"
          className="glt-sway pointer-events-none absolute -left-3 -top-2 z-[6] h-[40vh] max-h-[330px] w-[26vw] max-w-[150px] origin-top sm:-left-1 sm:w-[22vw]"
        />
        <FloralCascade
          side="right"
          className="glt-sway-alt pointer-events-none absolute -right-3 -top-2 z-[6] h-[40vh] max-h-[330px] w-[26vw] max-w-[150px] origin-top sm:-right-1 sm:w-[22vw]"
        />

        {/* A bloom of page-colour behind the hero type. This is what guarantees
            "Save the Date" reads cleanly no matter what sits behind it. */}
        <div className="glt-veil pointer-events-none absolute inset-x-0 top-0 z-[7] h-[78vh]" />

        <main className="relative z-20 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-7 pb-16 pt-10 text-center sm:px-10 sm:pt-14">
          {/* Ganesha at the apex, with the crown pendant hanging beneath it —
              one still ornament on the centre line instead of four swinging
              bells across the headline. */}
          <m.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <Ganesha className="h-14 w-14 sm:h-16 sm:w-16" />
            <CrownPendant className="h-9 w-4 opacity-80 sm:h-11" />
          </m.div>

          {/* SAVE THE DATE — engraved, not shouted. Lighter weight, wider
              tracking, smaller cap height (9.5vw, was 13vw) and a hairline-
              flanked italic "the": the letterpress convention. */}
          <m.h1
            initial={{ opacity: 0, y: 10, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.2em" }}
            transition={{ delay: 0.55, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="glt-title mt-4 text-[clamp(2.15rem,9.5vw,4.1rem)] leading-[1.06]"
          >
            <span className="block">Save</span>
            <span className="my-1 flex items-center justify-center gap-3">
              <span className="glt-rule w-9 sm:w-12" />
              <span className="glt-the">the</span>
              <span className="glt-rule w-9 sm:w-12" />
            </span>
            <span className="block">Date</span>
          </m.h1>

          {/* for the wedding of */}
          <m.p
            {...RISE}
            transition={{ delay: 0.95, duration: 0.9 }}
            className="glt-sans mt-6 text-[0.62rem] font-medium uppercase tracking-[0.46em] text-[color:var(--glt-ink-soft)] sm:text-[0.7rem]"
          >
            For the wedding of
          </m.p>

          {/* names — gold-foil script */}
          <m.p
            {...RISE}
            transition={{ delay: 1.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="glt-names glt-foil mt-3 text-[clamp(2.5rem,13vw,4.6rem)] leading-[1.1]"
          >
            {nameParts.length === 2 ? (
              <>
                {nameParts[0]}{" "}
                <span className="glt-amp">&amp;</span> {nameParts[1]}
              </>
            ) : (
              names
            )}
          </m.p>

          {/* date + city */}
          <m.div
            initial={{ opacity: 0, scaleX: 0.7 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 flex w-full max-w-[15rem] items-center gap-3"
          >
            <span className="glt-rule flex-1" />
            <span className="text-[0.6rem] text-[color:var(--glt-gold)]" aria-hidden>
              ✦
            </span>
            <span className="glt-rule flex-1" />
          </m.div>

          {dateLabel ? (
            <m.p
              {...RISE}
              transition={{ delay: 1.55, duration: 0.9 }}
              className="glt-date mt-5 text-[clamp(1.05rem,4.6vw,1.6rem)] font-medium uppercase tracking-[0.28em] text-[color:var(--glt-maroon)]"
            >
              {dateLabel}
            </m.p>
          ) : null}
          {city || weekday ? (
            <m.p
              {...RISE}
              transition={{ delay: 1.65, duration: 0.8 }}
              className="glt-sans mt-2 text-[0.62rem] uppercase tracking-[0.44em] text-[color:var(--glt-ink-soft)]"
            >
              {[weekday, city].filter(Boolean).join(" · ")}
            </m.p>
          ) : null}

          {/* the scene — palace + lake with the couple (or the client's own
              illustration) on the balcony */}
          <m.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.65, duration: 0.9, ease: "easeOut" }}
            className="glt-scene relative mt-9 w-full max-w-md"
          >
            <GulistanScene artwork={illustration.art ?? undefined} show={illustration.show} />
          </m.div>

          {/* romantic quote — set smaller and looser than the display type, so
              it reads as a whispered aside rather than a second headline. */}
          <m.p
            {...RISE}
            transition={{ delay: 1.95, duration: 0.9 }}
            className="glt-quote mt-9 max-w-[19rem] text-[clamp(1.05rem,4.2vw,1.4rem)] leading-relaxed text-[color:var(--glt-maroon)]/85 sm:max-w-md"
          >
            &ldquo;{quote}&rdquo;
          </m.p>

          {/* a small gold diamond, not a big pink heart */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1, duration: 0.8 }}
            className="mt-5 text-[0.6rem] tracking-[0.6em] text-[color:var(--glt-gold)]"
            aria-hidden
          >
            ◆
          </m.div>

          {/* countdown */}
          {countdownDate ? (
            <m.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.25, duration: 0.7 }}
              className="mt-8"
            >
              <FlipCountdown
                dateIso={countdownDate}
                time={config.eventTime ? `${config.eventTime}:00` : undefined}
                tileClassName="glt-flip"
                labelClassName="text-[color:var(--glt-ink-soft)]"
              />
            </m.div>
          ) : null}

          {/* add to calendar */}
          {calUrl ? (
            <m.a
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.6 }}
              href={calUrl}
              target="_blank"
              rel="noreferrer"
              className="glt-btn mt-9"
            >
              Add to calendar
            </m.a>
          ) : null}

          {config.footer?.hashtag ? (
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.55, duration: 0.6 }}
              className="glt-names glt-foil mt-8 text-[clamp(1.5rem,7vw,2.4rem)]"
            >
              #{config.footer.hashtag}
            </m.p>
          ) : null}
        </main>

        {/* Lanterns anchored to the lower corners — smaller and dimmer on
            phones, where they were crowding the content column. */}
        <Lantern className="glt-lantern pointer-events-none absolute bottom-8 left-1 z-[6] h-24 w-11 origin-top opacity-70 sm:left-6 sm:h-36 sm:w-16 sm:opacity-100" />
        <Lantern className="glt-lantern-alt pointer-events-none absolute bottom-8 right-1 z-[6] h-24 w-11 origin-top opacity-70 sm:right-6 sm:h-36 sm:w-16 sm:opacity-100" />

        <footer className="relative z-20 pb-9 text-center">
          <p className="glt-sans text-[11px] uppercase tracking-[0.32em] text-[color:var(--glt-ink-soft)]">
            A formal invitation will follow
          </p>
          <JashnCredit className="mt-4 text-[color:var(--glt-ink-soft)]" />
        </footer>
      </div>
    </MotionProvider>
  );
}
