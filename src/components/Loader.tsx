import { useEffect, useRef, useState } from "react";
import { gsap, startScroll } from "../lib/scroll";
import { heroReady, setEntered } from "../lib/app";
import { prefersReducedMotion } from "../lib/env";
import { Mark } from "./Mark";

/** Abertura curta: contador 0–100 enquanto o vídeo carrega; depois a cortina sobe. */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const state = { v: 0 };
    const draw = () => {
      const n = Math.round(state.v * 100);
      if (num.current) num.current.textContent = String(n).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${state.v})`;
    };
    const ready = Promise.race([
      Promise.all([heroReady, document.fonts?.ready ?? Promise.resolve()]),
      new Promise((r) => setTimeout(r, 4500)),
    ]);

    const ctx = gsap.context(() => {
      const first = gsap.to(state, { v: 0.86, duration: reduced ? 0.2 : 1.25, ease: "power2.out", onUpdate: draw });
      ready.then(() => {
        first.kill();
        const tl = gsap.timeline({ onComplete: () => setGone(true) });
        tl.to(state, { v: 1, duration: reduced ? 0.1 : 0.45, ease: "power2.inOut", onUpdate: draw })
          .to("[data-loader-fade]", { opacity: 0, y: -10, duration: 0.5, ease: "power2.in", stagger: 0.04 }, "+=0.08")
          .add(() => {
            setEntered();
            startScroll();
          }, "-=0.15")
          .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: reduced ? 0.2 : 1.15, ease: "expo.inOut" }, "-=0.2");
      });
    }, root);
    return () => ctx.revert();
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink p-5 text-bone md:p-10"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-live="polite"
      aria-label="Carregando"
    >
      <div data-loader-fade className="flex items-center justify-between text-[0.9rem] text-bone/60">
        <span>BM Odontologia</span>
        <span>São Paulo</span>
      </div>
      <div data-loader-fade className="flex flex-col items-center gap-6">
        <Mark size={76} tone="light" alt="" />
      </div>
      <div data-loader-fade>
        <div className="flex items-end justify-between">
          <span className="text-[0.9rem] text-bone/60">Lentes em resina</span>
          <span ref={num} className="t-display text-[18vw] tabular-nums leading-[0.8] md:text-[10vw]">
            000
          </span>
        </div>
        <div className="mt-5 h-px w-full bg-bone/15">
          <div ref={bar} className="h-full origin-left bg-bone" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
