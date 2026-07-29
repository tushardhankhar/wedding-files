import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { THEMES } from "@/modules/website/themes/registry";

/**
 * The public marketing surface only: the landing page, the two content pages,
 * and one live demo per theme. Guest sites, previews and admin routes are
 * private and are excluded here as well as in robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    // Each theme demo is a real landing target — the gallery links straight in.
    ...THEMES.map((theme) => ({
      url: `${base}/demo/${theme.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
