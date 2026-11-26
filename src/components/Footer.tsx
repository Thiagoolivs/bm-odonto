import { LINKS, LOCAL, RESPONSAVEIS, SIGNATURE, WHATSAPP_DISPLAY, whatsappLink } from "../content";
import { onAnchorClick } from "../lib/scroll";
import { ArrowUpRight } from "./Icons";
import { Mark } from "./Mark";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 text-bone md:px-10 md:pt-36">
      <div className="mx-auto max-w-[1440px]">
        <p className="t-eyebrow text-bone/50">{SIGNATURE}</p>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener"
          data-cursor="WhatsApp"
          className="group mt-6 block"
        >
          <span className="t-display block text-[clamp(3.4rem,13.5vw,15rem)]">Agende sua</span>
          <span className="t-display flex items-center gap-[0.15em] text-[clamp(3.4rem,13.5vw,15rem)]">
            <span className="text-bone/55 transition-colors duration-700 group-hover:text-bone">avaliação</span>
            <span className="grid h-[0.62em] w-[0.62em] place-items-center rounded-full bg-bone text-ink transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-45">
              <ArrowUpRight className="h-[45%] w-[45%]" strokeWidth={1.4} />
            </span>
          </span>
        </a>

        <div className="mt-20 grid gap-10 border-t border-bone/12 pt-10 text-[0.95rem] md:mt-28 md:grid-cols-4">
          <div>
            <a href="#inicio" onClick={onAnchorClick} aria-label="Voltar ao início">
              <Mark size={52} tone="light" alt="" />
            </a>
          </div>
          <div className="flex flex-col gap-1.5 text-bone/70">
            <p className="mb-2 text-bone/55">Contato</p>
            <a href={whatsappLink()} target="_blank" rel="noopener" className="u-link w-fit hover:text-bone">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <a href={LINKS.instagram} target="_blank" rel="noopener" className="u-link w-fit hover:text-bone">
              Instagram {LINKS.instagramHandle}
            </a>
          </div>
          <div className="flex flex-col gap-1.5 text-bone/70">
            <p className="mb-2 text-bone/55">Endereço</p>
            <p>{LOCAL.address}</p>
            <p>{LOCAL.city}</p>
          </div>
          <div className="flex flex-col gap-1.5 text-bone/70">
            <p className="mb-2 text-bone/55">Responsáveis técnicos</p>
            {RESPONSAVEIS.map((r) => (
              <p key={r}>{r}</p>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 text-[0.78rem] leading-relaxed text-bone/55 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} BM Odontologia · Lentes em resina em São Paulo</p>
          <p className="max-w-[44rem] md:text-right">
            Imagens de abertura de banco de imagens, de uso ilustrativo. Casos clínicos publicados com autorização dos pacientes. Simulações
            ilustrativas: a indicação de cada tratamento é feita na avaliação.
          </p>
        </div>
      </div>
    </footer>
  );
}
