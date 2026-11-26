/** Pôster pré-renderizado da própria cena 3D (fallback sem WebGL acelerado). */
export function ToothPoster({ className = "" }: { className?: string }) {
  return (
    <img
      src="/assets/dente-3d.webp"
      alt="Dente com lente de resina ultrafina"
      width={640}
      height={900}
      decoding="async"
      fetchPriority="high"
      className={`pointer-events-none select-none object-contain ${className}`}
      style={{
        maskImage: "radial-gradient(closest-side, #000 48%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(closest-side, #000 48%, transparent 100%)",
      }}
    />
  );
}
