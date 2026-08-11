import { PRICE, SHOWCASE_THEMES, SITE_DOMAIN, type ShowcaseTheme } from "./data";
import {
  Backdrop,
  Eyebrow,
  GOLD,
  GROUND,
  Headline,
  Icon,
  IVORY,
  NAVY,
  POPPINS,
  Phone,
  Rule,
  ThemeGround,
  moodFor,
  type IconName,
} from "./ad-kit";

/**
 * The "how many designs do you actually get" ad — a single feed image whose
 * whole job is range, not depth. Every other creative in this kit puts one
 * theme in one phone because a cold visitor has to believe any single
 * invitation is real; this one exists to answer the very next question —
 * "okay, but is there one that suits *my* wedding?" — by showing five
 * distinct moods live in one frame instead of listing "16 themes" as a
 * number nobody can picture.
 *
 * All five phones render the actual live /demo sites (via `Phone`, same as
 * every other creative), never a mockup — the breadth being sold is real, so
 * the proof is real too.
 */

// Same 4:5 as the single feed post — the format Meta shows most, and one
// canvas size across every static Jashn ad keeps the ad account visually one
// campaign rather than several.
export const AD_THEMES_CANVAS = { width: 540, height: 675, scale: 2 } as const;

const PAD = 34;

/**
 * Front-to-back, centre out. Chosen for five visibly different moods —
 * royal wine, rose-romantic, peacock teal, illustrated ivory, modern pink —
 * so the fan reads as "range" at a glance rather than as five reds.
 */
const FAN: { id: string; scale: number; left: number; top: number; rotate: number; z: number }[] = [
  { id: "mayura", scale: 0.445, left: -16, top: 278, rotate: -18, z: 1 },
  { id: "jharokha", scale: 0.6, left: 48, top: 236, rotate: -9, z: 3 },
  { id: "maharaja", scale: 0.78, left: 166, top: 192, rotate: 0, z: 5 },
  { id: "jodi", scale: 0.6, left: 332, top: 236, rotate: 9, z: 3 },
  { id: "gulmohar", scale: 0.445, left: 452, top: 278, rotate: 18, z: 1 },
];

/**
 * Three, not six — a scrolling thumb reads a badge, not a sentence. Each one
 * is what people actually ask before they buy, not a feature-list entry, and
 * every icon is a full circle rather than a bare line so it still reads at
 * Instagram's scroll speed.
 */
const BADGES: { icon: IconName; text: string }[] = [
  { icon: "rsvp", text: "RSVP Included" },
  { icon: "pin", text: "Maps & Countdown" },
  { icon: "camera", text: "Photos & Story" },
];

function themeById(id: string): ShowcaseTheme | undefined {
  return SHOWCASE_THEMES.find((t) => t.id === id);
}

export function AdThemesCard() {
  const { width, height } = AD_THEMES_CANVAS;
  const hero = themeById("maharaja");
  const heroMood = moodFor(hero);

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", background: GROUND }}>
      {/* Warmth pooled behind the centre phone only — five separate pools would
          muddy the ground; one, tuned to the hero theme, is enough to lift the
          whole fan off the navy. */}
      <ThemeGround mood={heroMood} anchor="50% 58%" />
      <Backdrop bloom="50% -6%" tint={heroMood.warm} />

      {/* Copy — centred, because a fan of phones is a centred composition and
          copy ranged left would fight its symmetry. */}
      <div
        style={{
          position: "absolute",
          insetInline: 0,
          top: PAD - 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 6,
          padding: `0 ${PAD + 6}px`,
        }}
      >
        <Eyebrow text="Premium Wedding Websites" />
        <Headline text={"Find your perfect\nwedding *invitation*."} size={22} />
        <Rule centred />

        {/* The offer, stated once, big enough to stop a thumb — not buried in
            a footer line nobody scrolling stops to read. */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 16px",
            borderRadius: 999,
            background: `linear-gradient(177deg, #FFF07A 0%, ${GOLD} 46%, #D8C300 100%)`,
            boxShadow: `0 10px 18px -12px ${GOLD}80`,
          }}
        >
          <span
            style={{
              fontFamily: POPPINS,
              fontWeight: 700,
              fontSize: 8.5,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: NAVY,
              opacity: 0.72,
            }}
          >
            Launch offer
          </span>
          <span aria-hidden="true" style={{ width: 1, height: 12, background: `${NAVY}4a` }} />
          <span style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em", color: NAVY }}>
            {PRICE}
          </span>
        </div>

        {/* Three badges, side by side — a row reads as one unified checklist
            at a glance, where a stack reads as three separate decisions. Wraps
            to a second line only if a phone this narrow ever needs it. */}
        <ul
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            rowGap: 7,
            columnGap: 8,
            marginTop: 1,
          }}
        >
          {BADGES.map((badge) => (
            <li
              key={badge.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "4px 12px",
                borderRadius: 999,
                background: `${IVORY}12`,
                border: `1px solid ${IVORY}28`,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "flex",
                  flex: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  background: `${GOLD}22`,
                  border: `1px solid ${GOLD}66`,
                }}
              >
                <Icon name={badge.icon} size={9.5} color={GOLD} />
              </span>
              <span style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 11.5, color: IVORY, whiteSpace: "nowrap" }}>
                {badge.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* The fan. Absolute within the full canvas so each phone's rotation and
          layering is independent of the copy block above it. */}
      <div style={{ position: "absolute", inset: 0 }}>
        {FAN.map((slot) => {
          const theme = themeById(slot.id);
          if (!theme) return null;
          const mood = moodFor(theme);
          return (
            <div
              key={slot.id}
              style={{
                position: "absolute",
                left: slot.left,
                top: slot.top,
                zIndex: slot.z,
                transform: `rotate(${slot.rotate}deg)`,
                transformOrigin: "50% 12%",
                // A soft, size-matched ground shadow — the fan has to look set
                // down on a surface, not pasted on. `drop-shadow` follows the
                // phone's own rounded silhouette, unlike a box-shadow rectangle.
                filter: `drop-shadow(0 ${18 * slot.scale}px ${26 * slot.scale}px rgba(4,4,10,.55))`,
              }}
            >
              <Phone theme={theme} scale={slot.scale} mood={mood} />
            </div>
          );
        })}
      </div>

      {/* Domain only, bottom centre. Sits above the fan's own reserved
          clearance (see FAN tops) rather than at the very edge, so a phone in
          front of it never dims it against its own dark screen. */}
      <p style={{ position: "absolute", insetInline: 0, bottom: PAD - 14, textAlign: "center" }}>
        <span
          style={{
            fontFamily: POPPINS,
            fontWeight: 600,
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: IVORY,
            opacity: 0.55,
          }}
        >
          {SITE_DOMAIN}
        </span>
      </p>
    </div>
  );
}
