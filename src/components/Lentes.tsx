import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import { PROCESS, SHADES, SHAPES, SIMULATOR_NOTE, TECNICAS } from "../content";
import { bindDragRotate, lab, type ShapeKey } from "../three/state";
import { isSmallScreen, prefersReducedMotion, webglTier } from "../lib/env";

const LensScene = lazy(() => import("../three/LensScene"));

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function Lentes() {
  const card = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [shade, setShade] = useState<(typeof SHADES)[number]["key"]>("BL2");
  const [shape, setShape] = useState<ShapeKey>("oval");
  const [tec, setTec] = useState(1);

  useEffect(() => {
    lab.reducedMotion = prefersReducedMotion();
    const el = card.current!;
    // sem GPU (WebGL emulado na CPU) a cena 3D travaria a rolagem: fica o pôster
    if (webglTier() !== "gpu") setFailed(true);
    // monta perto da tela; renderiza só enquanto visível
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMount(true), { rootMargin: "120% 0px" });
    const vis = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "10% 0px" });
    near.observe(el);
    vis.observe(el);
    const off = bindDragRotate(el);
    return () => {
      near.disconnect();
      vis.disconnect();
      off();
    };
  }, []);

  useEffect(() => {
    const s = SHADES.find((x) => x.key === shade)!;
    lab.shade = { lens: s.lens, tooth: s.tooth };
  }, [shade]);
  useEffect(() => {
    lab.shape = shape;
  }, [shape]);

  return (
    <section id="lentes" className="relative bg-paper px-5 pb-24 pt-28 md:px-10 md:pb-36 md:pt-40" aria-label="Lentes em resina">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <p className="t-eyebrow text-mute lg:col-span-3" data-reveal>
            (01) Lentes em resina
          </p>
          <h2 className="t-title text-[clamp(2.6rem,9.5vw,7.4rem)] lg:col-span-9" data-lines>
            <span className="line-mask">
              <span data-line>Ultrafinas.</span>
            </span>
            <span className="line-mask">
              <span data-line className="text-mute-2">Desenhadas para</span>
            </span>
            <span className="line-mask">
              <span data-line className="text-mute-2">o seu rosto.</span>
            </span>
          </h2>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-16">
          {/* simulador */}
          <div className="lg:col-span-7">
            <div
              ref={card}
              data-cursor="Arraste"
              className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden rounded-[22px] bg-paper-2 md:aspect-[5/4] md:rounded-[28px]"
            >
              {mount && !failed && (
                <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: ready ? 1 : 0 }}>
                  <Boundary onError={() => setFailed(true)}>
                    <Suspense fallback={null}>
                      <LensScene active={active} maxDpr={isSmallScreen() ? 1.5 : 2} onReady={() => setReady(true)} />
                    </Suspense>
                  </Boundary>
                </div>
              )}
              {(failed || !ready) && (
                <img
                  src="/media/lente-poster.webp"
                  alt="Dente com lente de resina ultrafina"
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                  style={{ opacity: failed || !mount ? 1 : 0.999 }}
                  loading="lazy"
                />
              )}

              <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between text-[0.8rem] text-ink/60 md:inset-x-6 md:top-6">
                <span>Simulador</span>
                <span className="font-medium text-ink">{shade}</span>
              </div>

            </div>

            {/* controles: abaixo do cartão no celular, sobre ele no desktop */}
            <div className="relative md:-mt-[5.5rem] md:px-5" data-no-drag>
              <div className="mt-3 rounded-[16px] bg-bone/80 p-3 md:mt-0 md:p-4 md:backdrop-blur-md">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="grid grid-cols-5 gap-1 md:flex md:items-center md:gap-1.5" role="radiogroup" aria-label="Tonalidade">
                    {SHADES.map((s) => {
                      const on = s.key === shade;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-label={`Tonalidade ${s.key}`}
                          onClick={() => setShade(s.key)}
                          className={`flex h-10 items-center justify-center gap-1.5 rounded-full px-1 text-[0.74rem] font-medium transition-colors duration-500 md:justify-start md:gap-2 md:pl-1.5 md:pr-3 md:text-[0.78rem] ${
                            on ? "bg-ink text-bone" : "text-ink/70 hover:bg-ink/5"
                          }`}
                        >
                          <span className="h-5 w-5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] md:h-7 md:w-7" style={{ background: s.swatch }} />
                          {s.key}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 rounded-full bg-ink/5 p-1" role="radiogroup" aria-label="Formato">
                    {SHAPES.map((s) => {
                      const on = s.key === shape;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setShape(s.key)}
                          className={`h-9 rounded-full px-3.5 text-[0.8rem] font-medium transition-all duration-500 ${
                            on ? "bg-bone text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]" : "text-ink/60 hover:text-ink"
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[0.82rem] text-mute md:mt-7">{SIMULATOR_NOTE}</p>
          </div>

          {/* processo + técnicas */}
          <div className="flex flex-col gap-14 lg:col-span-5 lg:pt-2">
            <div>
              <p className="t-eyebrow text-mute" data-reveal>
                Como funciona
              </p>
              <ol className="mt-6 border-t border-ink/10">
                {PROCESS.map((p) => (
                  <li key={p.n} className="grid grid-cols-[3rem_1fr] gap-2 border-b border-ink/10 py-6" data-reveal>
                    <span className="text-[0.85rem] tabular-nums text-mute">{p.n}</span>
                    <div>
                      <h3 className="t-title text-[1.6rem] md:text-[1.9rem]">{p.title}</h3>
                      <p className="mt-2 max-w-[28rem] text-[0.98rem] leading-relaxed text-ink/65">{p.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div data-reveal>
              <p className="t-eyebrow text-mute">Técnicas</p>
              <div className="mt-5 flex gap-2" role="tablist" aria-label="Técnicas">
                {TECNICAS.map((t, i) => (
                  <button
                    key={t.title}
                    type="button"
                    role="tab"
                    aria-selected={tec === i}
                    onClick={() => setTec(i)}
                    className={`h-10 rounded-full border px-4 text-[0.88rem] font-medium transition-colors duration-500 ${
                      tec === i ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink/70 hover:border-ink/40"
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
              <div className="relative mt-5 min-h-[3.5rem]">
                {TECNICAS.map((t, i) => (
                  <p
                    key={t.title}
                    role="tabpanel"
                    aria-hidden={tec !== i}
                    className="absolute inset-0 text-[1.15rem] leading-snug tracking-[-0.015em] transition-all duration-700"
                    style={{ opacity: tec === i ? 1 : 0, transform: tec === i ? "none" : "translateY(8px)" }}
                  >
                    {t.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
