import type { WeddingEvent } from "@/modules/events/types";

/** Shared, presentation-agnostic date/time helpers used by every theme. */

export function splitNames(names: string): [string, string] | null {
  const parts = names.split(" & ");
  return parts.length === 2 ? [parts[0], parts[1]] : null;
}

/**
 * Caps hero name type at whatever actually fits the line, so a long name steps
 * down instead of breaking mid-word or running off the side.
 *
 * The display type on each theme was set against the sample couple ("Karan &
 * Anjali"). A real pair like "Bhuvaneshwari & Chandrashekhar" is more than
 * twice as long, and at a phone width that broke three ways across the set: the
 * name split mid-word ("BHUVANESH / WARI"), it overflowed and was clipped, or
 * the "&" was stranded at the end of the first line.
 *
 * The width is estimated from the character count rather than measured: a real
 * measurement needs a layout pass, so it is wrong during SSR and pops on
 * hydration. `emPerChar` is the face's average glyph advance in em — roughly
 * 0.5 for a mixed-case serif, ~0.68 for the same face set uppercase, and more
 * again with letterspacing, since tracking widens every glyph slot. Estimating
 * is safe because `min()` only ever makes type *smaller*: pass the size the
 * theme already used as `max` and a short name renders exactly as before, while
 * the estimate only has to be close enough to keep a long one inside the
 * measure.
 */
export function fitName(
  text: string,
  opts: { max: string; emPerChar: number; measure?: string },
): { fontSize: string } {
  const chars = Math.max(text.trim().length, 1);
  const measure = opts.measure ?? "86vw";
  return { fontSize: `min(${opts.max}, calc(${measure} / ${chars} / ${opts.emPerChar}))` };
}

/**
 * Whether a pair is too long to share one line with the "&" between them.
 *
 * Measured on the combined length, because that is what has to fit. Past this,
 * a hero should stack — first name, "&", second name — rather than let the
 * browser break wherever it likes, which is what strands the "&" at the end of
 * the first line. The threshold matches the one The Jodi arrived at
 * independently: ~14 characters fit the narrowest measure the themes render
 * into (the 248px card preview), less the three that " & " itself costs.
 */
export function shouldStack(pair: [string, string]): boolean {
  return pair[0].length + pair[1].length > 11;
}

export function longDate(iso: string | null, upper = false): string {
  if (!iso) return "";
  const s = new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return upper ? s.toUpperCase() : s;
}

export function dayMonth(iso: string | null, upper = false): string {
  if (!iso) return "";
  const s = new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
  return upper ? s.toUpperCase() : s;
}

export function weekday(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString("en-GB", { weekday: "long" })
    .toUpperCase();
}

/** "18:30" → "6:30 PM" */
export function clockTime(t: string | null): string {
  if (!t) return "";
  const h = Number(t.slice(0, 2));
  const m = t.slice(3, 5);
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m} ${h < 12 ? "AM" : "PM"}`;
}

/** "18-12-2026" style compact seal, custom separator. */
export function compactDate(iso: string | null, sep = "."): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}${sep}${m}${sep}${y.slice(2)}`;
}

/** Google Calendar "add event" URL from a wedding event. */
export function gcalUrl(e: WeddingEvent, siteTitle: string): string | null {
  if (!e.eventDate) return null;
  let dates: string;
  if (e.startTime) {
    const start = new Date(`${e.eventDate}T${e.startTime.slice(0, 5)}:00`);
    const end = new Date(start.getTime() + 2 * 3600_000);
    const f = (x: Date) =>
      `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}T${String(x.getHours()).padStart(2, "0")}${String(x.getMinutes()).padStart(2, "0")}00`;
    dates = `${f(start)}/${f(end)}`;
  } else {
    const next = new Date(`${e.eventDate}T00:00:00`);
    next.setDate(next.getDate() + 1);
    const f = (x: Date) =>
      `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}`;
    dates = `${e.eventDate.replace(/-/g, "")}/${f(next)}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.name} — ${siteTitle}`,
    dates,
  });
  const loc = [e.venueName, e.venueAddress].filter(Boolean).join(", ");
  if (loc) params.set("location", loc);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
