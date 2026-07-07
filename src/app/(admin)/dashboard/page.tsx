import Link from "next/link";
import { listWeddings } from "@/modules/weddings/server/queries";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDate(iso: string | null): string {
  if (!iso) return "Date not set";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const weddings = await listWeddings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your weddings</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your wedding websites.
          </p>
        </div>
        <Link href="/weddings/new" className={buttonVariants()}>
          New wedding
        </Link>
      </div>

      {weddings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No weddings yet</CardTitle>
            <CardDescription>
              Create your first wedding to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {weddings.map((w) => (
            <li key={w.id}>
              <Link href={`/weddings/${w.id}`} className="block">
                <Card className="transition-colors hover:border-foreground/30">
                  <CardHeader>
                    <CardTitle>{w.title}</CardTitle>
                    <CardDescription>
                      {formatDate(w.eventDate)} · /w/{w.slug}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
