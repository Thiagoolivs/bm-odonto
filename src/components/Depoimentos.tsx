import { DEPOIMENTOS, LINKS } from "../content";
import { ArrowUpRight, Star } from "./Icons";

export function Depoimentos() {
  const row = [...DEPOIMENTOS, ...DEPOIMENTOS];
  return (
    <section id="depoimentos" className="relative overflow-hidden bg-ink py-24 text-bone md:py-36" aria-label="Depoimentos">
      <div className="mx-auto grid max-w-[1440px] gap-y-8 px-5 md:px-10 lg:grid-cols-12 lg:gap-x-16">
        <p className="t-eyebrow text-bone/50 lg:col-span-3" data-reveal>
          (04) Depoimentos
        </p>
        <div className="lg:col-span-9">
          <h2 className="sr-only">Avaliações no Google</h2>
          <div className="flex flex-wrap items-end gap-x-10 gap-y-6" data-reveal>
            <p className="t-display text-[clamp(7rem,30vw,17rem)] leading-[0.78] tabular-nums">5,0</p>
            <div className="pb-3">
              <div className="flex gap-1" role="img" aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} />
                ))}
              </div>
              <p className="mt-3 text-[1.15rem] tracking-[-0.02em]">No Google · 32 avaliações</p>
              <a href={LINKS.googleReviews} target="_blank" rel="noopener" className="u-link mt-2 inline-flex items-center gap-1.5 text-[0.95rem] text-bone/60 hover:text-bone">
                Ver avaliações <ArrowUpRight size={14} strokeWidth={1.6} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="group mt-20 md:mt-28" aria-label="Trechos de avaliações">
        <ul
          className="flex w-max gap-4 pl-5 group-hover:[animation-play-state:paused] md:gap-6"
          style={{ animation: "marquee 60s linear infinite" }}
        >
          {row.map((d, i) => (
            <li
              key={i}
              aria-hidden={i >= DEPOIMENTOS.length}
              className="flex w-[82vw] shrink-0 flex-col justify-between rounded-[22px] border border-bone/12 p-7 md:w-[38vw] md:p-10"
            >
              <blockquote className="t-title text-[clamp(1.6rem,4.6vw,2.7rem)] leading-[1.05]">“{d.text}”</blockquote>
              <p className="mt-10 text-[0.9rem] text-bone/55">{d.name} · Google</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
