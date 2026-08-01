import { PRICE, SHOWCASE_THEMES, SITE_DOMAIN } from "./data";
import {
  Backdrop,
  Body,
  Eyebrow,
  GOLD,
  GROUND,
  Headline,
  Icon,
  IVORY,
  LEAF,
  POPPINS,
  Phone,
  RALEWAY,
  Rule,
  ThemeGround,
  moodFor,
  type IconName,
} from "./ad-kit";

/**
 * The single-image Meta feed ad — one creative that has to do the whole job a
 * nine-card carousel does, because most people will never swipe and many
 * placements only ever show one image.
 *
 * Its three jobs, in the order a thumb meets them:
 *   1. Say what this *is*. Cold audiences don't know the category exists, so the
 *      headline names the product in plain words rather than teasing it.
 *   2. Make it look worth ₹1,599, which the phone does by showing a real
 *      invitation rather than a mockup or a feature list.
 *   3. Send the tap to Meta's own CTA button, which sits *below* the image in the
 *      feed — hence the arrow pointing down out of the frame.
 *
 * Deliberately NOT a drawn button. A fake button inside the creative competes
 * with the real one directly beneath it, harvests taps that don't register as
 * link clicks, and reads as broken the moment someone presses it. The arrow
 * points at the real control instead.
 */

// ── Canvas ──────────────────────────────────────────────────────────────────
/**
 * 4:5 at 2× → 1080×1350, the tallest single image Meta will show in feed and so
 * the most screen a static ad can occupy. Square would be safer across every
 * placement but gives up a third of the height.
 */
export const AD_POST_CANVAS = { width: 540, height: 675, scale: 2 } as const;

const PAD = 34;

/** Which theme fills the phone. */
const POST_THEME_ID = "maharaja";

/**
 * The phone. Big and bleeding off the bottom edge, kept to the right so the copy
 * column and the arrow own the left.
 *
 * The crop is the point: at this height it stops in the clear space just after the
 * couple's names and the date — the part of an invitation people recognise — and
 * leaves the rest below the fold as the reason to click. Scale and top are tuned
 * together so the cut never lands *through* a line of the invitation's type, which
 * reads as a broken export rather than as a card continuing past the edge.
 */
const PHONE = { left: 218, top: 300, scale: 1.12 } as const;

/** Everything the ad claims, in the order it's read. */
const TICKS: { icon: IconName; text: string }[] = [
  { icon: "chat", text: "Shared on WhatsApp" },
  { icon: "globe", text: "Opens in any browser" },
  { icon: "rsvp", text: "RSVP, event by event" },
];

/**
 * The offer as a struck seal in the corner, the way a printer stamps a card —
 * a rounded rectangle would read as a UI badge, and this has to read as luxury.
 */
function PriceSeal() {
  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        right: 28,
        width: 116,
        height: 116,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        borderRadius: "50%",
        border: `1px solid ${LEAF}8c`,
        // A second hairline inside the first, the way an engraved seal is ruled.
        boxShadow: `inset 0 0 0 4px ${IVORY}0a, inset 0 0 0 5px ${LEAF}3d`,
        background: `radial-gradient(closest-side, ${IVORY}12 0%, transparent 82%)`,
      }}
    >
      <span
        style={{
          fontFamily: POPPINS,
          fontWeight: 600,
          fontSize: 7.5,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: IVORY,
          opacity: 0.58,
        }}
      >
        Launch offer
      </span>
      <span
        style={{
          fontFamily: POPPINS,
          fontWeight: 700,
          fontSize: 29,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: GOLD,
        }}
      >
        {PRICE}
      </span>
      {/* The anchor price. Struck type at 10px and half opacity turned into a
          smudge inside the ring — an anchor nobody can read anchors nothing. */}
      <span
        style={{
          fontFamily: POPPINS,
          fontWeight: 500,
          fontSize: 12,
          color: IVORY,
          opacity: 0.72,
          textDecoration: "line-through",
          textDecorationThickness: 1,
        }}
      >
        ₹2,199
      </span>
    </div>
  );
}

/**
 * The whole reason the creative exists: move the thumb onto Meta's CTA button.
 *
 * The button's label is set in Ads Manager and can be anything, so the copy says
 * "the button below" rather than naming it — and the arrow does the work language
 * can't, pointing out of the frame at the control directly underneath.
 */
function CtaNudge() {
  return (
    <div
      style={{
        position: "absolute",
        left: PAD,
        bottom: 34,
        display: "flex",
        flexDirection: "column",
        gap: 7,
        // Kept narrow enough to clear the phone's left edge at `PHONE.left`.
        maxWidth: 174,
      }}
    >
      <span
        style={{
          fontFamily: POPPINS,
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: "-0.01em",
          color: IVORY,
        }}
      >
        See a live demo
      </span>
      <span
        style={{
          fontFamily: RALEWAY,
          fontSize: 11.5,
          lineHeight: 1.45,
          color: IVORY,
          opacity: 0.58,
        }}
      >
        Tap the button just below
      </span>
      <svg
        viewBox="0 0 30 34"
        width={30}
        height={34}
        aria-hidden="true"
        style={{ marginTop: 3 }}
        fill="none"
        stroke={GOLD}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* A shaft with two chevrons — one arrow reads as decoration, the second
            chevron reads as motion, which is what makes the eye travel down. */}
        <path d="M15 2v20" strokeOpacity={0.55} />
        <path d="M6 16l9 9 9-9" />
        <path d="M9 27l6 5 6-5" strokeOpacity={0.4} />
      </svg>
    </div>
  );
}

export function AdPostCard() {
  const theme = SHOWCASE_THEMES.find((t) => t.id === POST_THEME_ID);
  const mood = moodFor(theme);
  const { width, height } = AD_POST_CANVAS;

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", background: GROUND }}>
      {/* Warmth pooled where the phone stands, so the wine screen and the navy
          card read as one lit room rather than two pictures. */}
      <ThemeGround mood={mood} anchor="70% 66%" />
      <Backdrop bloom="92% -2%" tint={mood.warm} />

      {/* Copy column, ranged left and clear of the seal. */}
      <div
        style={{
          position: "absolute",
          top: PAD + 8,
          left: PAD,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 338,
        }}
      >
        <Eyebrow text={SITE_DOMAIN} />
        {/* Names the product outright. A cold audience has never heard of a
            "wedding website", so nothing here is left to be inferred. */}
        <Headline text={"Your shaadi card,\nas a *website*."} size={36} />
        <Rule />
        <div style={{ maxWidth: 306 }}>
          <Body
            text="One private link your guests open in a single tap. Every event, RSVP and venue map inside — in English and हिंदी."
            size={13}
          />
        </div>

        <ul style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
          {TICKS.map((tick) => (
            <li key={tick.text} style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <Icon name={tick.icon} size={14} opacity={0.92} />
              <span
                style={{
                  fontFamily: POPPINS,
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "0.01em",
                  color: IVORY,
                  opacity: 0.86,
                }}
              >
                {tick.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <PriceSeal />

      {theme && (
        <div style={{ position: "absolute", left: PHONE.left, top: PHONE.top }}>
          <Phone theme={theme} scale={PHONE.scale} mood={mood} />
        </div>
      )}

      <CtaNudge />
    </div>
  );
}
