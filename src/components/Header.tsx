import { useEffect, useRef, useState } from "react";
import { HERO, LINKS, NAV, WHATSAPP_DISPLAY, whatsappLink } from "../content";
import { onAnchorClick, scrollToHash } from "../lib/scroll";
import { CloseIcon, InstagramIcon, MenuIcon, WhatsAppIcon } from "./Icons";
import { Logo } from "./ui";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 30);
        const goingDown = y > last.current + 4;
        const goingUp = y < last.current - 4;
        if (goingDown && y > window.innerHeight * 0.9) setHidden(true);
        else if (goingUp || y < 80) setHidden(false);
        last.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    requestAnimationFrame(() => scrollToHash(href));
  };

  return (
    <>
      <header
        data-hero-fade
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-700 ease-[var(--ease-lux)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${scrolled && !open ? "border-b border-gold/15 bg-ink/88" : "border-b border-transparent bg-transparent"}`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-20 md:px-10">
          <a href="#inicio" onClick={onAnchorClick} className="flex items-center gap-3" aria-label="BM Odontologia — início">
            <Logo size={38} className="md:h-11 md:w-11" />
            <span className="hidden font-serif text-[1.15rem] leading-none tracking-wide text-cream sm:block">
              BM <span className="italic text-gold-soft">Odontologia</span>
            </span>
          </a>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Seções">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={onAnchorClick}
                className="label text-[0.66rem] text-cream/75 transition-colors duration-300 hover:text-gold"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="#agendar" onClick={onAnchorClick} className="btn-gold !px-4 !py-2.5 !text-[0.6rem] !tracking-[0.2em] md:!px-6 md:!py-3">
              <span className="md:hidden">Agendar</span>
              <span className="hidden md:inline">{HERO.cta}</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 text-cream lg:hidden"
            >
              {open ? <CloseIcon size={20} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* menu em tela cheia (mobile) */}
      <div
        id="menu"
        className={`grain fixed inset-0 z-40 flex flex-col bg-ink px-6 pb-10 pt-28 transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav className="relative z-10 flex flex-1 flex-col gap-1" aria-label="Menu">
          {NAV.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              tabIndex={open ? 0 : -1}
              onClick={(e) => {
                e.preventDefault();
                go(n.href);
              }}
              className="group flex items-baseline gap-4 border-b border-gold/15 py-4"
              style={{
                transition: `transform .8s var(--ease-lux) ${open ? 0.08 + i * 0.06 : 0}s, opacity .8s var(--ease-lux) ${open ? 0.08 + i * 0.06 : 0}s`,
                transform: open ? "none" : "translateY(24px)",
                opacity: open ? 1 : 0,
              }}
            >
              <span className="label text-gold/70">0{i + 1}</span>
              <span className="display text-[2.6rem] text-cream transition-colors group-hover:text-gold-soft">{n.label}</span>
            </a>
          ))}
        </nav>
        <div className="relative z-10 flex flex-col gap-4">
          <a href={whatsappLink()} target="_blank" rel="noopener" className="flex items-center gap-3 text-cream/85" tabIndex={open ? 0 : -1}>
            <WhatsAppIcon size={18} className="text-gold" /> {WHATSAPP_DISPLAY}
          </a>
          <a href={LINKS.instagram} target="_blank" rel="noopener" className="flex items-center gap-3 text-cream/85" tabIndex={open ? 0 : -1}>
            <InstagramIcon size={18} className="text-gold" /> {LINKS.instagramHandle}
          </a>
        </div>
      </div>
    </>
  );
}
