export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isSmallScreen = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;

const params = () => new URLSearchParams(typeof location !== "undefined" ? location.search : "");

/**
 * "gpu": WebGL acelerado · "software": WebGL emulado na CPU (SwiftShader, llvmpipe…)
 * "none": sem WebGL. Com renderização por software a cena travaria a rolagem,
 * então usamos o pôster estático. `?3d=1` força a cena (útil para testes/gravações).
 */
export function webglTier(): "gpu" | "software" | "none" {
  const force = params().get("3d");
  if (force === "1") return "gpu";
  if (force === "0") return "none";
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "none";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) ? "software" : "gpu";
  } catch {
    return "none";
  }
}

/** modo usado só para gerar o pôster estático (scripts/gerar-poster.mjs) */
export const isCaptureMode = () => params().get("capture") === "1";
