import type { Metadata } from "next";
import { Suspense } from "react";
import App, { type Shared } from "@/components/App";
import Scene from "@/components/Scene";
import { isCity, isCountry, isExcuse, isReason, locationLabel, whyLabel } from "@/lib/data";

// Share link: /b/14383?e=fever&co=in&c=bangalore   (add &t=stuck for the "busted" side)
// The page meta points at this person's card so X/WhatsApp previews show their number.

type Props = PageProps<"/b/[n]">;

async function read({ params, searchParams }: Props): Promise<Shared> {
  const { n } = await params;
  const sp = await searchParams;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const side = sp.t === "stuck" ? "stuck" : "bunk";
  const e = str(sp.e);
  const co = str(sp.co);
  const c = str(sp.c);
  const num = Number.parseInt(n, 10);
  return {
    n: Number.isFinite(num) ? num : 0,
    side,
    e: e && (side === "bunk" ? isExcuse(e) : isReason(e)) ? e : undefined,
    co: co && isCountry(co) ? co : undefined,
    c: c && isCity(c) ? c : undefined,
  };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const s = await read(props);
  const qs = new URLSearchParams({ n: String(s.n) });
  if (s.e) qs.set("e", s.e);
  if (s.co) qs.set("co", s.co);
  if (s.c) qs.set("c", s.c);
  if (s.side === "stuck") qs.set("t", "stuck");
  const image = `/api/card?${qs}`;
  const num = s.n.toLocaleString("en-US");
  const title = s.side === "bunk" ? `#${num} bunked for GTA 6` : `#${num} got busted. Couldn't bunk for GTA 6`;
  const description = [
    s.e && `${s.side === "bunk" ? "Excuse" : "Reason"}: ${whyLabel(s.e)}`,
    s.co && locationLabel(s.co, s.c),
    "How many people worldwide are skipping college & work for GTA 6?",
  ]
    .filter(Boolean)
    .join(" · ");
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

async function SharedApp(props: Props) {
  return <App shared={await read(props)} />;
}

export default function SharedPage(props: Props) {
  return (
    <>
      <Scene />
      <Suspense fallback={<App />}>
        <SharedApp {...props} />
      </Suspense>
    </>
  );
}
