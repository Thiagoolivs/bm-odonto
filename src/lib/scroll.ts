import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initScroll(reduced: boolean) {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (reduced) return () => {};
  // No toque, a rolagem continua nativa (syncTouch desligado): 60fps garantidos.
  lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToHash(hash: string) {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
  else el.scrollIntoView({ behavior: "auto", block: "start" });
}

/** intercepta cliques em links "#ancora" para rolar suavemente */
export function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#")) return;
  e.preventDefault();
  scrollToHash(href);
  history.replaceState(null, "", href);
}

export { gsap, ScrollTrigger };
