import { cookies } from "next/headers";
import { clientIp, getStore, hashIp, sameOrigin } from "@/lib/store";
import { moderateStory } from "@/lib/moderate";
import { isCity, isCountry, isExcuse, isPlace, isReason, isSide, type BunkResult } from "@/lib/data";

const COOKIE = "bunked";

// POST /api/bunk { side, place, excuse, country, city?, story? } -> { number, totals }
// `excuse` holds an excuse id for side=bunk, or a stuck-reason id for side=stuck.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "bad origin" }, { status: 403 });

  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing) {
    let previous: BunkResult | null = null;
    try {
      previous = JSON.parse(existing);
    } catch {}
    return Response.json({ error: "already_bunked", previous }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) ?? {};
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  const side = body.side ?? "bunk";
  const { place, excuse, country } = body;
  const city = country === "in" ? body.city : undefined;
  const whyOk = side === "bunk" ? isExcuse(excuse) : isReason(excuse);
  if (!isSide(side) || !isPlace(place) || !whyOk || !isCountry(country) || (city !== undefined && !isCity(city))) {
    return Response.json({ error: "invalid choice" }, { status: 400 });
  }

  let story: string | undefined;
  if (typeof body.story === "string" && body.story.trim()) {
    const m = moderateStory(body.story);
    if (!m.ok) return Response.json({ error: "story_rejected", reason: m.reason }, { status: 422 });
    story = m.text;
  }

  try {
    const store = getStore();
    if (!(await store.allow(await hashIp(clientIp(req))))) {
      return Response.json({ error: "rate_limited" }, { status: 429 });
    }
    const why = excuse as BunkResult["why"];
    const { number, stats } = await store.submit({ side, place, why, country, city, story });
    const result: BunkResult = { side, number, place, why, country, ...(city ? { city } : {}) };
    jar.set(COOKIE, JSON.stringify(result), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    if (story) {
      jar.set("storied", "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 90 });
    }
    return Response.json({ number, result, totals: stats });
  } catch (err) {
    console.error("[bunk]", err);
    return Response.json({ error: "server error" }, { status: 500 });
  }
}
