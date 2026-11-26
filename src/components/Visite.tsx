import { useId, useState } from "react";
import { FAQ, LINKS, LOCAL, whatsappLink } from "../content";
import { ArrowRight, ArrowUpRight, Plus } from "./Icons";

export function Visite() {
  const [open, setOpen] = useState<number | null>(null);
  const uid = useId();

  return (
    <section id="localizacao" className="relative bg-paper px-5 py-24 md:px-10 md:py-36" aria-label="Localização">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-16">
          <p className="t-eyebrow text-mute lg:col-span-3" data-reveal>
            (05) Localização
          </p>
          <h2 className="t-title text-[clamp(2.6rem,9.5vw,7.4rem)] lg:col-span-9" data-lines>
            <span className="line-mask">
              <span data-line>Visite a clínica.</span>
            </span>
            <span className="line-mask">
              <span data-line className="text-mute-2">Perto da Paulista.</span>
            </span>
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col justify-between gap-10 lg:col-span-4 lg:col-start-4" data-reveal>
            <div>
              <p className="text-[1.5rem] leading-snug tracking-[-0.025em]">
                {LOCAL.address}
                <span className="block text-mute">{LOCAL.city}</span>
              </p>
              <ul className="mt-8 border-t border-ink/10">
                {LOCAL.notes.map((n) => (
                  <li key={n} className="border-b border-ink/10 py-3.5 text-[0.98rem] text-ink/70">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={whatsappLink()} target="_blank" rel="noopener" className="btn btn-dark" data-cursor="WhatsApp">
                Agendar pelo WhatsApp
                <span className="btn-arrow">
                  <ArrowRight size={14} strokeWidth={1.8} />
                </span>
              </a>
              <a href={LINKS.maps} target="_blank" rel="noopener" className="btn btn-ghost">
                Abrir no Maps <ArrowUpRight size={15} strokeWidth={1.6} />
              </a>
            </div>
          </div>
          <div className="overflow-hidden rounded-[22px] bg-paper-2 lg:col-span-5 md:rounded-[28px]" data-reveal>
            <iframe
              title="Mapa: BM Odontologia, Av. Brigadeiro Luís Antônio, 2050"
              src={LINKS.mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block aspect-[4/5] w-full md:aspect-[4/3] lg:aspect-[4/5]"
              style={{ filter: "grayscale(1) contrast(1.05) brightness(1.04)", border: 0 }}
            />
          </div>
        </div>

        {/* perguntas frequentes */}
        <div className="mt-28 grid gap-y-8 md:mt-40 lg:grid-cols-12 lg:gap-x-16">
          <p className="t-eyebrow text-mute lg:col-span-3" data-reveal>
            Perguntas frequentes
          </p>
          <div className="border-t border-ink/12 lg:col-span-9">
            {FAQ.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className="border-b border-ink/12">
                  <h3>
                    <button
                      type="button"
                      id={`${uid}-q${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`${uid}-a${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-8"
                    >
                      <span className="t-title text-[clamp(1.35rem,3.2vw,2.3rem)]">{f.q}</span>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/20 transition-transform duration-700 ease-[var(--ease-out-expo)] ${isOpen ? "rotate-45" : ""}`}>
                        <Plus size={16} strokeWidth={1.6} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${uid}-a${i}`}
                    role="region"
                    aria-labelledby={`${uid}-q${i}`}
                    className="grid transition-[grid-template-rows] duration-700 ease-[var(--ease-out-expo)]"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-8 text-[1.05rem] leading-relaxed text-ink/65">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
