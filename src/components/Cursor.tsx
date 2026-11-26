import { useEffect, useRef } from "react";
import { onFrame } from "../lib/scroll";

/** Cursor próprio (só com mouse): um ponto que cresce sobre áreas interativas e mostra um rótulo. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const pos = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2, s: 1, ts: 1, o: 0, to: 0, lo: 0, tlo: 0 };
    const move = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      if (pos.to === 0) {
        pos.x = pos.tx;
        pos.y = pos.ty;
      }
      pos.to = 1;
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button");
      const text = t?.dataset.cursor ?? "";
      pos.ts = t ? (text ? 6.4 : 3) : 1;
      pos.tlo = text ? 1 : 0;
      if (text && label.current && label.current.textContent !== text) label.current.textContent = text;
    };
    const leave = () => (pos.to = 0);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    const off = onFrame((_, dt) => {
      const k = 1 - Math.exp(-dt * 22);
      const k2 = 1 - Math.exp(-dt * 12);
      pos.x += (pos.tx - pos.x) * k;
      pos.y += (pos.ty - pos.y) * k;
      pos.s += (pos.ts - pos.s) * k2;
      pos.o += (pos.to - pos.o) * k2;
      pos.lo += (pos.tlo - pos.lo) * k2;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${pos.s})`;
        dot.current.style.opacity = String(pos.o);
      }
      if (label.current) {
        label.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
        label.current.style.opacity = String(pos.o * pos.lo);
      }
    });
    return () => {
      off();
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] h-3 w-3 rounded-full bg-white opacity-0 mix-blend-difference" />
      <div
        ref={label}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] whitespace-nowrap text-[11px] font-medium tracking-[-0.01em] text-white opacity-0 mix-blend-difference"
      />
    </>
  );
}
