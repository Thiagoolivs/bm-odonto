import { useId, useState } from "react";
import { FAQ } from "../content";
import { Plus } from "./Icons";
import { Label, Title } from "./ui";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <section id="faq" className="theme-light grain-light relative z-10 bg-cream px-6 py-24 text-cocoa md:px-10 md:py-36" aria-label="Perguntas frequentes">
      <div className="relative z-10 mx-auto max-w-[1400px] md:grid md:grid-cols-[1fr_1.4fr] md:gap-20">
        <div>
          <Label>Dúvidas frequentes</Label>
          <Title lines={["Perguntas", "comuns."]} italic={1} className="mt-5 text-[clamp(2.6rem,11vw,5.2rem)] text-cocoa [&_.text-gold-soft]:text-gold" />
        </div>
        <div className="mt-12 border-t border-cocoa/15 md:mt-0">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-cocoa/15" data-reveal>
                <h3>
                  <button
                    type="button"
                    id={`${uid}-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-serif text-[1.55rem] leading-tight text-cocoa md:text-[1.9rem]">{f.q}</span>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-lux)] ${
                        isOpen ? "rotate-45 border-gold bg-gold text-cream" : "border-cocoa/25 text-gold"
                      }`}
                    >
                      <Plus size={16} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`${uid}-a${i}`}
                  role="region"
                  aria-labelledby={`${uid}-q${i}`}
                  className="grid transition-[grid-template-rows] duration-600 ease-[var(--ease-lux)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="max-w-xl pb-7 pr-12 text-[0.98rem] leading-relaxed text-cocoa/72 transition-opacity duration-500"
                      style={{ opacity: isOpen ? 1 : 0 }}
                    >
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
