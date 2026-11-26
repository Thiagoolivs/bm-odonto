import { useSyncExternalStore } from "react";

/** estado global mínimo: a abertura terminou? */
let entered = false;
const subs = new Set<() => void>();

export function setEntered() {
  if (entered) return;
  entered = true;
  subs.forEach((f) => f());
}
export const isEntered = () => entered;

export function useEntered() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => entered,
    () => entered,
  );
}

export function whenEntered(fn: () => void) {
  if (entered) {
    fn();
    return () => {};
  }
  const f = () => {
    subs.delete(f);
    fn();
  };
  subs.add(f);
  return () => subs.delete(f);
}

/** a abertura avisa quando o vídeo pode tocar (o loader espera por isso) */
let heroReadyResolve: () => void = () => {};
export const heroReady = new Promise<void>((r) => (heroReadyResolve = r));
export const markHeroReady = () => heroReadyResolve();
