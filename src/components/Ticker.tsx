"use client";

import { Icon } from "./Icon";
import { fmt, locationLabel, whyLabel, type RecentEntry } from "@/lib/data";

const HEADLINES = [
  "HR departments worldwide on high alert",
  "Mothers report sudden spike in fever cases",
  "Professors say the attendance sheet looks suspicious",
  "Wifi repair guys have never been this busy",
  "Local cousin gets married for the 4th time this year",
  "Dentists confused by record number of appointments",
];

const ago = (t: number) => {
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function Ticker({ recent }: { recent: RecentEntry[] }) {
  const items =
    recent.length > 0
      ? recent.map((r) => ({
          tag: r.s === "bunk" ? "BUNKED" : "BUSTED",
          bunk: r.s === "bunk",
          text: `#${fmt(r.n)} · ${locationLabel(r.co, r.c)} · ${whyLabel(r.w)} · ${ago(r.t)}`,
        }))
      : HEADLINES.map((text) => ({ tag: "", bunk: true, text }));
  const loop = [...items, ...items];

  return (
    <div className="relative flex items-stretch overflow-hidden border-y border-pink/40 bg-navy/85 backdrop-blur">
      <div className="z-10 flex shrink-0 items-center gap-1.5 bg-pink px-3 font-display text-sm tracking-widest text-navy">
        <span className="live-dot h-2 w-2 rounded-full bg-navy" />
        {recent.length ? "LIVE" : "NEWS"}
      </div>
      <div className="relative flex-1 overflow-hidden py-2">
        <div
          className="marquee flex w-max gap-8 whitespace-nowrap pl-6 text-sm font-medium text-ink/90"
          style={{ ["--marquee-duration" as string]: `${Math.max(24, items.length * 6)}s` }}
        >
          {loop.map((it, i) => (
            <span key={i} className="flex items-center gap-8">
              <span className="flex items-center gap-2">
                {it.tag && (
                  <span className={`font-display tracking-wider ${it.bunk ? "text-teal" : "text-[#ff4d4d]"}`}>{it.tag}</span>
                )}
                {it.text}
              </span>
              <Icon name="star" fill className="h-3 w-3 text-sun" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
