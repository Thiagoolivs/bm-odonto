import { useEffect, useLayoutEffect } from "react";
import { Stage } from "./components/Stage";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ScrollStory } from "./components/ScrollStory";
import { Simulator } from "./components/Simulator";
import { SorrisoReal } from "./components/SorrisoReal";
import { Tecnicas } from "./components/Tecnicas";
import { Resultados } from "./components/Resultados";
import { Doutores } from "./components/Doutores";
import { Depoimentos } from "./components/Depoimentos";
import { Jornada, OutrosTratamentos } from "./components/Jornada";
import { Faq } from "./components/Faq";
import { PreAvaliacao } from "./components/PreAvaliacao";
import { Localizacao } from "./components/Localizacao";
import { Footer } from "./components/Footer";
import { WhatsAppFab } from "./components/WhatsAppFab";
import { gsap, initScroll, ScrollTrigger, scrollToHash } from "./lib/scroll";
import { prefersReducedMotion } from "./lib/env";

export default function App() {
  // rolagem suave + animações de entrada ao rolar
  useLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    const stop = initScroll(reduced);
    if (reduced) return stop;

    document.documentElement.classList.add("reveal-ready");
    const ctx = gsap.context(() => {
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.09, overwrite: true }),
      });
      gsap.utils.toArray<HTMLElement>("[data-lines]").forEach((el) => {
        if (el.closest("#inicio")) return;
        gsap.from(el.querySelectorAll("[data-line]"), {
          yPercent: 112,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
    });
    return () => {
      ctx.revert();
      document.documentElement.classList.remove("reveal-ready");
      stop();
    };
  }, []);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    if (location.hash) setTimeout(() => scrollToHash(location.hash), 400);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-cream focus:p-3 focus:text-ink">
        Pular para o conteúdo
      </a>
      <Stage />
      <Header />
      <main id="conteudo">
        <div id="zona-3d" className="relative z-10">
          <Hero />
          <ScrollStory />
          <Simulator />
        </div>
        <SorrisoReal />
        <Tecnicas />
        <Resultados />
        <Doutores />
        <Depoimentos />
        <Jornada />
        <OutrosTratamentos />
        <Faq />
        <PreAvaliacao />
        <Localizacao />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
