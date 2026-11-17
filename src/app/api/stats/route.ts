import { connection } from "next/server";
import { getStore } from "@/lib/store";

// GET /api/stats: every count, edge-cached for ~3s. Clients poll it every 5s.
export async function GET() {
  await connection(); // always run at request time, never prerendered at build
  try {
    const stats = await getStore().stats();
    return Response.json(stats, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "CDN-Cache-Control": "public, s-maxage=3, stale-while-revalidate=10",
      },
    });
  } catch (err) {
    console.error("[stats]", err);
    return Response.json({ error: "stats unavailable" }, { status: 503 });
  }
}
