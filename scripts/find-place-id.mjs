#!/usr/bin/env node
/**
 * Resolves a business name to the Google Place ID that `GOOGLE_PLACE_ID` wants.
 *
 * The Place ID is not the business name and not anything visible in a Maps URL
 * you can copy from the address bar — it's an opaque identifier
 * ("ChIJ…"), and hunting for it by hand means either Google's Place ID Finder
 * widget or reading it out of a network tab. This does it with the same API key
 * the site already needs.
 *
 * Place IDs are the one piece of Places data Google's terms allow storing
 * indefinitely, which is why this is a one-off lookup written to .env rather
 * than a Text Search call on every page render.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=… node scripts/find-place-id.mjs "Join the Jashn"
 *
 * The key is also picked up from .env.local or .env if it's already there:
 *   node --env-file=.env.local scripts/find-place-id.mjs "Join the Jashn"
 *
 * Then put the winner in .env.local:
 *   GOOGLE_PLACE_ID=ChIJ…
 */

const SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

const query = process.argv.slice(2).join(" ").trim();
const apiKey = process.env.GOOGLE_PLACES_API_KEY;

if (!query) {
  console.error('Usage: node scripts/find-place-id.mjs "Business name"');
  process.exit(1);
}

if (!apiKey) {
  console.error(
    "GOOGLE_PLACES_API_KEY is not set.\n" +
      "Pass it inline, or run with --env-file=.env.local once it's in there:\n" +
      '  GOOGLE_PLACES_API_KEY=… node scripts/find-place-id.mjs "Join the Jashn"'
  );
  process.exit(1);
}

const res = await fetch(SEARCH_ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    // Cheapest field mask that still lets a human tell the candidates apart.
    // `rating`/`userRatingCount` are here only to confirm the listing that has
    // the reviews is the one being wired up.
    "X-Goog-FieldMask":
      "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri",
  },
  body: JSON.stringify({ textQuery: query, languageCode: "en" }),
});

if (!res.ok) {
  // Google explains the actual problem in the body — bad key, API not enabled
  // on the project, key restricted to the wrong referrer.
  console.error(`Places Text Search failed (${res.status}):`);
  console.error(await res.text());
  process.exit(1);
}

const { places = [] } = await res.json();

if (places.length === 0) {
  console.log(`No places matched "${query}".`);
  console.log(
    "If the business is new, its profile may not be published yet — an unverified\n" +
      "listing is not searchable through the API even when you can see it while\n" +
      "signed in as the owner."
  );
  process.exit(0);
}

console.log(`\n${places.length} match(es) for "${query}":\n`);
for (const place of places) {
  const name = place.displayName?.text ?? "(unnamed)";
  const reviews =
    typeof place.userRatingCount === "number" ? place.userRatingCount : 0;
  console.log(`  ${name}`);
  console.log(`    GOOGLE_PLACE_ID=${place.id}`);
  console.log(`    ${place.formattedAddress ?? "(no address)"}`);
  console.log(
    `    ${place.rating ?? "no"} ★  ·  ${reviews} review${reviews === 1 ? "" : "s"}`
  );
  if (place.googleMapsUri) console.log(`    ${place.googleMapsUri}`);
  console.log("");
}

console.log(
  "Pick the listing whose review count matches what you see on Maps, and put its\n" +
    "GOOGLE_PLACE_ID line in .env.local (and in the Vercel project env).\n"
);
