import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { THEMES, getTheme } from "@/modules/website/themes/registry";
import { buildSiteProps } from "@/modules/website/render/build";
import { SiteView } from "@/modules/website/render/site";
import {
  DEMO_SITE_WEDDING,
  DEMO_SITE_EVENTS,
  DEMO_SITE_CONFIG,
} from "@/modules/website/demo-data";

/**
 * PUBLIC live theme demo — the real guest-site renderer fed a fictional sample
 * wedding. No auth, no real data. Linked from the landing page's theme gallery
 * and "Experience a Live Wedding" CTAs.
 */

export function generateStaticParams() {
  return THEMES.map((t) => ({ themeId: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ themeId: string }>;
}): Promise<Metadata> {
  const { themeId } = await params;
  const theme = getTheme(themeId);
  return {
    title: `${theme.name} — Live demo · Join the Jashn`,
    description: `Preview the ${theme.name} wedding theme on a sample celebration.`,
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  if (!THEMES.some((t) => t.id === themeId)) notFound();
  const theme = getTheme(themeId);

  const props = buildSiteProps(
    {
      ...DEMO_SITE_WEDDING,
      config: DEMO_SITE_CONFIG as Record<string, unknown>,
    },
    DEMO_SITE_EVENTS
  );

  return (
    <>
      <SiteView
        theme={theme}
        {...props}
        ownerPreview
        chip={{ en: "Live demo", hi: "डेमो" }}
      />

      {/* Demo chrome: back to the landing + switch themes in place. */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
        <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full bg-black/80 px-3 py-2 text-white shadow-2xl backdrop-blur-md">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:text-white"
          >
            ← Join the Jashn
          </Link>
          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-white/25" />
          {THEMES.map((t) => {
            const active = t.id === theme.id;
            return (
              <Link
                key={t.id}
                href={`/demo/${t.id}`}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-full bg-[#e8c877] px-3 py-1.5 text-xs font-bold text-[#3b1022]"
                    : "rounded-full px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:text-white"
                }
              >
                {t.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
