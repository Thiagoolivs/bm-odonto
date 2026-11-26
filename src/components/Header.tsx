import { useEffect, useState } from "react";
import { LINKS, NAV, WHATSAPP_DISPLAY, whatsappLink } from "../content";
import { onAnchorClick, scrollToHash } from "../lib/scroll";
import { useEntered } from "../lib/app";
import { Mark } from "./Mark";

/**
 * Cabeçalho mínimo em branco com mix-blend "difference":
 * fica escuro sobre fundos claros e claro sobre fundos escuros, sem trocar estilos.
 */
export function Header() {
  const entered = useEntered();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    requestAnimationFrame(() => scrollToHash(href));
  };

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 text-white mix-blend-difference transition-opacity duration-1000"
        style={{ opacity: entered ? 1 : 0 }}
      >
        <div className="flex h-[72px] items-center justify-between px-5 md:h-[84px] md:px-10">
          <a href="#inicio" onClick={onAnchorClick} className="pointer-events-auto flex items-center gap-3" aria-label="BM Odontologia, início">
            <Mark size={34} tone="light" alt="" />
            <span className="hidden text-[0.95rem] font-medium tracking-[-0.02em] sm:block">BM Odontologia</span>
          </a>

          <nav className="pointer-events-auto hidden items-center gap-8 lg:flex" aria-label="Seções">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={onAnchorClick} className="u-link text-[0.9rem] font-medium tracking-[-0.01em]">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="pointer-events-auto flex items-center gap-5">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener"
              className="hidden items-center gap-2 text-[0.9rem] font-medium tracking-[-0.01em] md:flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" style={{ animation: "pulse-dot 2.4s ease-in-out infinite" }} />
              <span className="u-link">Agendar avaliação</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu"
              className="flex items-center gap-2 text-[0.9rem] font-medium lg:hidden"
            >
              <span>{open ? "Fechar" : "Menu"}</span>
              <span className="relative block h-[10px] w-[18px]" aria-hidden>
                <span className={`absolute left-0 h-px w-full bg-white transition-all duration-500 ${open ? "top-1/2 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-full bg-white transition-all duration-500 ${open ? "top-1/2 -rotate-45" : "top-full"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="menu"
        aria-hidden={!open}
        className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-28 text-bone lg:hidden"
        style={{
          clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
          transition: "clip-path 0.9s cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      >
        <nav className="flex flex-col" aria-label="Menu">
          {NAV.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              tabIndex={open ? 0 : -1}
              onClick={(e) => {
                e.preventDefault();
                go(n.href);
              }}
              className="t-title overflow-hidden py-1 text-[13vw] leading-[1.02]"
            >
              <span
                className="block"
                style={{
                  transform: open ? "none" : "translateY(105%)",
                  transition: `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${open ? 0.25 + i * 0.05 : 0}s`,
                }}
              >
                {n.label}
              </span>
            </a>
          ))}
        </nav>
        <div className="flex items-end justify-between text-[0.95rem] text-bone/70">
          <div className="flex flex-col gap-1">
            <a href={whatsappLink()} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <a href={LINKS.instagram} target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
              Instagram {LINKS.instagramHandle}
            </a>
          </div>
          <Mark size={44} tone="light" alt="" />
        </div>
      </div>
    </>
  );
}
