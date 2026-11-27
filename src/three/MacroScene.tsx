import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode, type DepthOfFieldEffect } from "postprocessing";
import * as THREE from "three";
import { createMacroVeneerGeometry } from "./geometry";
import { createBodyTexture, createGlowTexture, createSurfaceNormal, createTransmissionTexture } from "./textures";
import { onFrame } from "../lib/scroll";

/*
 * Cena macro da lente de resina, no clima de fotografia de produto:
 * fundo escuro, luz quente atravessando a borda (translucidez aproximada),
 * reflexos de estúdio que varrem a superfície, foco que "puxa" na entrada.
 * Sem controles: só reage à rolagem (film.progress) e ao mouse (parallax leve).
 */

export const film = {
  /** 0..1 — progresso da rolagem do capítulo atual */
  progress: 0,
  /** mouse normalizado (-1..1) */
  mx: 0,
  my: 0,
  /** momento em que a entrada começa (s); -1 = ainda não */
  introAt: -1,
  reduced: false,
  /** composição: 0 = celular (lente em cima), 1 = desktop (lente à direita) */
  wide: 1,
};

// prévia determinística (gravação de vídeo): window.__film permite ajustar o estado
(window as unknown as { __film?: typeof film }).__film = film;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const damp = (a: number, b: number, l: number, dt: number) => a + (b - a) * (1 - Math.exp(-l * dt));

/** tempo da cena; window.__macroT permite renderizar quadros determinísticos (prévia em vídeo) */
function sceneTime(t: number) {
  const o = (window as unknown as { __macroT?: number }).__macroT;
  return typeof o === "number" ? o : t;
}

function Veneer({ onReady }: { onReady: () => void }) {
  const root = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const key = useRef<THREE.DirectionalLight>(null!);
  const back = useRef<THREE.DirectionalLight>(null!);
  const glow = useRef<THREE.Mesh>(null!);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);

  const { geometry, material, glowMat, transUniforms } = useMemo(() => {
    const geometry = createMacroVeneerGeometry("oval");
    const transUniforms = {
      uBackDir: { value: new THREE.Vector3(0.4, 0.2, -1).normalize() },
      uTransColor: { value: new THREE.Color("#ffb877") },
      uTrans: { value: 2.4 },
    };
    const material = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      map: createBodyTexture(),
      normalMap: createSurfaceNormal(),
      normalScale: new THREE.Vector2(0.18, 0.18),
      roughness: 0.2,
      metalness: 0,
      transmission: 0.95,
      transmissionMap: createTransmissionTexture(),
      thickness: 0.45,
      thicknessMap: createTransmissionTexture(),
      ior: 1.5,
      attenuationColor: new THREE.Color("#f0c896"),
      attenuationDistance: 0.6,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      sheen: 0.35,
      sheenRoughness: 0.35,
      sheenColor: new THREE.Color("#fff0dc"),
      iridescence: 0.1,
      iridescenceIOR: 1.3,
      specularIntensity: 1,
      envMapIntensity: 1.9,
    });
    // translucidez: luz de trás atravessando as partes finas (aproximação de subsuperfície)
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, transUniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aThick;\nvarying float vThick;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvThick = aThick;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform vec3 uBackDir;\nuniform vec3 uTransColor;\nuniform float uTrans;\nvarying float vThick;",
        )
        .replace(
          "#include <opaque_fragment>",
          `{
            vec3 Vd = normalize(vViewPosition);
            vec3 Hd = normalize(uBackDir + normal * 0.35);
            float tr = pow(clamp(dot(Vd, -Hd), 0.0, 1.0), 2.6);
            float thin = 1.0 - smoothstep(0.15, 1.0, vThick);
            #ifdef USE_MAP
              // borda incisal: vidro acinzentado (sem brilho quente), como numa lente real
              float inc = 1.0 - smoothstep(0.0, 0.3, vMapUv.y);
              outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.78, 0.8, 0.84), inc * 0.55);
              thin *= 1.0 - inc * 0.8;
            #endif
            outgoingLight += uTransColor * tr * (0.25 + thin) * uTrans;
            float rim = pow(1.0 - clamp(dot(Vd, normal), 0.0, 1.0), 3.0);
            outgoingLight += uTransColor * rim * 0.22 * uTrans * (0.4 + thin);
          }
          #include <opaque_fragment>`,
        );
    };
    material.customProgramCacheKey = () => "macro-veneer";
    const glowMat = new THREE.MeshBasicMaterial({
      map: createGlowTexture(),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      color: new THREE.Color(1.25, 1.0, 0.78),
    });
    return { geometry, material, glowMat, transUniforms };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.map?.dispose();
      material.normalMap?.dispose();
      material.dispose();
      glowMat.map?.dispose();
      glowMat.dispose();
    },
    [geometry, material, glowMat],
  );

  const mem = useRef({ frames: 0, ready: false, px: 0, py: 0, t0: -1 });
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }), []);

  useFrame((state, rawDt) => {
    const m = mem.current;
    const dt = Math.min(Math.max(rawDt, 0.0001), 1 / 20);
    const t = sceneTime(state.clock.elapsedTime);
    if (!m.ready && ++m.frames > 2) {
      m.ready = true;
      onReady();
    }
    const reduced = film.reduced;
    const intro = film.introAt < 0 ? 0 : reduced ? 1 : clamp01((t - film.introAt) / 3.2);
    const p = film.progress;

    // mouse: parallax leve, amortecido
    m.px = damp(m.px, film.mx, 2.5, dt);
    m.py = damp(m.py, film.my, 2.5, dt);

    // composição
    const wide = film.wide;
    const baseX = 0.56 * wide;
    const baseY = 0.4 * (1 - wide);
    const idle = reduced ? 0 : t;
    root.current.position.set(baseX + m.px * 0.04, baseY + 0.02 * Math.sin(idle * 0.6) - m.py * 0.03, 0);
    root.current.rotation.set(
      0.22 + 0.05 * Math.sin(idle * 0.37) + m.py * 0.08 - p * 0.25,
      -0.92 + 0.16 * Math.sin(idle * 0.23) + m.px * 0.14 + p * 0.9 + (1 - easeOut(intro)) * -0.45,
      0.24 + 0.03 * Math.sin(idle * 0.31),
    );
    const s = (wide ? 0.86 : 0.52) * (0.9 + 0.1 * easeOut(intro)) * (1 + p * 0.35);
    // no celular (sem multisample) o relevo fino serrilha: suaviza
    material.normalScale.setScalar(wide ? 0.18 : 0.07);
    root.current.scale.setScalar(s);

    // luz-chave quente varre da esquerda para a direita na entrada, depois respira
    const sweep = easeInOut(intro);
    key.current.position.set(-4 + 6.5 * sweep + 0.6 * Math.sin(idle * 0.4), 2.2, 2.6);
    key.current.intensity = 0.15 + 1.35 * easeOut(intro * 1.3);
    back.current.intensity = 0.4 + 2.2 * easeOut((intro - 0.15) * 1.4);
    transUniforms.uTrans.value = 0.2 + 1.1 * easeOut((intro - 0.1) * 1.3);

    // direção da luz de trás em espaço de câmera (para a translucidez)
    tmp.a.copy(back.current.position).applyMatrix4(camera.matrixWorldInverse);
    tmp.b.copy(root.current.position).applyMatrix4(camera.matrixWorldInverse);
    transUniforms.uBackDir.value.copy(tmp.a.sub(tmp.b)).normalize();

    // reflexos de estúdio que deslizam pela superfície
    const er = scene.environmentRotation;
    er.set(0, -1.2 + 2.4 * sweep + 0.25 * Math.sin(idle * 0.2), 0);

    // bokeh quente atrás
    glow.current.position.set(baseX + 2.5, baseY - 1.5, -3.6);
    (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + 0.45 * easeOut((intro - 0.05) * 1.2);
  });

  return (
    <>
      <group ref={root}>
        <group scale={[1, 1.16, 1]} position={[0, -0.5, -0.22]}>
          <mesh ref={mesh} geometry={geometry} material={material} />
        </group>
      </group>
      <mesh ref={glow} material={glowMat} scale={[7.5, 6, 1]} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <directionalLight ref={key} position={[-4, 2.2, 2.6]} intensity={0} color="#ffe9d2" />
      <directionalLight ref={back} position={[1.8, 0.6, -3.5]} intensity={0} color="#ffc185" />
      <directionalLight position={[-3, -1, 1]} intensity={0.12} color="#cfd6ff" />
    </>
  );
}

