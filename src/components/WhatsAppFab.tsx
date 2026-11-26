import { useEffect, useState } from "react";
import { whatsappLink } from "../content";
import { WhatsAppIcon } from "./Icons";

/** Botão flutuante: aparece depois do hero e some sobre o simulador e o formulário. */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hideOver = ["zona-3d", "agendar"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const over = new Map<Element, boolean>();
    let pastHero = false;
    const update = () => setVisible(pastHero && ![...over.values()].some(Boolean));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => over.set(e.target, e.isIntersecting && (e.target.id === "zona-3d" || e.intersectionRatio > 0.25)));
        update();
      },
      { threshold: [0, 0.25, 0.5], rootMargin: "0px 0px -35% 0px" },
    );
    hideOver.forEach((el) => io.observe(el));

    const onScroll = () => {
      const p = window.scrollY > window.innerHeight * 0.7;
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
      className={`fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold text-ink shadow-[0_10px_30px_-8px_rgba(0,0,0,.55)] transition-all duration-700 ease-[var(--ease-lux)] md:bottom-8 md:right-8 md:h-16 md:w-16 ${
        visible ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-6 scale-75 opacity-0"
      }`}
    >
      <span aria-hidden className="absolute inset-0 rounded-full border border-gold" style={{ animation: "ring-pulse 2.6s ease-out infinite" }} />
      <WhatsAppIcon size={26} />
    </a>
  );
}
