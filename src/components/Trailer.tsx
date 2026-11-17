"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

// Official GTA VI launch trailer on Rockstar Games' YouTube channel (@RockstarGames).
// Verified 18 Nov 2026 via YouTube oEmbed: author "Rockstar Games", embedding enabled.
export const TRAILER_ID = "rz1B4B2yBZY";
const THUMB = (q: "hqdefault" | "sddefault" | "maxresdefault") =>
  `https://i.ytimg.com/vi/${TRAILER_ID}/${q}.jpg`;

function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Full-screen player. The YouTube iframe only loads once someone asks for it. */
export function TrailerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fade-in fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/95 p-3 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="GTA VI launch trailer"
    >
      <button
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Close trailer"
      />
      <div className="relative w-full max-w-5xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-sm tracking-[0.3em] text-teal">
            OFFICIAL LAUNCH TRAILER
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white/10 text-ink hover:bg-white/20"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-[0_0_80px_rgba(255,61,129,0.35)] ring-1 ring-pink/40">
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${TRAILER_ID}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
            title="Grand Theft Auto VI Launch Trailer (Rockstar Games)"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          Video by Rockstar Games on YouTube. This site is an unofficial fan
          page.
        </p>
      </div>
    </div>
  );
}

/** Small pill for the hero. */
export function TrailerPill({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 py-1.5 pl-1.5 pr-4 text-sm font-semibold backdrop-blur transition hover:border-pink/70 active:scale-95"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-pink text-white shadow-[0_0_14px_#ff3d81] transition group-hover:scale-110">
        <PlayGlyph className="h-3.5 w-3.5 translate-x-px" />
      </span>
      Watch the launch trailer
    </button>
  );
}

/** Cinematic card section with the video's own YouTube preview. */
export function TrailerSection({ onOpen }: { onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <section className="panel overflow-hidden rounded-3xl">
      <button
        onClick={onOpen}
        className="group relative block aspect-video w-full overflow-hidden bg-black text-left"
        aria-label="Play the GTA VI launch trailer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={THUMB("hqdefault")}
          srcSet={`${THUMB("hqdefault")} 480w, ${THUMB("sddefault")} 640w, ${THUMB("maxresdefault")} 1280w`}
          sizes="(min-width: 1024px) 1100px, 80vw"
          alt="Grand Theft Auto VI launch trailer preview"
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-pink/90 text-white shadow-[0_0_40px_#ff3d81] transition group-hover:scale-110 sm:h-24 sm:w-24">
          <span className="pulse-ring absolute inset-0 rounded-full" />
          <PlayGlyph className="h-9 w-9 translate-x-0.5 sm:h-11 sm:w-11" />
        </span>
      </button>
      <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
        <div>
          <p className="font-display text-xs tracking-[0.3em] text-teal">
            OFFICIAL · ROCKSTAR GAMES
          </p>
          <h2 className="font-display mt-1 text-3xl uppercase leading-none tracking-wide sm:text-4xl">
            Watch the <span className="sunset-text">launch trailer</span>
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            Then tell your boss about that fever.
          </p>
        </div>
        <button
          onClick={onOpen}
          className="btn-neon font-display hidden shrink-0 rounded-xl px-5 py-3 text-lg uppercase tracking-wider text-white sm:block"
        >
          Play
        </button>
      </div>
    </section>
  );
}
