import { clientIp, getStore, hashIp, sameOrigin } from "@/lib/store";

// POST /api/report { id } -> a story is hidden after 3 reports.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "bad origin" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (typeof id !== "string" || !/^[a-f0-9]{12}$/.test(id)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    const ok = await getStore().report(id, await hashIp(clientIp(req)));
    return ok ? Response.json({ ok: true }) : Response.json({ error: "rate_limited" }, { status: 429 });
  } catch (err) {
    console.error("[report]", err);
    return Response.json({ error: "server error" }, { status: 500 });
  }
}
