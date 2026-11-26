import { useRef } from "react";
import { DOUTORES } from "../content";
import { gsap } from "../lib/scroll";
import { useGsap } from "../lib/useGsap";
import { prefersReducedMotion } from "../lib/env";
import { ArrowUpRight } from "./Icons";

export function Doutores() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    if (prefersReducedMotion()) return;
    gsap.utils.toArray<HTMLElement>("[data-portrait]").forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 80 + i * 60 },
        { y: -40, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.fromTo(
        el.querySelector("img"),
        { scale: 1.25 },
        { scale: 1.05, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
  });

  return (
    <section id="doutores" ref={root} className="relative bg-paper px-5 py-24 md:px-10 md:py-36" aria-label="Doutores">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-16">
          <p className="t-eyebrow text-mute lg:col-span-3" data-reveal>
            (03) Doutores
          </p>
          <h2 className="t-title text-[clamp(2.6rem,9.5vw,7.4rem)] lg:col-span-9" data-lines>
            <span className="line-mask">
              <span data-line>Quem cuida</span>
            </span>
            <span className="line-mask">
              <span data-line className="text-mute-2">do seu sorriso.</span>
            </span>
          </h2>
        </div>

        <div className="mt-16 grid gap-20 md:mt-28 md:grid-cols-2 md:gap-10 lg:pl-[25%]">
          {DOUTORES.map((d) => (
            <article key={d.name} className="flex flex-col">
              <div data-portrait className="relative aspect-square w-[72%] max-w-[340px] overflow-hidden rounded-full bg-paper-3">
                <img src={d.photo} alt={`${d.name}, ${d.cro}`} loading="lazy" decoding="async" className="h-full w-full object-cover will-change-transform" />
              </div>
              <p className="t-micro mt-10 text-mute">{d.cro}</p>
              <h3 className="t-title mt-3 text-[clamp(2.1rem,6vw,3.6rem)]">{d.name}</h3>
              <p className="mt-3 text-[1rem] text-ink/65">{d.area}</p>
              <a
                href={d.instagram}
                target="_blank"
                rel="noopener"
                data-cursor="Instagram"
                className="mt-6 inline-flex w-fit items-center gap-2 border-b border-ink/25 pb-1 text-[0.95rem] font-medium transition-colors hover:border-ink"
              >
                {d.handle}
                <ArrowUpRight size={15} strokeWidth={1.6} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
