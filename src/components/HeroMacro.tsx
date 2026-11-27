import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import { HERO, whatsappLink } from "../content";
import { gsap, onAnchorClick, ScrollTrigger } from "../lib/scroll";
import { markHeroReady, whenEntered } from "../lib/app";
import { isSmallScreen, prefersReducedMotion, webglTier } from "../lib/env";
import { film } from "../three/MacroScene";
import { ArrowRight } from "./Icons";

const MacroScene = lazy(() => import("../three/MacroScene"));

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Abertura: a lente de resina em macro, revelada por uma luz quente. */
export function HeroMacro() {
  const root = useRef<HTMLElement>(null);
  const [gpu] = useState(() => webglTier() === "gpu");
  const [failed, setFailed] = useState(!gpu);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const small = isSmallScreen();

  useEffect(() => {
    film.reduced = prefersReducedMotion();
    const wideMq = window.matchMedia("(min-width: 1024px)");
    const setWide = () => (film.wide = wideMq.matches ? 1 : 0);
    setWide();
    wideMq.addEventListener("change", setWide);
    if (!gpu) markHeroReady();
    const t = window.setTimeout(markHeroReady, 5000);

    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(root.current!);
    const move = (e: PointerEvent) => {
      film.mx = (e.clientX / innerWidth) * 2 - 1;
      film.my = (e.clientY / innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => (film.progress = self.progress),
    });
    const stop = whenEntered(() => {
      film.introAt = gsap.ticker.time + 0.1;
    });
    return () => {
      clearTimeout(t);
      wideMq.removeEventListener("change", setWide);
      io.disconnect();
      window.removeEventListener("pointermove", move);
      st.kill();
      stop();
    };
  }, [gpu]);

  // texto
  useEffect(() => {
    const reduced = prefersReducedMotion();
    let unsub = () => {};
    const ctx = gsap.context(() => {
      gsap.set("[data-h-line]", { yPercent: reduced ? 0 : 110 });
      gsap.set("[data-h-fade]", { opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 });
      unsub = whenEntered(() =>
        ctx.add(() => {
          gsap
            .timeline({ delay: reduced ? 0 : 1.1 })
            .to("[data-h-line]", { yPercent: 0, duration: 1.6, ease: "expo.out", stagger: 0.09 })
            .to("[data-h-fade]", { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.06 }, 0.5);
        }),
      );
      if (!reduced) {
        gsap.to("[data-h-copy]", {
          yPercent: -20,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "70% top", scrub: true },
        });
      }
    }, root);
    return () => {
      unsub();
      ctx.revert();
    };
  }, []);

  return (
    <section id="inicio" ref={root} className="relative h-svh min-h-[620px] overflow-hidden bg-[#070606] text-bone" aria-label="Apresentação">
      {!failed && (
        <div className="absolute inset-0 transition-opacity duration-[1600ms]" style={{ opacity: ready ? 1 : 0 }}>
          <Boundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <MacroScene
                active={active}
                maxDpr={small ? 1.5 : 2}
                effects={!small}
                onReady={() => {
                  setReady(true);
                  markHeroReady();
                }}
              />
            </Suspense>
          </Boundary>
        </div>
      )}
      {failed && (
        <img
          src="/media/macro-poster.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[70%_50%]"
        />
      )}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#070606] via-[#070606]/60 to-transparent lg:h-[35%]" />

      <div data-h-copy className="relative z-10 flex h-full flex-col justify-end px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 md:px-10 md:pb-10">
        <p data-h-fade className="t-eyebrow mb-5 max-w-[16rem] text-bone/60 lg:absolute lg:left-10 lg:top-[7.5rem] lg:mb-0">
          {HERO.eyebrow}
        </p>
        <h1 className="t-display text-[clamp(3.15rem,14.2vw,9.6rem)] lg:max-w-[60vw] lg:text-[clamp(4rem,8.2vw,9.6rem)]">
          {HERO.title.map((l) => (
            <span key={l} className="line-mask">
              <span data-h-line>{l}</span>
            </span>
          ))}
        </h1>
        <div className="mt-7 flex flex-col gap-7 lg:mt-10 lg:flex-row lg:items-end lg:justify-between">
          <div data-h-fade className="flex flex-wrap items-center gap-x-5 gap-y-3 whitespace-nowrap">
            <a href={whatsappLink()} target="_blank" rel="noopener" className="btn btn-light" data-cursor="Agendar">
              {HERO.cta}
              <span className="btn-arrow">
                <ArrowRight size={14} strokeWidth={1.8} />
              </span>
            </a>
            <a href="#lentes" onClick={onAnchorClick} className="u-link text-[0.95rem] font-medium text-bone/80">
              Conheça a lente
            </a>
          </div>
          <ul className="grid grid-cols-3 gap-4 border-t border-bone/15 pt-4 lg:w-[min(46vw,640px)] lg:gap-8">
            {HERO.seals.map((s) => (
              <li data-h-fade key={s.title} className="text-[0.8rem] leading-snug md:text-[0.9rem]">
                <span className="block font-medium">{s.title}</span>
                <span className="block text-bone/55">{s.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
