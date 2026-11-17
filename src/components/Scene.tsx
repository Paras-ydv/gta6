import { PALM_PATHS } from "@/lib/palm";

function Palm({ className, flip }: { className: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 200 400" aria-hidden className={className} style={flip ? { transform: "scaleX(-1)" } : undefined}>
      {PALM_PATHS.map((d) => (
        <path key={d} d={d} fill="#05010f" />
      ))}
    </svg>
  );
}

// Original illustrated coastline at dusk. Pure CSS/SVG, no images, transform/opacity animations only.
export default function Scene() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="sky absolute inset-0" />
      <div className="stars absolute inset-x-0 top-0 h-1/2" />

      {/* sun sitting on the horizon */}
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-[88%]">
        <div className="sun h-[min(74vw,400px)] w-[min(74vw,400px)] rounded-full" />
      </div>

      {/* city skyline with lit windows */}
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 top-[58%] h-[8vh] w-full -translate-y-full">
        <path
          d="M0 60 V40 h14 v-8 h10 v12 h8 V22 h12 v38 h6 V34 h16 v-6 h6 v32 h10 V14 h4 v-6 h4 v6 h4 v46 h12 V30 h18 v30 h8 V38 h10 v-8 h12 v30 h6 V18 h16 v42 h10 V36 h14 v24 h8 V26 h6 v-6 h6 v40 h12 V32 h20 v28 h10 V44 h12 v16 h8 V24 h14 v36 h10 V40 h16 v20 Z"
          fill="#12052e"
        />
        <g fill="#ffcf6d" opacity="0.7" className="windows">
          <rect x="35" y="27" width="2" height="2" />
          <rect x="39" y="33" width="2" height="2" />
          <rect x="92" y="20" width="2" height="2" />
          <rect x="96" y="28" width="2" height="2" />
          <rect x="92" y="38" width="2" height="2" />
          <rect x="178" y="24" width="2" height="2" />
          <rect x="183" y="32" width="2" height="2" />
          <rect x="262" y="30" width="2" height="2" />
          <rect x="300" y="38" width="2" height="2" />
          <rect x="356" y="30" width="2" height="2" />
          <rect x="360" y="40" width="2" height="2" />
        </g>
      </svg>

      {/* police helicopter with sweeping searchlight */}
      <div className="heli absolute right-[12%] top-[14%]">
        <div className="searchlight absolute left-[22px] top-[18px] h-[70vh] w-[140px] origin-top" />
        <svg viewBox="0 0 80 32" className="relative w-16 sm:w-20">
          <rect className="rotor" x="4" y="3" width="56" height="2" rx="1" fill="#05010f" />
          <rect x="29" y="4" width="3" height="5" fill="#05010f" />
          <ellipse cx="30" cy="16" rx="14" ry="8" fill="#05010f" />
          <path d="M42 13 L74 11 L74 16 L42 19 Z M69 5 L76 5 L74 14 L69 14 Z" fill="#05010f" />
          <path d="M18 27 H44 M24 23 V27 M38 23 V27" stroke="#05010f" strokeWidth="2" />
          <circle className="beacon" cx="74" cy="11" r="1.6" fill="#ff3b3b" />
        </svg>
      </div>

      {/* horizon glow */}
      <div className="absolute inset-x-0 top-[58%] h-px bg-teal shadow-[0_0_18px_4px_rgba(34,227,211,0.8)]" />

      {/* ocean with the sun's reflection */}
      <div className="ocean absolute inset-x-0 bottom-0 top-[58%] overflow-hidden">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="shimmer absolute left-1/2 h-[3px] rounded-full"
            style={{
              top: `${4 + i * 5.2}%`,
              width: `${Math.max(12, 58 - i * 5)}%`,
              animationDelay: `${(i % 4) * 0.6}s`,
              opacity: 1 - i * 0.08,
            }}
          />
        ))}
        <div className="waves absolute inset-0" />
      </div>

      {/* coastal road with a passing car */}
      <div className="absolute inset-x-0 bottom-0 h-[13%] bg-[linear-gradient(180deg,#0b0420,#030008)]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-pink/70 shadow-[0_0_14px_2px_rgba(255,61,129,0.7)]" />
        <div className="road-line absolute inset-x-0 top-1/2 h-[3px]" />
        <div className="car absolute bottom-[38%] w-28 sm:w-36">
          <div className="headlight absolute -right-24 top-[34%] h-6 w-28" />
          <svg viewBox="0 0 120 34" className="relative w-full">
            <path
              d="M4 25 C4 21 8 19 14 18 L30 16 C38 10 48 7 62 7 C74 7 82 10 90 15 L106 17 C112 18 116 21 116 25 L116 27 L4 27 Z"
              fill="#05010f"
            />
            <path d="M40 15 C46 11 54 10 62 10 C70 10 76 12 82 15 Z" fill="#2a1452" />
            <circle cx="28" cy="27" r="6" fill="#05010f" stroke="#22e3d3" strokeWidth="1.2" />
            <circle cx="94" cy="27" r="6" fill="#05010f" stroke="#22e3d3" strokeWidth="1.2" />
            <rect x="3" y="20" width="4" height="3" rx="1" fill="#ff2d55" />
            <rect x="112" y="19" width="4" height="3" rx="1" fill="#fff3b0" />
            <path d="M14 26 H106" stroke="#ff3d81" strokeWidth="1" opacity="0.9" />
          </svg>
        </div>
      </div>

      {/* siren glow from just off screen */}
      <div className="siren-red absolute -bottom-24 -left-24 h-72 w-72 rounded-full" />
      <div className="siren-blue absolute -bottom-24 -right-24 h-72 w-72 rounded-full" />

      <Palm className="absolute -left-12 bottom-[6%] h-[52vh] w-auto" />
      <Palm className="absolute left-12 bottom-[9%] h-[30vh] w-auto opacity-95" flip />
      <Palm className="absolute -right-14 bottom-[5%] h-[58vh] w-auto" flip />
      <Palm className="absolute right-14 bottom-[10%] h-[26vh] w-auto opacity-95" />

      <div className="scanlines absolute inset-0" />
      <div className="vignette absolute inset-0" />
    </div>
  );
}
