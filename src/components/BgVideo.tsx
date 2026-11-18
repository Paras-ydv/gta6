"use client";

import { useEffect, useRef, useState } from "react";

// Official GTA VI launch trailer on Rockstar Games' YouTube channel (@RockstarGames).
// Verified 18 Nov 2026 via YouTube oEmbed: author "Rockstar Games", embedding enabled.
const VIDEO_ID = "rz1B4B2yBZY";
const YT_ORIGIN = "https://www.youtube-nocookie.com";

type NetInfo = { saveData?: boolean; effectiveType?: string };

/**
 * Muted, looping trailer behind the whole page. It loads after first paint and only
 * fades in once YouTube reports it is actually playing, so if autoplay is blocked
 * (Low Power Mode, data saver) the CSS scene underneath simply stays visible.
 */
function YouTubeBg() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Decide whether to load at all, then wait until the page has painted.
  useEffect(() => {
    const net = (navigator as Navigator & { connection?: NetInfo }).connection;
    if (net?.saveData || /(^|-)2g$/.test(net?.effectiveType ?? "")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      loop: "1",
      playlist: VIDEO_ID, // required for loop to work on a single video
      playsinline: "1",
      rel: "0",
      disablekb: "1",
      iv_load_policy: "3",
      cc_load_policy: "0", // no subtitles over the page (also enforced below)
      hl: "en",
      fs: "0",
      enablejsapi: "1",
      origin: location.origin,
    });
    const load = () => setSrc(`${YT_ORIGIN}/embed/${VIDEO_ID}?${params}`);
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    const start = () =>
      w.requestIdleCallback
        ? w.requestIdleCallback(load, { timeout: 2500 })
        : setTimeout(load, 800);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
  }, []);

  // Talk to the player over postMessage (no YouTube API script needed).
  useEffect(() => {
    if (!src) return;
    const post = (msg: object) =>
      frame.current?.contentWindow?.postMessage(JSON.stringify(msg), YT_ORIGIN);
    const command = (func: string, args: unknown[] = []) =>
      post({ event: "command", func, args });

    // Never show subtitles over the page, even if the viewer's own YouTube
    // settings switch them on. Re-applied for 30s in case captions load late.
    const killCaptions = () => {
      command("unloadModule", ["captions"]);
      command("unloadModule", ["cc"]);
      command("setOption", ["captions", "track", {}]);
    };
    const captionGuard = setInterval(killCaptions, 2000);
    const captionGuardStop = setTimeout(
      () => clearInterval(captionGuard),
      30000,
    );

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGIN || typeof e.data !== "string") return;
      try {
        const data = JSON.parse(e.data);
        const state =
          data?.info?.playerState ??
          (data?.event === "onStateChange" ? data.info : undefined);
        if (state === 1) {
          setPlaying(true);
          killCaptions();
        }
      } catch {}
    };
    const onVisibility = () =>
      command(document.hidden ? "pauseVideo" : "playVideo");
    const onToggle = (e: Event) => {
      const wantSound = (e as CustomEvent<boolean>).detail;
      command(wantSound ? "unMute" : "mute");
      if (wantSound) command("playVideo");
      setMuted(!wantSound);
    };

    window.addEventListener("message", onMessage);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("bgvideo:sound", onToggle);
    // Ask the player to start sending state updates; retry until it answers.
    const hello = setInterval(
      () => post({ event: "listening", id: 1, channel: "widget" }),
      500,
    );
    return () => {
      clearInterval(hello);
      clearInterval(captionGuard);
      clearTimeout(captionGuardStop);
      window.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("bgvideo:sound", onToggle);
    };
  }, [src]);

  useEffect(() => {
    document.documentElement.dataset.video = playing ? "on" : "off";
  }, [playing]);

  if (!src) return null;

  return (
    <>
      <div
        aria-hidden
        className={`bg-video pointer-events-none fixed inset-0 -z-10 overflow-hidden ${playing ? "is-playing" : ""}`}
      >
        <iframe
          ref={frame}
          src={src}
          title="Grand Theft Auto VI launch trailer (Rockstar Games), playing in the background"
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
          className="bg-video-frame"
        />
        {/* tint + scanlines keep the counter readable over bright footage */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,6,32,0.55)_0%,rgba(11,6,32,0.35)_40%,rgba(11,6,32,0.75)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(255,61,129,0.18)_100%)] mix-blend-screen" />
        <div className="scanlines absolute inset-0" />
        <div className="vignette absolute inset-0" />
      </div>

      {playing && (
        <button
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("bgvideo:sound", { detail: muted }),
            )
          }
          className="fade-in fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3.5 py-2 text-xs font-semibold text-ink backdrop-blur transition hover:border-pink/70 active:scale-95"
          aria-label={muted ? "Turn trailer sound on" : "Mute trailer"}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            {muted ? (
              <path d="m23 9-6 6M17 9l6 6" />
            ) : (
              <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
            )}
          </svg>
          {muted ? "Sound on" : "Mute"}
          <span className="hidden text-muted sm:inline">
            · Trailer by Rockstar Games
          </span>
        </button>
      )}
    </>
  );
}

// Self-hosted clip you have the rights to (e.g. your own gameplay recording).
// Set NEXT_PUBLIC_BG_VIDEO_URL=/bg.mp4 (file in /public) or a CDN URL to use it.
const LOCAL_SRC = process.env.NEXT_PUBLIC_BG_VIDEO_URL;
const LOCAL_POSTER = process.env.NEXT_PUBLIC_BG_VIDEO_POSTER;

function LocalBg({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const net = (navigator as Navigator & { connection?: NetInfo }).connection;
    if (net?.saveData || /(^|-)2g$/.test(net?.effectiveType ?? "")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const go = () => setAllowed(true);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.video = playing ? "on" : "off";
    const v = video.current;
    if (!v) return;
    const onVis = () =>
      document.hidden ? v.pause() : v.play().catch(() => {});
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [playing]);

  if (!allowed) return null;
  return (
    <>
      <div
        aria-hidden
        className={`bg-video pointer-events-none fixed inset-0 -z-10 overflow-hidden ${playing ? "is-playing" : ""}`}
      >
        <video
          ref={video}
          src={src}
          poster={LOCAL_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,6,32,0.55)_0%,rgba(11,6,32,0.35)_40%,rgba(11,6,32,0.75)_100%)]" />
        <div className="scanlines absolute inset-0" />
        <div className="vignette absolute inset-0" />
      </div>
      {playing && (
        <button
          onClick={() => {
            const v = video.current;
            if (!v) return;
            v.muted = !v.muted;
            setMuted(v.muted);
          }}
          className="fade-in fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 rounded-full border border-white/20 bg-black/55 px-3.5 py-2 text-xs font-semibold text-ink backdrop-blur hover:border-pink/70"
        >
          {muted ? "Sound on" : "Mute"}
        </button>
      )}
    </>
  );
}

/** Background video: your own clip if NEXT_PUBLIC_BG_VIDEO_URL is set, otherwise the official YouTube trailer. */
export default function BgVideo() {
  return LOCAL_SRC ? <LocalBg src={LOCAL_SRC} /> : <YouTubeBg />;
}
