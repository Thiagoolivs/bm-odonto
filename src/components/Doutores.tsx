import { useRef } from "react";
import { DOUTORES } from "../content";
import { gsap } from "../lib/scroll";
import { useGsap } from "../lib/useGsap";
import { prefersReducedMotion } from "../lib/env";
import { ArrowUpRight, InstagramIcon } from "./Icons";
import { Label, Title } from "./ui";

function RingText({ id }: { id: string }) {
  const text = "Estética odontológica · Lentes em resina · ";
  return (
    <svg viewBox="0 0 200 200" className="pointer-events-none absolute -inset-[9%] h-[118%] w-[118%]" aria-hidden>
      <defs>
        <path id={id} d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" />
      </defs>
      <g style={{ animation: "spin-slow 38s linear infinite", transformOrigin: "100px 100px" }}>
        <text fill="#b98c4b" fontSize="7.2" fontFamily="Montserrat, sans-serif" fontWeight={500}>
          <textPath href={`#${id}`} textLength={548} lengthAdjust="spacing">
            {(text + text).toUpperCase()}
          </textPath>
        </text>
      </g>
    </svg>
  );
}

export function Doutores() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    if (prefersReducedMotion()) return;
    gsap.utils.toArray<HTMLElement>("[data-portrait]").forEach((el) => {
      const img = el.querySelector("img");
      gsap.fromTo(
        img,
        { yPercent: -7 },
        { yPercent: 7, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.fromTo(
        el,
        { y: 60 },
        { y: -30, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
  });

  return (
    <section
      id="doutores"
      ref={root}
      className="theme-light grain-light relative z-10 bg-cream px-6 py-24 text-cocoa md:px-10 md:py-36"
      aria-label="Doutores"
    >
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <Label>Quem cuida do seu sorriso</Label>
        <Title lines={["Os doutores"]} className="mt-5 text-[clamp(2.8rem,12vw,6rem)] text-cocoa" />

        <div className="mt-16 grid gap-20 md:mt-24 md:grid-cols-2 md:gap-16">
          {DOUTORES.map((d, i) => (
            <article key={d.name} className={`flex flex-col items-center text-center ${i === 1 ? "md:mt-40" : ""}`}>
              <div data-portrait className="relative aspect-square w-[74%] max-w-[360px]">
                <RingText id={`ring-${i}`} />
                <div className="absolute inset-0 overflow-hidden rounded-full bg-cream-2 ring-1 ring-gold/50">
                  <img
                    src={d.photo}
                    alt={`${d.name}, ${d.cro}`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-[1.22] object-cover will-change-transform"
                  />
                </div>
              </div>
              <p className="label mt-12 text-gold">{d.cro}</p>
              <h3 className="display mt-3 text-[clamp(2.4rem,10vw,3.6rem)] text-cocoa">{d.name}</h3>
              <p className="mt-3 text-[0.95rem] text-cocoa/70">{d.area}</p>
              <a
                href={d.instagram}
                target="_blank"
                rel="noopener"
                className="group mt-6 inline-flex items-center gap-2.5 rounded-full border border-cocoa/20 px-5 py-3 text-[0.72rem] font-medium tracking-[0.12em] text-cocoa transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-ink"
              >
                <InstagramIcon size={16} className="text-gold transition-colors group-hover:text-ink" />
                {d.handle}
                <ArrowUpRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
