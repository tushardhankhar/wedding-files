import { GoogleTagManager } from "@next/third-parties/google";
import { gtmId } from "@/lib/env";
import { SpaPageview } from "./spa-pageview";

/**
 * Layout for the PUBLIC marketing surface — the landing page, /about, /terms
 * and the live theme demos. Its only job is to load Google Tag Manager and tell
 * it about client-side navigation.
 *
 * GTM is the single tag layer: GA4 itself is configured as a tag INSIDE the GTM
 * container, not loaded here. That's why there is no gtag.js / measurement ID in
 * this codebase — adding a `<GoogleAnalytics>` component alongside this would
 * double-count every pageview and event in the same GA4 property. Any future
 * vendor (Meta, LinkedIn) goes in the GTM UI too, so no redeploy is needed.
 *
 * Analytics is deliberately scoped to this route group. Guest invitation sites
 * (`/w/[slug]`), previews and the admin dashboard sit outside it and are never
 * measured: their URLs identify real couples and their guest lists, and sending
 * those paths to Google would leak private data for no analytical gain. Putting
 * the tag in a route-group layout rather than the root layout makes that
 * boundary structural — a new private route can't be tracked by accident, and
 * anything dropped into `(marketing)/` is tracked with no extra wiring.
 *
 * The route group is parentheses-wrapped, so it does not appear in URLs: this
 * layout wraps `/`, `/about`, `/terms` and `/demo/[themeId]` unchanged.
 */
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Unset in development and in any deployment without the var, so local page
  // loads and preview builds never reach the production property.
  const containerId = gtmId();

  return (
    <>
      {/* Both gated on the same id, so with analytics switched off nothing pushes
          to a dataLayer that no container is listening to. */}
      {containerId ? (
        <>
          <GoogleTagManager gtmId={containerId} />
          <SpaPageview />
        </>
      ) : null}
      {children}
    </>
  );
}
