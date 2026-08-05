"use client";

import { useEffect, useRef, useState } from "react";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export interface LoopRange {
  start: number;
  end: number;
}

/**
 * Lets the client pick which part of a track loops on the guest site — drag
 * the two handles over the waveform, preview the trimmed loop, done. Decoding
 * (for the waveform bars and the track's real duration) uses the Web Audio
 * API purely for analysis, not playback, so it needs no user gesture and
 * works the same for a library track or a freshly uploaded one.
 *
 * Callers must pass `key={url}` — swapping tracks should remount this
 * (fresh waveform, fresh duration) rather than reuse state across two
 * completely different files.
 */
export function WaveformTrimmer({
  url,
  value,
  onChange,
}: {
  url: string;
  value?: LoopRange;
  onChange: (v: LoopRange) => void;
}) {
  const [duration, setDuration] = useState<number | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"start" | "end" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioCtx();
        const audioBuffer = await ctx.decodeAudioData(buf);
        if (cancelled) return;

        const data = audioBuffer.getChannelData(0);
        const BUCKETS = 200;
        const bucketSize = Math.max(1, Math.floor(data.length / BUCKETS));
        const result: number[] = [];
        for (let i = 0; i < BUCKETS; i++) {
          let max = 0;
          const start = i * bucketSize;
          for (let j = start; j < start + bucketSize && j < data.length; j++) {
            const v = Math.abs(data[j]);
            if (v > max) max = v;
          }
          result.push(max);
        }
        setPeaks(result);
        setDuration(audioBuffer.duration);
        ctx.close();
      } catch {
        if (!cancelled) setError("Could not load a waveform for this track.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  const start = value?.start ?? 0;
  const end = value?.end ?? duration ?? 0;

  // Stop-and-loop the preview at the current selection — the same behaviour
  // the guest-facing player uses for a trimmed track.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      if (audio.currentTime >= end) audio.currentTime = start;
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [start, end]);

  function ratioFromClientX(clientX: number): number {
    const el = areaRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }

  function handleMove(clientX: number) {
    if (!dragRef.current || !duration) return;
    const t = ratioFromClientX(clientX) * duration;
    if (dragRef.current === "start") {
      onChange({ start: clamp(t, 0, end - 1), end });
    } else {
      onChange({ start, end: clamp(t, start + 1, duration) });
    }
  }

  function togglePreview() {
    const audio = audioRef.current;
    if (!audio) return;
    if (previewing) {
      audio.pause();
      setPreviewing(false);
      return;
    }
    audio.currentTime = start;
    audio.play().catch(() => {});
    setPreviewing(true);
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }
  if (!peaks || !duration) {
    return <p className="text-sm text-muted-foreground">Loading waveform…</p>;
  }

  const startPct = (start / duration) * 100;
  const endPct = (end / duration) * 100;

  return (
    <div className="space-y-2">
      <audio
        ref={audioRef}
        src={url}
        preload="none"
        onEnded={() => setPreviewing(false)}
      />

      <div
        ref={areaRef}
        className="relative h-16 w-full touch-none select-none rounded-md border bg-muted/40"
        onPointerMove={(e) => handleMove(e.clientX)}
        onPointerUp={(e) => {
          dragRef.current = null;
          areaRef.current?.releasePointerCapture(e.pointerId);
        }}
      >
        <div className="absolute inset-0 flex items-center gap-px px-1">
          {peaks.map((p, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-foreground/30"
              style={{ height: `${Math.max(4, p * 100)}%` }}
            />
          ))}
        </div>

        {/* Dim the parts outside the selection. */}
        <div
          className="absolute inset-y-0 left-0 bg-background/70"
          style={{ width: `${startPct}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-background/70"
          style={{ width: `${100 - endPct}%` }}
        />
        <div
          className="absolute inset-y-0 border-x-2 border-primary"
          style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
        />

        <div
          role="slider"
          aria-label="Loop start"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={start}
          aria-valuetext={formatTime(start)}
          className="absolute inset-y-0 -ml-1.5 w-3 cursor-ew-resize touch-none"
          style={{ left: `${startPct}%` }}
          onPointerDown={(e) => {
            dragRef.current = "start";
            areaRef.current?.setPointerCapture(e.pointerId);
          }}
        >
          <div className="mx-auto h-full w-1 rounded-full bg-primary" />
        </div>
        <div
          role="slider"
          aria-label="Loop end"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={end}
          aria-valuetext={formatTime(end)}
          className="absolute inset-y-0 -ml-1.5 w-3 cursor-ew-resize touch-none"
          style={{ left: `${endPct}%` }}
          onPointerDown={(e) => {
            dragRef.current = "end";
            areaRef.current?.setPointerCapture(e.pointerId);
          }}
        >
          <div className="mx-auto h-full w-1 rounded-full bg-primary" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">{formatTime(start)}</span>
        <button
          type="button"
          onClick={togglePreview}
          className="font-medium text-primary hover:underline"
        >
          {previewing ? "Stop preview" : "Preview loop"}
        </button>
        <span className="tabular-nums">{formatTime(end)}</span>
      </div>
    </div>
  );
}
