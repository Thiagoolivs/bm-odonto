import * as THREE from "three";
import type { ShapeKey } from "./state";

/*
 * Incisivo central superior modelado proceduralmente.
 * Superfície "lofted": anéis (superelipses) empilhados da borda incisal (y=0)
 * até o ápice da raiz. A lente de resina é uma casca fina gerada a partir
 * da face vestibular da própria coroa, então encaixa com precisão.
 * Os três formatos (oval, quadrado, triangular) têm a mesma topologia e
 * viram morph targets na GPU.
 */

export const CROWN_H = 1.05;
export const ROOT_H = 1.3;
export const TOOTH_H = CROWN_H + ROOT_H;

const N = 88; // segmentos do anel
const KC = 70; // anéis da coroa
const KR = 30; // anéis da raiz

interface ShapeParams {
  incisalHW: number;
  cervicalHW: number;
  cornerR: number;
  cornerP: number;
  bulge: number;
  maxAt: number;
}

const SHAPE_PARAMS: Record<ShapeKey, ShapeParams> = {
  oval: { incisalHW: 0.392, cervicalHW: 0.33, cornerR: 0.24, cornerP: 2.5, bulge: 0.022, maxAt: 0.32 },
  quadrado: { incisalHW: 0.418, cervicalHW: 0.372, cornerR: 0.085, cornerP: 4.6, bulge: 0, maxAt: 0.55 },
  triangular: { incisalHW: 0.44, cervicalHW: 0.272, cornerR: 0.12, cornerP: 3.4, bulge: -0.012, maxAt: 0.04 },
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const spow = (v: number, e: number) => Math.sign(v) * Math.pow(Math.abs(v), e);

interface Section {
  y: number;
  hw: number;
  dl: number;
  dg: number;
  conc: number;
  q: number;
  lobes: number;
}

function crownSection(c: number, s: ShapeParams): Section {
  const corner = c < s.cornerR ? Math.pow(1 - Math.pow(1 - c / s.cornerR, s.cornerP), 1 / s.cornerP) : 1;
  const base =
    s.cervicalHW + (s.incisalHW - s.cervicalHW) * (1 - smooth(s.maxAt, 1, c)) + s.bulge * Math.sin(Math.PI * Math.min(1, c * 1.1));
  const edge = c < 0.03 ? Math.sqrt(c / 0.03) : 1;
  return {
    y: c * CROWN_H,
    hw: base * corner,
    dl: edge * (0.04 + 0.245 * smooth(0, 0.78, c)),
    dg: edge * (0.034 + 0.335 * smooth(0.06, 0.88, c)),
    conc: 0.13 * smooth(0.04, 0.26, c) * (1 - smooth(0.5, 0.86, c)),
    q: 2.7,
    lobes: smooth(0.03, 0.09, c) * (1 - smooth(0.2, 0.75, c)),
  };
}

function rootSection(r: number, cej: Section): Section {
  const taper = 1 - 0.8 * Math.pow(r, 1.35);
  const tip = r > 0.88 ? Math.sqrt(Math.max(0, (1 - r) / 0.12)) : 1;
  const k = taper * tip;
  const neck = 1;
  return {
    y: CROWN_H + r * ROOT_H,
    hw: cej.hw * k * neck,
    dl: cej.dl * k * neck,
    dg: cej.dg * k * neck,
    conc: 0,
    q: 2.7 - 0.7 * smooth(0, 0.5, r),
    lobes: 0,
  };
}

/** parâmetros de cada anel (iguais para todos os formatos) */
const CROWN_C = Array.from({ length: KC + 1 }, (_, k) => Math.pow(k / KC, 1.7));
const ROOT_R = Array.from({ length: KR }, (_, k) => 1 - Math.pow(1 - (k + 1) / KR, 1.5));
const ROWS = CROWN_C.length + ROOT_R.length;

const COLORS = {
  halo: new THREE.Color("#ffffff"),
  incisal: new THREE.Color("#d8d1c6"),
  body: new THREE.Color("#ffffff"),
  cervical: new THREE.Color("#f0dfc2"),
  root: new THREE.Color("#e3cfab"),
  apex: new THREE.Color("#b89a6e"),
};

function rowColor(row: number, out: THREE.Color) {
  if (row < CROWN_C.length) {
    const c = CROWN_C[row];
    out.copy(COLORS.incisal).lerp(COLORS.halo, 1 - smooth(0.0, 0.025, c));
    out.lerp(COLORS.body, smooth(0.06, 0.32, c));
    out.lerp(COLORS.cervical, smooth(0.62, 1.0, c));
  } else {
    const r = ROOT_R[row - CROWN_C.length];
    out.copy(COLORS.cervical).lerp(COLORS.root, smooth(0, 0.12, r));
    out.lerp(COLORS.apex, smooth(0.1, 0.8, r));
  }
  return out;
}

function sections(shape: ShapeKey): Section[] {
  const s = SHAPE_PARAMS[shape];
  const crown = CROWN_C.map((c) => crownSection(c, s));
  const cej = crown[crown.length - 1];
  return [...crown, ...ROOT_R.map((r) => rootSection(r, cej))];
}

function toothPositions(shape: ShapeKey) {
  const secs = sections(shape);
  const pos = new Float32Array(ROWS * N * 3);
  let p = 0;
  for (const sec of secs) {
    const e = 2 / sec.q;
    for (let j = 0; j < N; j++) {
      const u = (j / N) * Math.PI * 2;
      const ex = spow(Math.cos(u), e);
      const ez = spow(Math.sin(u), e);
      const x = sec.hw * ex;
      let z = ez >= 0 ? sec.dl * ez : sec.dg * ez;
      if (ez < 0) z += sec.conc * Math.pow(1 - ex * ex, 2); // face palatina côncava (forma de pá)
      if (ez > 0 && sec.lobes > 0) {
        // sulcos de desenvolvimento suaves na face vestibular
        z -= 0.0075 * sec.lobes * smooth(0.55, 0.95, ez) * (0.5 - 0.5 * Math.cos(3 * Math.PI * ex));
      }
      pos[p++] = x;
      pos[p++] = sec.y;
      pos[p++] = z;
    }
  }
  return pos;
}

function ringIndex() {
  const idx: number[] = [];
  for (let i = 0; i < ROWS - 1; i++) {
    for (let j = 0; j < N; j++) {
      const a = i * N + j;
      const b = i * N + ((j + 1) % N);
      const c = (i + 1) * N + j;
      const d = (i + 1) * N + ((j + 1) % N);
      idx.push(a, c, b, b, c, d);
    }
  }
  return idx;
}

const INDEX = ringIndex();

function normalsFor(pos: Float32Array, index: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  const n = g.getAttribute("normal").array as Float32Array;
  g.dispose();
  return n;
}

const SHAPE_ORDER: ShapeKey[] = ["oval", "quadrado", "triangular"];

interface ToothData {
  pos: Float32Array;
  nrm: Float32Array;
}

let cache: Record<ShapeKey, ToothData> | null = null;
function toothData() {
  if (!cache) {
    cache = {} as Record<ShapeKey, ToothData>;
    for (const s of SHAPE_ORDER) {
      const pos = toothPositions(s);
      cache[s] = { pos, nrm: normalsFor(pos, INDEX) };
    }
  }
  return cache;
}

function withMorphs(base: ToothData, morphs: ToothData[], index: number[], color?: Float32Array) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(base.pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(base.nrm, 3));
  if (color) g.setAttribute("color", new THREE.BufferAttribute(color, 3));
  g.setIndex(index);
  g.morphAttributes.position = morphs.map((m) => new THREE.BufferAttribute(m.pos, 3));
  g.morphAttributes.normal = morphs.map((m) => new THREE.BufferAttribute(m.nrm, 3));
  g.morphTargetsRelative = false;
  g.computeBoundingSphere();
  g.boundingSphere!.radius *= 1.3;
  return g;
}

