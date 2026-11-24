import type { ShapeKey } from "../three/state";

/* Ilustração estática usada quando o WebGL não está disponível. */

const PATHS: Record<ShapeKey, string> = {
  oval: "M60 18c22 0 36 8 40 30 4 24 6 60-2 92-6 22-22 34-38 34S28 162 22 140c-8-32-6-68-2-92 4-22 18-30 40-30Z",
  quadrado: "M60 18c24 0 38 6 41 26 3 26 3 66 0 100-2 22-14 30-41 30s-39-8-41-30c-3-34-3-74 0-100 3-20 17-26 41-26Z",
  triangular: "M60 20c16 0 26 6 30 22 6 26 14 62 12 98-1 24-18 34-42 34s-41-10-42-34c-2-36 6-72 12-98 4-16 14-22 30-22Z",
};

export function ToothFallback({ shape = "oval", tint = "#f5f0e6", className = "" }: { shape?: ShapeKey; tint?: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} role="img" aria-label="Ilustração de um dente com lente em resina">
      <defs>
        <radialGradient id="tf-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#b98c4b" stopOpacity=".45" />
          <stop offset="1" stopColor="#b98c4b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tf-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset=".55" stopColor={tint} />
          <stop offset="1" stopColor="#cdb08a" />
        </linearGradient>
        <linearGradient id="tf-gloss" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="105" rx="60" ry="95" fill="url(#tf-glow)" />
      <path d={PATHS[shape]} fill="url(#tf-body)" style={{ transition: "d .8s cubic-bezier(.22,1,.36,1)" }} />
      <path d="M44 40c-6 30-6 80 2 116" stroke="url(#tf-gloss)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={PATHS[shape]} fill="none" stroke="#b98c4b" strokeOpacity=".7" strokeWidth=".8" style={{ transition: "d .8s cubic-bezier(.22,1,.36,1)" }} />
    </svg>
  );
}
