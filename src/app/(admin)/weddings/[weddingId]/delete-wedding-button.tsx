"use client";

import { useTransition } from "react";
import { deleteWeddingAction } from "@/modules/weddings/server/actions";
import { Button } from "@/components/ui/button";

export function DeleteWeddingButton({
  weddingId,
  title,
  occasion,
}: {
  weddingId: string;
  title: string;
  /** Lowercase occasion noun for copy, e.g. "wedding", "baby shower". */
  occasion: string;
}) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (
      !window.confirm(
        `Delete "${title}"? This permanently removes the ${occasion} and everything under it.`
      )
    ) {
      return;
    }
    startTransition(() => {
      void deleteWeddingAction(weddingId);
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={onDelete}
      disabled={pending}
    >
      {pending ? "Deleting…" : `Delete ${occasion}`}
    </Button>
  );
}
