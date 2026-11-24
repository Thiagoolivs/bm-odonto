import { LINKS, LOCAL, whatsappLink } from "../content";
import { ArrowUpRight, AvenueIcon, CalendarIcon, MetroIcon, PinIcon, WhatsAppIcon } from "./Icons";
import { Label, Title } from "./ui";

const NOTE_ICONS = [MetroIcon, AvenueIcon, CalendarIcon];

export function Localizacao() {
  return (
    <section id="localizacao" className="theme-light grain-light relative z-10 bg-cream px-6 py-24 text-cocoa md:px-10 md:py-36" aria-label="Localização">
      <div className="relative z-10 mx-auto max-w-[1400px] md:grid md:grid-cols-[1fr_1.3fr] md:gap-20">
        <div>
          <Label>Localização</Label>
          <Title lines={["No coração", "de São Paulo."]} italic={1} className="mt-5 text-[clamp(2.6rem,11vw,5.2rem)] text-cocoa [&_.text-gold-soft]:text-gold" />

          <div className="mt-10 flex gap-4" data-reveal>
            <PinIcon size={22} className="mt-1 shrink-0 text-gold" />
            <p className="font-serif text-[1.6rem] leading-snug text-cocoa">
              {LOCAL.address}
              <span className="block text-[1.1rem] italic text-cocoa/60">{LOCAL.city}</span>
            </p>
          </div>

          <ul className="mt-8 border-t border-cocoa/15">
            {LOCAL.notes.map((n, i) => {
              const Icon = NOTE_ICONS[i];
              return (
                <li key={n} data-reveal className="flex items-center gap-4 border-b border-cocoa/15 py-4 text-[0.95rem] text-cocoa/80">
                  <Icon size={20} className="text-gold" /> {n}
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3" data-reveal>
            <a href={LINKS.maps} target="_blank" rel="noopener" className="btn-gold on-light">
              Ver no Google Maps <ArrowUpRight size={15} />
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener" className="btn-gold solid">
              <WhatsAppIcon size={17} /> Agendar
            </a>
          </div>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[28px] border border-gold/30 md:mt-0" data-reveal>
          <iframe
            title="Mapa: BM Odontologia, Av. Brigadeiro Luís Antônio, 2050"
            src={LINKS.mapsEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[440px] w-full md:h-full md:min-h-[560px]"
            style={{ filter: "grayscale(1) sepia(.32) contrast(.96) brightness(1.03)", border: 0 }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-gold/30" />
        </div>
      </div>
    </section>
  );
}
