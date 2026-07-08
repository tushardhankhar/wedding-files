import Link from "next/link";
import { notFound } from "next/navigation";
import { isCurrentUserAdmin } from "@/modules/auth/server/user";
import { getWeddingById } from "@/modules/weddings/server/queries";
import { updateWeddingAction } from "@/modules/weddings/server/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { THEMES, getTheme } from "@/modules/website/themes/registry";
import { WeddingForm } from "../wedding-form";
import { DeleteWeddingButton } from "./delete-wedding-button";
import { ClientAccess } from "./client-access";
import { ThemePicker } from "./theme-picker";

export default async function WeddingDetailPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const [wedding, isAdmin] = await Promise.all([
    getWeddingById(weddingId),
    isCurrentUserAdmin(),
  ]);
  if (!wedding) notFound();

  const updateAction = updateWeddingAction.bind(null, wedding.id);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to dashboard
        </Link>
        <span className="text-sm text-muted-foreground">/w/{wedding.slug}</span>
      </div>

      <Link href={`/weddings/${wedding.id}/events`} className="block">
        <Card className="relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:border-[color:var(--gold-line)] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-[color:var(--gold)] before:to-[color:var(--gold-deep)] before:opacity-0 before:transition-opacity hover:before:opacity-100">
          <CardHeader>
            <CardTitle className="text-base">Events →</CardTitle>
            <CardDescription>
              Manage the celebrations — Haldi, Mehendi, wedding, reception.
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Link href={`/weddings/${wedding.id}/content`} className="block">
        <Card className="relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:border-[color:var(--gold-line)] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-[color:var(--gold)] before:to-[color:var(--gold-deep)] before:opacity-0 before:transition-opacity hover:before:opacity-100">
          <CardHeader>
            <CardTitle className="text-base">Website content →</CardTitle>
            <CardDescription>
              Story, gallery, families, FAQ and more — in English & Hindi.
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Link href={`/weddings/${wedding.id}/guests`} className="block">
        <Card className="relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:border-[color:var(--gold-line)] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-[color:var(--gold)] before:to-[color:var(--gold-deep)] before:opacity-0 before:transition-opacity hover:before:opacity-100">
          <CardHeader>
            <CardTitle className="text-base">Guests →</CardTitle>
            <CardDescription>
              Groups, members, and which events each group is invited to.
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Website</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Choose a design, then preview the live site."
              : "Preview your live site. The design is set by your planner."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <a
            href={`/preview/${wedding.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            Preview website ↗
          </a>
          {isAdmin ? (
            <ThemePicker
              weddingId={wedding.id}
              currentThemeId={getTheme(wedding.themeId).id}
              themes={THEMES.map((t) => ({
                id: t.id,
                name: t.name,
                description: t.description,
                swatch: t.swatch,
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Current theme:{" "}
              <span className="font-medium text-foreground">
                {getTheme(wedding.themeId).name}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{wedding.title}</CardTitle>
          <CardDescription>Edit the core wedding details.</CardDescription>
        </CardHeader>
        <CardContent>
          <WeddingForm
            action={updateAction}
            canRename={isAdmin}
            values={{
              title: wedding.title,
              partnerOneName: wedding.partnerOneName,
              partnerTwoName: wedding.partnerTwoName,
              eventDate: wedding.eventDate,
            }}
          />
        </CardContent>
      </Card>

      {isAdmin ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client access</CardTitle>
              <CardDescription>
                Hand this wedding to your client to manage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientAccess
                weddingId={wedding.id}
                claimed={wedding.clientId !== null}
              />
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-base">Danger zone</CardTitle>
              <CardDescription>
                Deleting a wedding cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteWeddingButton
                weddingId={wedding.id}
                title={wedding.title}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
