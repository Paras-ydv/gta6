"use client";

import { useEffect, useRef, useState } from "react";
import { Blip, Icon, Stars, WhatsAppLogo, XLogo } from "./Icon";
import {
  CITIES,
  COUNTRIES,
  EXCUSES,
  PLACES,
  REASONS,
  STORY_MAX,
  cardPath,
  fmt,
  locationLabel,
  shareText,
  shareUrl,
  whyIcon,
  whyLabel,
  type BunkResult,
  type CityId,
  type CountryId,
  type ExcuseId,
  type PlaceId,
  type ReasonId,
  type Side,
  type Stats,
} from "@/lib/data";

export const STORAGE_KEY = "bunked:v2";
const STORY_KEY = "bunked:story";

// How suspicious your excuse looks to HR / your professor.
const WANTED: Record<string, number> = {
  fever: 3,
  wedding: 2,
  wifi: 4,
  function: 2,
  stomach: 3,
  exam: 4,
  powercut: 3,
  dentist: 3,
  car: 2,
  honest: 5,
};

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
function load(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function fireConfetti(side: Side) {
  const confetti = (await import("canvas-confetti")).default;
  const colors = side === "bunk" ? ["#ff3d81", "#22e3d3", "#ffe66d", "#ff9e3d", "#ff2bd6"] : ["#ff2d3c", "#2f6bff", "#ffffff"];
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.65 }, colors, disableForReducedMotion: true });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, disableForReducedMotion: true }), 180);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, disableForReducedMotion: true }), 300);
}

async function postStory(story: string): Promise<string | null> {
  const res = await fetch("/api/story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ story }),
  });
  if (res.ok || res.status === 409) return null;
  const data = await res.json().catch(() => ({}));
  return data.reason ? `Story rejected: ${data.reason}.` : "Couldn't post that story.";
}

type Props = {
  open: boolean;
  side: Side;
  result: BunkResult | null;
  onClose: () => void;
  onDone: (r: BunkResult, totals?: Stats) => void;
};

