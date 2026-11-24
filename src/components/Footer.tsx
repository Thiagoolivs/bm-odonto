import { LINKS, RESPONSAVEIS, SIGNATURE, WHATSAPP_DISPLAY, LOCAL, whatsappLink } from "../content";
import { onAnchorClick } from "../lib/scroll";
import { InstagramIcon, WhatsAppIcon } from "./Icons";
import { Logo } from "./ui";

export function Footer() {
  return (
    <footer className="grain relative z-10 overflow-hidden bg-ink px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-20 text-cream md:px-10 md:pt-28">
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <a href="#inicio" onClick={onAnchorClick} aria-label="Voltar ao início">
            <Logo size={76} />
          </a>
          <p className="display max-w-[16ch] text-[clamp(2.2rem,9vw,4.4rem)] italic text-cream/90">{SIGNATURE}</p>
        </div>

        <div className="mt-14 h-px bg-gold/25" />

        <div className="mt-10 grid gap-10 md:grid-cols-3">
          <div>
            <p className="label text-gold">Contato</p>
            <a href={whatsappLink()} target="_blank" rel="noopener" className="mt-4 flex items-center gap-3 text-[0.95rem] text-cream/80 hover:text-gold">
              <WhatsAppIcon size={17} className="text-gold" /> {WHATSAPP_DISPLAY}
            </a>
            <a href={LINKS.instagram} target="_blank" rel="noopener" className="mt-3 flex items-center gap-3 text-[0.95rem] text-cream/80 hover:text-gold">
              <InstagramIcon size={17} className="text-gold" /> {LINKS.instagramHandle}
            </a>
          </div>
          <div>
            <p className="label text-gold">Endereço</p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/80">
              {LOCAL.address}
              <br />
              {LOCAL.city} · Atendimento com agendamento
            </p>
          </div>
          <div>
            <p className="label text-gold">Responsáveis técnicos</p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/80">
              {RESPONSAVEIS.split(" | ").map((r) => (
                <span key={r} className="block">
                  {r}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-gold/15 pt-6 text-[0.7rem] leading-relaxed text-cream/65 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} BM Odontologia · Lentes em resina em São Paulo</p>
          <p>Simulações ilustrativas. A indicação de cada tratamento é feita na avaliação clínica.</p>
        </div>
      </div>
      <p
        aria-hidden
        className="display pointer-events-none mt-10 select-none whitespace-nowrap text-center text-[34vw] leading-[0.8] text-gold/[0.07] md:text-[22vw]"
      >
        BM
      </p>
    </footer>
  );
}
