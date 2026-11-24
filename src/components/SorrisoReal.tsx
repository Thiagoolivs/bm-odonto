import { useRef } from "react";
import { SIGNATURE } from "../content";
import { gsap } from "../lib/scroll";
import { useGsap } from "../lib/useGsap";
import { prefersReducedMotion } from "../lib/env";
import { Label, Sparkle } from "./ui";

/** Editorial: foto real em tela cheia, máscara arredondada que se abre + parallax. */
export function SorrisoReal() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      "[data-mask]",
      { clipPath: "inset(7% 7% 7% 7% round 220px 220px 28px 28px)" },
      {
        clipPath: "inset(0% 0% 0% 0% round 28px 28px 28px 28px)",
        ease: "none",
        scrollTrigger: { trigger: "[data-mask]", start: "top 95%", end: "top 15%", scrub: true },
      },
    );
    gsap.fromTo(
      "[data-parallax-img]",
      { yPercent: -9, scale: 1.18 },
      {
        yPercent: 9,
        scale: 1.06,
        ease: "none",
        scrollTrigger: { trigger: "[data-mask]", start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  return (
    <section
      ref={root}
      className="theme-light grain-light relative z-10 -mt-10 rounded-t-[34px] bg-cream px-4 pb-20 pt-16 text-cocoa md:rounded-t-[56px] md:px-10 md:pt-24"
      aria-label="Sorriso real"
    >
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="px-2 md:px-0">
          <Label>Sorriso real</Label>
        </div>

        <div className="relative mt-8 md:mt-12">
          <div data-mask className="relative h-[86svh] max-h-[920px] min-h-[520px] overflow-hidden rounded-[28px]">
            <img
              data-parallax-img
              src="/assets/hero-sorriso.webp"
              alt="Paciente da BM Odontologia sorrindo"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[50%_30%] will-change-transform"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-14">
              <p className="display max-w-[14ch] text-[clamp(2.5rem,11vw,6.4rem)] italic text-cream" data-lines>
                {SIGNATURE.split(" em ").map((part, i) => (
                  <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                    <span data-line className="block">
                      {i === 0 ? part : `em ${part}`}
                    </span>
                  </span>
                ))}
              </p>
              <p className="label mt-6 text-cream/75">BM Odontologia · São Paulo</p>
            </div>
            <Sparkle className="right-[12%] top-[14%] text-gold-soft" size={16} delay={0.6} />
            <Sparkle className="right-[22%] top-[24%] text-gold-soft" size={9} delay={1.8} />
          </div>
        </div>
      </div>
    </section>
  );
}
