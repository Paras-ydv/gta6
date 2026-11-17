# Bunked for GTA 6

A live, worldwide counter of everyone skipping college or work for GTA 6 (out **19 Nov 2026**, midnight local time), plus everyone who *couldn't* skip. It has one giant number, a 3-tap flow, share cards for X and WhatsApp, live leaderboards and an anonymous stories wall.

Unofficial fan page. Not affiliated with Rockstar Games or Take-Two. It uses no official logos, fonts, screenshots or artwork; all scenery and icons are original CSS/SVG.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind v4 · Upstash Redis · `@upstash/ratelimit` · `next/og` (Satori / `@vercel/og`) · Vercel.

---

## Deploy in under 5 minutes

1. **Create the database (1 min).** Go to [console.upstash.com](https://console.upstash.com), choose **Create Database → Redis**, pick the region closest to your users (for example `ap-south-1` Mumbai if most traffic is from India), and leave the defaults. On the database page, open **REST API** and copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
2. **Push this repo to GitHub**, then on [vercel.com/new](https://vercel.com/new) import it. The framework is auto-detected.
3. **Add the env vars** in Vercel → Project → Settings → Environment Variables:

   | Name | Value |
   | --- | --- |
   | `UPSTASH_REDIS_REST_URL` | from step 1 |
   | `UPSTASH_REDIS_REST_TOKEN` | from step 1 |
   | `NEXT_PUBLIC_SITE_URL` | your final URL, e.g. `https://bunkedforgta6.com` (no trailing slash) |
   | `IP_SALT` | optional: any long random string (`openssl rand -hex 32`) |

   You can use the **Upstash integration from the Vercel Marketplace** instead of steps 1 and 3. It injects `KV_REST_API_URL` / `KV_REST_API_TOKEN`, and the app reads either naming.
4. **Deploy.** If you add a custom domain later, update `NEXT_PUBLIC_SITE_URL` and redeploy. Share links and OG images are built from it.

### Free tier warning

At the time of writing (Nov 2026), Upstash's free tier allows 500K commands/month. Each `/api/stats` call costs 5 commands. The CDN caches it for 3 s per Vercel region, so a busy region costs roughly 100 commands/min, and the free tier would be gone in about 3 days of sustained traffic. Before launch, switch the database to **Pay as you go** (about $0.20 per 100K commands) and set a **budget cap** in the Upstash console. A viral day typically costs a few dollars.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in Upstash vars, or leave them empty
npm run dev                  # http://localhost:3000
```

Without Upstash env vars in development, the app uses an **in-memory store**, so you can try everything immediately. Counts reset when the server restarts. Production refuses to start without Redis.

## How it works

| Route | What it does |
| --- | --- |
| `/` | Static page. Live numbers come from `/api/stats`, polled every 5 s while the tab is visible. |
| `GET /api/stats` | All counts, recent feed and stories. `CDN-Cache-Control: s-maxage=3`. |
| `POST /api/bunk` | `{ side: "bunk"\|"stuck", place, excuse, country, city?, story? }`. Validates against fixed lists, increments every counter in one Redis `MULTI`, and returns `{ number, result, totals }`. `excuse` holds a stuck-reason id when `side` is `stuck`. `city` is only accepted when `country` is `in`. |
| `POST /api/story` | `{ story }`. Lets someone who already submitted add one story later. |
| `POST /api/report` | `{ id }`. A story is hidden after 3 reports. |
| `GET /api/card` | 1200×630 PNG. `?n=14383&e=fever&co=in&c=bangalore[&t=stuck]` (`excuse` and `city` also work). Any `n` above the real total renders the live-total card instead, so numbers can't be faked. |
| `/b/[n]?…` | Share link. Its `og:image` / `twitter:card=summary_large_image` point at that person's card. |

**Redis keys:** `total`, `excuse:<id>`, `place:<id>`, `country:<id>`, `city:<id>`, `day:<YYYY-MM-DD IST>`, `stuck:total`, `stuck:reason:<id>`, plus the lists `recent` and `stories` and the hash `reports`. Rate-limit keys use the `bunk:rl` and `report:rl` prefixes.

**Abuse rules**

- One submission per device: a `localStorage` flag plus an httpOnly `bunked` cookie (the server returns `409` with the previous result).
- At most 3 submissions per IP per 24 h (sliding window), so a shared hostel or office wifi still works. IPs are SHA-256-hashed with a secret salt and never stored raw.
- Requests from another site's `Origin` are rejected.
- Counters start at 0 and only move on real submissions. Nothing is seeded or inflated.

**Stories moderation:** stories are optional, anonymous and capped at 140 characters. They are rejected if they contain profanity (English via [`obscenity`](https://github.com/jo3-l/obscenity), which handles l33t-speak, plus a Hindi/Hinglish blocklist in `src/lib/moderate.ts`), links, emails, `@handles` or phone numbers. Anyone can report a story, and 3 reports hide it. To remove a story by hand, run `HSET reports <id> 99` in the Upstash console's CLI.

## Project layout

```
src/
  app/
    page.tsx               static home
    b/[n]/page.tsx         share page with per-person OG meta
    api/{stats,bunk,story,report,card}/route.ts(x)
    layout.tsx, globals.css, icon.svg
  components/
    App.tsx                state, polling, hero
    BunkFlow.tsx           3-step sheet + result screen
    Leaderboards.tsx, Stories.tsx, Ticker.tsx, Counter.tsx, Countdown.tsx
    Scene.tsx              CSS/SVG coastline background
    Icon.tsx               icon, blip badge, stars, X/WhatsApp marks
  lib/
    data.ts                option lists, types, share helpers
    store.ts               Upstash + in-memory store, rate limits, IP hashing
    moderate.ts            story filter
    icons.ts, palm.ts      original SVG artwork
assets/Anton-Regular.ttf   font for the share card (SIL OFL)
```

## Editing the lists

Excuses, stuck reasons, countries and Indian cities live in `src/lib/data.ts`. Their ids become Redis keys, so **add** new entries freely but don't rename existing ids after launch.

## Checks before you ship

```bash
npm run lint && npx tsc --noEmit && npm run build
```

Then, on a phone-sized viewport, confirm that:

- [ ] submitting twice from the same browser is blocked
- [ ] the counter updates live in a second tab within about 5 s
- [ ] `/api/card?n=1&e=fever&co=in&c=bangalore` renders
- [ ] the X share link has the right text and URL
