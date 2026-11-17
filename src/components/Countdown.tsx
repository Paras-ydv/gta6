"use client";

import { useSyncExternalStore } from "react";
import { fmt, launchDate } from "@/lib/data";
import { Icon } from "./Icon";

const pad = (n: number) => String(n).padStart(2, "0");

// A 1-second clock. Renders nothing on the server so there is no hydration mismatch.
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000) * 1000;

export default function Countdown({ today }: { today: number | null }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, () => null);

  if (now === null) return <div className="h-9" />;

  const diff = launchDate().getTime() - now;

  if (diff <= 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-teal/50 bg-navy/70 px-4 py-2 text-sm font-semibold backdrop-blur">
        <Icon name="siren" className="h-4 w-4 text-[#ff4d4d]" />
        <span>
          GTA 6 is out. <span className="neon-teal font-display text-base tracking-wide">{fmt(today ?? 0)}</span>{" "}
          people chose violence today
        </span>
      </div>
    );
  }

  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${h}h ${pad(m)}m ${pad(sec)}s`;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-pink/50 bg-navy/70 px-4 py-2 text-sm font-semibold backdrop-blur">
      <span className="text-muted">GTA 6 drops in</span>
      <span className="neon-teal font-display text-lg tabular-nums tracking-wider">{parts}</span>
    </div>
  );
}
