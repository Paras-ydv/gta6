// Original palm-tree silhouette, used in the page scenery and on the share card.
export const PALM_PATHS = [
  "M92 400 C98 320 106 240 98 150 L110 150 C118 240 112 320 110 400 Z",
  "M104 150 C70 120 30 125 5 160 C35 140 70 140 104 153 Z",
  "M104 150 C140 118 180 125 198 165 C170 142 135 140 104 153 Z",
  "M104 150 C85 105 55 85 20 90 C55 100 80 120 102 153 Z",
  "M104 150 C125 100 160 85 192 98 C158 104 128 122 106 153 Z",
  "M104 150 C100 110 108 75 125 55 C115 85 110 115 106 153 Z",
  "M104 150 C80 150 50 175 40 210 C60 180 85 165 104 156 Z",
  "M104 150 C130 152 160 178 168 212 C148 182 125 166 104 156 Z",
];

export const palmSvg = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400">${PALM_PATHS.map(
    (d) => `<path d="${d}" fill="${fill}"/>`,
  ).join("")}</svg>`;
