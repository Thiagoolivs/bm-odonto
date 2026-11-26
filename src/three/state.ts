// Estado compartilhado entre o DOM e a cena 3D, sem re-render do React.
// O DOM escreve (scroll, arraste, simulador); a cena lê a cada frame.

export type ShapeKey = "oval" | "quadrado" | "triangular";

export type SlotKey = "hero" | "story" | "sim";

export interface SlotConfig {
  /** altura (em unidades do modelo) que deve caber no slot */
  fit: number;
  /** ponto do modelo (y) que fica no centro do slot */
  focusY: number;
}

export const SLOT_CONFIG: Record<SlotKey, SlotConfig> = {
  hero: { fit: 2.4, focusY: 0.86 },
  story: { fit: 2.3, focusY: 0.8 },
  sim: { fit: 1.95, focusY: 0.64 },
};

export const stage = {
  slots: {} as Partial<Record<SlotKey, HTMLElement>>,
  sections: {} as Partial<Record<"story" | "sim", HTMLElement>>,
  /** rotação aplicada pelo usuário (arrastar) */
  drag: { y: 0, x: 0, vy: 0, dragging: false, lastInteraction: -1e9 },
  shade: { lens: "#fdfaf3", tooth: "#f5f0e6" },
  shape: "oval" as ShapeKey,
  reducedMotion: false,
  /** 0..1 — aparece quando a cena carrega */
  intro: 0,
};

export const SHAPE_INDEX: Record<ShapeKey, number> = { oval: 0, quadrado: 1, triangular: 2 };

/** registra um elemento como "slot" (onde o dente deve aparecer) */
export function slotRef(key: SlotKey) {
  return (el: HTMLElement | null) => {
    if (el) stage.slots[key] = el;
  };
}

export function sectionRef(key: "story" | "sim") {
  return (el: HTMLElement | null) => {
    if (el) stage.sections[key] = el;
  };
}

/** Arrastar para girar: só horizontal no toque (o vertical continua rolando a página). */
export function bindDragRotate(el: HTMLElement) {
  let active = false;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let pointerType = "mouse";

  const down = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button,input,label,[data-no-drag]")) return;
    active = true;
    pointerType = e.pointerType;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = performance.now();
    stage.drag.dragging = true;
    stage.drag.vy = 0;
    if (pointerType === "mouse") el.setPointerCapture?.(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!active) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = Math.max(1, now - lastT);
    stage.drag.y += dx * 0.0085;
    if (pointerType === "mouse") stage.drag.x = Math.max(-0.5, Math.min(0.5, stage.drag.x + dy * 0.004));
    stage.drag.vy = (dx * 0.0085) / dt;
    stage.drag.lastInteraction = now;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = now;
  };
  const up = () => {
    if (!active) return;
    active = false;
    stage.drag.dragging = false;
    stage.drag.lastInteraction = performance.now();
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
