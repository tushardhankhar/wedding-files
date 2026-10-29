/**
 * THE ROSHNI — the theme's own wording. Each line can be rewritten by the host
 * (`experience.roshni.<key>`); the dashboard prefills these, and saves a line
 * only when the host has changed it. Kept apart from the renderer so the admin
 * editor can import it without pulling in the animation bundle.
 */
export const ROSHNI_DEFAULTS = {
  headline: "An Evening of Lights, Love & Laughter",
  intro: "This Diwali, let’s illuminate our homes, hearts, and moments together.",
  invitation:
    "You are warmly invited to celebrate the festival of lights with us, surrounded by warmth, happiness, delicious treats, and beautiful memories.",
  letterTitle: "Let’s Make This Diwali Special",
  letterBody:
    "May the glow of every diya bring happiness, the sparkle of every light bring hope, and every moment bring us closer together. Join us for an evening filled with festive cheer, warmth, and togetherness.",
  closingTitle: "Your Presence Will Make Our Jashn Brighter",
  closingLine: "Come for the lights, stay for the laughter, and leave with memories to cherish.",
  blessing: "Wishing You a Diwali Filled With Light, Love & Prosperity",
} as const;
