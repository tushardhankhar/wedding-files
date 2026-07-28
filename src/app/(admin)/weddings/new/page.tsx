import { CreateWizard } from "./create-wizard";
import { NavLink } from "@/components/brand/nav-link";

export default function NewInvitationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <NavLink
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to dashboard
        </NavLink>
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