export function createToothGeometry() {
  const data = toothData();
  const col = new Float32Array(ROWS * N * 3);
  const tmp = new THREE.Color();
  for (let i = 0; i < ROWS; i++) {
    rowColor(i, tmp);
    for (let j = 0; j < N; j++) {
      const o = (i * N + j) * 3;
      col[o] = tmp.r;
      col[o + 1] = tmp.g;
      col[o + 2] = tmp.b;
    }
  }
  const g = withMorphs(data.oval, [data.quadrado, data.triangular], INDEX, col);
  // grupo 0 = coroa (opaca, vista através da lente) · grupo 1 = raiz (se dissolve)
  const crownCount = (CROWN_C.length - 1) * N * 6;
  g.addGroup(0, crownCount, 0);
  g.addGroup(crownCount, INDEX.length - crownCount, 1);
  return g;
}

// ---------------------------------------------------------------- lente

const V_ROW0 = 1;
const V_ROW1 = CROWN_C.findIndex((c) => c >= 0.86);
const V_COLS: number[] = (() => {
  const cols: number[] = [];
  const wrap = 0.24;
  for (let j = -N; j < N; j++) {
    const u = (j / N) * Math.PI * 2;
    if (u >= -wrap && u <= Math.PI + wrap) cols.push((j + N) % N);
  }
  return cols;
})();
const VR = V_ROW1 - V_ROW0 + 1;
const VC = V_COLS.length;
const LENS_T = 0.05;
const LENS_GAP = 0.0045;

