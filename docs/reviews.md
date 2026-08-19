# The reviews carousel

_Two ways to feed it, why the cheap one is the default, and the line neither of
them crosses._

## The line

**Every review shown must be one somebody actually left.** Not a polished
composite, not the review we wish we'd got, not a placeholder to make the layout
look finished. The carousel sits directly above the price on a page selling to
families, and a visitor who clicks through to the Google listing to check a quote
needs to find it there.

Nothing in the shipped path can invent one: with no reviews configured the section
returns `null` and vanishes from the page. There is no sample testimonial to
accidentally leave in.

## Two sources

| | `curated` (default) | `google-places` |
|---|---|---|
| Setup | type them into a file | Cloud project + billing + API key |
| Cost | none | free in practice; India needs a refundable ₹1,000 deposit |
| How many | as many as you like | **5, hard cap, forever** |
| Updates | by hand | itself, once a day |
| Says "Reviews from Google" | no | yes |

`curated` is the default because it is the only one that works with nothing
configured, and because five reviews behind a deposit is a worse deal than ten
typed out by hand.

A third source, **`google-business-profile`**, is the only route to every review
via API — it needs ownership of the listing, an OAuth grant, and Google's approval
of API access (an application with a review period). Not built. The reader map in
`modules/reviews/server/index.ts` has a slot for it.

## Using `curated`

Edit **`src/modules/reviews/curated-reviews.ts`**. Three things in it:

- `CURATED_REVIEWS` — the reviews, with the reviewer's name, their words, a
  1–5 rating and roughly when ("March 2026" is fine).
- `CURATED_RATING` / `CURATED_TOTAL` — the star average and review count read
  **off the Google listing**, not computed from the array. The average of five
  hand-picked five-star reviews is 5.0, which would overstate a real 4.7.
- `CURATED_PLACE_URL` — the public Maps link (listing → Share → copy). No API or
  billing needed, and it's what lets a visitor verify the quotes.

Reviewer photos stay blank: we have no licence to re-host someone's Google profile
picture. Cards fall back to a monogram, which the layout was built to handle.

Because the source isn't live, the section drops the "Reviews from Google" eyebrow
for "In their words" and offers a "Read them on Google" button instead. Claiming a
verification we aren't performing is the one thing the wording must not do.

## Switching to `google-places`

Set `REVIEWS_SOURCE=google-places` plus the two vars below.

**The Places API returns a maximum of five reviews.** Not five per page — five,
full stop. There is no page token, no offset and no sort parameter. Google's own
reference states it: "A maximum of 5 reviews can be returned." Anyone who goes
looking for the request that returns the sixth will not find it.

## Setup

1. **Create a Google Cloud project and attach a billing account.** Maps Platform
   requires one even to use the free allowance — there is no card-free tier. In
   India this also means the ₹1,000 prepayment described below.
2. **Enable "Places API (New)"** — APIs & Services → Library. Take care here:
   there are two similarly named products, and the legacy "Places API" is the
   wrong one. Our code calls `places.googleapis.com/v1`, which only the **(New)**
   product serves. With the legacy one enabled instead, every request 403s.
3. **Create an API key** under APIs & Services → Credentials, then restrict it:
   - *API restrictions* → **Places API (New)**. This is the real control.
   - *Application restrictions* → **None**. Do not set an HTTP-referrer
     restriction: the call is made from our server, not a browser, so there is no
     referrer to match and every request would be rejected. An IP restriction
     won't work either, because Vercel's egress addresses move.
4. **Find the Place ID.** It is not the business name and it is not anything you
   can copy out of the Maps address bar:

   ```
   GOOGLE_PLACES_API_KEY=… node scripts/find-place-id.mjs "Join the Jashn"
   ```

   The script prints every match with its rating and review count. Pick the one
   whose review count matches what Maps shows you.
5. **Set the vars** in `.env.local` and in the Vercel project:

   ```
   REVIEWS_SOURCE=google-places
   GOOGLE_PLACES_API_KEY=…
   GOOGLE_PLACE_ID=ChIJ…
   ```

   Remember that `www.jointhejashn.com` ships from the `production` branch, and
   that env changes need a redeploy before they apply.

Miss either Google var and the Places reader returns nothing rather than failing,
so local and preview builds don't need credentials — reviews are a billed field
and there's no reason for every dev build to spend on them.

**A note on the India deposit.** Google Cloud asks Indian accounts for a one-time
₹1,000 prepayment before any API will serve traffic, because RBI's e-mandate rules
make recurring card charges unreliable. It is credited to the account as balance
rather than spent, is refundable on closing the billing account, and also
activates the free trial credits. Our usage never consumes it. It is still ₹1,000
parked with Google, which is the whole reason `curated` is the default.

## Cost and caching

Asking for `reviews` puts the whole request in **Place Details Enterprise +
Atmosphere**, the dearest Places SKU: roughly **$20–$25 per 1,000 requests** (the
rate steps with volume), with **1,000 free per month**. (`rating` and
`userRatingCount` alone would be the cheaper Enterprise SKU, but one field mask
bills at its highest tier.) Google retired the blanket $200 monthly credit in
March 2025 — the free allowance is now per-SKU, and for this one it is 1,000, not
the 10,000 several other SKUs get.

**To make free enforceable rather than merely likely**, cap the quota: APIs &
Services → Places API (New) → Quotas & System Limits → set requests-per-day to
~50. Past the cap Google returns an error instead of a charge. With the key also
restricted to Places, there is no path to a surprise bill.

So the response is cached for **one day** (`REVALIDATE_SECONDS` in
`modules/reviews/server/google-places.ts`) and the landing page is prerendered on
top of that cache: about **30 requests a month regardless of traffic**, which sits
inside the free allowance. In practice this feature costs nothing.

That allowance is why the revalidation window is not a knob to turn casually.
Served uncached, this would bill per visitor, and a good day would clear 1,000
requests before lunch.

The cache also keeps us compliant: Google's Places terms don't allow storing this
content beyond a short window, which is why the reviews are fetched-and-cached
rather than pasted into `components/landing/data.ts` as static copy. A day-long
cache is comfortably inside that. A hardcoded array would not be.

The fetch is tagged `google-reviews`, so a future admin action can call
`revalidateTag("google-reviews")` to pull a new review in before the day is up.

## Attribution is not optional (`google-places` only)

Google requires that we show, for each review: the reviewer's **name and photo as
supplied**, and a **link to the review**. That is why the avatar is a plain
`<img>` pointed straight at Google's CDN — not proxied, not re-hosted, not run
through `next/image` — and why every card carries a "View on Google" link.

Don't "optimise" any of that away.

## It never breaks the page

**`getReviews()` catches everything and logs it.** A
marketing page that 500s because a third party is down is a worse outcome than a
page with one fewer band on it. If the section vanishes in production, the reason
is in `vercel logs` under `[reviews]`.

## Working on the design

The section is only as good as whatever it's fed that day, and it renders nothing
when unconfigured — so there is a dev-only stage at **`/dev/reviews`**
with fixtures covering the awkward cases: a two-line review, a clamped long one, a
three-star rating, a very long reviewer name, a missing avatar. It 404s outside
development, and its fixtures are visibly fake on purpose.
