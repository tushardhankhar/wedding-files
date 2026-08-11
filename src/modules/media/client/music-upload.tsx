"use client";

import { useRef, useState } from "react";
import { Music, Loader2 } from "lucide-react";
import { createMusicUploadUrlAction } from "@/modules/media/server/presign";
import { MAX_MUSIC_UPLOAD_BYTES } from "@/modules/media/shared/limits";

/**
 * Single-file MP3 uploader for a couple's own background music. No
 * client-side re-encoding (unlike photos → WebP) — the file goes to R2 as-is,
 * so the size/type checks below are the only gate.
 */
export function MusicUpload({
  weddingId,
  onUploaded,
}: {
  weddingId: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.type !== "audio/mpeg") {
      setError("Only MP3 files are supported.");
      return;
    }
    if (file.size > MAX_MUSIC_UPLOAD_BYTES) {
      setError(
        `That file is too large — max ${Math.floor(MAX_MUSIC_UPLOAD_BYTES / 1024 / 1024)}MB.`
      );
      return;
    }

    setBusy(true);
    try {
      const res = await createMusicUploadUrlAction(weddingId, file.type);
      if (!res.ok) throw new Error(res.error);
      const put = await fetch(res.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!put.ok) throw new Error("Upload failed. Please try again.");
      onUploaded(res.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong uploading the track.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-6 text-center text-sm hover:bg-muted/50"
      >
        {busy ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            <span className="text-muted-foreground">Uploading…</span>
          </>
        ) : (
          <>
            <Music className="size-5 text-muted-foreground" aria-hidden />
            <span>
              <span className="font-medium">Click to upload</span> your own track
            </span>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        MP3 only • Max {Math.floor(MAX_MUSIC_UPLOAD_BYTES / 1024 / 1024)}MB •
        Ideally 3–6 min (it&apos;ll loop)
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
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
