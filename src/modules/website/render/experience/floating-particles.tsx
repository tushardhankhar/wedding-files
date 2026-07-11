"use client";

import { useEffect, useRef } from "react";

export interface FloatingParticlesProps {
  colors?: string[];
  /** Particles per 100k px² of container area (density). */
  density?: number;
  maxCount?: number;
  minR?: number;
  maxR?: number;
  speed?: number;
  /** "drift" = gentle brownian float; "rise" = float upward (embers/dust). */
  mode?: "drift" | "rise";
  className?: string;
  style?: React.CSSProperties;
}

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  color: string;
  tw: number;
}

/**
 * Ambient floating particles (dust / light motes / embers) painted on a single
 * canvas sized to its container. One rAF loop, low particle count, capped DPR.
 * Fully disabled under prefers-reduced-motion (renders a static frame). Reused
 * by several themes for atmosphere.
 */
export function FloatingParticles({
  colors = ["#ffffff"],
  density = 6,
  maxCount = 60,
  minR = 0.6,
  maxR = 2.2,
  speed = 0.25,
  mode = "drift",
  className,
  style,
}: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let dots: Dot[] = [];
    let raf: number | null = null;
    let dpr = 1;
    let w = 0;
    let h = 0;

    const build = () => {
      const rect = parent.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const n = Math.min(maxCount, Math.round((w * h) / 100000 * density));
      dots = Array.from({ length: n }, () => spawn(true));
    };

    const spawn = (anywhere: boolean): Dot => {
      const ang = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        vx: Math.cos(ang) * speed * (0.5 + Math.random()),
        vy:
          mode === "rise"
            ? -(0.3 + Math.random()) * speed * 2
            : Math.sin(ang) * speed * (0.5 + Math.random()),
        r: minR + Math.random() * (maxR - minR),
        a: 0.15 + Math.random() * 0.5,
        color: colors[(Math.random() * colors.length) | 0],
        tw: Math.random() * 6.283,
      };
    };

    const paint = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        ctx.globalAlpha = d.a * (0.6 + 0.4 * Math.sin(d.tw));
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x * dpr, d.y * dpr, d.r * dpr, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        d.tw += 0.03;
        if (mode === "rise" && d.y < -10) Object.assign(d, spawn(false));
        else {
          if (d.x < -10) d.x = w + 10;
          if (d.x > w + 10) d.x = -10;
          if (d.y < -10) d.y = h + 10;
          if (d.y > h + 10) d.y = -10;
        }
      }
      paint();
      raf = requestAnimationFrame(loop);
    };

    build();
    if (reduce) paint();
    else raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      build();
      if (reduce) paint();
    });
    ro.observe(parent);

    return () => {
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [colors, density, maxCount, minR, maxR, speed, mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      style={style}
    />
  );
}
