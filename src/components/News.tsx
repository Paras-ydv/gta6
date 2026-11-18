import { NEWS, NEWS_CHECKED } from "@/lib/news";
import { Blip } from "./Icon";

// Real-world coverage. Static, so it costs nothing at runtime.
export default function News() {
  return (
    <section className="panel rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs tracking-[0.3em] text-teal">MEANWHILE, IN THE REAL WORLD</p>
          <h2 className="font-display mt-1 text-3xl uppercase tracking-wide">Bunk news</h2>
          <p className="mt-1 text-sm text-pink">Companies are literally giving the day off. Show this to your boss.</p>
        </div>
        <Blip name="siren" tone="red" />
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {NEWS.map((n) => (
          <li key={n.url}>
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-pink/60 hover:bg-white/[0.07]"
            >
              <span className="font-display text-xs tracking-[0.2em] text-sun">{n.tag}</span>
              <span className="mt-1.5 flex-1 text-[15px] leading-snug text-ink">{n.text}</span>
              <span className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>
                  {n.source} · {n.date}
                </span>
                <span className="font-semibold text-teal transition group-hover:translate-x-0.5">Read →</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted/70">Links checked {NEWS_CHECKED}. Summaries are ours; full stories at the source.</p>
    </section>
  );
}
