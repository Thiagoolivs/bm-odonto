import { useEffect, useRef } from "react";
import { SEQUENCE } from "../content";
import { ScrollTrigger, onFrame } from "../lib/scroll";
import { isSmallScreen, prefersReducedMotion } from "../lib/env";

const COUNT_D = 111;
const COUNT_M = 69;

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/**
 * Sequência de quadros controlada pela rolagem (como a página dos AirPods Pro):
 * imagens pré-extraídas do vídeo, desenhadas num canvas — sem "seek" de vídeo, sem engasgos.
 */
export function SmileSequence() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const small = isSmallScreen();
    const reduced = prefersReducedMotion();
    const dir = small ? "/media/seq-m/" : "/media/seq-d/";
    const COUNT = small ? COUNT_M : COUNT_D;
    const imgs: (HTMLImageElement | null)[] = new Array(COUNT).fill(null);
    const c = canvas.current!;
    const ctx = c.getContext("2d", { alpha: false })!;
    let loading = false;

    // carregamento progressivo: primeiro quadros espaçados, depois os intermediários
    const order: number[] = [];
    for (const stride of [24, 8, 4, 2, 1]) for (let i = 0; i < COUNT; i += stride) if (!order.includes(i)) order.push(i);
    if (!order.includes(COUNT - 1)) order.splice(1, 0, COUNT - 1);
    const load = () => {
      if (loading) return;
      loading = true;
      let next = 0;
      const worker = async () => {
        while (next < order.length) {
          const i = order[next++];
          const img = new Image();
          img.decoding = "async";
          img.src = `${dir}${String(i + 1).padStart(3, "0")}.webp`;
          try {
            await img.decode();
            imgs[i] = img;
            if (i === 0) dirty = true;
          } catch {
            /* ignora quadro que falhou */
          }
        }
      };
      for (let w = 0; w < 4; w++) worker();
    };
    // o primeiro quadro carrega logo; o restante só quando a pessoa começa a rolar
    const first = new Image();
    first.src = `${dir}001.webp`;
    first.decode().then(() => {
      if (!imgs[0]) imgs[0] = first;
      dirty = true;
    }, () => {});
    let near = false;
    let scrolled = false;
    const maybeLoad = () => near && scrolled && load();
    const onScroll = () => {
      scrolled = true;
      maybeLoad();
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => {
      near = e.isIntersecting;
      maybeLoad();
    }, { rootMargin: "150% 0px" });
    io.observe(section.current!);

    let target = 0;
    let current = 0;
    let drawn = -1;
    let dirty = true;
    let progress = 0;
    let lastGrow = -1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      dirty = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const nearest = (i: number) => {
      for (let d = 0; d < COUNT; d++) {
        if (imgs[i - d]) return imgs[i - d];
        if (imgs[i + d]) return imgs[i + d];
      }
      return null;
    };

    // o quadro nasce como um cartão e cresce até a tela cheia (como na Apple)
    const STUDIO = "#d6d4cf";
    const draw = (i: number, grow: number) => {
      const img = nearest(i);
      const cw = c.width;
      const ch = c.height;
      ctx.fillStyle = STUDIO;
      ctx.fillRect(0, 0, cw, ch);
      if (!img) return;
      const g = ease(grow);
      const insetX = cw * (small ? 0.06 : 0.22) * (1 - g);
      const insetY = ch * (small ? 0.06 : 0.16) * (1 - g);
      const rx = insetX;
      const ry = insetY;
      const rw = cw - insetX * 2;
      const rh = ch - insetY * 2;
      const radius = (small ? 18 : 28) * (window.devicePixelRatio || 1) * (1 - g);
      const s = Math.max(rw / img.naturalWidth, rh / img.naturalHeight) * (1.08 - 0.08 * g);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.save();
      ctx.beginPath();
      if (radius > 0.5 && "roundRect" in ctx) (ctx as CanvasRenderingContext2D).roundRect(rx, ry, rw, rh, radius);
      else ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, rx + (rw - w) / 2, ry + (rh - h) * 0.45, w, h);
      ctx.restore();
    };

    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress = self.progress;
        target = Math.min(1, Math.max(0, (progress - 0.06) / 0.94)) * (COUNT - 1);
      },
    });

    const off = onFrame((_, dt) => {
      current += (target - current) * (reduced ? 1 : 1 - Math.exp(-dt * 10));
      const f = Math.round(current);
      const grow = progress / 0.16;
      const growKey = Math.round(Math.min(1, grow) * 200);
      if (f !== drawn || dirty || growKey !== lastGrow) {
        draw(f, grow);
        drawn = f;
        lastGrow = growKey;
        dirty = false;
      }
      // frases: entram e saem conforme o progresso
      SEQUENCE.forEach((s, i) => {
        const el = texts.current[i];
        if (!el) return;
        const [a, b] = s.at;
        const fin = Math.min(1, Math.max(0, (progress - a) / 0.07));
        const fout = Math.min(1, Math.max(0, (b - progress) / 0.07));
        const o = Math.min(fin, fout);
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(1 - fin) * 40 - (1 - fout) * 40}px, 0)`;
        el.style.visibility = o > 0.001 ? "visible" : "hidden";
      });
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
    });

    return () => {
      off();
      st.kill();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={section} className="relative h-[460svh] bg-studio text-ink" aria-label="O sorriso">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <div className="relative h-[66svh] w-full lg:absolute lg:inset-0 lg:h-full">
          <canvas ref={canvas} aria-hidden className="h-full w-full" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-studio to-transparent lg:h-[45%] lg:from-studio/90" />
        </div>

        <div className="relative flex-1 lg:absolute lg:inset-0">
          {SEQUENCE.map((s, i) => (
            <div
              key={i}
              ref={(el) => {
                texts.current[i] = el;
              }}
              className="absolute inset-x-5 top-2 opacity-0 lg:inset-x-10 lg:bottom-24 lg:top-auto"
              style={{ visibility: "hidden" }}
            >
              <p className="t-display text-[clamp(2.6rem,11.5vw,8.4rem)] lg:text-[clamp(3rem,7.2vw,8.4rem)]">
                {s.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] flex items-center gap-4 text-[0.8rem] text-ink/65 lg:inset-x-10 lg:bottom-10">
          <span>Role</span>
          <div className="relative h-px flex-1 bg-ink/15">
            <div ref={bar} className="absolute inset-0 origin-left bg-ink" style={{ transform: "scaleX(0)" }} />
          </div>
          <span>Imagem ilustrativa</span>
        </div>
      </div>
    </section>
  );
}
