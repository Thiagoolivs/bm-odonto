import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stage } from "./state";

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uMotion;
  attribute float aScale;
  attribute float aPhase;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float a = uTime * 0.045 * (0.4 + aScale) * uMotion;
    float s = sin(a), c = cos(a);
    p.xz = mat2(c, -s, s, c) * p.xz;
    p.y += sin(uTime * 0.35 * uMotion + aPhase * 6.2831) * 0.06;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio / -mv.z;
    float tw = 0.5 + 0.5 * sin(uTime * (0.8 + aScale * 1.6) * uMotion + aPhase * 40.0);
    vAlpha = 0.25 + 0.75 * tw * tw;
  }
`;

const frag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
  }
`;

export function Particles({ target, count }: { target: RefObject<THREE.Group>; count?: number }) {
  const points = useRef<THREE.Points>(null!);
  const n = count ?? (window.matchMedia("(max-width: 768px)").matches ? 260 : 520);

  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const scale = new Float32Array(n);
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      // casca elíptica ao redor do dente, mais densa perto dele
      const r = 0.9 + Math.pow(Math.random(), 1.6) * 2.6;
      const th = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.4;
      pos[i * 3] = Math.cos(th) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(th) * r * 0.8;
      scale[i] = 0.25 + Math.pow(Math.random(), 3) * 1.2;
      phase[i] = Math.random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uSize: { value: 38 },
        uMotion: { value: 1 },
        uColor: { value: new THREE.Color("#d8a964") },
        uOpacity: { value: 0 },
      },
    });
    return { geometry, material };
  }, [n]);

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uPixelRatio.value = state.viewport.dpr;
    u.uMotion.value = stage.reducedMotion ? 0 : 1;
    u.uOpacity.value = 0.9 * stage.intro;
    const g = target.current;
    if (g) {
      points.current.position.copy(g.position);
      points.current.scale.setScalar(g.scale.x * 1.05);
    }
  });

  return <points ref={points} geometry={geometry} material={material} renderOrder={4} />;
}
