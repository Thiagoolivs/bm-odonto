import type { ReactNode } from "react";

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 text-gold ${className}`}>
      <span className="inline-block h-px w-7 bg-current opacity-70" aria-hidden />
      {children}
    </p>
  );
}

/** Título em linhas mascaradas (cada linha sobe ao entrar na tela). */
export function Title({
  lines,
  as: Tag = "h2",
  className = "",
  italic,
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** índice da linha em itálico dourado */
  italic?: number;
}) {
  return (
    <Tag className={`display ${className}`} data-lines>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span data-line className={`block ${italic === i ? "italic text-gold-soft" : ""}`}>
            {l}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** brilho dourado de quatro pontas */
export function Sparkle({ className = "", delay = 0, size = 14 }: { className?: string; delay?: number; size?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`pointer-events-none absolute text-gold ${className}`}
      style={{ animation: `twinkle 3.6s ease-in-out ${delay}s infinite` }}
    >
      <path fill="currentColor" d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" />
    </svg>
  );
}

export function Logo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/assets/logo.webp"
      width={size}
      height={size}
      alt="BM Odontologia"
      className={`select-none rounded-full ${className}`}
      draggable={false}
      style={{ width: size, height: size }}
    />
  );
}

/** Monograma BM em SVG (usado na abertura e onde a imagem não cabe) */
export function Monogram({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-label="BM Odontologia" role="img">
      <circle cx="32" cy="32" r="31" fill="#f7eadb" />
      <circle cx="32" cy="32" r="26.5" fill="none" stroke="#b98c4b" strokeWidth="1.1" />
      <text
        x="32"
        y="41"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontSize="25"
        fill="#b98c4b"
        letterSpacing="-1.5"
      >
        BM
      </text>
    </svg>
  );
}
