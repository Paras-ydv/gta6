import type { IconName } from "./data";

// Hand-drawn 24x24 stroke icons (no emoji). Each entry is a list of SVG elements as
// [tag, attrs]. Used by <Icon/> on the page and as inline SVG on the share card.
type El = ["path", { d: string }] | ["circle", { cx: number; cy: number; r: number }] | ["rect", { x: number; y: number; width: number; height: number; rx: number }];

const p = (d: string): El => ["path", { d }];
const c = (cx: number, cy: number, r: number): El => ["circle", { cx, cy, r }];
const r = (x: number, y: number, width: number, height: number, rx = 2): El => ["rect", { x, y, width, height, rx }];

export const ICONS: Record<IconName, El[]> = {
  cap: [p("M22 9 12 4 2 9l10 5 10-5z"), p("M6 11v5c3 3 9 3 12 0v-5"), p("M22 9v6")],
  briefcase: [r(2, 7, 20, 14), p("M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"), p("M2 13h20")],
  flame: [p("M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3.5 2.5 3.5C11 8 10 5.5 12 2z")],
  thermo: [p("M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"), p("M11.5 9v7")],
  ring: [c(12, 15, 6), p("M9 5.5 12 2l3 3.5L12 9z")],
  wifi: [p("M5 12.55a11 11 0 0 1 14 0"), p("M8.5 16.05a6 6 0 0 1 7 0"), p("M2 8.82a15 15 0 0 1 20 0"), c(12, 20, 0.8)],
  users: [c(9, 7, 4), p("M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"), p("M16 3.13a4 4 0 0 1 0 7.75"), p("M23 21v-2a4 4 0 0 0-3-3.87")],
  pill: [p("M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"), p("M7 10l7 7")],
  book: [p("M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"), p("M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5")],
  zapoff: [p("M13 2 3 14h9l-1 8 10-12h-9l1-8z"), p("M2 2l20 20")],
  tooth: [p("M12 5.5C10 3 6 3 5 6s1 6 1.5 9 1 6 2.5 6 1.5-4 3-4 1.5 4 3 4 2-3 2.5-6S20 9 19 6s-5-3-7-.5z")],
  car: [p("M5 17h14v-5l-2.5-5h-9L5 12z"), p("M5 12h14"), c(8, 17, 2), c(16, 17, 2)],
  pad: [
    p("M6 12h4M8 10v4"),
    p("M15 13h.01M18 11h.01"),
    p("M17.3 5H6.7a4 4 0 0 0-4 3.6l-.9 7.2A3 3 0 0 0 4.8 19c.9 0 1.6-.5 2.1-1.2L8 16h8l1.1 1.8c.5.7 1.2 1.2 2.1 1.2a3 3 0 0 0 3-3.2l-.9-7.2A4 4 0 0 0 17.3 5z"),
  ],
  calx: [r(3, 4, 18, 18), p("M16 2v4M8 2v4M3 10h18"), p("M10 14l4 4M14 14l-4 4")],
  ban: [c(12, 12, 10), p("M4.9 4.9l14.2 14.2")],
  pencil: [p("M12 20h9"), p("M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z")],
  cash: [p("M12 1v22"), p("M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6")],
  tvoff: [r(2, 3, 20, 14), p("M8 21h8M12 17v4"), p("M2 2l20 20")],
  clock: [c(12, 12, 10), p("M12 6v6l4 2")],
  keyboard: [r(2, 6, 20, 12), p("M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10")],
  leaf: [p("M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"), p("M2 21c0-3 1.9-5.4 5.1-6")],
  pin: [p("M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"), c(12, 10, 3)],
  star: [p("M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z")],
  x: [p("M18 6 6 18M6 6l12 12")],
  copy: [r(9, 9, 13, 13), p("M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1")],
  download: [p("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), p("M7 10l5 5 5-5M12 15V3")],
  check: [p("M20 6 9 17l-5-5")],
  globe: [c(12, 12, 10), p("M2 12h20"), p("M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z")],
  siren: [p("M7 18v-6a5 5 0 0 1 10 0v6"), p("M5 21h14v-3H5z"), p("M12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4")],
  chat: [p("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z")],
  flag: [p("M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"), p("M4 22v-7")],
};

const attrs = (o: Record<string, string | number>) =>
  Object.entries(o)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

/** The icon as a standalone SVG string (for the OG card). */
export const iconSvg = (name: IconName, color: string, fill = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill ? color : "none"}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[
    name
  ]
    .map(([tag, a]) => `<${tag} ${attrs(a)}/>`)
    .join("")}</svg>`;
