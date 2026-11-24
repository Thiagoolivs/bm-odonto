import { useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "./scroll";

/** gsap.context com limpeza automática (seguro no StrictMode) */
export function useGsap(scope: RefObject<HTMLElement | null>, fn: () => void, deps: DependencyList = []) {
  useLayoutEffect(() => {
    const ctx = gsap.context(fn, scope.current ?? undefined);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
