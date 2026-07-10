"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { createUploadUrlAction } from "@/modules/media/server/presign";
import { compressImage, UnsupportedImageError } from "./compress";

/**
 * Drag-and-drop / click image uploader. For each picked file it: compresses in
 * the browser, asks the server for a presigned PUT URL scoped to this wedding,
 * uploads the bytes straight to R2, then reports the public URL via
 * `onUploaded`. The parent owns the resulting list of URLs.
 */
export function ImageUpload({
  weddingId,
  onUploaded,
  disabled,
}: {
  weddingId: string;
  onUploaded: (url: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadOne(file: File): Promise<void> {
    const { blob, contentType } = await compressImage(file);
    const res = await createUploadUrlAction(weddingId, contentType);
    if (!res.ok) throw new Error(res.error);

    const put = await fetch(res.uploadUrl, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": contentType },
    });
    if (!put.ok) throw new Error("Upload failed. Please try again.");
    onUploaded(res.publicUrl);
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setError(null);
    setBusy((n) => n + list.length);
    await Promise.all(
      list.map((file) =>
        uploadOne(file)
          .catch((e) => {
            setError(
              e instanceof UnsupportedImageError
                ? e.message
                : e instanceof Error
                  ? e.message
                  : "Something went wrong uploading a photo."
            );
          })
          .finally(() => setBusy((n) => n - 1))
      )
    );
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled || undefined}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        className={[
          "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center text-sm transition-colors",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-muted/50",
          dragOver ? "border-primary bg-muted/50" : "border-input",
        ].join(" ")}
      >
        {busy > 0 ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            <span className="text-muted-foreground">
              Uploading {busy} photo{busy > 1 ? "s" : ""}…
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="size-5 text-muted-foreground" aria-hidden />
            <span>
              <span className="font-medium">Click to upload</span> or drag photos
              here
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, WEBP or GIF — any size, we optimize them for you.
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
