"use client";

import { Blip } from "./Icon";
import { CITIES, COUNTRIES, EXCUSES, PLACES, REASONS, fmt, type IconName, type Stats } from "@/lib/data";

type Row = { id: string; label: string; icon?: IconName; code?: string; count: number };

const sorted = (rows: Row[]) => [...rows].sort((a, b) => b.count - a.count);

function lead(rows: Row[], empty: string) {
  const [a, b] = rows;
  if (!a || a.count === 0) return empty;
  if (!b || a.count > b.count) return `${a.label} is winning by ${fmt(a.count - (b?.count ?? 0))}`;
  return `${a.label} and ${b.label} are tied at ${fmt(a.count)}`;
}

function Bars({ rows, accent }: { rows: Row[]; accent: "pink" | "teal" | "red" }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const fill = {
    pink: "bg-gradient-to-r from-orange via-pink to-hot shadow-[0_0_12px_rgba(255,61,129,0.8)]",
    teal: "bg-gradient-to-r from-purple to-teal shadow-[0_0_12px_rgba(34,227,211,0.7)]",
    red: "bg-gradient-to-r from-[#7a1030] to-[#ff4d4d] shadow-[0_0_12px_rgba(255,77,77,0.7)]",
  }[accent];
  return (
    <ol className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.id} className="flex items-center gap-3">
          {r.icon ? (
            <Blip name={r.icon} size="sm" tone={i === 0 && r.count > 0 ? "sun" : accent === "red" ? "red" : accent} />
          ) : (
            <span
              className={`font-display grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-[11px] tracking-wide ${
                i === 0 && r.count > 0 ? "border-sun text-sun" : "border-teal/70 text-teal"
              }`}
            >
              {r.code}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium">{r.label}</span>
              <span className="font-display shrink-0 text-base tabular-nums tracking-wide">{fmt(r.count)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className={`bar-fill h-full rounded-full ${fill}`} style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Card({
  kicker,
  title,
  sub,
  children,
  className = "",
}: {
  kicker: string;
  title: string;
  sub: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel rounded-3xl p-5 sm:p-6 ${className}`}>
      <p className="font-display text-xs tracking-[0.3em] text-teal">{kicker}</p>
      <h2 className="font-display mt-1 text-3xl uppercase tracking-wide">{title}</h2>
      <p className="mb-5 mt-1 text-sm text-pink">{sub}</p>
      {children}
    </section>
  );
}

export default function Leaderboards({ stats }: { stats: Stats | null }) {
  const bunk = stats?.total ?? 0;
  const stuck = stats?.stuck ?? 0;
  const both = bunk + stuck;

  const excuses = sorted(EXCUSES.map((e) => ({ id: e.id, label: e.label, icon: e.icon, count: stats?.excuses[e.id] ?? 0 })));
  const reasons = sorted(REASONS.map((r) => ({ id: r.id, label: r.label, icon: r.icon, count: stats?.reasons[r.id] ?? 0 })));
  const countries = sorted(
    COUNTRIES.map((c) => ({ id: c.id, label: c.label, code: c.id === "xx" ? "??" : c.id.toUpperCase(), count: stats?.countries[c.id] ?? 0 })),
  );
  const cities = sorted(CITIES.map((c) => ({ id: c.id, label: c.label, icon: "pin" as const, count: stats?.cities[c.id] ?? 0 })));
  const places = PLACES.map((p) => ({ ...p, count: stats?.places[p.id] ?? 0 }));
  const placeTotal = places.reduce((s, p) => s + p.count, 0);
  const colors = { college: "bg-teal", office: "bg-pink", both: "bg-orange" } as const;
  const tones = { college: "teal", office: "pink", both: "sun" } as const;
  const activeCountries = countries.filter((c) => c.count > 0).length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Bunked vs Busted */}
      <Card
        className="lg:col-span-2"
        kicker="THE BIG ONE"
        title="Bunked vs Busted"
        sub={
          both === 0
            ? "Nobody has picked a side yet."
            : bunk >= stuck
              ? `${Math.round((bunk / both) * 100)}% of people chose violence`
              : `${Math.round((stuck / both) * 100)}% are stuck at their desks. Pray for them.`
        }
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="mission neon-teal text-2xl uppercase">Bunked</div>
            <div className="font-display text-5xl tabular-nums sm:text-6xl">{fmt(bunk)}</div>
          </div>
          <div className="font-display pb-2 text-2xl text-muted">VS</div>
          <div className="text-right">
            <div className="mission busted text-2xl uppercase">Busted</div>
            <div className="font-display text-5xl tabular-nums sm:text-6xl">{fmt(stuck)}</div>
          </div>
        </div>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
          <div
            className="bar-fill h-full bg-gradient-to-r from-teal to-pink shadow-[0_0_14px_rgba(34,227,211,0.7)]"
            style={{ width: both ? `${(bunk / both) * 100}%` : "50%" }}
          />
          <div className="bar-fill h-full flex-1 bg-gradient-to-r from-[#7a1030] to-[#ff4d4d]" style={{ opacity: both ? 1 : 0.3 }} />
        </div>
      </Card>

      <Card kicker="LEADERBOARD 01" title="Top excuses" sub={lead(excuses, "No excuses yet. Be the first.")}>
        <Bars rows={excuses} accent="pink" />
      </Card>

      <div className="grid gap-5">
        <Card
          kicker="LEADERBOARD 02"
          title="Country wars"
          sub={activeCountries ? `${activeCountries} ${activeCountries === 1 ? "country" : "countries"} bunking. ${lead(countries, "")}` : "Which country bunks hardest? Nobody yet."}
        >
          <Bars rows={countries.slice(0, 6)} accent="teal" />
        </Card>

        <Card
          kicker="LEADERBOARD 03"
          title="College vs Office"
          sub={placeTotal ? "Who's bunking harder?" : "Students or the 9-to-5 crowd? Nobody yet."}
        >
          <div className="flex h-11 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            {places.map((p) =>
              p.count > 0 ? (
                <div
                  key={p.id}
                  className={`bar-fill flex items-center justify-center font-display text-lg text-navy ${colors[p.id]}`}
                  style={{ width: `${(p.count / placeTotal) * 100}%` }}
                >
                  {Math.round((p.count / placeTotal) * 100)}%
                </div>
              ) : null,
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {places.map((p) => (
              <div key={p.id} className="flex flex-col items-center rounded-2xl bg-white/5 px-2 py-3">
                <Blip name={p.icon} size="sm" tone={tones[p.id]} />
                <div className="font-display mt-2 text-2xl tabular-nums">{fmt(p.count)}</div>
                <div className="text-xs text-muted">{p.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card kicker="LEADERBOARD 04" title="India city wars" sub={lead(cities, "Bangalore vs Delhi vs Mumbai. Waiting for the first one.")}>
        <Bars rows={cities.slice(0, 8)} accent="teal" />
      </Card>

      <Card kicker="LEADERBOARD 05" title="Why they're stuck" sub={lead(reasons, "Nobody's admitted defeat yet.")}>
        <Bars rows={reasons} accent="red" />
      </Card>
    </div>
  );
}
