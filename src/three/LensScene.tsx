import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { CROWN_H, createToothGeometry, createVeneerGeometry } from "./geometry";
import { SHAPE_INDEX, lab } from "./state";
import { onFrame } from "../lib/scroll";

/*
 * Estúdio de porcelana: dente + lente em resina sobre fundo claro, luz suave,
 * sombra de contato, sem brilhos dourados. Renderiza no mesmo relógio da página
 * (frameloop "never" + advance) e só enquanto a seção está na tela.
 */

const BG = "#e3e1dd";
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const damp = (a: number, b: number, l: number, dt: number) => lerp(a, b, 1 - Math.exp(-l * dt));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const LOOP = 4.6;
const FLOAT = 0.42;

function lensOffset(t: number, reduced: boolean) {
  if (reduced) return 0.28;
  const ph = (((t % LOOP) + LOOP) % LOOP) / LOOP;
  if (ph < 0.3) return FLOAT + 0.025 * Math.sin((ph / 0.3) * Math.PI * 2);
  if (ph < 0.48) return FLOAT * (1 - easeInOut((ph - 0.3) / 0.18));
  if (ph < 0.76) return 0;
  return FLOAT * (0.5 - 0.5 * Math.cos(((ph - 0.76) / 0.24) * Math.PI));
}

