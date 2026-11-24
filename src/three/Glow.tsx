import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { stage } from "./state";

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const frag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    p.x *= 1.15;
    float d = length(p) * 2.0;
    float g = exp(-d * d * 3.2) * 0.9 + exp(-d * 9.0) * 0.35;
    gl_FragColor = vec4(uColor * g * uIntensity, 1.0);
  }
`;

/** halo dourado discreto atrás do dente */
export function Glow({ target }: { target: RefObject<THREE.Group> }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color("#7a5427") },
          uIntensity: { value: 0 },
        },
      }),
    [],
  );
  useFrame(({ clock }) => {
    const g = target.current;
    if (!g) return;
    mesh.current.position.set(g.position.x, g.position.y, -1.6);
    mesh.current.scale.setScalar(g.scale.x * 4.2);
    const t = clock.elapsedTime;
    material.uniforms.uIntensity.value = stage.intro * (0.85 + (stage.reducedMotion ? 0 : 0.12 * Math.sin(t * 1.5)));
  });
  return (
    <mesh ref={mesh} material={material} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}
