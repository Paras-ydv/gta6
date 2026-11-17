import { createElement } from "react";
import type { IconName } from "@/lib/data";
import { ICONS } from "@/lib/icons";

export function Icon({ name, className = "h-5 w-5", fill = false }: { name: IconName; className?: string; fill?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name].map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

/** Round radar-blip badge, like map markers on a minimap. */
export function Blip({
  name,
  tone = "pink",
  size = "md",
}: {
  name: IconName;
  tone?: "pink" | "teal" | "sun" | "red";
  size?: "sm" | "md" | "lg";
}) {
  const tones = {
    pink: "border-pink text-pink shadow-[0_0_12px_rgba(255,61,129,0.55)]",
    teal: "border-teal text-teal shadow-[0_0_12px_rgba(34,227,211,0.5)]",
    sun: "border-sun text-sun shadow-[0_0_12px_rgba(255,230,109,0.5)]",
    red: "border-[#ff4d4d] text-[#ff4d4d] shadow-[0_0_12px_rgba(255,77,77,0.55)]",
  } as const;
  const sizes = { sm: "h-7 w-7 p-1.5", md: "h-10 w-10 p-2", lg: "h-14 w-14 p-3" } as const;
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full border-2 bg-navy/80 ${tones[tone]} ${sizes[size]}`}>
      <Icon name={name} className="h-full w-full" />
    </span>
  );
}

export function Stars({ count, of = 5, className = "h-4 w-4" }: { count: number; of?: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${count} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <Icon
          key={i}
          name="star"
          fill={i < count}
          className={`${className} ${i < count ? "text-sun drop-shadow-[0_0_6px_#ffe66d]" : "text-white/20"}`}
        />
      ))}
    </span>
  );
}

export function XLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

export function WhatsAppLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.47 9.47 0 0 1 9.47 9.48c0 5.22-4.25 9.47-9.47 9.47zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.97 1.52 5.7L.55 23.62l6.04-1.58a11.4 11.4 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.33-8.05z"
      />
    </svg>
  );
}
