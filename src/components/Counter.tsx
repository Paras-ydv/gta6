"use client";

import { useEffect, useRef, useState } from "react";
import { fmt } from "@/lib/data";

// Ticks from the previous value to the new one, and flashes when it changes.
export default function Counter({ value }: { value: number | null }) {
  const [shown, setShown] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const from = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    if (value === null) return;
    const start = from.current;
    const end = value;
    if (start === end) return;
    if (!first.current) setFlashKey((k) => k + 1);
    first.current = false;
    const duration = Math.min(1600, 500 + Math.abs(end - start) * 40);
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      const v = Math.round(start + (end - start) * eased);
      setShown(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const text = value === null ? "—" : fmt(shown);
  const size =
    text.length > 9 ? "text-[19vw] sm:text-[150px]" : text.length > 6 ? "text-[24vw] sm:text-[180px]" : "text-[32vw] sm:text-[220px]";

  return (
    <div
      key={flashKey}
      className={`${flashKey ? "flash" : ""} font-display leading-[0.9] tabular-nums tracking-tight ${size}`}
      aria-live="polite"
      aria-atomic
    >
      <span className="sunset-text chrome-shadow inline-block">{text}</span>
    </div>
  );
}