/** foco que "puxa" na entrada (rack focus) e acompanha a lente */
function Lens() {
  const dof = useRef<DepthOfFieldEffect>(null);
  useFrame((state) => {
    const d = dof.current;
    if (!d) return;
    const t = sceneTime(state.clock.elapsedTime);
    const intro = film.introAt < 0 ? 0 : film.reduced ? 1 : clamp01((t - film.introAt) / 2.6);
    d.bokehScale = 0.45 + 7 * (1 - easeOut(intro));
    d.target = new THREE.Vector3(0.56 * film.wide, 0.4 * (1 - film.wide), 0.05);
  });
  return <DepthOfField ref={dof} focalLength={0.028} bokehScale={8} height={480} />;
}

function Driver({ active }: { active: boolean }) {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    if (!active) return;
    return onFrame((time) => advance(time));
  }, [active, advance]);
  return null;
}

export default function MacroScene({
  active,
  maxDpr,
  effects,
  onReady,
}: {
  active: boolean;
  maxDpr: number;
  effects: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      frameloop="never"
      dpr={[1, maxDpr]}
      gl={{ antialias: false, alpha: false, stencil: false, depth: true, powerPreference: "high-performance" }}
      camera={{ fov: 22, position: [0, 0, 4.4], near: 0.1, far: 30 }}
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={["#070606"]} />
      <Driver active={active} />
      <Suspense fallback={null}>
        <Environment files="/hdr/studio.hdr" environmentIntensity={0.75} />
        <Veneer onReady={onReady} />
        <EffectComposer multisampling={effects ? 4 : 0} enableNormalPass={false}>
          {effects ? <Lens /> : <></>}
          <Bloom mipmapBlur intensity={0.32} luminanceThreshold={0.86} luminanceSmoothing={0.2} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.22} darkness={0.72} />
          <Noise opacity={0.028} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
