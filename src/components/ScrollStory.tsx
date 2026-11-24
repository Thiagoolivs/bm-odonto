import { useRef, useState } from "react";
import { STORY } from "../content";
import { ScrollTrigger } from "../lib/scroll";
import { useGsap } from "../lib/useGsap";
import { useRenderMode } from "../lib/renderMode";
import { sectionRef, slotRef } from "../three/state";
import { ToothPoster } from "./ToothPoster";
import { Label } from "./ui";

/**
 * História "pinned" (CSS sticky + progresso via ScrollTrigger):
 * a lente se aproxima e encaixa no dente em 3 etapas.
 */
export function ScrollStory() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const mode = useRenderMode();

  useGsap(root, () => {
    ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        setStep(p < 0.3 ? 0 : p < 0.62 ? 1 : 2);
      },
    });
  });

  return (
    <section
      id="tratamentos"
      ref={(el) => {
        root.current = el;
        sectionRef("story")(el);
      }}
      className="relative h-[330svh]"
      aria-label="Como funciona a lente em resina"
    >
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">

        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-20 md:px-10 lg:flex-row lg:items-center lg:gap-16 lg:pb-0">
          <h2 className="sr-only">Como funciona a lente em resina</h2>
          <div className="lg:hidden">
            <Label>Lentes em resina · o processo</Label>
          </div>

          <div className="relative min-h-[220px] flex-1 lg:h-[78%] lg:flex-[1.1]">
            <div ref={slotRef("story")} className="absolute inset-x-0 top-[4%] bottom-0" />
            {mode === "fallback" && (
              <ToothPoster className="absolute left-1/2 top-1/2 h-[112%] max-w-none -translate-x-1/2 -translate-y-1/2" />
            )}
          </div>

          <div className="relative lg:flex-1">
            <div className="hidden lg:block">
              <Label>Lentes em resina · o processo</Label>
            </div>

            {/* indicador de etapas */}
            <div className="mt-2 flex items-center gap-4 lg:mt-10">
              <span className="font-serif text-[1.05rem] italic text-gold-soft">0{step + 1}</span>
              <div className="relative h-px flex-1 bg-cream/15">
                <div ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-gold" />
                {[0.3, 0.62].map((p) => (
                  <span key={p} className="absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-gold" style={{ left: `${p * 100}%` }} />
                ))}
              </div>
              <span className="font-serif text-[1.05rem] italic text-cream/65">03</span>
            </div>

            <div className="relative mt-5 h-[222px] md:h-[230px] lg:mt-10 lg:h-[280px]">
              {STORY.map((s, i) => (
                <article
                  key={s.title}
                  aria-hidden={step !== i}
                  className="absolute inset-0 transition-[opacity,transform,filter] duration-[900ms] ease-[var(--ease-lux)]"
                  style={{
                    opacity: step === i ? 1 : 0,
                    transform: step === i ? "none" : `translateY(${i < step ? -22 : 22}px)`,
                    filter: step === i ? "none" : "blur(6px)",
                  }}
                >
                  <p className="label text-cream/62">Etapa {s.n}</p>
                  <h3 className="display mt-3 text-[clamp(2.4rem,10.5vw,4.4rem)] text-cream">{s.title}</h3>
                  <p className="mt-4 max-w-[30rem] text-[0.95rem] leading-relaxed text-cream/70 md:text-[1.02rem]">{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
