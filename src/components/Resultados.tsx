import { useEffect, useRef, useState } from "react";
import { RESULTADOS, VIDEOS } from "../content";
import { onFrame } from "../lib/scroll";

type Item = { kind: "img"; src: string } | { kind: "video"; src: string; poster: string };

// fotos reais da clínica, com os 3 vídeos intercalados
const ITEMS: Item[] = (() => {
  const out: Item[] = [];
  RESULTADOS.forEach((src, i) => {
    out.push({ kind: "img", src });
    if (i === 1) out.push({ kind: "video", ...VIDEOS[0] });
    if (i === 6) out.push({ kind: "video", ...VIDEOS[1] });
    if (i === 10) out.push({ kind: "video", ...VIDEOS[2] });
  });
  return out;
})();

function Video({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" className="h-full w-full object-cover" aria-label="Vídeo de caso atendido" />;
}

/** Galeria arrastável: rolagem nativa + arraste com mouse + leve inclinação pela velocidade. */
export function Resultados() {
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(1);

  useEffect(() => {
    const el = track.current!;
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let last = el.scrollLeft;
    let vel = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx * 1.4;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.scrollSnapType = "";
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

    let visible = false;
    let lastSkew = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const off = onFrame((_, dt) => {
      if (!visible) return;
      const d = el.scrollLeft - last;
      last = el.scrollLeft;
      vel += (d / Math.max(dt, 0.001) / 4000 - vel) * 0.2;
      const skew = Math.round(Math.max(-4, Math.min(4, vel * 6)) * 100) / 100;
      if (skew !== lastSkew) {
        el.style.setProperty("--skew", `${skew}deg`);
        lastSkew = skew;
      }
      const max = el.scrollWidth - el.clientWidth;
      const p = max > 0 ? el.scrollLeft / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${0.06 + p * 0.94})`;
      const i = Math.min(ITEMS.length, Math.max(1, Math.round(p * (ITEMS.length - 1)) + 1));
      setIdx((old) => (old === i ? old : i));
    });

    return () => {
      off();
      io.disconnect();
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <section id="resultados" className="relative bg-ink py-24 text-bone md:py-36" aria-label="Resultados">
      <div className="mx-auto grid max-w-[1440px] gap-y-8 px-5 md:px-10 lg:grid-cols-12 lg:gap-x-16">
        <p className="t-eyebrow text-bone/50 lg:col-span-3" data-reveal>
          (02) Resultados
        </p>
        <h2 className="t-title text-[clamp(2.6rem,9.5vw,7.4rem)] lg:col-span-9" data-lines>
          <span className="line-mask">
            <span data-line>Sorrisos reais.</span>
          </span>
          <span className="line-mask">
            <span data-line className="text-bone/45">Feitos aqui.</span>
          </span>
        </h2>
        <p className="max-w-[26rem] text-[0.95rem] leading-relaxed text-bone/55 lg:col-span-5 lg:col-start-4" data-reveal>
          Imagens publicadas com autorização dos pacientes. Cada caso é único e os resultados variam de pessoa para pessoa.
        </p>
      </div>

      <div
        ref={track}
        data-cursor="Arraste"
        data-lenis-prevent-wheel
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 md:mt-20 md:gap-5 md:px-10"
        role="region"
        aria-label="Galeria de casos atendidos"
        tabIndex={0}
      >
        {ITEMS.map((it, i) => (
          <figure
            key={i}
            className={`relative h-[58svh] max-h-[640px] min-h-[360px] shrink-0 snap-start overflow-hidden rounded-[18px] bg-ink-2 md:h-[66vh] md:rounded-[22px] ${
              it.kind === "video" ? "aspect-[9/16]" : "aspect-[4/5]"
            }`}
            style={{ transform: "skewX(var(--skew, 0deg))", transition: "transform 0.2s linear" }}
          >
            {it.kind === "img" ? (
              <img src={it.src} alt={`Caso atendido na BM Odontologia, imagem ${i + 1}`} loading="lazy" decoding="async" draggable={false} className="h-full w-full select-none object-cover" />
            ) : (
              <Video src={it.src} poster={it.poster} />
            )}
          </figure>
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </div>

      <div className="mx-auto mt-8 flex max-w-[1440px] items-center gap-5 px-5 text-[0.85rem] tabular-nums text-bone/55 md:px-10">
        <span className="text-bone">{String(idx).padStart(2, "0")}</span>
        <div className="relative h-px flex-1 bg-bone/15">
          <div ref={bar} className="absolute inset-0 origin-left bg-bone" style={{ transform: "scaleX(.06)" }} />
        </div>
        <span>{String(ITEMS.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
