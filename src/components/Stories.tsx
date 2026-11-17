"use client";

import { useState } from "react";
import { Blip, Icon } from "./Icon";
import { fmt, locationLabel, whyIcon, whyLabel, type Story } from "@/lib/data";

const ago = (t: number) => {
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function Stories({ stories, onWrite }: { stories: Story[]; onWrite: () => void }) {
  const [hidden, setHidden] = useState<string[]>([]);

  async function report(id: string) {
    setHidden((h) => [...h, id]);
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  const visible = stories.filter((s) => !hidden.includes(s.id));

  return (
    <section className="panel rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs tracking-[0.3em] text-teal">CONFESSIONS</p>
          <h2 className="font-display mt-1 text-3xl uppercase tracking-wide">Bunk stories</h2>
          <p className="mt-1 text-sm text-pink">
            {visible.length ? "Anonymous. 140 characters. Your boss will never know." : "No stories yet. Write the first one when you bunk."}
          </p>
        </div>
        <Blip name="chat" tone="pink" />
      </div>

      {visible.length > 0 && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {visible.map((s) => (
            <li key={s.id} className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-xs">
                <span className={`mission text-sm uppercase ${s.s === "bunk" ? "neon-teal" : "busted"}`}>
                  {s.s === "bunk" ? "Bunked" : "Busted"}
                </span>
                <span className="font-display tracking-wide text-ink/80">#{fmt(s.n)}</span>
                <span className="truncate text-muted">· {locationLabel(s.co, s.c)}</span>
              </div>
              <p className="mt-2 text-[15px] leading-snug text-ink">&ldquo;{s.text}&rdquo;</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name={whyIcon(s.w)} className="h-3.5 w-3.5 text-pink" />
                  {whyLabel(s.w)} · {ago(s.t)}
                </span>
                <button
                  onClick={() => report(s.id)}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-muted/70 hover:bg-white/10 hover:text-ink"
                  aria-label="Report this story"
                >
                  <Icon name="flag" className="h-3.5 w-3.5" /> Report
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onWrite}
        className="mt-5 w-full rounded-2xl border border-pink/50 bg-pink/10 py-3 font-semibold text-pink transition hover:bg-pink/20 active:scale-[0.98]"
      >
        Add yours
      </button>
    </section>
  );
}
