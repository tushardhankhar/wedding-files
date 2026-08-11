"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * The machine's voice, synthesised rather than downloaded.
 *
 * A slot machine that spins in silence loses most of what makes it satisfying,
 * but a wedding invitation cannot afford to ship audio files for one gesture on
 * one screen. So every sound here is built from an oscillator and a short burst
 * of noise at play time: no network, no assets, a few hundred bytes of code.
 *
 *   click  — the lever's ratchet, on the way down
 *   clunk  — a reel's stopper catching: a low body thump under a wooden knock
 *   chime  — the reveal, two gold notes a fifth apart
 *
 * The context is created lazily inside the first gesture (browsers refuse one
 * created earlier), reused after that, and closed on unmount. Callers are
 * expected to hold it behind an explicit mute control and to stay silent under
 * `prefers-reduced-motion`.
 */
export function useSlotSound(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);

  useEffect(
    () => () => {
      void ctxRef.current?.close();
      ctxRef.current = null;
    },
    []
  );

  /** The shared audio context — created on the gesture that first needs it. */
  const ctxOf = useCallback((): AudioContext | null => {
    if (muted) return null;
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    const ctx = ctxRef.current;
    // Safari suspends the context whenever the tab loses focus.
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }, [muted]);

  /** 0.4s of white noise, generated once and reused for every knock. */
  const noiseOf = useCallback((ctx: AudioContext): AudioBuffer => {
    if (noiseRef.current) return noiseRef.current;
    const frames = Math.floor(ctx.sampleRate * 0.4);
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    // A deterministic LCG, so the grain is identical on every machine and no
    // Math.random() call ever lands in a render path.
    let seed = 0x2f6e2b1;
    for (let i = 0; i < frames; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      data[i] = (seed / 0x3fffffff - 1) * 0.9;
    }
    noiseRef.current = buf;
    return buf;
  }, []);

  /** A filtered noise burst — the wooden/metallic half of a knock. */
  const knock = useCallback(
    (ctx: AudioContext, at: number, hz: number, gain: number, decay: number) => {
      const src = ctx.createBufferSource();
      src.buffer = noiseOf(ctx);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = hz;
      bp.Q.value = 1.6;
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(gain, at);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + decay);
      src.connect(bp).connect(amp).connect(ctx.destination);
      src.start(at);
      src.stop(at + decay + 0.02);
    },
    [noiseOf]
  );

  /** A pitched body — the thump you feel rather than hear. */
  const body = useCallback(
    (ctx: AudioContext, at: number, from: number, to: number, gain: number, decay: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(from, at);
      osc.frequency.exponentialRampToValueAtTime(to, at + decay);
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, at);
      amp.gain.exponentialRampToValueAtTime(gain, at + 0.008);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + decay);
      osc.connect(amp).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + decay + 0.02);
    },
    []
  );

  /** The lever's ratchet — a dry tick, pitched up as the arm travels. */
  const click = useCallback(
    (step = 0) => {
      const ctx = ctxOf();
      if (!ctx) return;
      const at = ctx.currentTime;
      knock(ctx, at, 1900 + step * 260, 0.16, 0.035);
      body(ctx, at, 320, 170, 0.05, 0.05);
    },
    [ctxOf, knock, body]
  );

  /** A reel's stopper catching. `delay` schedules it against the animation. */
  const clunk = useCallback(
    (delay = 0, weight = 1) => {
      const ctx = ctxOf();
      if (!ctx) return;
      const at = ctx.currentTime + delay;
      // the stopper
      knock(ctx, at, 780, 0.3 * weight, 0.09);
      knock(ctx, at + 0.012, 2400, 0.12 * weight, 0.04);
      // the cabinet answering it
      body(ctx, at, 132, 58, 0.3 * weight, 0.2);
    },
    [ctxOf, knock, body]
  );

  /** The reveal — two gold notes, a fifth apart, brief and unsweetened. */
  const chime = useCallback(
    (delay = 0) => {
      const ctx = ctxOf();
      if (!ctx) return;
      const at = ctx.currentTime + delay;
      [
        [1174.7, 0.0, 0.07],
        [1760.0, 0.09, 0.055],
      ].forEach(([hz, offset, gain]) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = hz;
        const amp = ctx.createGain();
        amp.gain.setValueAtTime(0.0001, at + offset);
        amp.gain.exponentialRampToValueAtTime(gain, at + offset + 0.02);
        amp.gain.exponentialRampToValueAtTime(0.0001, at + offset + 1.1);
        osc.connect(amp).connect(ctx.destination);
        osc.start(at + offset);
        osc.stop(at + offset + 1.15);
      });
    },
    [ctxOf]
  );

  return { click, clunk, chime };
}
