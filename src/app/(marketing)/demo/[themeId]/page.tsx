import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { THEMES, getTheme } from "@/modules/website/themes/registry";
import { buildSiteProps } from "@/modules/website/render/build";
import { SiteView } from "@/modules/website/render/site";
import { getDemoData } from "@/modules/website/demo-data";
import { SHOWCASE_THEMES } from "@/components/landing/data";
import { ThemeDock } from "./theme-dock";

/**
 * PUBLIC live theme demo — the real guest-site renderer fed a fictional sample
 * wedding. No auth, no real data. Linked from the landing page's theme gallery
 * and "Experience a Live Wedding" CTAs.
 */

/**
 * The dock lists themes in the same order as the landing page's theme gallery —
 * arriving from a gallery card and finding the chips reshuffled reads as a
 * different set of themes. The registry's own order is a build order, not a
 * presentation one, so the showcase list drives it and anything absent from the
 * gallery falls in behind, still in registry order.
 */
const DOCK_THEMES = [
  ...SHOWCASE_THEMES.map((s) => THEMES.find((t) => t.id === s.demo)).filter(
    (t): t is (typeof THEMES)[number] => Boolean(t),
  ),
  ...THEMES.filter((t) => !SHOWCASE_THEMES.some((s) => s.demo === t.id)),
].map((t) => ({ id: t.id, name: t.name }));

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
    description: `Preview the ${theme.name} theme on a sample invitation.`,
  };
}

export default async function DemoPage({
  params,
  searchParams,
}: {
  params: Promise<{ themeId: string }>;
  searchParams: Promise<{ embed?: string; chip?: string }>;
}) {
  const { themeId } = await params;
  const { embed, chip } = await searchParams;
  if (!THEMES.some((t) => t.id === themeId)) notFound();
  const theme = getTheme(themeId);

  const { wedding, events } = getDemoData(themeId);
  const props = buildSiteProps(wedding, events);

  // Embedded mode powers the landing page's phone previews: render just the
  // live site, no navigation chrome, so it reads as a real screen.
  //
  // `?chip=0` drops the "Live demo" badge. The screenshot stages ask for it: the
  // phone mock draws its own LIVE pill in the same corner, and two badges
  // stacked on each other read as a bug in an exported image.
  if (embed) {
    return (
      <SiteView
        theme={theme}
        {...props}
        ownerPreview
        chip={chip === "0" ? null : { en: "Live demo", hi: "डेमो" }}
      />
    );
  }

  return (
    <>
      <SiteView
        theme={theme}
        {...props}
        ownerPreview
        chip={{ en: "Live demo", hi: "डेमो" }}
      />

      <ThemeDock themes={DOCK_THEMES} activeId={theme.id} />
    </>
  );
}
