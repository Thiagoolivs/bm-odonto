import { useEffect, useRef, useState } from "react";
import { HERO, whatsappLink } from "../content";
import { HeroGL } from "../gl/HeroGL";
import { gsap, onAnchorClick, onFrame } from "../lib/scroll";
import { markHeroReady, whenEntered } from "../lib/app";
import { isSmallScreen, prefersReducedMotion, webglTier } from "../lib/env";
import { ArrowRight } from "./Icons";

const FALLBACK: [number, number, number] = [0.84, 0.83, 0.81];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [glFailed, setGlFailed] = useState(false);
  const small = isSmallScreen();

  // vídeo + WebGL
  useEffect(() => {
    const v = video.current!;
    const c = canvas.current!;
    const reduced = prefersReducedMotion();
    let gl: HeroGL | null = null;
    // sem GPU (WebGL emulado na CPU) o shader travaria a página: usa o vídeo direto
    if (webglTier() === "gpu") {
      try {
        gl = new HeroGL(c, v, { focus: small ? [0.5, 0.4] : [0.5, 0.45], fallback: FALLBACK });
      } catch {
        gl = null;
      }
    }
    if (!gl) setGlFailed(true);

    const onReady = () => markHeroReady();
    if (v.readyState >= 3) onReady();
    v.addEventListener("canplay", onReady, { once: true });
    v.addEventListener("error", onReady, { once: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible) v.pause();
      else if (document.documentElement.dataset.entered) v.play().catch(() => {});
    });
    io.observe(root.current!);

    // layout: no desktop o vídeo ocupa a direita e se funde ao estúdio; no celular, tela cheia
    const lens = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0, k: 0, tk: 0, lastMove: -10 };
    const layout = () => {
      if (!gl) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      gl.resize(w, h, Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
      if (w >= 1024) {
        gl.rect = { x: w * 0.34, y: 0, w: w * 0.66, h };
        gl.feather = w * 0.16;
        gl.featherB = 0;
      } else {
        // celular: retrato em cima, texto embaixo; a base do vídeo se dissolve no estúdio
        gl.rect = { x: 0, y: 0, w, h: h * (h / w > 1.9 ? 0.66 : 0.6) };
        gl.feather = 0;
        gl.featherB = h * 0.16;
      }
      lens.tr = Math.min(w, h) * (w >= 1024 ? 0.12 : 0.17);
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(c);

    // a lente segue o mouse; parada, ela volta a flutuar sobre o rosto
    const move = (e: PointerEvent) => {
      if (!gl) return;
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      // só segue o cursor sobre o vídeo; fora dele, volta a flutuar no sorriso
      if (x < gl.rect.x + gl.feather * 0.5 || y > gl.rect.y + gl.rect.h) return;
      if ((e.target as HTMLElement).closest("a,button")) return;
      lens.tx = x;
      lens.ty = y;
      lens.lastMove = performance.now();
    };
    root.current!.addEventListener("pointermove", move);

    const off = onFrame((time) => {
      if (!gl || !visible) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      const idle = performance.now() - lens.lastMove > 2600;
      if (idle || reduced) {
        // trajetória lenta (Lissajous) sobre a região do sorriso
        const cx = gl.rect.x + gl.rect.w * 0.5;
        const cy = w >= 1024 ? h * 0.6 : gl.rect.y + gl.rect.h * 0.6;
        const a = reduced ? 0 : time * 0.38;
        lens.tx = cx + Math.sin(a) * gl.rect.w * (w >= 1024 ? 0.09 : 0.13);
        lens.ty = cy + Math.sin(a * 1.6 + 1.2) * h * 0.025;
      }
      lens.tk = gl.reveal > 0.6 ? 0.34 : 0;
      const kPos = idle ? 0.025 : 0.14;
      if (lens.x === 0 && lens.y === 0) {
        lens.x = lens.tx;
        lens.y = lens.ty;
      }
      lens.x += (lens.tx - lens.x) * kPos;
      lens.y += (lens.ty - lens.y) * kPos;
      lens.r += (lens.tr - lens.r) * 0.06;
      lens.k += (lens.tk - lens.k) * 0.05;
      gl.lens = { x: lens.x, y: lens.y, r: lens.r * Math.min(1, gl.reveal * 1.4), k: lens.k };
      gl.render(time);
    });

    const stop = whenEntered(() => {
      document.documentElement.dataset.entered = "1";
      v.play().catch(() => {});
      if (gl) gsap.to(gl, { reveal: 1, duration: reduced ? 0.01 : 2.4, ease: "expo.out", delay: reduced ? 0 : 0.15 });
    });

    return () => {
      stop();
      off();
      io.disconnect();
      ro.disconnect();
      root.current?.removeEventListener("pointermove", move);
      gl?.dispose();
    };
  }, [small]);

  // texto: entrada + saída com parallax
  useEffect(() => {
    const reduced = prefersReducedMotion();
    let unsub = () => {};
    const ctx = gsap.context(() => {
      gsap.set("[data-h-line]", { yPercent: reduced ? 0 : 110 });
      gsap.set("[data-h-fade]", { opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 });
      unsub = whenEntered(() =>
        ctx.add(() => {
          const tl = gsap.timeline({ delay: reduced ? 0 : 0.35 });
          tl.to("[data-h-line]", { yPercent: 0, duration: 1.5, ease: "expo.out", stagger: 0.09 }).to(
            "[data-h-fade]",
            { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.06 },
            0.45,
          );
        }),
      );
      if (!reduced) {
        gsap.to("[data-h-copy]", {
          yPercent: -18,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(canvas.current, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      }
    }, root);
    return () => {
      unsub();
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="inicio"
      ref={root}
      data-cursor=""
      className="relative h-svh min-h-[620px] overflow-hidden text-ink"
      style={{ background: glFailed ? "#c9cccd" : "var(--color-studio)" }}
      aria-label="Apresentação"
    >
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full will-change-transform" style={{ display: glFailed ? "none" : "block" }} />
      <video
        ref={video}
        src={small ? "/media/hero-m.mp4" : "/media/hero-d.mp4"}
        poster={small ? "/media/hero-poster-m.webp" : "/media/hero-poster.webp"}
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        aria-hidden
        className={
          glFailed
            ? "absolute inset-x-0 top-0 h-[62%] w-full object-cover object-[50%_35%] [mask-image:linear-gradient(to_bottom,#000_70%,transparent)] lg:inset-y-0 lg:left-[34%] lg:h-full lg:w-[66%] lg:[mask-image:linear-gradient(to_right,transparent,#000_26%)]"
            : "pointer-events-none absolute h-px w-px opacity-0"
        }
      />
      {/* leitura do texto no celular */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[26%] bg-gradient-to-t from-studio via-studio/40 to-transparent lg:block" />

      <div data-h-copy className="relative z-10 flex h-full flex-col justify-end px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 md:px-10 md:pb-10">
        <p data-h-fade className="t-eyebrow mb-5 max-w-[16rem] text-ink/70 lg:absolute lg:left-10 lg:top-[7.5rem] lg:mb-0">
          {HERO.eyebrow}
        </p>

        <h1 className="t-display text-[clamp(3.15rem,14.2vw,9.6rem)] lg:text-[clamp(4rem,8.4vw,9.6rem)]">
          {HERO.title.map((l) => (
            <span key={l} className="line-mask">
              <span data-h-line>{l}</span>
            </span>
          ))}
        </h1>

        <div className="mt-7 flex flex-col gap-7 lg:mt-10 lg:flex-row lg:items-end lg:justify-between">
          <div data-h-fade className="flex flex-wrap items-center gap-x-5 gap-y-3 whitespace-nowrap">
            <a href={whatsappLink()} target="_blank" rel="noopener" className="btn btn-dark" data-cursor="Agendar">
              {HERO.cta}
              <span className="btn-arrow">
                <ArrowRight size={14} strokeWidth={1.8} />
              </span>
            </a>
            <a href="#lentes" onClick={onAnchorClick} className="u-link text-[0.95rem] font-medium">
              Simular minha lente
            </a>
          </div>

          <ul className="grid grid-cols-3 gap-4 border-t border-ink/15 pt-4 lg:w-[min(46vw,640px)] lg:gap-8">
            {HERO.seals.map((s) => (
              <li data-h-fade key={s.title} className="text-[0.8rem] leading-snug md:text-[0.9rem]">
                <span className="block font-medium">{s.title}</span>
                <span className="block text-ink/65">{s.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
