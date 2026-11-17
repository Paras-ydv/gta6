import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getStore } from "@/lib/store";
import { fmt, isCity, isCountry, isExcuse, isReason, locationLabel, siteUrl, whyIcon, whyLabel } from "@/lib/data";
import { iconSvg } from "@/lib/icons";
import { palmSvg } from "@/lib/palm";

const svgSrc = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

// GET /api/card?n=14383&e=fever&co=in&c=bangalore[&t=stuck] -> 1200x630 PNG
// (`excuse` and `city` are accepted as aliases for `e` and `c`.)
// Without n, or with an n above the real total, it renders the live-total card.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const [anton, stats] = await Promise.all([
    readFile(join(process.cwd(), "assets/Anton-Regular.ttf")),
    getStore()
      .stats()
      .catch(() => null),
  ]);
  const total = stats?.total ?? 0;
  const stuckTotal = stats?.stuck ?? 0;

  const stuck = q.get("t") === "stuck";
  const n = Number(q.get("n"));
  // Never render a number that hasn't actually happened.
  const personal = Number.isInteger(n) && n >= 1 && n <= (stuck ? stuckTotal : total);
  const bunk = !(personal && stuck);

  const why = q.get("e") ?? q.get("excuse");
  const whyOk = why && (stuck ? isReason(why) : isExcuse(why));
  const city = q.get("c") ?? q.get("city");
  const co = q.get("co") ?? (city ? "in" : null);
  const where = co && isCountry(co) ? locationLabel(co, city && isCity(city) ? city : null) : null;
  const host = siteUrl().replace(/^https?:\/\//, "");

  const accent = bunk ? "#22e3d3" : "#ff4d4d";
  const palm = svgSrc(palmSvg("#0b0620"));
  const star = svgSrc(iconSvg("star", "#ffe66d", true));
  const starOff = svgSrc(iconSvg("star", "rgba(255,255,255,0.25)", true));
  const pin = svgSrc(iconSvg("pin", "#ffffff"));

  const headline = personal ? `#${fmt(n)}` : fmt(total);
  const lines = personal
    ? [bunk ? "BUNKED FOR GTA 6" : "COULDN'T BUNK FOR GTA 6"]
    : [total === 1 ? "PERSON IS BUNKING" : "PEOPLE ARE BUNKING", "FOR GTA 6"];
  const kicker = personal ? (bunk ? "BUNK PASSED" : "BUSTED") : "LIVE COUNTER";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "Anton",
          background: bunk
            ? "linear-gradient(180deg, #0b0620 0%, #2a0b4a 45%, #ff3d81 78%, #ff9e3d 100%)"
            : "linear-gradient(180deg, #0b0620 0%, #1d0a3a 45%, #6b0f2e 78%, #ff2d3c 100%)",
          overflow: "hidden",
        }}
      >
        {/* sun with horizontal slats, clipped to the circle */}
        <div
          style={{
            position: "absolute",
            right: 90,
            top: 120,
            width: 420,
            height: 420,
            borderRadius: 420,
            overflow: "hidden",
            background: bunk
              ? "linear-gradient(180deg, #ffe66d 0%, #ff9e3d 45%, #ff3d81 100%)"
              : "linear-gradient(180deg, #ff9e3d 0%, #ff2d3c 60%, #7a1030 100%)",
            display: "flex",
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                width: 420,
                top: 240 + i * 30,
                height: 6 + i * 3,
                background: "#2a0b4a",
                opacity: 0.85,
                display: "flex",
              }}
            />
          ))}
        </div>
        {!bunk && (
          <div
            style={{
              position: "absolute",
              left: -200,
              bottom: -200,
              width: 600,
              height: 600,
              borderRadius: 600,
              background: "radial-gradient(circle, rgba(47,107,255,0.45), transparent 65%)",
              display: "flex",
            }}
          />
        )}
        {/* ground */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 110,
            background: "linear-gradient(180deg, #1a0533 0%, #0b0620 100%)",
            borderTop: `4px solid ${accent}`,
            display: "flex",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={palm} width={210} height={420} style={{ position: "absolute", right: -30, bottom: 60 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={palm} width={150} height={300} style={{ position: "absolute", right: 150, bottom: 80 }} />

        <div style={{ display: "flex", flexDirection: "column", padding: "44px 64px", position: "relative", width: 820 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: accent, letterSpacing: 6 }}>
            {kicker}
            <div style={{ display: "flex", marginLeft: 18 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} alt="" src={bunk || i === 0 ? star : starOff} width={30} height={30} style={{ marginRight: 4 }} />
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: headline.length > 8 ? 150 : 180,
              lineHeight: 1,
              marginTop: 14,
              color: "#fff4f9",
              textShadow: bunk ? "0 0 30px #ff3d81, 6px 6px 0 #ff3d81" : "0 0 30px #ff2d3c, 6px 6px 0 #7a1030",
            }}
          >
            {headline}
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 58, lineHeight: 1.1, color: "#ffffff", marginTop: 12, letterSpacing: 2 }}>
            {lines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          {personal && (whyOk || where) ? (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
              {whyOk ? (
                <div style={{ display: "flex", alignItems: "center", fontSize: 36, color: "#ffe66d" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={svgSrc(iconSvg(whyIcon(why), "#ffe66d"))} width={34} height={34} style={{ marginRight: 12 }} />
                  {stuck ? "REASON" : "EXCUSE"}: {whyLabel(why)}
                </div>
              ) : null}
              {where ? (
                <div style={{ display: "flex", alignItems: "center", fontSize: 36, color: "#ffffff", marginTop: 4 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={pin} width={34} height={34} style={{ marginRight: 12 }} />
                  {where}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div style={{ position: "absolute", left: 64, bottom: 34, fontSize: 36, color: accent, letterSpacing: 2, display: "flex" }}>
          {host}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Anton", data: anton, weight: 400, style: "normal" }],
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "CDN-Cache-Control": personal ? "public, s-maxage=31536000, immutable" : "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
