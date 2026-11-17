// Fixed option lists. Everything the server accepts is validated against these.

export const SIDES = ["bunk", "stuck"] as const;
export type Side = (typeof SIDES)[number];

export const PLACES = [
  { id: "college", label: "College", icon: "cap" },
  { id: "office", label: "Office", icon: "briefcase" },
  { id: "both", label: "Both", icon: "flame" },
] as const;

// Reasons for bunking.
export const EXCUSES = [
  { id: "fever", label: "fever", icon: "thermo" },
  { id: "wedding", label: "cousin's wedding", icon: "ring" },
  { id: "wifi", label: "wifi repair guy is coming", icon: "wifi" },
  { id: "function", label: "family function", icon: "users" },
  { id: "stomach", label: "stomach issue", icon: "pill" },
  { id: "exam", label: "exam prep (lol)", icon: "book" },
  { id: "powercut", label: "power cut at home", icon: "zapoff" },
  { id: "dentist", label: "dentist appointment", icon: "tooth" },
  { id: "car", label: "car broke down", icon: "car" },
  { id: "honest", label: "just being honest: it's GTA 6", icon: "pad" },
] as const;

// Reasons for NOT bunking (the "stuck" side).
export const REASONS = [
  { id: "noleave", label: "no leave approved", icon: "calx" },
  { id: "boss", label: "boss said no", icon: "ban" },
  { id: "exams", label: "actual exams. real ones.", icon: "pencil" },
  { id: "broke", label: "can't afford it yet", icon: "cash" },
  { id: "noconsole", label: "no PS5 or Xbox", icon: "tvoff" },
  { id: "later", label: "playing after work like an adult", icon: "clock" },
  { id: "pc", label: "waiting for the PC version", icon: "keyboard" },
  { id: "notplaying", label: "not playing. touching grass.", icon: "leaf" },
] as const;

export const COUNTRIES = [
  { id: "in", label: "India" },
  { id: "us", label: "United States" },
  { id: "gb", label: "United Kingdom" },
  { id: "ca", label: "Canada" },
  { id: "br", label: "Brazil" },
  { id: "mx", label: "Mexico" },
  { id: "ar", label: "Argentina" },
  { id: "de", label: "Germany" },
  { id: "fr", label: "France" },
  { id: "es", label: "Spain" },
  { id: "it", label: "Italy" },
  { id: "nl", label: "Netherlands" },
  { id: "pl", label: "Poland" },
  { id: "se", label: "Sweden" },
  { id: "tr", label: "Turkey" },
  { id: "ae", label: "UAE" },
  { id: "sa", label: "Saudi Arabia" },
  { id: "eg", label: "Egypt" },
  { id: "ng", label: "Nigeria" },
  { id: "za", label: "South Africa" },
  { id: "pk", label: "Pakistan" },
  { id: "bd", label: "Bangladesh" },
  { id: "np", label: "Nepal" },
  { id: "lk", label: "Sri Lanka" },
  { id: "id", label: "Indonesia" },
  { id: "ph", label: "Philippines" },
  { id: "my", label: "Malaysia" },
  { id: "sg", label: "Singapore" },
  { id: "jp", label: "Japan" },
  { id: "kr", label: "South Korea" },
  { id: "au", label: "Australia" },
  { id: "nz", label: "New Zealand" },
  { id: "xx", label: "Somewhere else" },
] as const;

// Only asked when the country is India.
export const CITIES = [
  { id: "bangalore", label: "Bangalore" },
  { id: "delhi", label: "Delhi NCR" },
  { id: "mumbai", label: "Mumbai" },
  { id: "pune", label: "Pune" },
  { id: "hyderabad", label: "Hyderabad" },
  { id: "chennai", label: "Chennai" },
  { id: "kolkata", label: "Kolkata" },
  { id: "ahmedabad", label: "Ahmedabad" },
  { id: "jaipur", label: "Jaipur" },
  { id: "chandigarh", label: "Chandigarh" },
  { id: "lucknow", label: "Lucknow" },
  { id: "indore", label: "Indore" },
  { id: "other", label: "Other city" },
] as const;

