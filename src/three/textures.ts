import * as THREE from "three";

/*
 * Texturas procedurais da lente (geradas em canvas, sem arquivos):
 * - corpo: marfim com mamelos suaves, borda incisal translúcida e linhas brancas finas;
 * - relevo: periquimácias (linhas horizontais finíssimas do esmalte) + lóbulos verticais.
 * UV: u = mesial→distal, v = borda incisal (0) → cervical (1).
 */

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function createBodyTexture(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  // base: incisal (y=0 no UV → linha 0 do canvas por causa do flipY=false)
  const base = g.createLinearGradient(0, 0, 0, size);
  base.addColorStop(0, "#c9c6c4");
  base.addColorStop(0.12, "#e6ddd1");
  base.addColorStop(0.45, "#f1e6d7");
  base.addColorStop(0.85, "#eedabd");
  base.addColorStop(1, "#e8cfa9");
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);

  // mamelos: três lóbulos claros no terço incisal/médio
  for (const x of [0.3, 0.5, 0.7]) {
    const grd = g.createRadialGradient(x * size, size * 0.3, 0, x * size, size * 0.3, size * 0.2);
    grd.addColorStop(0, "rgba(255,252,246,0.55)");
    grd.addColorStop(1, "rgba(255,252,246,0)");
    g.fillStyle = grd;
    g.beginPath();
    g.ellipse(x * size, size * 0.32, size * 0.09, size * 0.24, 0, 0, Math.PI * 2);
    g.fill();
  }

  // halo incisal: uma linha fina mais opaca bem na borda
  const halo = g.createLinearGradient(0, 0, 0, size * 0.06);
  halo.addColorStop(0, "rgba(255,255,255,0.65)");
  halo.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, size, size * 0.06);

  // linhas brancas finíssimas (caracterização "realista")
  const r = rand(7);
  g.strokeStyle = "rgba(255,255,255,0.55)";
  g.lineWidth = size / 700;
  for (let i = 0; i < 3; i++) {
    let x = size * (0.45 + r() * 0.3);
    let y = size * (0.25 + r() * 0.25);
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 14; k++) {
      x += (r() - 0.5) * size * 0.025;
      y += size * 0.012 + r() * size * 0.01;
      g.lineTo(x, y);
    }
    g.stroke();
  }

  const t = new THREE.CanvasTexture(c);
  t.flipY = false;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function createSurfaceNormal(size = 512) {
  // mapa de altura → normal (Sobel)
  const h = new Float32Array(size * size);
  const r = rand(3);
  const phase = Array.from({ length: 6 }, () => r() * Math.PI * 2);
  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      // periquimácias: ondas horizontais finas, levemente onduladas
      const wobble = Math.sin(u * 9 + phase[0]) * 0.004 + Math.sin(u * 23 + phase[1]) * 0.002;
      const peri = Math.sin((v + wobble) * Math.PI * 2 * 150) * 0.12 * (0.3 + 0.7 * v);
      // lóbulos verticais suaves
      const lobes = Math.cos(u * Math.PI * 2 * 1.5 + 0.4) * 0.5 * (1 - v);
      // micro-ondulação
      const micro = Math.sin(u * 140 + phase[2]) * Math.sin(v * 120 + phase[3]) * 0.04;
      h[y * size + x] = peri + lobes + micro;
    }
  }
  const data = new Uint8Array(size * size * 4);
  const strength = 2.2;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const xl = h[y * size + ((x - 1 + size) % size)];
      const xr = h[y * size + ((x + 1) % size)];
      const yu = h[((y - 1 + size) % size) * size + x];
      const yd = h[((y + 1) % size) * size + x];
      const dx = (xr - xl) * strength;
      const dy = (yd - yu) * strength;
      const nz = 1;
      const len = Math.hypot(dx, dy, nz);
      const o = (y * size + x) * 4;
      data[o] = ((-dx / len) * 0.5 + 0.5) * 255;
      data[o + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      data[o + 2] = (nz / len * 0.5 + 0.5) * 255;
      data[o + 3] = 255;
    }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/** cartão de luz desfocado (o "bokeh" quente atrás da lente) */
export function createGlowTexture(size = 256, inner = "rgba(255,214,170,1)", outer = "rgba(255,170,110,0)") {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.35, inner.replace(/[\d.]+\)$/, "0.55)"));
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** transmissão (canal R) e espessura (canal G): borda incisal translúcida, cervical mais opaca */
export function createTransmissionTexture(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  for (let y = 0; y < size; y++) {
    const v = y / (size - 1);
    const tr = Math.round(255 * (0.25 + 0.75 * (1 - Math.min(1, v / 0.55)) ** 1.4));
    const th = Math.round(255 * (0.2 + 0.8 * Math.min(1, v / 0.8)));
    g.fillStyle = `rgb(${tr},${th},0)`;
    g.fillRect(0, y, size, 1);
  }
  // bordas proximais também mais translúcidas
  const side = g.createLinearGradient(0, 0, size, 0);
  side.addColorStop(0, "rgba(255,0,0,0.5)");
  side.addColorStop(0.12, "rgba(255,0,0,0)");
  side.addColorStop(0.88, "rgba(255,0,0,0)");
  side.addColorStop(1, "rgba(255,0,0,0.5)");
  g.globalCompositeOperation = "lighter";
  g.fillStyle = side;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.flipY = false;
  return t;
}
