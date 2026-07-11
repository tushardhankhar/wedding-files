import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingById } from "@/modules/weddings/server/queries";
import { parseWebsiteConfig } from "@/modules/website/schema";
import { getTheme } from "@/modules/website/themes/registry";
import { ContentEditor } from "./content-editor";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const wedding = await getWeddingById(weddingId);
  if (!wedding) notFound();

  const config = parseWebsiteConfig(wedding.config);
  const theme = getTheme(wedding.themeId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/weddings/${weddingId}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {wedding.title}
        </Link>
        <a
          href={`/preview/${weddingId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Preview ↗
        </a>
      </div>

      <div>
        <p className="mb-1 font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
          ❁ The website
        </p>
        <h1 className="text-2xl font-semibold">Website content</h1>
        <p className="text-sm text-muted-foreground">
          Fill in each section in English and Hindi. Empty sections are hidden
          on the site.
        </p>
      </div>

      <ContentEditor
        weddingId={weddingId}
        initial={config}
        supports={theme.supports}
        category={theme.category}
      />
    </div>
  );
}
