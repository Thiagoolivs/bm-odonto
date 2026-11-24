import { DEPOIMENTOS, LINKS } from "../content";
import { ArrowUpRight, Star } from "./Icons";
import { Label, Sparkle } from "./ui";

export function Depoimentos() {
  return (
    <section id="depoimentos" className="grain relative z-10 overflow-hidden bg-ink px-6 py-24 text-cream md:px-10 md:py-36" aria-label="Depoimentos">
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <Label>Depoimentos</Label>
        <h2 className="sr-only">Depoimentos de pacientes no Google</h2>

        <div className="mt-10 md:flex md:items-end md:gap-16">
          <div className="relative" data-reveal>
            <p className="display bg-gradient-to-b from-[#f3d9a8] via-gold to-[#8a6430] bg-clip-text text-[clamp(7.5rem,40vw,15rem)] leading-[0.82] text-transparent">
              5,0
            </p>
            <Sparkle className="-right-2 top-2" size={18} delay={0.3} />
            <Sparkle className="right-10 top-14" size={9} delay={1.5} />
          </div>
          <div className="mt-6 md:mb-6" data-reveal>
            <div className="flex gap-1.5 text-gold" role="img" aria-label="5 de 5 estrelas">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} />
              ))}
            </div>
            <p className="mt-4 font-serif text-[1.7rem] leading-tight text-cream">
              no Google <span className="text-cream/65">·</span> <span className="italic text-gold-soft">32 avaliações</span>
            </p>
            <a href={LINKS.googleReviews} target="_blank" rel="noopener" className="label link-line mt-5 inline-flex items-center gap-2 text-cream/75">
              Ver avaliações no Google <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:mt-24 md:grid-cols-2 md:gap-6">
          {DEPOIMENTOS.map((d, i) => (
            <figure
              key={d.name}
              data-reveal
              className={`relative rounded-[26px] border border-gold/20 bg-ink-2/60 p-7 md:p-10 ${i % 2 ? "md:translate-y-16" : ""}`}
            >
              <span aria-hidden className="absolute right-6 top-2 font-serif text-[6rem] leading-none text-gold/25">
                ”
              </span>
              <div className="flex gap-1 text-gold" aria-hidden>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} size={12} />
                ))}
              </div>
              <blockquote className="mt-5 font-serif text-[1.65rem] font-light italic leading-[1.22] text-cream md:text-[2rem]">
                “{d.text}”
              </blockquote>
              <figcaption className="label mt-6 flex items-center gap-3 text-cream/60">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/40 font-serif text-[0.95rem] normal-case italic tracking-normal text-gold-soft">
                  {d.name[0]}
                </span>
                {d.name} · Google
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
