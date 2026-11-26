// Estado compartilhado entre o DOM (simulador) e a cena 3D, sem re-render do React.

export type ShapeKey = "oval" | "quadrado" | "triangular";

export const lab = {
  shade: { lens: "#fdfaf3", tooth: "#f5f0e6" },
  shape: "oval" as ShapeKey,
  reducedMotion: false,
  /** rotação aplicada pelo usuário (arrastar) */
  drag: { y: 0, x: 0, vy: 0, dragging: false, lastInteraction: -1e9 },
};

export const SHAPE_INDEX: Record<ShapeKey, number> = { oval: 0, quadrado: 1, triangular: 2 };

/** Arrastar para girar: no toque só o eixo horizontal (o vertical continua rolando a página). */
export function bindDragRotate(el: HTMLElement) {
  let active = false;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let pointerType = "mouse";

  const down = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("button,a,input,label,[data-no-drag]")) return;
    active = true;
    pointerType = e.pointerType;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = performance.now();
    lab.drag.dragging = true;
    lab.drag.vy = 0;
    if (pointerType === "mouse") el.setPointerCapture?.(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!active) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = Math.max(1, now - lastT);
    lab.drag.y += dx * 0.009;
    if (pointerType === "mouse") lab.drag.x = Math.max(-0.45, Math.min(0.45, lab.drag.x + dy * 0.004));
    lab.drag.vy = (dx * 0.009) / dt;
    lab.drag.lastInteraction = now;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = now;
  };
  const up = () => {
    if (!active) return;
    active = false;
    lab.drag.dragging = false;
    lab.drag.lastInteraction = performance.now();
  };

  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("pointerleave", up);
  return () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
    el.removeEventListener("pointerleave", up);
  };
}
