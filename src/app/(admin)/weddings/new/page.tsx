import Link from "next/link";
import { createWeddingAction } from "@/modules/weddings/server/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WeddingForm } from "../wedding-form";

export default function NewWeddingPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New wedding</CardTitle>
          <CardDescription>
            A shareable URL is generated automatically from the title.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeddingForm action={createWeddingAction} submitLabel="Create wedding" />
        </CardContent>
      </Card>
    </div>
  );
}
