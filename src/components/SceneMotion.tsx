"use client";

import { useEffect } from "react";

// Drives the background: parallax from scroll + pointer (CSS vars on #scene), and keeps
// the day/night phase in sync with the viewer's clock (initial phase is set by an inline
// script in the layout so there is no flash).
export default function SceneMotion() {
  useEffect(() => {
    const scene = document.getElementById("scene");
    if (!scene) return;
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setPhase = () => {
      const h = new Date().getHours();
      root.dataset.phase = h >= 19 || h < 5 ? "night" : "dusk";
    };
    const phaseTimer = setInterval(setPhase, 60_000);
    if (reduce) return () => clearInterval(phaseTimer);

    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    const tick = () => {
      // ease toward the pointer target
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      scene.style.setProperty("--px", px.toFixed(3));
      scene.style.setProperty("--py", py.toFixed(3));
      scene.style.setProperty("--sy", String(Math.min(window.scrollY, 1200)));
      raf = Math.abs(tx - px) > 0.001 || Math.abs(ty - py) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      kick();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    kick();
    return () => {
      clearInterval(phaseTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", kick);
    };
  }, []);

  return null;
}
