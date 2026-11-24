import { useEffect, useRef, useState } from "react";
import { TECNICAS } from "../content";
import { prefersReducedMotion } from "../lib/env";
import { Label, Title } from "./ui";

/*
 * Cada card tem uma mini animação de camadas de resina: um corte da lente
 * (em forma de crescente) que vai sendo construído camada por camada.
 */

const LAYER_SETS: Record<string, { fill: string; name: string }[]> = {
  tradicional: [
    { fill: "#e8d3ae", name: "Corpo" },
    { fill: "#f6ecdc", name: "Esmalte" },
  ],
  estratificada: [
    { fill: "#d6b27f", name: "Dentina" },
    { fill: "#e6cfa6", name: "Corpo" },
    { fill: "#f3e6d0", name: "Esmalte" },
    { fill: "rgba(255,250,242,.55)", name: "Translucidez" },
  ],
  realista: [
    { fill: "#cfa874", name: "Dentina" },
    { fill: "#e1c69b", name: "Corpo" },
    { fill: "#ecdcc0", name: "Esmalte" },
    { fill: "rgba(210,204,196,.65)", name: "Halo incisal" },
    { fill: "#f8f0e4", name: "Esmalte final" },
    { fill: "rgba(255,255,255,.55)", name: "Glaze" },
  ],
};

function crescent(i: number, n: number) {
  // camadas se acumulam para fora; extremidades finas como uma lente real
  const t0 = (i / n) * 46;
  const t1 = ((i + 1) / n) * 46;
  const y0 = 150 - t0 * 0.18;
  const y1 = 150 - t1 * 0.18;
  return `M18 ${y0} Q160 ${96 - t0 * 2} 302 ${y0} L302 ${y1} Q160 ${96 - t1 * 2} 18 ${y1} Z`;
}

function LayerArt({ k, play }: { k: string; play: boolean }) {
  const layers = LAYER_SETS[k];
  const n = layers.length;
  const cycle = 1.2 + n * 0.55 + 2.2;
  return (
    <svg viewBox="0 0 320 190" className="h-auto w-full" role="img" aria-label={`Camadas da técnica ${k}`}>
      <defs>
        <linearGradient id={`tooth-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a1b" />
          <stop offset="1" stopColor="#25190f" />
        </linearGradient>
        <radialGradient id={`glow-${k}`} cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#b98c4b" stopOpacity=".35" />
          <stop offset="1" stopColor="#b98c4b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="320" height="190" fill={`url(#glow-${k})`} />
      {/* estrutura do dente */}
      <path d="M18 150 Q160 96 302 150 L302 190 L18 190 Z" fill={`url(#tooth-${k})`} />
      <path d="M18 150 Q160 96 302 150" fill="none" stroke="#b98c4b" strokeWidth="1" strokeOpacity=".8" />
      {layers.map((l, i) => (
        <path
          key={i}
          d={crescent(i, n)}
          fill={l.fill}
          style={{
            transformBox: "fill-box",
            transformOrigin: "50% 100%",
            animation: play ? `layer-in ${cycle}s cubic-bezier(.22,1,.36,1) ${0.2 + i * 0.55}s infinite both` : "none",
            opacity: play ? undefined : 1,
          }}
        />
      ))}
      {k === "realista" && (
        <g stroke="#fff" strokeOpacity=".55" strokeWidth=".6" fill="none" style={{ animation: play ? `layer-in ${cycle}s ease ${0.2 + n * 0.55}s infinite both` : "none" }}>
          <path d="M88 108 q6 -4 12 -1" />
          <path d="M150 92 q8 -3 15 0" />
          <path d="M210 101 q7 -2 13 2" />
          <circle cx="122" cy="98" r="1.2" fill="#fff" stroke="none" />
          <circle cx="190" cy="95" r=".9" fill="#fff" stroke="none" />
        </g>
      )}
      {/* brilho que passa sobre a superfície polida */}
      <path
        d={`M18 ${150 - 46 * 0.18} Q160 ${96 - 46 * 2} 302 ${150 - 46 * 0.18}`}
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="34 400"
        style={{ animation: play ? `glint ${cycle}s ease-in-out ${0.2 + n * 0.55}s infinite` : "none", opacity: 0 }}
      />
    </svg>
  );
}

function TecnicaCard({ t, index }: { t: (typeof TECNICAS)[number]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPlay(e.isIntersecting && !prefersReducedMotion()), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const layers = LAYER_SETS[t.key];

  return (
    <article
      ref={ref}
      className="grain sticky overflow-hidden rounded-[28px] border border-gold/20 bg-ink p-6 text-cream shadow-[0_-20px_60px_-30px_rgba(37,25,15,.6)] md:static md:p-8"
      style={{ top: `${88 + index * 16}px` }}
    >
      <div className="relative z-10">
        <div className="flex items-baseline justify-between">
          <span className="font-serif text-[1.1rem] italic text-gold-soft">0{index + 1}</span>
          <span className="label text-[0.58rem] text-cream/60">{layers.length} camadas</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl bg-[#1d130b]">
          <LayerArt k={t.key} play={play} />
        </div>
        <h3 className="display mt-6 text-[2.6rem] text-cream">{t.title}</h3>
        <p className="mt-3 text-[0.94rem] leading-relaxed text-cream/68">{t.text}</p>
        <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5">
          {layers.map((l) => (
            <li key={l.name} className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-cream/62">
              <span className="h-2 w-2 rounded-full border border-gold/40" style={{ background: l.fill }} />
              {l.name}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function Tecnicas() {
  return (
    <section id="tecnicas" className="theme-light grain-light relative z-10 bg-cream px-4 pb-24 text-cocoa md:px-10 md:pb-32" aria-label="Técnicas">
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="px-2 md:flex md:items-end md:justify-between md:gap-10 md:px-0">
          <div>
            <Label>Técnicas</Label>
            <Title lines={["Três técnicas,", "um mesmo cuidado."]} italic={1} className="mt-5 text-[clamp(2.6rem,11vw,5.6rem)] text-cocoa [&_.text-gold-soft]:text-gold" />
          </div>
          <p className="mt-5 max-w-sm text-[0.98rem] leading-relaxed text-cocoa/70 md:mt-0" data-reveal>
            A resina é construída em camadas. A quantidade e o tipo de camada mudam conforme a técnica indicada para o seu caso.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-5 md:mt-16 md:grid md:grid-cols-3 md:gap-6">
          {TECNICAS.map((t, i) => (
            <TecnicaCard key={t.key} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
