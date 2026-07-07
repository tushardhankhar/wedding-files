import { redirect } from "next/navigation";

export default function RootPage() {
  // The dashboard guard sends unauthenticated visitors to /login.
  redirect("/dashboard");
}
