import { loadGuestSite } from "@/modules/guest-access/server/guest-site";
import { getTheme } from "@/modules/website/themes/registry";
import { buildSiteProps } from "@/modules/website/render/build";
import { WebsiteView } from "@/modules/website/render/website-view";
import { Lotus } from "@/components/brand/motifs";

// The live guest site: the Phase 3 renderer fed the Phase 6 authorized data,
// so a guest sees the full wedding but ONLY the events their group is invited to.
export default async function GuestHome({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ invalid?: string }>;
}) {
  const { slug } = await params;
  const { invalid } = await searchParams;
  const data = await loadGuestSite(slug);

  if (!data) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-3">
          <Lotus className="mx-auto h-10 text-[color:var(--gold-deep)]" />
          <h1 className="font-heading text-2xl font-semibold">
            A private invitation
          </h1>
          <p className="text-sm text-muted-foreground">
            {invalid
              ? "That invitation link is invalid or has expired. Please ask your host for a fresh link."
              : "Please open the personal invitation link you were sent to view this wedding."}
          </p>
        </div>
      </main>
    );
  }

  const theme = getTheme(data.wedding.themeId);
  const props = buildSiteProps(data.wedding, data.events);

  if (data.mode === "share") {
    return (
      <WebsiteView
        theme={theme}
        {...props}
        chip={{ en: "Guest" }}
        selfRsvp={{
          slug,
          events: data.events.map((e) => ({ id: e.id, name: e.name })),
        }}
      />
    );
  }

  return (
    <WebsiteView
      theme={theme}
      {...props}
      chip={{ en: data.label }}
      rsvp={{ slug, guests: data.guests, statuses: data.rsvps }}
    />
  );
}