function veneerIndex() {
  const idx: number[] = [];
  const O = (k: number, j: number) => k * VC + j;
  const I = (k: number, j: number) => VR * VC + k * VC + j;
  for (let k = 0; k < VR - 1; k++)
    for (let j = 0; j < VC - 1; j++) {
      idx.push(O(k, j), O(k + 1, j), O(k, j + 1), O(k, j + 1), O(k + 1, j), O(k + 1, j + 1));
      idx.push(I(k, j), I(k, j + 1), I(k + 1, j), I(k, j + 1), I(k + 1, j + 1), I(k + 1, j));
    }
  // bordas: incisal (k=0), cervical (k=VR-1)
  for (let j = 0; j < VC - 1; j++) {
    let k = 0;
    idx.push(O(k, j), O(k, j + 1), I(k, j), O(k, j + 1), I(k, j + 1), I(k, j));
    k = VR - 1;
    idx.push(O(k, j), I(k, j), O(k, j + 1), O(k, j + 1), I(k, j), I(k, j + 1));
  }
  // bordas proximais
  for (let k = 0; k < VR - 1; k++) {
    let j = 0;
    idx.push(O(k, j), I(k, j), O(k + 1, j), O(k + 1, j), I(k, j), I(k + 1, j));
    j = VC - 1;
    idx.push(O(k, j), O(k + 1, j), I(k, j), O(k + 1, j), I(k + 1, j), I(k, j));
  }
  return idx;
}
const V_INDEX = veneerIndex();

function veneerPositions(tooth: ToothData) {
  const pos = new Float32Array(VR * VC * 2 * 3);
  for (let k = 0; k < VR; k++) {
    const sr = k / (VR - 1);
    const fr = smooth(0, 0.05, sr) * (1 - smooth(0.78, 1, sr));
    for (let j = 0; j < VC; j++) {
      const sc = j / (VC - 1);
      const fc = smooth(0, 0.16, sc) * (1 - smooth(0.84, 1, sc));
      const t = LENS_T * Math.max(0.1, fr * fc) * (0.85 + 0.15 * (1 - sr));
      const src = ((V_ROW0 + k) * N + V_COLS[j]) * 3;
      const o = (k * VC + j) * 3;
      const i = (VR * VC + k * VC + j) * 3;
      for (let a = 0; a < 3; a++) {
        const p = tooth.pos[src + a];
        const n = tooth.nrm[src + a];
        pos[o + a] = p + n * (LENS_GAP + t);
        pos[i + a] = p + n * LENS_GAP;
      }
    }
  }
  return pos;
}

export function createVeneerGeometry() {
  const data = toothData();
  const make = (s: ShapeKey): ToothData => {
    const pos = veneerPositions(data[s]);
    return { pos, nrm: normalsFor(pos, V_INDEX) };
  };
  return withMorphs(make("oval"), [make("quadrado"), make("triangular")], V_INDEX);
}

/** Linhas de "planejamento": contorno + curvas de nível da face externa da lente. */
export function createVeneerGuideGeometry() {
  const data = toothData();
  const rowsAt = [0.18, 0.4, 0.62, 0.84].map((f) => Math.round(f * (VR - 1)));
  const colsAt = [0.25, 0.5, 0.75].map((f) => Math.round(f * (VC - 1)));
  const segs = (pos: Float32Array) => {
    const out: number[] = [];
    const P = (k: number, j: number) => {
      const o = (k * VC + j) * 3;
      return [pos[o], pos[o + 1], pos[o + 2] + 0.006];
    };
    const line = (pts: number[][]) => {
      for (let i = 0; i < pts.length - 1; i++) out.push(...pts[i], ...pts[i + 1]);
    };
    // contorno
    line(Array.from({ length: VC }, (_, j) => P(0, j)));
    line(Array.from({ length: VC }, (_, j) => P(VR - 1, j)));
    line(Array.from({ length: VR }, (_, k) => P(k, 0)));
    line(Array.from({ length: VR }, (_, k) => P(k, VC - 1)));
    for (const k of rowsAt) line(Array.from({ length: VC }, (_, j) => P(k, j)));
    for (const j of colsAt) line(Array.from({ length: VR }, (_, k) => P(k, j)));
    return new Float32Array(out);
  };
  const base = segs(veneerPositions(data.oval));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(base, 3));
  g.morphAttributes.position = (["quadrado", "triangular"] as ShapeKey[]).map(
    (s) => new THREE.BufferAttribute(segs(veneerPositions(data[s])), 3),
  );
  g.morphTargetsRelative = false;
  g.computeBoundingSphere();
  return g;
}
