import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/**
 * Um único relógio para tudo: o ticker do GSAP move o Lenis, o ScrollTrigger,
 * o WebGL da abertura, a sequência de quadros e a cena 3D — na mesma ordem,
 * no mesmo quadro. Nada de dois loops brigando (era o que causava tremidas).
 */
export function initScroll(reduced: boolean) {
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.ticker.lagSmoothing(0);
  if (reduced) return () => {};
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick, false, true);
  if (document.documentElement.classList.contains("is-loading")) lenis.stop();
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function startScroll() {
  document.documentElement.classList.remove("is-loading");
  lenis?.start();
  ScrollTrigger.refresh();
}

/** registra uma função por quadro (tempo em s, delta em s) */
export function onFrame(fn: (time: number, dt: number) => void) {
  const cb = (time: number, deltaMs: number) => fn(time, Math.min(deltaMs / 1000, 0.05));
  gsap.ticker.add(cb);
  return () => gsap.ticker.remove(cb);
}

export function scrollToHash(hash: string) {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: "auto", block: "start" });
}

export function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#")) return;
  e.preventDefault();
  scrollToHash(href);
  history.replaceState(null, "", href);
}

export { gsap, ScrollTrigger };
