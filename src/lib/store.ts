import "server-only";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import {
  CITIES,
  COUNTRIES,
  EXCUSES,
  PLACES,
  REASONS,
  type BunkInput,
  type BunkResult,
  type RecentEntry,
  type Stats,
  type Story,
} from "./data";

// Key layout
//   bunkers: total, excuse:<id>, place:<id>, country:<id>, city:<id>, day:<YYYY-MM-DD IST>
//   stuck:   stuck:total, stuck:reason:<id>
//   feeds:   recent (list), stories (list), reports (hash storyId -> count)
const KEYS = [
  "total",
  "stuck:total",
  ...EXCUSES.map((e) => `excuse:${e.id}`),
  ...REASONS.map((r) => `stuck:reason:${r.id}`),
  ...PLACES.map((p) => `place:${p.id}`),
  ...COUNTRIES.map((c) => `country:${c.id}`),
  ...CITIES.map((c) => `city:${c.id}`),
];

const RECENT_MAX = 20;
const STORIES_MAX = 60;
const HIDE_AFTER_REPORTS = 3;
const LIMIT = 3; // submissions per hashed IP per 24h, so shared wifi still works
const REPORT_LIMIT = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

function toStats(
  values: (number | string | null)[],
  todayCount: number | string | null,
  recent: RecentEntry[],
  stories: Story[],
  reports: Record<string, number | string> | null,
): Stats {
  const v = (i: number) => Number(values[i] ?? 0);
  let i = 2;
  const pick = <T extends { id: string }>(list: readonly T[]) =>
    Object.fromEntries(list.map((x) => [x.id, v(i++)]));
  const excuses = pick(EXCUSES) as Stats["excuses"];
  const reasons = pick(REASONS) as Stats["reasons"];
  const places = pick(PLACES) as Stats["places"];
  const countries = pick(COUNTRIES) as Stats["countries"];
  const cities = pick(CITIES) as Stats["cities"];
  const visible = stories.filter((s) => Number(reports?.[s.id] ?? 0) < HIDE_AFTER_REPORTS).slice(0, 30);
  return {
    total: v(0),
    stuck: v(1),
    today: Number(todayCount ?? 0),
    excuses,
    reasons,
    places,
    countries,
    cities,
    recent,
    stories: visible,
  };
}

type Store = {
  stats(): Promise<Stats>;
  submit(input: BunkInput): Promise<{ number: number; stats: Stats }>;
  allow(ipHash: string): Promise<boolean>;
  report(storyId: string, ipHash: string): Promise<boolean>;
  addStory(r: BunkResult, text: string): Promise<void>;
};

const newId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 12);

// ---------- Upstash Redis (production) ----------
function redisStore(redis: Redis): Store {
  const submitLimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(LIMIT, "24 h"), prefix: "bunk:rl" });
  const reportLimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(REPORT_LIMIT, "24 h"), prefix: "report:rl" });

  async function stats() {
    const [values, todayCount, recent, stories, reports] = await redis
      .pipeline()
      .mget<(number | null)[]>(...KEYS)
      .get<number>(`day:${today()}`)
      .lrange<RecentEntry>("recent", 0, RECENT_MAX - 1)
      .lrange<Story>("stories", 0, STORIES_MAX - 1)
      .hgetall<Record<string, number>>("reports")
      .exec<[(number | null)[], number | null, RecentEntry[], Story[], Record<string, number> | null]>();
    return toStats(values, todayCount, recent, stories, reports);
  }

  return {
    stats,

    async submit({ side, place, why, country, city, story }) {
      // One MULTI: every counter for this submission moves together.
      const tx = redis.multi();
      if (side === "bunk") {
        tx.incr("total").incr(`excuse:${why}`).incr(`place:${place}`).incr(`country:${country}`).incr(`day:${today()}`);
        if (city) tx.incr(`city:${city}`);
      } else {
        tx.incr("stuck:total").incr(`stuck:reason:${why}`);
      }
      const res = await tx.exec<number[]>();
      const number = res[0];

      // Feeds are cosmetic, so they live outside the transaction.
      const t = Date.now();
      const p = redis.pipeline();
      p.lpush("recent", { s: side, n: number, w: why, co: country, c: city, t } satisfies RecentEntry);
      p.ltrim("recent", 0, RECENT_MAX - 1);
      if (story) {
        p.lpush("stories", { id: newId(), s: side, n: number, w: why, co: country, c: city, text: story, t } satisfies Story);
        p.ltrim("stories", 0, STORIES_MAX - 1);
      }
      await p.exec();
      return { number, stats: await stats() };
    },

    async allow(ipHash) {
      return (await submitLimit.limit(ipHash)).success;
    },

    async report(storyId, ipHash) {
      if (!(await reportLimit.limit(ipHash)).success) return false;
      await redis.hincrby("reports", storyId, 1);
      return true;
    },

    async addStory(r, text) {
      const story: Story = { id: newId(), s: r.side, n: r.number, w: r.why, co: r.country, c: r.city, text, t: Date.now() };
      await redis.pipeline().lpush("stories", story).ltrim("stories", 0, STORIES_MAX - 1).exec();
    },
  };
}

