import { useEffect, useRef, useState } from "react";
import { HERO } from "../content";
import { onAnchorClick, gsap } from "../lib/scroll";
import { useGsap } from "../lib/useGsap";
import { prefersReducedMotion } from "../lib/env";
import { useRenderMode } from "../lib/renderMode";
import { bindDragRotate, slotRef, stage } from "../three/state";
import { ArrowDown, ArrowRight, ClockIcon, DragIcon, SealIcon, SessionIcon } from "./Icons";
import { ToothPoster } from "./ToothPoster";
import { Sparkle } from "./ui";

const SEAL_ICONS = { session: SessionIcon, clock: ClockIcon, seal: SealIcon };

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const mode = useRenderMode();
  const [hint, setHint] = useState(true);

  useEffect(() => {
    if (!root.current) return;
    const off = bindDragRotate(root.current);
    const t = window.setInterval(() => {
      if (stage.drag.lastInteraction > 0) {
        setHint(false);
        clearInterval(t);
      }
    }, 400);
    return () => {
      off();
      clearInterval(t);
    };
  }, []);

  useGsap(root, () => {
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
    tl.from("[data-hero-label]", { opacity: 0, x: -24, filter: "blur(6px)", duration: 1.6 }, 0)
      .from("[data-hero-line]", { yPercent: 115, duration: 1.5, stagger: 0.13 }, 0.15)
      .from("[data-hero-cta]", { opacity: 0, y: 18, duration: 1.2, stagger: 0.1 }, 0.75)
      .from("[data-hero-rule]", { scaleX: 0, transformOrigin: "left center", duration: 1.6, ease: "power3.inOut" }, 0.8)
      .from("[data-hero-seal]", { opacity: 0, y: 14, duration: 1.1, stagger: 0.12 }, 1.0);

    // ao rolar, o texto do hero sai com leve parallax
    gsap.to("[data-hero-copy]", {
      yPercent: -14,
      opacity: 0.0,
      ease: "none",
      scrollTrigger: { trigger: root.current, start: "top top", end: "bottom 20%", scrub: true },
    });
  });

  return (
    <section
      id="inicio"
      ref={root}
      className="relative flex h-svh min-h-[620px] touch-pan-y select-none flex-col overflow-hidden lg:min-h-[720px]"
      aria-label="Apresentação"
    >

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 pt-16 md:px-10 lg:flex-row lg:items-stretch lg:pt-20">
        {/* slot do dente 3D */}
        <div className="relative min-h-[230px] flex-1 lg:order-2 lg:flex-1">
          <div ref={slotRef("hero")} className="absolute inset-x-0 top-[2%] bottom-[-6%] lg:inset-y-[8%]" />
          {mode === "fallback" && (
            <ToothPoster className="absolute left-1/2 top-1/2 h-[112%] max-w-none -translate-x-1/2 -translate-y-1/2" />
          )}
          <Sparkle className="left-[14%] top-[22%]" delay={0.4} size={12} />
          <Sparkle className="right-[16%] top-[48%]" delay={1.6} size={9} />
          <Sparkle className="left-[24%] bottom-[12%]" delay={2.4} size={7} />
          {hint && mode === "3d" && (
            <p
              style={{ animation: "fade-in 1.2s ease 2.2s both" }}
              className="label absolute right-0 top-[6%] flex items-center gap-2 text-[0.56rem] text-cream/65 lg:bottom-[10%] lg:top-auto"
            >
              <DragIcon size={16} className="text-gold" style={{ animation: "float-hint 2.4s ease-in-out infinite" }} />
              Arraste para girar
            </p>
          )}
        </div>

        {/* texto */}
        <div
          data-hero-copy
          className="relative pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:order-1 lg:flex lg:flex-[1.1] lg:flex-col lg:justify-end lg:pb-16"
        >
          <p data-hero-label className="label text-[0.6rem] tracking-[0.22em] text-gold min-[380px]:text-[0.62rem] min-[380px]:tracking-[0.26em] md:text-[0.7rem]">
            {HERO.label}
          </p>
          <h1 className="display mt-4 text-[clamp(2.85rem,12.4vw,5.6rem)] text-cream lg:mt-6">
            {HERO.title.map((l, i) => (
              <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                <span data-hero-line className={`block ${i === 1 ? "italic text-gold-soft" : ""}`}>
                  {l}
                </span>
              </span>
            ))}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-10">
            <a data-hero-cta href="#agendar" onClick={onAnchorClick} className="btn-gold solid">
              {HERO.cta}
              <ArrowRight size={16} />
            </a>
            <a
              data-hero-cta
              href="#simulador"
              onClick={onAnchorClick}
              className="label flex items-center gap-2 text-[0.6rem] text-cream/70 transition-colors hover:text-gold"
            >
              Simular minha lente <ArrowDown size={14} className="text-gold" />
            </a>
          </div>

          <div data-hero-rule className="mt-7 h-px w-full bg-gold/35 lg:mt-12" />
          <ul className="grid grid-cols-3 lg:max-w-[640px]">
            {HERO.seals.map((s, i) => {
              const Icon = SEAL_ICONS[s.icon];
              return (
                <li
                  key={s.title}
                  data-hero-seal
                  className={`flex flex-col gap-2 pt-4 ${i > 0 ? "border-l border-gold/25 pl-3 md:pl-5" : "pr-2"}`}
                >
                  <Icon size={18} className="text-gold" />
                  <span className="text-[0.66rem] font-medium uppercase leading-[1.35] tracking-[0.12em] text-cream md:text-[0.72rem]">
                    {s.title}
                    <span className="mt-0.5 block font-light normal-case tracking-[0.02em] text-cream/65">{s.note}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
