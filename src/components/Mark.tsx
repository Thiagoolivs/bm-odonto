/** Monograma BM real da clínica, em versão monocromática. */
export function Mark({ size = 40, tone = "light", className = "", alt = "BM Odontologia" }: { size?: number; tone?: "light" | "dark"; className?: string; alt?: string }) {
  return (
    <img
      src={tone === "light" ? "/assets/mark-light.webp" : "/assets/mark-dark.webp"}
      width={size}
      height={size}
      alt={alt}
      draggable={false}
      className={`select-none ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
