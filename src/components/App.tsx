"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Counter from "./Counter";
import Countdown from "./Countdown";
import Leaderboards from "./Leaderboards";
import Stories from "./Stories";
import Ticker from "./Ticker";
import News from "./News";
import BunkFlow, { STORAGE_KEY } from "./BunkFlow";
import { Icon, Stars } from "./Icon";
import {
  fmt,
  isCity,
  isCountry,
  isExcuse,
  isReason,
  locationLabel,
  whyLabel,
  type BunkResult,
  type Side,
  type Stats,
} from "@/lib/data";

const POLL_MS = 5000;

export type Shared = {
  n: number;
  side: Side;
  e?: string;
  co?: string;
  c?: string;
};

// This device's result lives in localStorage; read it as an external store.
const subscribeStorage = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener("bunked", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("bunked", cb);
  };
};
const readStorage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // private mode / blocked storage
  }
};

export default function App({ shared }: { shared?: Shared }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sessionResult, setSessionResult] = useState<BunkResult | null>(null);
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<Side>("bunk");

  const raw = useSyncExternalStore(subscribeStorage, readStorage, () => null);
  const stored = useMemo<BunkResult | null>(() => {
    try {
      const r = raw ? JSON.parse(raw) : null;
      return r?.side ? r : null;
    } catch {
      return null;
    }
  }, [raw]);
  const result = stored ?? sessionResult;

  // Poll live stats every 5s while the tab is visible.
  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (res.ok && alive) {
          const next: Stats = await res.json();
          // Never move backwards because of a stale edge-cached response.
          setStats((prev) =>
            prev && prev.total + prev.stuck > next.total + next.stuck
              ? prev
              : next,
          );
        }
      } catch {}
    };
    load();
    const id = setInterval(load, POLL_MS);
    const onVis = () => !document.hidden && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const onDone = useCallback((r: BunkResult, totals?: Stats) => {
    setSessionResult(r);
    window.dispatchEvent(new Event("bunked"));
    if (totals) setStats(totals);
  }, []);
  const onClose = useCallback(() => setOpen(false), []);
  const start = (s: Side) => {
    setSide(s);
    setOpen(true);
  };

  const total = stats?.total ?? null;
  const sideTotal = shared
    ? shared.side === "bunk"
      ? stats?.total
      : stats?.stuck
    : undefined;
  const showShared =
    shared && sideTotal !== undefined && shared.n >= 1 && shared.n <= sideTotal;
  const sharedWhy =
    shared?.e && (isExcuse(shared.e) || isReason(shared.e))
      ? whyLabel(shared.e)
      : null;
  const sharedWhere =
    shared?.co && isCountry(shared.co)
      ? locationLabel(shared.co, shared.c && isCity(shared.c) ? shared.c : null)
      : null;

  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <div className="leading-none">
          <span className="font-script neon-pink flicker block -rotate-6 text-2xl">
            bunked
          </span>
          <span className="font-display -mt-1 block text-lg tracking-[0.2em] text-ink">
            FOR GTA 6
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Stars
            count={Math.min(5, Math.ceil((total ?? 0) / 1000))}
            className="hidden h-4 w-4 sm:block"
          />
          <div className="flex items-center gap-2 rounded-full border border-teal/40 bg-navy/60 px-3 py-1.5 text-xs font-bold tracking-widest text-teal backdrop-blur">
            <span className="live-dot h-2 w-2 rounded-full bg-pink shadow-[0_0_8px_#ff3d81]" />
            LIVE
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl">
        <section className="flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center px-4 pb-10 pt-6 text-center sm:px-6">
          {showShared && (
            <div className="fade-in mb-5 max-w-md rounded-2xl border border-teal/40 bg-navy/75 px-4 py-3 text-sm backdrop-blur">
              <span className="font-display text-base tracking-wide text-teal">
                #{fmt(shared.n)}
              </span>{" "}
              {shared.side === "bunk" ? "bunked" : "got busted"}
              {sharedWhy ? <> with &ldquo;{sharedWhy}&rdquo;</> : null}
              {sharedWhere ? <> from {sharedWhere}</> : null}.{" "}
              <span className="font-semibold text-pink">Your turn.</span>
            </div>
          )}

          <Countdown today={stats?.today ?? null} />

          <div className="hero-scrim mt-6 flex flex-col items-center">
            <div>
              <Counter value={total} />
            </div>
            <h1 className="font-display -mt-1 text-[8.5vw] uppercase leading-tight tracking-wide sm:text-5xl">
              {total === 1 ? "person is" : "people are"}{" "}
              <span className="neon-pink">bunking</span> for GTA 6
            </h1>
            <p className="text-legible mt-2 max-w-sm text-sm text-ink/85">
              {total === 0
                ? "Starts at zero. No fake numbers. Be the first legend on Earth."
                : "Real taps from around the world. Skipping college & office, one fake fever at a time."}
            </p>
          </div>

          {result ? (
            <>
              <button
                onClick={() => setOpen(true)}
                className={`${result.side === "bunk" ? "btn-neon" : "btn-busted"} pulse-ring font-display mt-8 w-full max-w-sm rounded-2xl px-6 py-5 text-[1.7rem] uppercase tracking-wider text-white`}
              >
                {result.side === "bunk" ? "Bunked" : "Busted"} · #
                {fmt(result.number)}
              </button>
              <button
                onClick={() => setOpen(true)}
                className="mt-3 text-sm font-semibold text-teal underline-offset-4 hover:underline"
              >
                Share yours again →
              </button>
            </>
          ) : (
            <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
              <button
                onClick={() => start("bunk")}
                className="btn-neon pulse-ring font-display flex items-center justify-center gap-3 rounded-2xl px-6 py-5 text-[1.7rem] uppercase tracking-wider text-white"
              >
                <Icon name="pad" className="h-7 w-7" /> I&apos;m bunking too
              </button>
              <button
                onClick={() => start("stuck")}
                className="btn-ghost font-display flex items-center justify-center gap-3 rounded-2xl px-6 py-3.5 text-xl uppercase tracking-wider text-[#ff8080]"
              >
                <Icon name="calx" className="h-5 w-5" /> I can&apos;t bunk
              </button>
              <p className="text-legible text-xs text-ink/75">
                3 taps. No login. No personal data.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 rounded-full border border-[#ff4d4d]/40 bg-navy/70 px-4 py-2 text-sm backdrop-blur">
            <span className="mission busted text-base uppercase">Busted</span>
            <span className="font-display text-xl tabular-nums">
              {stats ? fmt(stats.stuck) : "—"}
            </span>
            <span className="text-muted">stuck at work or college</span>
          </div>

          <a
            href="#boards"
            className="mt-8 animate-bounce text-xs font-bold uppercase tracking-[0.3em] text-ink/60"
          >
            Leaderboards ↓
          </a>
        </section>
      </main>

      <Ticker recent={stats?.recent ?? []} />

      <div
        id="boards"
        className="mx-auto grid w-full max-w-6xl scroll-mt-4 gap-5 px-4 py-10 sm:px-6"
      >
        <Leaderboards stats={stats} />
        <News />
        <Stories
          stories={stats?.stories ?? []}
          onWrite={() => (result ? setOpen(true) : start("bunk"))}
        />
      </div>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 text-center text-xs leading-relaxed text-ink/60 sm:px-6">
        Unofficial fan page. Not affiliated with Rockstar Games or Take-Two.
        Made for fun by{" "}
        <a
          href="https://x.com/parascodes"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-pink hover:underline"
        >
          @parascodes
        </a>
      </footer>
      <BunkFlow
        key={side}
        open={open}
        side={side}
        result={result}
        onClose={onClose}
        onDone={onDone}
      />
    </>
  );
}
