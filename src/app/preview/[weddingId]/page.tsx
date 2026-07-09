import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/modules/auth/server/user";
import { getWeddingById } from "@/modules/weddings/server/queries";
import { listEvents } from "@/modules/events/server/queries";
import { getTheme } from "@/modules/website/themes/registry";
import { buildSiteProps } from "@/modules/website/render/build";
import { WebsiteView } from "@/modules/website/render/website-view";

// Owner-only preview of the live guest site — full-bleed, outside the admin
// chrome. RLS on getWeddingById ensures only the wedding's admin/client can see
// it. In preview, ALL events show (guest gating is applied on the real site).
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  await requireUser();

  const [wedding, events] = await Promise.all([
    getWeddingById(weddingId),
    listEvents(weddingId),
  ]);
  if (!wedding) notFound();
  const theme = getTheme(wedding.themeId);
  const props = buildSiteProps(wedding, events);

  return (
    <>
      <Link
        href={`/weddings/${weddingId}`}
        className="fixed left-3 top-3 z-[60] rounded-full bg-black/70 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/85"
      >
        ← Back to editing
      </Link>
      <WebsiteView
        theme={theme}
        {...props}
        ownerPreview
        chip={{ en: "Preview", hi: "पूर्वावलोकन" }}
      />
    </>
  );
}
