import { useEffect, useRef, useState } from "react";
import { RESULTADOS, VIDEOS } from "../content";
import { ArrowRight } from "./Icons";
import { Label, Title } from "./ui";

/** carrossel nativo (scroll-snap) + arrastar com mouse no desktop */
function useDragScroll(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.scrollSnapType = "";
      el.style.cursor = "";
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [ref]);
}

function VideoCard({ src, poster, i }: { src: string; poster: string; i: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== "auto") v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <figure className="relative w-[64vw] max-w-[300px] shrink-0 snap-center overflow-hidden rounded-[26px] border border-gold/20 bg-ink-2 md:w-auto md:max-w-none">
      <video
        ref={ref}
        className="aspect-[9/16] h-full w-full object-cover"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={`Vídeo de resultado ${i + 1}`}
      />
      <figcaption className="label absolute left-4 top-4 rounded-full bg-ink/60 px-3 py-1.5 text-[0.55rem] text-cream/80">
        Vídeo 0{i + 1}
      </figcaption>
    </figure>
  );
}

export function Resultados() {
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  useDragScroll(track);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = el.scrollWidth - el.clientWidth;
        const p = max > 0 ? el.scrollLeft / max : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${0.08 + p * 0.92})`;
        setIdx(Math.round(p * (RESULTADOS.length - 1)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const nudge = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("figure");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 12), behavior: "smooth" });
  };

  return (
    <section id="resultados" className="grain relative z-10 bg-ink py-24 text-cream md:py-32" aria-label="Resultados">
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10">
        <Label>Resultados</Label>
        <div className="md:flex md:items-end md:justify-between">
          <Title lines={["Cada sorriso,", "único."]} italic={1} className="mt-5 text-[clamp(2.6rem,11vw,5.6rem)] text-cream" />
          <div className="mt-6 hidden gap-3 md:flex">
            <button type="button" onClick={() => nudge(-1)} aria-label="Anterior" className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 text-cream transition-colors hover:bg-gold hover:text-ink">
              <ArrowRight size={18} className="rotate-180" />
            </button>
            <button type="button" onClick={() => nudge(1)} aria-label="Próximo" className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 text-cream transition-colors hover:bg-gold hover:text-ink">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={track}
        data-lenis-prevent-wheel
        className="no-scrollbar relative z-10 mt-10 flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-6 pb-2 md:mt-14 md:gap-5 md:px-10"
        role="region"
        aria-label="Fotos de casos atendidos"
        tabIndex={0}
      >
        {RESULTADOS.map((src, i) => (
          <figure
            key={src}
            className="relative w-[78vw] max-w-[380px] shrink-0 snap-center overflow-hidden rounded-[24px] bg-ink-2 first:ml-0"
          >
            <img
              src={src}
              alt={`Caso atendido na BM Odontologia — imagem ${i + 1}`}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="aspect-[4/5] h-full w-full select-none object-cover"
            />
            <span className="label absolute bottom-4 left-4 text-[0.55rem] text-cream/85 [text-shadow:0_1px_8px_rgba(0,0,0,.5)]">
              {String(i + 1).padStart(2, "0")} / {RESULTADOS.length}
            </span>
          </figure>
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </div>

      <div className="relative z-10 mx-auto mt-6 flex max-w-[1400px] items-center gap-4 px-6 md:px-10">
        <span className="font-serif text-[1.05rem] italic text-gold-soft">{String(idx + 1).padStart(2, "0")}</span>
        <div className="relative h-px flex-1 bg-cream/15">
          <div ref={bar} className="absolute inset-0 origin-left bg-gold" style={{ transform: "scaleX(.08)" }} />
        </div>
        <span className="font-serif text-[1.05rem] italic text-cream/65">{RESULTADOS.length}</span>
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10">
        <p className="mt-6 text-[0.78rem] leading-relaxed text-cream/65">
          Imagens publicadas com autorização dos pacientes. Cada caso é único e os resultados variam de pessoa para pessoa.
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-20 max-w-[1400px] px-6 md:mt-28 md:px-10">
        <Label>Em movimento</Label>
        <p className="display mt-4 max-w-[18ch] text-[clamp(2rem,8vw,3.6rem)] text-cream" data-reveal>
          A naturalidade aparece quando o sorriso <span className="italic text-gold-soft">se move.</span>
        </p>
      </div>
      <div className="no-scrollbar relative z-10 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 md:mx-auto md:grid md:max-w-[1400px] md:grid-cols-3 md:gap-6 md:overflow-visible md:px-10">
        {VIDEOS.map((v, i) => (
          <VideoCard key={v.src} {...v} i={i} />
        ))}
        <div className="w-1 shrink-0 md:hidden" aria-hidden />
      </div>
    </section>
  );
}
