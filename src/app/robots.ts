import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/**
 * Only the marketing surface is crawlable. Everything else is either private
 * (a guest's invitation, an owner preview, a claim link) or behind auth.
 *
 * Note this is a courtesy signal, not access control — `/w/*` is genuinely
 * protected by the guest session gate. The reason it's disallowed here is that
 * `generateMetadata` on the guest page deliberately serves the couple's names
 * and date WITHOUT a session so WhatsApp can render a link preview; without
 * this, a crawler that discovered a slug could surface those names in search.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/w/", // guest invitations (names/date exposed for link previews)
        "/preview/", // owner preview of an unpublished site
        "/client/", // one-time claim links
        "/dashboard",
        "/weddings/",
        "/login",
        "/auth/",
        "/api/",
        "/dev/", // 404s in production anyway
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
