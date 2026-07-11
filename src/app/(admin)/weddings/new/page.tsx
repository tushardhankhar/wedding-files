import Link from "next/link";
import { CreateWizard } from "./create-wizard";

export default function NewInvitationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">New invitation</h1>
        <p className="text-sm text-muted-foreground">
          Choose an occasion, pick a theme, then fill in the details.
        </p>
      </div>
      <CreateWizard />
    </div>
  );
}
