# Conversion tracking — GTM, Meta Pixel & GA4

_What the app sends, and what you configure in the Google Tag Manager UI._

## The rule this all follows

**GTM is the only tag loader.** The app never calls `fbq`, `gtag`, or any vendor
SDK — it pushes named events to the dataLayer, and every pixel is a tag inside
the container. That is why adding Meta, LinkedIn or anything else is a change in
an interface, not a code change plus a redeploy.

Do not add the Meta base pixel to the codebase. If both GTM and a hardcoded
pixel are present, every conversion is counted twice, and the number your ad
spend is judged on is silently double what it should be.

## Where tags load — and where they deliberately don't

Only the `(marketing)` route group loads GTM (`app/(marketing)/layout.tsx`):
`/`, `/about`, `/terms`, `/demo/*` and **`/start`**.

Everything else — `/w/[slug]`, `/preview`, `/dashboard`, `/weddings/*` — loads
no tags at all, because those URLs identify real couples and their guest lists.
This is why the `purchase` event fires on `/start` *before* redirecting to
`/weddings/[id]`: announced after the redirect, it would be announced to nobody.

## Events the app pushes

| dataLayer event | Fires when | Meta standard event | GA4 |
|---|---|---|---|
| `spa_pageview` | client-side route change | PageView | page_view |
| `demo_click` | a "see a demo" CTA is clicked | ViewContent | — |
| `self_serve_start` | a buy CTA is clicked (`cta_from` names the surface) | — | — |
| `sign_up` | an account is created via OTP | CompleteRegistration | sign_up |
| `select_theme` | a theme is chosen (`theme_id`, `occasion`) | — | — |
| `begin_checkout` | the Razorpay order exists and the sheet opens | InitiateCheckout | begin_checkout |
| **`purchase`** | **payment verified, invitation created** | **Purchase** | **purchase** |
| `whatsapp_click` | the WhatsApp fallback is clicked | Contact | — |
| `enquiry_submitted` | the contact form succeeds | Lead | generate_lead |

`purchase` carries `value` (99), `currency` (INR), `transaction_id` and
`event_id` (both the Razorpay payment id), plus an `items` array.

**Value is in rupees, not paise.** Sending 9900 would tell Meta each sale is
worth ₹9,900 and let it bid roughly a hundred times what a buyer is actually
worth. The figure derives from the same `PRICE_PAISE` the server charges, so
the number optimised on and the number banked cannot drift apart.

## Setting up the Meta Pixel in GTM

1. **Meta Events Manager** → create a Pixel → copy the Pixel ID.
2. **GTM → Tags → New → Custom HTML** — the Meta base code, trigger
   **Initialization – All Pages**. Name it `Meta – Base Pixel`.
3. For each conversion, add a **Custom HTML** tag firing `fbq('track', …)` on a
   **Custom Event** trigger matching the dataLayer event name above.

   The one that matters — `Meta – Purchase`, on Custom Event `purchase`:

   ```html
   <script>
     fbq('track', 'Purchase', {
       value: {{DLV - value}},
       currency: {{DLV - currency}},
       content_type: 'product',
       content_ids: ['self-serve-invitation']
     }, { eventID: {{DLV - event_id}} });
   </script>
   ```

4. Create **Data Layer Variables** for `value`, `currency`, `event_id`,
   `transaction_id`, `theme_id`, `cta_from`. GTM does not expose dataLayer keys
   as variables automatically.
5. **Preview** with GTM's debugger, run a test purchase, confirm the tag fires
   once — then **Submit → Publish**. An unpublished container changes nothing on
   the live site.

## GA4

GA4 is already a tag inside the same container. `purchase`, `begin_checkout` and
`sign_up` are GA4 **recommended** event names, so they map with no renaming —
just add a GA4 Event tag per Custom Event trigger. Mark `purchase` as a **Key
Event** in GA4 → Admin → Events, or it won't be importable as a conversion.

## Meta ads: what to optimise on

Point the campaign at the **Purchase** event, not Lead or ViewContent. With a
₹99 product the temptation is to optimise for something that fires more often,
but Meta optimises for whatever you name — pick Lead and it will find people who
sign up and never pay.

Use `sign_up` for a retargeting audience: registered, never purchased. That is
the warmest audience this funnel produces, and the cheapest to convert.

## Server-side: Meta Conversions API ✅ built

Browser events are lossy. Ad blockers and iOS tracking prevention account for
much of it, but the loss unique to this funnel is worse: a buyer who approves a
UPI payment on their phone and never returns to the tab gets their invitation
created by the **Razorpay webhook**, server-side, with no browser involved. The
pixel cannot fire for that purchase even in principle.

So `Purchase` is also reported from the server, in `reportPurchase`
(`modules/self-serve/server/meta-capi.ts`), called from `activateSignup` — after
the atomic claim, so it runs **exactly once per purchase** whichever path
arrived first, including the closed-tab case.

**Deduplication.** Both reporters send the Razorpay payment id — the pixel as
`eventID`, CAPI as `event_id` — and Meta collapses them into one conversion.
Breaking this is worse than sending nothing: every sale would count twice, which
looks like success while teaching the campaign the wrong thing. If you ever
change one id, change both.

### Configuration

`META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, and optionally
`META_TEST_EVENT_CODE` (see `.env.example`). With the first two unset, nothing
is sent and the pixel is the only reporter — no errors, no behaviour change.

To verify: set `META_TEST_EVENT_CODE` from Events Manager → Test Events, make a
test purchase, watch it appear there. **Then remove it** — while it is set,
events route to the test tab *instead of* production reporting.

### What is sent, and what deliberately is not

Sent: hashed email and phone (SHA-256, normalized per Meta's spec), the value,
currency, theme id, and the payment id as `event_id`.

Not sent: names, event dates, guest data, anything about the celebration. This
is the **only** place personal data leaves the app for analytics, and it leaves
hashed — everywhere else the no-PII rule stands unchanged.

### Known limitation: match quality

`client_ip_address`, `client_user_agent`, and the `_fbp` / `_fbc` cookies are
not sent, because `activateSignup` has no request context — and on the webhook
path there is no buyer request to take them from. Hashed email plus phone gives
a decent match rate, but threading the browser signals through the
`verifyPaymentAction` path (where they *are* available) would raise it. Worth
doing if Events Manager reports a low match quality score.
