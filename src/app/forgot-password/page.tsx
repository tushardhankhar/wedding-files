import Link from "next/link";
import { InvitationShell } from "@/components/brand/invitation-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <>
      <Link
        href="/login"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white"
      >
        ← Back to sign in
      </Link>
      <InvitationShell
        title="JASHN"
        subtitle="Reset your password."
        footer="Remembered it? Head back to sign in."
      >
        <ForgotPasswordForm />
      </InvitationShell>
    </>
  );
}