// ---------- In-memory (local dev without Upstash only) ----------
function memoryStore(): Store {
  const g = globalThis as unknown as {
    __bunk2?: {
      counts: Map<string, number>;
      recent: RecentEntry[];
      stories: Story[];
      reports: Record<string, number>;
      hits: Map<string, number[]>;
    };
  };
  const m = (g.__bunk2 ??= {
    counts: new Map<string, number>(),
    recent: [] as RecentEntry[],
    stories: [] as Story[],
    reports: {} as Record<string, number>,
    hits: new Map<string, number[]>(),
  });
  const incr = (k: string) => {
    const n = (m.counts.get(k) ?? 0) + 1;
    m.counts.set(k, n);
    return n;
  };
  const hit = (key: string, max: number) => {
    const now = Date.now();
    const hits = (m.hits.get(key) ?? []).filter((t) => now - t < DAY_MS);
    if (hits.length >= max) return false;
    m.hits.set(key, [...hits, now]);
    return true;
  };
  const stats = async () =>
    toStats(
      KEYS.map((k) => m.counts.get(k) ?? 0),
      m.counts.get(`day:${today()}`) ?? 0,
      [...m.recent],
      [...m.stories],
      m.reports,
    );

  return {
    stats,
    async submit({ side, place, why, country, city, story }) {
      let number: number;
      if (side === "bunk") {
        number = incr("total");
        [`excuse:${why}`, `place:${place}`, `country:${country}`, `day:${today()}`].forEach(incr);
        if (city) incr(`city:${city}`);
      } else {
        number = incr("stuck:total");
        incr(`stuck:reason:${why}`);
      }
      const t = Date.now();
      m.recent = [{ s: side, n: number, w: why, co: country, c: city, t }, ...m.recent].slice(0, RECENT_MAX);
      if (story) {
        m.stories = [{ id: newId(), s: side, n: number, w: why, co: country, c: city, text: story, t }, ...m.stories].slice(
          0,
          STORIES_MAX,
        );
      }
      return { number, stats: await stats() };
    },
    async allow(ipHash) {
      return hit(`s:${ipHash}`, LIMIT);
    },
    async report(storyId, ipHash) {
      if (!hit(`r:${ipHash}`, REPORT_LIMIT)) return false;
      m.reports[storyId] = (m.reports[storyId] ?? 0) + 1;
      return true;
    },
    async addStory(r, text) {
      const story: Story = { id: newId(), s: r.side, n: r.number, w: r.why, co: r.country, c: r.city, text, t: Date.now() };
      m.stories = [story, ...m.stories].slice(0, STORIES_MAX);
    },
  };
}

let store: Store | undefined;

export function getStore(): Store {
  if (store) return store;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    store = redisStore(new Redis({ url, token }));
  } else if (process.env.NODE_ENV !== "production") {
    console.warn("[bunked] No Upstash env vars found, using in-memory store (dev only).");
    store = memoryStore();
  } else {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
  }
  return store;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

// SHA-256 of the IP with a secret salt. The raw IP is never stored or logged.
export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.IP_SALT || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "dev-salt";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  return !origin || new URL(origin).host === req.headers.get("host");
}
