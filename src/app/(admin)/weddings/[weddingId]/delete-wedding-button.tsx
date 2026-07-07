"use client";

import { useTransition } from "react";
import { deleteWeddingAction } from "@/modules/weddings/server/actions";
import { Button } from "@/components/ui/button";

export function DeleteWeddingButton({
  weddingId,
  title,
}: {
  weddingId: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (
      !window.confirm(
        `Delete "${title}"? This permanently removes the wedding and everything under it.`
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
      {pending ? "Deleting…" : "Delete wedding"}
    </Button>
  );
}
