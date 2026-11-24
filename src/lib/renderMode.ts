import { useSyncExternalStore } from "react";

/** loading: canvas ainda não pronto · 3d: cena ativa · fallback: sem WebGL */
export type RenderMode = "loading" | "3d" | "fallback";

let mode: RenderMode = "loading";
const subs = new Set<() => void>();

export function setRenderMode(m: RenderMode) {
  if (mode === m) return;
  mode = m;
  subs.forEach((f) => f());
}

export function useRenderMode() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => mode,
    () => mode,
  );
}
