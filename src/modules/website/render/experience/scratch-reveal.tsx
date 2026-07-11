"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface ScratchRevealProps {
  /** The prize — rendered underneath the foil, always in the DOM (so it stays
   * accessible and visible if the canvas fails). */
  children: ReactNode;
  /** Sizes the card, e.g. "h-56 w-full max-w-md". */
  className?: string;
  foilColors?: [string, string];
  foilText?: string;
  foilSubtext?: string;
  foilTextColor?: string;
  /** Fraction scratched (0–1) that auto-clears the rest. Default 0.55. */
  threshold?: number;
  brushRadius?: number;
  radius?: number;
  onReveal?: () => void;
}

/**
 * A realistic digital scratch card. Canvas foil erased with destination-out on
 * pointer (mouse + finger); a coarse cell grid tracks scratched area cheaply
 * (no per-frame getImageData). Past the threshold the remaining foil auto-clears
 * with a fade. Keyboard-accessible (Enter/Space reveals) and reduced-motion
 * aware (instant clear). Reusable — the cloud-shaped baby-shower reveal just
 * passes a rounded className + different colours.
 */
export function ScratchReveal({
  children,
  className,
  foilColors = ["#3a3a3a", "#121212"],
  foilText = "SCRATCH TO REVEAL",
  foilSubtext,
  foilTextColor = "#ffffff",
  threshold = 0.55,
  brushRadius = 24,
  radius = 20,
  onReveal,
}: ScratchRevealProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [clearing, setClearing] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const grid = useRef<Uint8Array | null>(null);
  const dims = useRef({ cols: 0, rows: 0, cell: 16, marked: 0 });
  const doneRef = useRef(false);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const paint = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, foilColors[0]);
      g.addColorStop(1, foilColors[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // diagonal foil shimmer
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      for (let x = -h; x < w; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = foilTextColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const fs = Math.max(13, Math.min(20, w * 0.05));
      ctx.font = `700 ${fs}px system-ui, -apple-system, "Segoe UI", sans-serif`;
      ctx.fillText(foilText, w / 2, h / 2 - (foilSubtext ? 10 : 0));
      if (foilSubtext) {
        ctx.globalAlpha = 0.75;
        ctx.font = `500 ${fs * 0.7}px system-ui, sans-serif`;
        ctx.fillText(foilSubtext, w / 2, h / 2 + fs);
        ctx.globalAlpha = 1;
      }
      const cell = 16;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      grid.current = new Uint8Array(cols * rows);
      dims.current = { cols, rows, cell, marked: 0 };
    };

    paint();
    const ro = new ResizeObserver(() => {
      if (!doneRef.current) paint();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    setRevealed(true);
    onReveal?.();
  };
  const startClear = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (reduceRef.current) {
      finish();
      return;
    }
    setClearing(true);
    window.setTimeout(finish, 520);
  };

  const posOf = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const mark = (x: number, y: number) => {
    const d = dims.current;
    const gr = grid.current;
    if (!gr) return;
    const r = brushRadius;
    const c0 = Math.max(0, Math.floor((x - r) / d.cell));
    const c1 = Math.min(d.cols - 1, Math.floor((x + r) / d.cell));
    const r0 = Math.max(0, Math.floor((y - r) / d.cell));
    const r1 = Math.min(d.rows - 1, Math.floor((y + r) / d.cell));
    for (let cy = r0; cy <= r1; cy++)
      for (let cx = c0; cx <= c1; cx++) {
        const idx = cy * d.cols + cx;
        if (!gr[idx]) {
          gr[idx] = 1;
          d.marked++;
        }
      }
    if (d.marked / (d.cols * d.rows) >= threshold) startClear();
  };
  const eraseAt = (x: number, y: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, 6.283);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    mark(x, y);
  };
  const eraseLine = (x0: number, y0: number, x1: number, y1: number) => {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.floor(dist / (brushRadius * 0.6)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      eraseAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
    }
  };

  const down = (e: React.PointerEvent) => {
    if (revealed) return;
    drawing.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const p = posOf(e);
    last.current = p;
    eraseAt(p.x, p.y);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || revealed) return;
    const p = posOf(e);
    if (last.current) eraseLine(last.current.x, last.current.y, p.x, p.y);
    last.current = p;
  };
  const up = () => {
    drawing.current = false;
    last.current = null;
  };
  const onKey = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !revealed) {
      e.preventDefault();
      startClear();
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`relative select-none overflow-hidden ${className ?? ""}`}
      style={{ borderRadius: radius }}
    >
      <div className="absolute inset-0">{children}</div>
      {!revealed && (
        <canvas
          ref={canvasRef}
          role="button"
          tabIndex={0}
          aria-label={foilText}
          onKeyDown={onKey}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          className="absolute inset-0 h-full w-full cursor-pointer touch-none"
          style={{
            opacity: clearing ? 0 : 1,
            transform: clearing ? "scale(1.04)" : "none",
            transition: "opacity .5s ease, transform .5s ease",
          }}
        />
      )}
    </div>
  );
}
