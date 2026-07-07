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
import { WeddingForm } from "../wedding-form";
import { DeleteWeddingButton } from "./delete-wedding-button";
import { ClientAccess } from "./client-access";

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
