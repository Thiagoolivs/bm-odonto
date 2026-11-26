import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { isCaptureMode, isSmallScreen, prefersReducedMotion, webglTier } from "../lib/env";
import { setRenderMode, useRenderMode } from "../lib/renderMode";
import { stage } from "../three/state";

const Scene = lazy(() => import("../three/Scene"));

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

/**
 * Canvas 3D fixo atrás das três primeiras seções (hero, história, simulador).
 * Carrega sob demanda depois da primeira pintura e pausa quando sai da tela.
 */
export function Stage() {
  const mode = useRenderMode();
  const [mount, setMount] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const capture = isCaptureMode();
    if (capture) document.documentElement.classList.add("capture");
    stage.reducedMotion = capture || prefersReducedMotion();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => (stage.reducedMotion = capture || mq.matches);
    mq.addEventListener("change", onChange);

    if (webglTier() !== "gpu") {
      setRenderMode("fallback");
      return () => mq.removeEventListener("change", onChange);
    }
    // lazy-load: espera a primeira pintura do texto do hero
    let t = 0;
    const raf = requestAnimationFrame(() => {
      t = window.setTimeout(() => setMount(true), 30);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    const zone = document.getElementById("zona-3d");
    if (!zone) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "80px 0px" });
    io.observe(zone);
    return () => io.disconnect();
  }, []);

  const fail = () => setRenderMode("fallback");

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh bg-ink"
      style={{ visibility: active ? "visible" : "hidden" }}
    >
      {mount && mode !== "fallback" && (
        <div className="absolute inset-0 transition-opacity duration-[1400ms] ease-out" style={{ opacity: mode === "3d" ? 1 : 0 }}>
          <Boundary onError={fail}>
            <Suspense fallback={null}>
              <Scene
                active={active}
                maxDpr={isSmallScreen() ? 1.5 : 2}
                onReady={() => setRenderMode("3d")}
                onError={fail}
              />
            </Suspense>
          </Boundary>
        </div>
      )}
      {/* vinheta + escurecimento inferior fixos à viewport: o texto fica legível sem criar bordas entre seções */}
      <div className="grain absolute inset-x-0 top-0 h-svh" data-stage-overlay>
        <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_32%,transparent_42%,rgba(20,13,7,.6)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-ink via-ink/75 to-transparent lg:h-[30%] lg:via-ink/30" />
      </div>
    </div>
  );
}
