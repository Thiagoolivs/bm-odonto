import { useEffect, useState } from "react";
import { whatsappLink } from "../content";
import { WhatsAppIcon } from "./Icons";

/** Botão flutuante discreto: aparece depois da abertura e some sobre o rodapé. */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    let pastHero = false;
    let overFooter = false;
    const update = () => setVisible(pastHero && !overFooter);
    const io = new IntersectionObserver(([e]) => {
      overFooter = e.isIntersecting;
      update();
    });
    if (footer) io.observe(footer);
    const onScroll = () => {
      const p = window.scrollY > window.innerHeight * 0.85;
      if (p !== pastHero) {
        pastHero = p;
        update();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener"
      aria-label="Falar com a BM Odontologia pelo WhatsApp"
      tabIndex={visible ? 0 : -1}
      data-cursor="WhatsApp"
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 grid h-[52px] w-[52px] place-items-center rounded-full bg-ink text-bone shadow-[0_8px_30px_-6px_rgba(0,0,0,0.45)] transition-all duration-700 ease-[var(--ease-out-expo)] md:bottom-8 md:right-8 md:h-14 md:w-14 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <WhatsAppIcon size={22} />
    </a>
  );
}
