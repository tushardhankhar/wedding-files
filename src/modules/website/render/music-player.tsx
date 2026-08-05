"use client";

import { useEffect, useRef, useState } from "react";
import type { WebsiteConfig } from "../schema";
import { getMusicTrack } from "../music/registry";

/**
 * Background-music toggle, shared by every themed guest site (mounted once in
 * `SiteView`, like `GoToTop`). Renders nothing when the client turned music
 * off or picked no track.
 *
 * "On by default" only controls the toggle's starting visual state — browsers
 * block autoplay-with-sound regardless of what we ask for, so actual playback
 * always waits for the guest's first tap/keypress anywhere on the page (or a
 * direct tap on the toggle itself, which is always allowed to start audio).
 *
 * Stacked directly above `GoToTop` on the same corner (rather than the
 * opposite one) so the two persistent controls read as one family instead of
 * competing for their own corners — and so neither collides with the
 * Next.js dev-mode indicator, which already owns the bottom-left.
 */
export function MusicPlayer({
  config,
  bg = "#221c33",
  ring = "#b8912f",
}: {
  config: WebsiteConfig;
  bg?: string;
  ring?: string;
}) {
  const music = config.music;
  const url =
    music?.source === "custom" ? music.customUrl : getMusicTrack(music?.trackId)?.url;
  // A trimmed loop is client-controlled JS (seek back at `loopEnd`) instead
  // of the native `loop` attribute, which only ever loops the whole file.
  const trimmed =
    music?.loopStart != null && music?.loopEnd != null && music.loopEnd > music.loopStart;
  const loopStart = trimmed ? music!.loopStart! : 0;
  const loopEnd = trimmed ? music!.loopEnd! : undefined;
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function seekIntoRange(audio: HTMLAudioElement) {
    if (!trimmed) return;
    if (audio.currentTime < loopStart || audio.currentTime >= loopEnd!) {
      audio.currentTime = loopStart;
    }
  }

  useEffect(() => {
    if (!music?.enabled || !url) return;
    const audio = audioRef.current;
    if (!audio) return;

    const attemptPlay = () => {
      seekIntoRange(audio);
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          // Blocked until a real user gesture — the listeners below retry on
          // the guest's first tap/keypress anywhere on the page.
        });
    };
    attemptPlay();
    window.addEventListener("pointerdown", attemptPlay, { once: true });
    window.addEventListener("keydown", attemptPlay, { once: true });
    return () => {
      window.removeEventListener("pointerdown", attemptPlay);
      window.removeEventListener("keydown", attemptPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music?.enabled, url, trimmed, loopStart, loopEnd]);

  // Loop the trimmed segment: jump back to `loopStart` once playback reaches
  // `loopEnd`, instead of letting the whole file play through.
  useEffect(() => {
    if (!trimmed) return;
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      if (audio.currentTime >= loopEnd!) audio.currentTime = loopStart;
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [trimmed, loopStart, loopEnd]);

  if (!music?.enabled || !url) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      seekIntoRange(audio);
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <audio ref={audioRef} src={url} loop={!trimmed} preload="none" />
      <button
        type="button"
        aria-label={playing ? "Mute background music" : "Play background music"}
        aria-pressed={playing}
        onClick={toggle}
        className={`w-music${playing ? " w-music-on" : ""}`}
        style={{
          background: bg,
          boxShadow: `0 0 0 1px ${ring}66, 0 12px 28px -10px rgba(0,0,0,0.55)`,
        }}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke={ring} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke={ring} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </>
  );
}