export default function BunkFlow({ open, side, result, onClose, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [place, setPlace] = useState<PlaceId | null>(null);
  const [why, setWhy] = useState<ExcuseId | ReasonId | null>(null);
  const [country, setCountry] = useState<CountryId | "">("");
  const [city, setCity] = useState<CityId | "">("");
  const [story, setStory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const bunk = side === "bunk";
  const options = bunk ? EXCUSES : REASONS;
  const needCity = country === "in";
  const ready = place && why && country && (!needCity || city);

  async function submit() {
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side, place, excuse: why, country, city: needCity ? city : undefined, story: story.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        save(STORAGE_KEY, JSON.stringify(data.result));
        if (story.trim()) save(STORY_KEY, "1");
        onDone(data.result, data.totals);
        setFlash((f) => f + 1);
        fireConfetti(side);
      } else if (res.status === 409) {
        if (data.previous?.side) {
          save(STORAGE_KEY, JSON.stringify(data.previous));
          onDone(data.previous);
        } else setError("This browser already picked a side. One per person.");
      } else if (res.status === 422) {
        setError(`Story rejected: ${data.reason}. Edit it or leave it empty.`);
      } else if (res.status === 429) {
        setError("Too many submissions from your network today. The whole hostel can't skip at once. Try tomorrow.");
      } else {
        setError("Server's on a lunch break. Try again in a sec.");
      }
    } catch {
      setError("Network issue. Is the wifi repair guy actually coming?");
    } finally {
      setBusy(false);
    }
  }

  const steps = bunk ? ["Where", "Excuse", "Location"] : ["Where", "Reason", "Location"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="fade-in absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      {flash > 0 && (
        <div key={flash} className={`screen-flash pointer-events-none fixed inset-0 z-[60] ${bunk ? "bg-pink/60" : "bg-[#ff2d3c]/60"}`} />
      )}

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={result ? "Your result" : bunk ? "I'm bunking too" : "I can't bunk"}
        className="sheet-in panel relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none sm:rounded-[2rem] sm:p-7"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-ink/80 hover:bg-white/20"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>

        {result ? (
          <ResultView result={result} />
        ) : (
          <>
            <div className="mb-5 flex items-center gap-2 pr-10">
              {steps.map((s, i) => (
                <div key={s} className="flex-1">
                  <div
                    className={`h-1.5 rounded-full ${
                      i <= step
                        ? bunk
                          ? "bg-gradient-to-r from-orange to-pink shadow-[0_0_10px_#ff3d81]"
                          : "bg-gradient-to-r from-[#7a1030] to-[#ff4d4d] shadow-[0_0_10px_#ff4d4d]"
                        : "bg-white/10"
                    }`}
                  />
                  <div className={`mt-1.5 text-[11px] font-semibold uppercase tracking-widest ${i === step ? "text-pink" : "text-muted/60"}`}>
                    {i + 1}. {s}
                  </div>
                </div>
              ))}
            </div>

            {step === 0 && (
              <div key="s0" className="fade-in">
                <h3 className="font-display text-4xl uppercase leading-none">
                  {bunk ? "Where are you " : "Where are you "}
                  <span className={bunk ? "sunset-text" : "busted"}>{bunk ? "skipping?" : "stuck?"}</span>
                </h3>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {PLACES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPlace(p.id);
                        setStep(1);
                      }}
                      className={`flex flex-col items-center gap-3 rounded-2xl border px-2 py-5 transition active:scale-95 ${
                        place === p.id ? "border-pink bg-pink/15 shadow-[0_0_20px_rgba(255,61,129,0.5)]" : "border-white/10 bg-white/5 hover:border-teal/60"
                      }`}
                    >
                      <Blip name={p.icon} size="lg" tone={p.id === "college" ? "teal" : p.id === "office" ? "pink" : "sun"} />
                      <span className="font-display text-xl uppercase tracking-wide">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div key="s1" className="fade-in">
                <h3 className="font-display text-4xl uppercase leading-none">
                  {bunk ? (
                    <>
                      Pick your <span className="sunset-text">excuse</span>
                    </>
                  ) : (
                    <>
                      What&apos;s <span className="busted">stopping you?</span>
                    </>
                  )}
                </h3>
                <p className="mt-1 text-sm text-muted">{bunk ? "Choose wisely. Your boss might be online." : "No judgement. Okay, a little judgement."}</p>
                <div className="mt-4 grid gap-2">
                  {options.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setWhy(o.id);
                        setStep(2);
                      }}
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left font-medium transition active:scale-[0.98] ${
                        why === o.id ? "border-pink bg-pink/15" : "border-white/10 bg-white/5 hover:border-teal/60"
                      }`}
                    >
                      <Blip name={o.icon} size="sm" tone={bunk ? "pink" : "red"} />
                      <span>{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div key="s2" className="fade-in">
                <h3 className="font-display text-4xl uppercase leading-none">
                  Where in the <span className={bunk ? "sunset-text" : "busted"}>world?</span>
                </h3>
                <p className="mt-1 text-sm text-muted">For the country wars. Nothing else is stored.</p>

                <label className="sr-only" htmlFor="country">
                  Country
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value as CountryId);
                    setCity("");
                  }}
                  className="neon-select mt-4 w-full rounded-2xl border border-teal/50 bg-navy-2 px-4 py-4 text-lg font-semibold text-ink outline-none focus:border-pink"
                >
                  <option value="" disabled>
                    Select your country
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                {needCity && (
                  <>
                    <label className="sr-only" htmlFor="city">
                      City
                    </label>
                    <select
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value as CityId)}
                      className="neon-select fade-in mt-3 w-full rounded-2xl border border-teal/50 bg-navy-2 px-4 py-4 text-lg font-semibold text-ink outline-none focus:border-pink"
                    >
                      <option value="" disabled>
                        Select your city
                      </option>
                      {CITIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <label htmlFor="story" className="mt-5 flex items-baseline justify-between text-sm font-semibold">
                  <span>
                    Your story <span className="font-normal text-muted">(optional, anonymous)</span>
                  </span>
                  <span className={`tabular-nums ${story.length > STORY_MAX - 20 ? "text-pink" : "text-muted"}`}>
                    {story.length}/{STORY_MAX}
                  </span>
                </label>
                <textarea
                  id="story"
                  value={story}
                  maxLength={STORY_MAX}
                  rows={3}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder={bunk ? "Told my manager my cat has exams…" : "Asked for leave in June. Still pending…"}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/15 bg-navy-2 px-4 py-3 text-base text-ink outline-none placeholder:text-muted/50 focus:border-pink"
                />
                <p className="mt-1 text-xs text-muted">No names, links or @handles. Keep it clean, HR is watching.</p>

                <button
                  disabled={!ready || busy}
                  onClick={submit}
                  className={`font-display mt-5 w-full rounded-2xl py-4 text-2xl uppercase tracking-wider text-white disabled:opacity-40 disabled:grayscale ${
                    bunk ? "btn-neon" : "btn-busted"
                  }`}
                >
                  {busy ? "Sending…" : bunk ? "Bunk it" : "Accept my fate"}
                </button>
              </div>
            )}

            {error && <p className="mt-4 rounded-xl border border-pink/50 bg-pink/10 px-4 py-3 text-sm">{error}</p>}

            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="mt-4 text-sm font-semibold text-muted hover:text-ink">
                ← Back
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ResultView({ result }: { result: BunkResult }) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [story, setStory] = useState("");
  const [storyState, setStoryState] = useState<"idle" | "busy" | "done">(() => (load(STORY_KEY) ? "done" : "idle"));
  const [storyError, setStoryError] = useState<string | null>(null);
  const bunk = result.side === "bunk";
  const url = shareUrl(result);
  const text = shareText(result);
  const card = cardPath(result);
  const wanted = bunk ? (WANTED[result.why] ?? 3) : 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function saveCard() {
    setSaving(true);
    try {
      const blob = await (await fetch(card)).blob();
      const file = new File([blob], `bunked-for-gta6-${result.number}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] }) && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ files: [file], text }).catch(() => {});
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function sendStory() {
    setStoryState("busy");
    setStoryError(null);
    const err = await postStory(story).catch(() => "Network issue.");
    if (err) {
      setStoryError(err);
      setStoryState("idle");
    } else {
      save(STORY_KEY, "1");
      setStoryState("done");
    }
  }

  return (
    <div className="fade-in pt-2 text-center">
      <div className="stamp mx-auto inline-block">
        <span className={`mission text-5xl uppercase sm:text-6xl ${bunk ? "text-sun" : "busted"}`}>
          {bunk ? "Bunk passed" : "Busted"}
        </span>
      </div>
      <p className="font-script mt-1 text-3xl text-sun">{bunk ? "respect +" : "see you at your desk"}</p>

      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-muted">You&apos;re</p>
      <div className="font-display text-[22vw] leading-none sm:text-8xl">
        <span className={bunk ? "sunset-text chrome-shadow" : "text-ink drop-shadow-[0_0_20px_rgba(255,77,77,0.7)]"}>
          #{fmt(result.number)}
        </span>
      </div>
      <p className="mt-2 text-lg font-semibold">{bunk ? "to bunk for GTA 6" : "who couldn't bunk for GTA 6"}</p>
      <p className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Icon name={whyIcon(result.why)} className="h-4 w-4 text-pink" />
          {bunk ? "Excuse" : "Reason"}: <span className="text-ink">{whyLabel(result.why)}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="pin" className="h-4 w-4 text-teal" />
          {locationLabel(result.country, result.city)}
        </span>
      </p>

      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted">
        <span>{bunk ? "HR wanted level" : "Freedom level"}</span>
        <Stars count={wanted} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <a
          href={`https://x.com/intent/post?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-bold text-black transition active:scale-[0.98]"
        >
          <XLogo /> Share on X
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 font-bold text-black transition active:scale-[0.98]"
        >
          <WhatsAppLogo /> WhatsApp
        </a>
        <button
          onClick={copy}
          className="flex items-center justify-center gap-2 rounded-2xl border border-teal/60 bg-teal/10 py-3.5 font-bold text-teal transition active:scale-[0.98]"
        >
          <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      {storyState !== "done" ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
          <label htmlFor="late-story" className="flex items-baseline justify-between text-sm font-semibold">
            <span>Add your story to the wall</span>
            <span className="tabular-nums text-muted">
              {story.length}/{STORY_MAX}
            </span>
          </label>
          <textarea
            id="late-story"
            value={story}
            maxLength={STORY_MAX}
            rows={2}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Anonymous. No names, links or @handles."
            className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-navy-2 px-3 py-2.5 text-base outline-none placeholder:text-muted/50 focus:border-pink"
          />
          {storyError && <p className="mt-1 text-xs text-pink">{storyError}</p>}
          <button
            onClick={sendStory}
            disabled={story.trim().length < 3 || storyState === "busy"}
            className="mt-2 w-full rounded-xl bg-pink/90 py-2.5 font-semibold text-white disabled:opacity-40"
          >
            {storyState === "busy" ? "Posting…" : "Post story"}
          </button>
        </div>
      ) : (
        <p className="mt-6 text-sm text-teal">Your story is on the wall.</p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-pink/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card} alt={`Share card for #${fmt(result.number)}`} width={1200} height={630} className="block h-auto w-full bg-navy-2" />
      </div>
      <button
        onClick={saveCard}
        disabled={saving}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 font-semibold transition hover:bg-white/10 active:scale-[0.98] disabled:opacity-50"
      >
        <Icon name="download" className="h-4 w-4" />
        {saving ? "Preparing…" : "Save share image"}
      </button>
    </div>
  );
}