function Tooth({ onReady }: { onReady: () => void }) {
  const group = useRef<THREE.Group>(null!);
  const lensG = useRef<THREE.Group>(null!);
  const shadow = useRef<THREE.Mesh>(null!);

  const { tooth, lens, toothMat, rootMat, lensMat, shadowMat } = useMemo(() => {
    const toothMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      color: lab.shade.tooth,
      roughness: 0.36,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      sheen: 0.2,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#fff6ea"),
      specularIntensity: 0.55,
      ior: 1.6,
    });
    // a raiz se dissolve no fundo do estúdio
    const rootMat = toothMat.clone();
    rootMat.transparent = true;
    rootMat.depthWrite = false;
    rootMat.onBeforeCompile = (shader) => {
      shader.uniforms.uFade = { value: new THREE.Vector2(CROWN_H - 0.06, CROWN_H + 0.36) };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vLocalY;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvLocalY = transformed.y;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform vec2 uFade;\nvarying float vLocalY;")
        .replace(
          "#include <opaque_fragment>",
          "#include <opaque_fragment>\nfloat fade = 1.0 - smoothstep(uFade.x, uFade.y, vLocalY);\ngl_FragColor.a *= fade * fade;",
        );
    };
    rootMat.customProgramCacheKey = () => "root-fade-light";

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: lab.shade.lens,
      roughness: 0.12,
      transmission: 0.9,
      thickness: 0.3,
      ior: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      iridescence: 0.18,
      iridescenceIOR: 1.3,
      iridescenceThicknessMinimum: 120,
      iridescenceThicknessMaximum: 400,
      attenuationColor: new THREE.Color(lab.shade.lens),
      attenuationDistance: 0.6,
      specularIntensity: 1,
      envMapIntensity: 1.6,
    });

    const tooth = new THREE.Mesh(createToothGeometry(), [toothMat, rootMat]);
    tooth.updateMorphTargets();
    const lens = new THREE.Mesh(createVeneerGeometry(), lensMat);
    lens.updateMorphTargets();
    lens.renderOrder = 2;

    // sombra de contato (gradiente radial, barata)
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(40,36,32,0.6)");
    grad.addColorStop(0.45, "rgba(40,36,32,0.2)");
    grad.addColorStop(1, "rgba(40,36,32,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const shadowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
    return { tooth, lens, toothMat, rootMat, lensMat, shadowMat };
  }, []);

  useEffect(
    () => () => {
      tooth.geometry.dispose();
      lens.geometry.dispose();
      [toothMat, rootMat, lensMat, shadowMat].forEach((m) => m.dispose());
    },
    [tooth, lens, toothMat, rootMat, lensMat, shadowMat],
  );

  const mem = useRef({ frames: 0, ready: false, morph: [0, 0], lensC: new THREE.Color(), toothC: new THREE.Color(), start: -1 });

  useFrame((state, rawDt) => {
    const m = mem.current;
    const dt = Math.min(Math.max(rawDt, 0), 1 / 20);
    const t = state.clock.elapsedTime;
    if (m.start < 0) m.start = t;
    const reduced = lab.reducedMotion;
    if (!m.ready && ++m.frames > 2) {
      m.ready = true;
      onReady();
    }

    // rotação: ocioso + arrastar com inércia, voltando devagar ao centro
    const drag = lab.drag;
    if (!drag.dragging) {
      drag.y += drag.vy * dt * 1000;
      drag.vy *= Math.exp(-dt * 4);
      if (performance.now() - drag.lastInteraction > 2600) {
        drag.y = damp(drag.y, Math.round(drag.y / (Math.PI * 2)) * Math.PI * 2, 1.4, dt);
        drag.x = damp(drag.x, 0, 1.4, dt);
      }
    }
    const idle = reduced ? 0.32 : 0.42 * Math.sin((t - m.start) * 0.4) + 0.1 * Math.sin((t - m.start) * 1.1);
    group.current.rotation.y = idle + drag.y;
    group.current.rotation.x = 0.06 + (reduced ? 0 : 0.04 * Math.sin(t * 0.6)) + drag.x;

    // lente: respira e encaixa
    const off = lensOffset(t - m.start + LOOP * 0.1, reduced);
    const f = clamp01(off / FLOAT);
    lensG.current.position.set(0, 0.05 * f, off);
    lensG.current.rotation.set(-0.1 * f, 0.12 * f, 0.02 * f);
    lensG.current.scale.setScalar(1 + (reduced ? 0 : 0.018 * Math.sin(t * Math.PI) * f));

    // sombra acompanha a "altura" do dente
    shadow.current.scale.set(1.3, 0.5, 1);
    (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.9;

    // cor e formato
    const cl = 1 - Math.exp(-dt * 5);
    m.lensC.set(lab.shade.lens);
    m.toothC.set(lab.shade.tooth);
    lensMat.color.lerp(m.lensC, cl);
    lensMat.attenuationColor.lerp(m.lensC, cl);
    toothMat.color.lerp(m.toothC, cl);
    rootMat.color.copy(toothMat.color);
    const si = SHAPE_INDEX[lab.shape];
    const targets = [si === 1 ? 1 : 0, si === 2 ? 1 : 0];
    for (let i = 0; i < 2; i++) m.morph[i] = damp(m.morph[i], targets[i], 5, dt);
    for (const o of [tooth, lens]) {
      if (o.morphTargetInfluences) {
        o.morphTargetInfluences[0] = m.morph[0];
        o.morphTargetInfluences[1] = m.morph[1];
      }
    }
  });

  return (
    <>
      <group position={[0, 0.12, 0]}>
        <group ref={group}>
          <group position={[0, -0.62, 0]}>
            <primitive object={tooth} />
            <group ref={lensG}>
              <primitive object={lens} />
            </group>
          </group>
        </group>
      </group>
      <mesh ref={shadow} position={[0, -0.78, -0.2]} rotation={[-Math.PI / 2, 0, 0]} material={shadowMat} renderOrder={-1}>
        <planeGeometry args={[1.6, 1.6]} />
      </mesh>
    </>
  );
}

function Driver({ active }: { active: boolean }) {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    if (!active) return;
    return onFrame((time) => advance(time));
  }, [active, advance]);
  return null;
}

export default function LensScene({ active, maxDpr, onReady }: { active: boolean; maxDpr: number; onReady: () => void }) {
  return (
    <Canvas
      frameloop="never"
      dpr={[1, maxDpr]}
      gl={{ antialias: true, alpha: false, stencil: false, powerPreference: "high-performance", toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1 }}
      camera={{ fov: 26, position: [0, 0, 6.1], near: 0.1, far: 30 }}
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={[BG]} />
      <Driver active={active} />
      <ambientLight intensity={0.08} />
      <directionalLight position={[-3.5, 3.5, 3]} intensity={1.35} color="#fffaf2" />
      <directionalLight position={[4, 0.5, 2.5]} intensity={0.22} color="#ffffff" />
      <directionalLight position={[2.5, 1, -4]} intensity={0.55} color="#ffffff" />
      <Suspense fallback={null}>
        <Environment files="/hdr/studio.hdr" environmentIntensity={0.62} />
        <Tooth onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