export type PlaceId = (typeof PLACES)[number]["id"];
export type ExcuseId = (typeof EXCUSES)[number]["id"];
export type ReasonId = (typeof REASONS)[number]["id"];
export type CountryId = (typeof COUNTRIES)[number]["id"];
export type CityId = (typeof CITIES)[number]["id"];

const has = (list: readonly { id: string }[], v: unknown) => list.some((x) => x.id === v);
export const isSide = (v: unknown): v is Side => SIDES.includes(v as Side);
export const isPlace = (v: unknown): v is PlaceId => has(PLACES, v);
export const isExcuse = (v: unknown): v is ExcuseId => has(EXCUSES, v);
export const isReason = (v: unknown): v is ReasonId => has(REASONS, v);
export const isCountry = (v: unknown): v is CountryId => has(COUNTRIES, v);
export const isCity = (v: unknown): v is CityId => has(CITIES, v);

const find = (list: readonly { id: string; label: string }[], id: string) => list.find((x) => x.id === id);
/** Label for an excuse or a stuck-reason id. */
export const whyLabel = (id: string) => (find(EXCUSES, id) ?? find(REASONS, id))?.label ?? id;
export const whyIcon = (id: string) =>
  ((EXCUSES as readonly { id: string; icon: string }[]).concat(REASONS).find((x) => x.id === id)?.icon ?? "pad") as IconName;
export const countryLabel = (id: string) => find(COUNTRIES, id)?.label ?? id;
export const cityLabel = (id: string) => find(CITIES, id)?.label ?? id;
export const placeLabel = (id: string) => find(PLACES, id)?.label ?? id;
export const locationLabel = (country: string, city?: string | null) =>
  country === "in" && city ? `${cityLabel(city)}, India` : countryLabel(country);

export type IconName =
  | (typeof PLACES)[number]["icon"]
  | (typeof EXCUSES)[number]["icon"]
  | (typeof REASONS)[number]["icon"]
  | "pin"
  | "star"
  | "x"
  | "copy"
  | "download"
  | "check"
  | "globe"
  | "siren"
  | "chat"
  | "flag";

// GTA 6 unlocks at midnight local time on 19 Nov 2026 (verified 18 Nov 2026).
// Month is 0-indexed, so 10 = November. Built in the viewer's local timezone.
export const launchDate = () => new Date(2026, 10, 19, 0, 0, 0);

export type RecentEntry = { s: Side; n: number; w: string; co: CountryId; c?: CityId; t: number };
export type Story = { id: string; s: Side; n: number; w: string; co: CountryId; c?: CityId; text: string; t: number };

export type Stats = {
  total: number; // bunkers
  stuck: number; // couldn't bunk
  today: number; // bunkers today (IST date)
  excuses: Record<ExcuseId, number>;
  reasons: Record<ReasonId, number>;
  places: Record<PlaceId, number>;
  countries: Record<CountryId, number>;
  cities: Record<CityId, number>;
  recent: RecentEntry[];
  stories: Story[];
};

export type BunkInput = {
  side: Side;
  place: PlaceId;
  why: ExcuseId | ReasonId;
  country: CountryId;
  city?: CityId;
  story?: string;
};
export type BunkResult = Omit<BunkInput, "story"> & { number: number };

export const fmt = (n: number) => n.toLocaleString("en-US");

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

const query = (r: BunkResult) => {
  const q = new URLSearchParams({ e: r.why, co: r.country });
  if (r.city) q.set("c", r.city);
  if (r.side === "stuck") q.set("t", "stuck");
  return q.toString();
};

export const shareUrl = (r: BunkResult) => `${siteUrl()}/b/${r.number}?${query(r)}`;
export const cardPath = (r: BunkResult) => `/api/card?n=${r.number}&${query(r)}`;

export const shareText = (r: BunkResult) =>
  r.side === "bunk"
    ? `i'm #${fmt(r.number)} to bunk for gta 6. excuse: ${whyLabel(r.why)} → ${shareUrl(r)}`
    : `i'm #${fmt(r.number)} who couldn't bunk for gta 6. reason: ${whyLabel(r.why)}. pray for me → ${shareUrl(r)}`;

export const STORY_MAX = 140;
