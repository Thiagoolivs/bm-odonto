import { useEffect, useRef, useState } from "react";
import { SHADES, SHAPES, SIMULATOR_NOTE } from "../content";
import { useRenderMode } from "../lib/renderMode";
import { bindDragRotate, sectionRef, slotRef, stage, type ShapeKey } from "../three/state";
import { DragIcon } from "./Icons";
import { ToothFallback } from "./ToothFallback";
import { Label, Title } from "./ui";

const SHAPE_ICON: Record<ShapeKey, string> = {
  oval: "M12 3c4.5 0 6.6 2.4 6.9 7 .3 5-1.6 11-6.9 11S4.8 15 5.1 10C5.4 5.4 7.5 3 12 3Z",
  quadrado: "M12 3c5 0 6.6 1.6 6.8 5.2.3 4 .3 7.6 0 10.4-.2 1.8-1.8 2.4-6.8 2.4s-6.6-.6-6.8-2.4c-.3-2.8-.3-6.4 0-10.4C5.4 4.6 7 3 12 3Z",
  triangular: "M12 3.5c3 0 4.7 1.2 5.5 4 1.2 4 2.3 8 2.1 10.6-.2 2-3 2.9-7.6 2.9s-7.4-.9-7.6-2.9C4.2 15.5 5.3 11.5 6.5 7.5c.8-2.8 2.5-4 5.5-4Z",
};

export function Simulator() {
  const slot = useRef<HTMLDivElement>(null);
  const mode = useRenderMode();
  const [shade, setShade] = useState<(typeof SHADES)[number]["key"]>("BL2");
  const [shape, setShape] = useState<ShapeKey>("oval");

  useEffect(() => {
    const s = SHADES.find((x) => x.key === shade)!;
    stage.shade = { lens: s.lens, tooth: s.tooth };
  }, [shade]);
  useEffect(() => {
    stage.shape = shape;
  }, [shape]);
  useEffect(() => (slot.current ? bindDragRotate(slot.current) : undefined), []);

  const tint = SHADES.find((x) => x.key === shade)!.tooth;

  return (
    <section
      id="simulador"
      ref={sectionRef("sim")}
      className="relative flex min-h-svh flex-col"
      aria-label="Simulador de cor e formato"
    >

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-6 pb-16 pt-20 md:px-10 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
        <div className="lg:order-2 lg:flex-1">
          <Label>Simulador</Label>
          <Title lines={["Experimente", "cor e formato."]} italic={1} className="mt-4 text-[clamp(2.4rem,10vw,4.6rem)] text-cream" />
          <p className="mt-4 hidden max-w-md text-[0.98rem] leading-relaxed text-cream/65 lg:block">
            Toque nas tonalidades e nos formatos para ver como a lente muda. Arraste o dente para girar.
          </p>

          <div className="hidden lg:block">
            <Controls shade={shade} setShade={setShade} shape={shape} setShape={setShape} />
          </div>
        </div>

        <div ref={slot} className="relative my-2 min-h-[250px] flex-1 touch-pan-y select-none lg:order-1 lg:h-[72vh] lg:flex-[1.1]">
          <div ref={slotRef("sim")} className="absolute inset-0" />
          {mode === "fallback" && (
            <ToothFallback shape={shape} tint={tint} className="absolute left-1/2 top-1/2 h-[86%] -translate-x-1/2 -translate-y-1/2" />
          )}
          <span className="label absolute right-0 top-2 flex items-center gap-2 text-[0.56rem] text-cream/62">
            <DragIcon size={14} className="text-gold" /> Arraste
          </span>
          <span className="absolute bottom-1 left-0 font-serif text-[2.2rem] italic leading-none text-gold-soft/90 transition-all duration-500">
            {shade}
          </span>
        </div>

        <div className="lg:hidden">
          <Controls shade={shade} setShade={setShade} shape={shape} setShape={setShape} />
        </div>
      </div>
    </section>
  );
}

function Controls({
  shade,
  setShade,
  shape,
  setShape,
}: {
  shade: string;
  setShade: (s: (typeof SHADES)[number]["key"]) => void;
  shape: ShapeKey;
  setShape: (s: ShapeKey) => void;
}) {
  return (
    <div className="lg:mt-10" data-no-drag>
      <fieldset>
        <legend className="label text-[0.6rem] text-cream/65">Tonalidade</legend>
        <div className="mt-3 flex justify-between gap-2 lg:justify-start lg:gap-4" role="radiogroup" aria-label="Tonalidade">
          {SHADES.map((s) => {
            const active = s.key === shade;
            return (
              <button
                key={s.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setShade(s.key)}
                className="group flex flex-col items-center gap-2"
              >
                <span
                  className={`relative grid h-[52px] w-[52px] place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-lux)] ${
                    active ? "scale-100" : "scale-[.86] group-hover:scale-95"
                  }`}
                >
                  <span
                    className={`absolute inset-0 rounded-full border transition-colors duration-500 ${active ? "border-gold" : "border-cream/15"}`}
                  />
                  <span
                    className="h-[38px] w-[38px] rounded-full shadow-[inset_0_-6px_12px_rgba(120,90,50,.25),inset_0_4px_8px_rgba(255,255,255,.7)]"
                    style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${s.swatch} 55%, ${s.swatch})` }}
                  />
                </span>
                <span className={`text-[0.68rem] font-medium tracking-[0.14em] transition-colors ${active ? "text-gold" : "text-cream/60"}`}>{s.key}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="label text-[0.6rem] text-cream/65">Formato</legend>
        <div className="mt-3 grid grid-cols-3 gap-2 lg:max-w-md" role="radiogroup" aria-label="Formato">
          {SHAPES.map((s) => {
            const active = s.key === shape;
            return (
              <button
                key={s.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setShape(s.key)}
                className={`flex items-center justify-center gap-2 rounded-full border px-2 py-3 text-[0.64rem] font-medium uppercase tracking-[0.14em] transition-colors duration-500 ${
                  active ? "border-gold bg-gold text-ink" : "border-cream/20 text-cream/75 hover:border-gold/60"
                }`}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                  <path d={SHAPE_ICON[s.key]} />
                </svg>
                {s.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-5 flex items-start gap-2 text-[0.72rem] leading-snug text-cream/65">
        <span className="mt-[3px] grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border border-gold/60 font-serif text-[0.55rem] italic text-gold">
          i
        </span>
        {SIMULATOR_NOTE}
      </p>
    </div>
  );
}
