import { useRef } from "react";
import { JORNADA, OUTROS } from "../content";
import { gsap } from "../lib/scroll";
import { useGsap } from "../lib/useGsap";
import { prefersReducedMotion } from "../lib/env";
import { Label, Title } from "./ui";

export function Jornada() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      "[data-journey-line]",
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: "[data-journey]", start: "top 70%", end: "bottom 60%", scrub: true },
      },
    );
    gsap.utils.toArray<HTMLElement>("[data-journey-node]").forEach((node) => {
      gsap.fromTo(
        node,
        { backgroundColor: "rgba(185,140,75,0)", scale: 0.7 },
        {
          backgroundColor: "rgba(185,140,75,1)",
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: node, start: "top 62%", toggleActions: "play none none reverse" },
        },
      );
    });
  });

  return (
    <section ref={root} className="theme-light grain-light relative z-10 bg-cream px-6 py-24 text-cocoa md:px-10 md:py-36" aria-label="Jornada">
      <div className="relative z-10 mx-auto max-w-[1400px] md:grid md:grid-cols-[1fr_1.1fr] md:gap-20">
        <div className="md:sticky md:top-32 md:self-start">
          <Label>Sua jornada</Label>
          <Title lines={["Do primeiro contato", "ao acompanhamento."]} italic={1} className="mt-5 text-[clamp(2.5rem,10.5vw,5rem)] text-cocoa [&_.text-gold-soft]:text-gold" />
        </div>

        <ol data-journey className="relative mt-14 md:mt-4">
          <span aria-hidden className="absolute bottom-6 left-[15px] top-3 w-px bg-cocoa/15" />
          <span aria-hidden data-journey-line className="absolute bottom-6 left-[15px] top-3 w-px origin-top bg-gold" />
          {JORNADA.map((j, i) => (
            <li key={j.title} className="relative grid grid-cols-[32px_1fr] gap-6 pb-14 last:pb-0">
              <span
                data-journey-node
                className="relative z-10 mt-1.5 grid h-[31px] w-[31px] place-items-center rounded-full border border-gold bg-gold font-serif text-[0.95rem] italic text-cream"
              >
                {i + 1}
              </span>
              <div data-reveal>
                <h3 className="display text-[2.3rem] text-cocoa md:text-[2.8rem]">{j.title}</h3>
                <p className="mt-3 max-w-md text-[0.96rem] leading-relaxed text-cocoa/70">{j.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function OutrosTratamentos() {
  return (
    <section className="theme-light grain-light relative z-10 bg-cream-2 px-6 py-24 text-cocoa md:px-10 md:py-32" aria-label="Outros tratamentos">
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <Label>Outros tratamentos</Label>
        <Title lines={["Cuidado completo", "para o seu sorriso."]} italic={1} className="mt-5 text-[clamp(2.4rem,10vw,4.8rem)] text-cocoa [&_.text-gold-soft]:text-gold" />
        <ul className="mt-12 border-t border-cocoa/15 md:mt-16">
          {OUTROS.map((o, i) => (
            <li
              key={o.title}
              data-reveal
              className="group grid grid-cols-[2.2rem_1fr] items-baseline gap-x-3 border-b border-cocoa/15 py-6 md:grid-cols-[4rem_1fr_1.2fr] md:py-8"
            >
              <span className="font-serif text-[1rem] italic text-gold">0{i + 1}</span>
              <h3 className="display text-[2.1rem] text-cocoa transition-transform duration-700 ease-[var(--ease-lux)] group-hover:translate-x-2 md:text-[3rem]">
                {o.title}
              </h3>
              <p className="col-start-2 mt-2 text-[0.92rem] leading-relaxed text-cocoa/65 md:col-start-3 md:mt-0">{o.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
