import { useEffect, useLayoutEffect } from "react";
import { Loader } from "./components/Loader";
import { Header } from "./components/Header";
import { Cursor } from "./components/Cursor";
import { Hero } from "./components/Hero";
import { SmileSequence } from "./components/SmileSequence";
import { Lentes } from "./components/Lentes";
import { Resultados } from "./components/Resultados";
import { Doutores } from "./components/Doutores";
import { Depoimentos } from "./components/Depoimentos";
import { Visite } from "./components/Visite";
import { Footer } from "./components/Footer";
import { WhatsAppFab } from "./components/WhatsAppFab";
import { gsap, initScroll, ScrollTrigger } from "./lib/scroll";
import { prefersReducedMotion } from "./lib/env";
import { whenEntered } from "./lib/app";

export default function App() {
  useLayoutEffect(() => {
    document.documentElement.classList.add("is-loading");
    const reduced = prefersReducedMotion();
    const stop = initScroll(reduced);
    if (reduced) return stop;
    document.documentElement.classList.add("reveal-ready");
    const ctx = gsap.context(() => {});
    const unsub = whenEntered(() => ctx.add(() => {
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 88%",
          once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", stagger: 0.08, overwrite: true }),
        });
        gsap.utils.toArray<HTMLElement>("[data-lines]").forEach((el) => {
          gsap.from(el.querySelectorAll("[data-line]"), {
            yPercent: 110,
            duration: 1.4,
            ease: "expo.out",
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
      }));
    return () => {
      unsub();
      ctx.revert();
      document.documentElement.classList.remove("reveal-ready");
      stop();
    };
  }, []);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  return (
    <>
      <Loader />
      <Cursor />
      <Header />
      <main id="conteudo">
        <Hero />
        <SmileSequence />
        <Lentes />
        <Resultados />
        <Doutores />
        <Depoimentos />
        <Visite />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
