"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LoaderOverlay } from "./page-loader";

type ButtonProps = React.ComponentProps<typeof Button>;

/**
 * Submit button for a plain `<form action={serverAction}>` — the shape used
 * where the surrounding markup is a Server Component and there's no
 * useActionState to read a pending flag from. Must be rendered *inside* that
 * form; useFormStatus is how it sees the submission.
 *
 * Pass `overlay` for actions that end in a redirect and leave nothing useful to
 * interact with meanwhile (signing out): the screen is blocked until the new
 * page arrives, instead of looking frozen.
 */
export function PendingSubmit({
  label,
  pendingLabel,
  overlay,
  className,
  variant,
  size,
}: {
  label: React.ReactNode;
  pendingLabel: string;
  overlay?: string;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <Button
        type="submit"
        variant={variant}
        size={size}
        disabled={pending}
        className={className}
      >
        {pending ? <Spinner /> : null}
        {pending ? pendingLabel : label}
      </Button>
      {pending && overlay ? <LoaderOverlay label={overlay} /> : null}
    </>
  );
}
