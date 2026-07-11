"use client";

import { useEffect, useRef } from "react";

export interface ConfettiBurstProps {
  /** Increment this to fire a burst. 0 = idle (nothing fires on mount). */
  trigger: number;
  colors?: string[];
  /** Burst origin as a fraction of the viewport. */
  originRatio?: { x: number; y: number };
  count?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  shape: number;
  life: number;
}

/**
 * Lightweight canvas confetti. GPU-cheap: a single fixed canvas, one rAF loop
 * that runs ONLY while particles are alive then stops. Honours reduced-motion
 * by firing a small static-ish burst. Reusable across every theme.
 */
export function ConfettiBurst({
  trigger,
  colors = ["#7C3AED", "#EC4899", "#C6FF00", "#FAFAFA"],
  originRatio = { x: 0.5, y: 0.4 },
  count = 110,
  className,
}: ConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number | null>(null);
  const dpr = useRef(1);
  const fireRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      dpr.current = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr.current;
      canvas.height = window.innerHeight * dpr.current;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      const d = dpr.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ps = particles.current;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.vy += 0.22;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life++;
        if (p.y > window.innerHeight + 40 || p.life > 260) {
          ps.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(p.x * d, p.y * d);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - p.life / 260);
        ctx.fillStyle = p.color;
        const s = p.size * d;
        if (p.shape === 0) ctx.fillRect(-s / 2, -s / 2, s, s * 0.6);
        else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, s / 2, 0, 6.283);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -s / 2);
          ctx.lineTo(s / 2, s / 2);
          ctx.lineTo(-s / 2, s / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (ps.length > 0) raf.current = requestAnimationFrame(loop);
      else {
        raf.current = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    fireRef.current = () => {
      const reduce = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ox = w * originRatio.x;
      const oy = h * originRatio.y;
      const n = reduce ? Math.min(28, count) : count;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 4 + Math.random() * 9;
        particles.current.push({
          x: ox,
          y: oy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 6,
          rot: Math.random() * 6.283,
          vr: (Math.random() - 0.5) * 0.4,
          size: 5 + Math.random() * 7,
          color: colors[i % colors.length],
          shape: i % 3,
          life: 0,
        });
      }
      if (raf.current == null) raf.current = requestAnimationFrame(loop);
    };

    return () => {
      window.removeEventListener("resize", resize);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
      particles.current = [];
    };
  }, [colors, count, originRatio.x, originRatio.y]);

  useEffect(() => {
    if (trigger > 0) fireRef.current?.();
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[70] ${className ?? ""}`}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
