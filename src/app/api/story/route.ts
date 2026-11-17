import { cookies } from "next/headers";
import { getStore, sameOrigin } from "@/lib/store";
import { moderateStory } from "@/lib/moderate";
import { isCountry, isSide, type BunkResult } from "@/lib/data";

// POST /api/story { story } -> adds a story to this device's existing bunk. One per device.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "bad origin" }, { status: 403 });
  const jar = await cookies();
  let result: BunkResult | null = null;
  try {
    result = JSON.parse(jar.get("bunked")?.value ?? "null");
  } catch {}
  if (!result || !isSide(result.side) || !isCountry(result.country) || !Number.isInteger(result.number)) {
    return Response.json({ error: "bunk first" }, { status: 403 });
  }
  if (jar.get("storied")) return Response.json({ error: "already_told" }, { status: 409 });

  const body = await req.json().catch(() => null);
  const m = moderateStory(body?.story);
  if (!m.ok) return Response.json({ error: "story_rejected", reason: m.reason }, { status: 422 });

  try {
    const store = getStore();
    // The cookie is httpOnly, but don't trust it to carry a number that never happened.
    const stats = await store.stats();
    if (result.number > (result.side === "bunk" ? stats.total : stats.stuck)) {
      return Response.json({ error: "bunk first" }, { status: 403 });
    }
    await store.addStory(result, m.text);
    jar.set("storied", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[story]", err);
    return Response.json({ error: "server error" }, { status: 500 });
  }
}
