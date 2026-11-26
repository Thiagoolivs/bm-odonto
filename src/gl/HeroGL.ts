/*
 * Abertura em WebGL puro (sem three.js, para carregar rápido):
 * o vídeo é desenhado num plano com color grading, grão e uma "lente de resina"
 * — uma gota de vidro que refrata a imagem e segue o cursor (no toque, flutua sozinha).
 * O fundo fora do vídeo é amostrado do próprio estúdio do vídeo, então a borda some.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;        // px (device)
uniform vec2 uVid;        // px do vídeo
uniform vec4 uRect;       // retângulo do vídeo em px (x, y, w, h), y para baixo
uniform vec2 uFocus;      // ponto do vídeo que fica fixo no recorte (0..1)
uniform vec2 uMouse;      // centro da lente em px
uniform float uLensR;     // raio da lente em px
uniform float uLensK;     // intensidade
uniform float uTime;
uniform float uReveal;    // 0..1 entrada
uniform float uFeather;   // px de fusão na borda esquerda
uniform float uFeatherB;  // px de fusão na borda inferior
uniform float uHasTex;
uniform vec3 uFallback;
uniform float uDpr;
varying vec2 vUv;

vec3 grade(vec3 c) {
  c *= vec3(1.05, 1.018, 0.972);              // aquece o estúdio frio
  c = mix(c, vec3(1.0), 0.07);                // levanta os pretos (look editorial)
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(l), c, 0.86);                  // dessatura levemente
  c = (c - 0.5) * 1.05 + 0.5;
  return clamp(c, 0.0, 1.0);
}

vec2 toVideo(vec2 p, float zoom) {
  vec2 local = (p - uRect.xy) / uRect.zw;
  float rA = uRect.z / uRect.w;
  float vA = uVid.x / uVid.y;
  vec2 s = rA > vA ? vec2(1.0, vA / rA) : vec2(rA / vA, 1.0);
  return uFocus + (local - uFocus) * s / zoom;
}

vec3 tex(vec2 uv) {
  return grade(texture2D(uTex, clamp(uv, vec2(0.001), vec2(0.999))).rgb);
}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uRes;

  // cor do estúdio (média de pontos da borda superior do próprio vídeo)
  vec3 bg = uFallback;
  if (uHasTex > 0.5) {
    bg = (tex(vec2(0.03, 0.02)) + tex(vec2(0.5, 0.012)) + tex(vec2(0.97, 0.02)) + tex(vec2(0.02, 0.3)) + tex(vec2(0.98, 0.3))) / 5.0;
    bg = mix(bg, uFallback, 0.25);
  }

  // lente de resina: refração + aberração cromática na borda
  vec2 d = p - uMouse;
  float r = length(d) / max(uLensR, 1.0);
  vec2 q = p;
  float inLens = 1.0 - smoothstep(0.985, 1.0, r);
  float k = uLensK * (1.0 - r * r);
  vec2 off = d * k * inLens;

  float zoom = 1.0 + 0.14 * (1.0 - uReveal);
  vec3 col;
  if (uHasTex > 0.5) {
    vec2 ca = d / max(uLensR, 1.0) * 6.0 * uDpr * inLens * smoothstep(0.35, 1.0, r);
    vec2 uvR = toVideo(q - off * 1.03 + ca, zoom);
    vec2 uvG = toVideo(q - off, zoom);
    vec2 uvB = toVideo(q - off * 0.97 - ca, zoom);
    col = vec3(tex(uvR).r, tex(uvG).g, tex(uvB).b);
  } else {
    col = bg;
  }

  // fusão da borda esquerda do vídeo com o estúdio
  float fx = smoothstep(uRect.x, uRect.x + uFeather, p.x);
  float inside = step(uRect.x, p.x) * step(p.x, uRect.x + uRect.z);
  float m = uFeather > 0.0 ? fx : inside;
  if (uFeatherB > 0.0) m *= 1.0 - smoothstep(uRect.y + uRect.w - uFeatherB, uRect.y + uRect.w, p.y);

  // entrada: cortina que sobe de baixo
  float wipe = smoothstep(uRes.y * (1.0 - uReveal * 1.15) - 40.0 * uDpr, uRes.y * (1.0 - uReveal * 1.15) + 40.0 * uDpr, p.y);
  m *= wipe;

  col = mix(bg, col, m);

  // realces da lente (borda viva e brilho especular)
  if (uLensK > 0.0) {
    float rim = smoothstep(0.86, 0.985, r) * (1.0 - smoothstep(0.985, 1.01, r));
    vec2 nd = d / max(uLensR, 1.0);
    float spec = exp(-pow(length(nd - vec2(-0.42, -0.46)) / 0.16, 2.0));
    float shade = smoothstep(0.55, 1.0, r) * inLens;
    col = mix(col, col * 0.94, shade * 0.3);
    col += rim * 0.16 + spec * 0.16 * inLens;
    // sombra suave fora da lente
    float drop = (1.0 - smoothstep(1.0, 1.25, r)) * step(1.0, r);
    col *= 1.0 - drop * 0.07;
  }

  // vinheta leve + grão
  vec2 vv = vUv - 0.5;
  col *= 1.0 - dot(vv, vv) * 0.18;
  float g = hash(floor(p / max(uDpr, 1.0)) + fract(uTime * 7.0) * 100.0) - 0.5;
  col += g * 0.035;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface HeroGLOptions {
  focus: [number, number];
  fallback: [number, number, number];
}

export class HeroGL {
  private gl: WebGLRenderingContext;
  private prog: WebGLProgram;
  private tex: WebGLTexture;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private hasFrame = false;
  private frameDirty = true;
  private rvfc = 0;
  dpr = 1;
  width = 0;
  height = 0;
  rect = { x: 0, y: 0, w: 0, h: 0 };
  feather = 0;
  featherB = 0;
  reveal = 0;
  lens = { x: 0, y: 0, r: 0, k: 0 };
  focus: [number, number];
  private fallback: [number, number, number];

  constructor(
    private canvas: HTMLCanvasElement,
    private video: HTMLVideoElement,
    opts: HeroGLOptions,
  ) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "high-performance" });
    if (!gl) throw new Error("WebGL indisponível");
    this.gl = gl;
    this.focus = opts.focus;
    this.fallback = opts.fallback;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
    this.prog = prog;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    for (const n of ["uTex", "uRes", "uVid", "uRect", "uFocus", "uMouse", "uLensR", "uLensK", "uTime", "uReveal", "uFeather", "uFeatherB", "uHasTex", "uFallback", "uDpr"]) {
      this.u[n] = gl.getUniformLocation(prog, n);
    }

    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(this.u.uTex, 0);

    // envia o quadro só quando o vídeo tem um novo (economiza banda da GPU)
    const v = this.video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    if (v.requestVideoFrameCallback) {
      const loop = () => {
        this.frameDirty = true;
        this.rvfc = v.requestVideoFrameCallback!(loop);
      };
      this.rvfc = v.requestVideoFrameCallback(loop);
    }
  }

  resize(cssW: number, cssH: number, dpr: number) {
    this.dpr = dpr;
    this.width = Math.round(cssW * dpr);
    this.height = Math.round(cssH * dpr);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.gl.viewport(0, 0, this.width, this.height);
  }

  render(time: number) {
    const gl = this.gl;
    const v = this.video;
    const ready = v.readyState >= 2 && v.videoWidth > 0;
    if (ready && (this.frameDirty || !this.hasFrame || !("requestVideoFrameCallback" in v))) {
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v);
      this.hasFrame = true;
      this.frameDirty = false;
    }
    const d = this.dpr;
    gl.uniform2f(this.u.uRes, this.width, this.height);
    gl.uniform2f(this.u.uVid, v.videoWidth || 1080, v.videoHeight || 1350);
    gl.uniform4f(this.u.uRect, this.rect.x * d, this.rect.y * d, this.rect.w * d, this.rect.h * d);
    gl.uniform2f(this.u.uFocus, this.focus[0], this.focus[1]);
    gl.uniform2f(this.u.uMouse, this.lens.x * d, this.lens.y * d);
    gl.uniform1f(this.u.uLensR, this.lens.r * d);
    gl.uniform1f(this.u.uLensK, this.lens.k);
    gl.uniform1f(this.u.uTime, time);
    gl.uniform1f(this.u.uReveal, this.reveal);
    gl.uniform1f(this.u.uFeather, this.feather * d);
    gl.uniform1f(this.u.uFeatherB, this.featherB * d);
    gl.uniform1f(this.u.uHasTex, this.hasFrame ? 1 : 0);
    gl.uniform3f(this.u.uFallback, ...this.fallback);
    gl.uniform1f(this.u.uDpr, d);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    const v = this.video as HTMLVideoElement & { cancelVideoFrameCallback?: (h: number) => void };
    if (this.rvfc && v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(this.rvfc);
    this.gl.deleteTexture(this.tex);
    this.gl.deleteProgram(this.prog);
    // sem loseContext(): no StrictMode o mesmo canvas é reaproveitado na remontagem
  }
}
