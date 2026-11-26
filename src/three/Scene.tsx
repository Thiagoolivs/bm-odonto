import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { CROWN_H, createToothGeometry, createVeneerGeometry, createVeneerGuideGeometry } from "./geometry";
import { SHAPE_INDEX, SLOT_CONFIG, stage } from "./state";
import { Particles } from "./Particles";
import { Glow } from "./Glow";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const damp = (cur: number, target: number, lambda: number, dt: number) =>
  lerp(cur, target, 1 - Math.exp(-lambda * dt));

/** interpola uma sequência de pares [p, valor] com suavização */
function keys(p: number, k: [number, number][]) {
  if (p <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    const [p0, v0] = k[i];
    const [p1, v1] = k[i + 1];
    if (p <= p1) return lerp(v0, v1, smooth(p0, p1, p));
  }
  return k[k.length - 1][1];
}

const LOOP = 4.2; // segundos do ciclo "respira e encaixa"
const FLOAT = 0.5;
const INTRO = 2.6;

interface LensPose {
  off: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
  rz: number;
}

function heroLens(t: number, reduced: boolean): LensPose {
  if (reduced) return { off: 0.34, x: 0, y: 0.04, rx: -0.06, ry: 0.1, rz: 0 };
  const ph = (((t % LOOP) + LOOP) % LOOP) / LOOP;
  let off: number;
  if (ph < 0.32) off = FLOAT + 0.035 * Math.sin((ph / 0.32) * Math.PI * 2);
  else if (ph < 0.5) off = FLOAT * (1 - easeInOut((ph - 0.32) / 0.18));
  else if (ph < 0.74) off = 0;
  else off = FLOAT * (0.5 - 0.5 * Math.cos(((ph - 0.74) / 0.26) * Math.PI));
  const f = off / FLOAT;
  return { off, x: 0, y: 0.06 * f, rx: -0.12 * f, ry: 0.12 * f, rz: 0.03 * f };
}

function storyLens(p: number): LensPose {
  return {
    off: keys(p, [
      [0, 1.05],
      [0.28, 0.92],
      [0.5, 0.55],
      [0.62, 0.34],
      [0.78, 0],
    ]),
    x: keys(p, [
      [0, 0.4],
      [0.28, 0.32],
      [0.52, 0.04],
      [0.62, 0],
    ]),
    y: keys(p, [
      [0, 0.36],
      [0.28, 0.28],
      [0.55, 0.05],
      [0.78, 0],
    ]),
    rx: keys(p, [
      [0, -0.35],
      [0.5, -0.1],
      [0.78, 0],
    ]),
    ry: keys(p, [
      [0, -1.05],
      [0.3, -0.8],
      [0.55, -0.08],
      [0.78, 0],
    ]),
    rz: keys(p, [
      [0, 0.32],
      [0.5, 0.04],
      [0.78, 0],
    ]),
  };
}

const ZERO: LensPose = { off: 0, x: 0, y: 0, rx: 0, ry: 0, rz: 0 };

function mixPose(a: LensPose, b: LensPose, t: number): LensPose {
  return {
    off: lerp(a.off, b.off, t),
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    rx: lerp(a.rx, b.rx, t),
    ry: lerp(a.ry, b.ry, t),
    rz: lerp(a.rz, b.rz, t),
  };
}

function rectOf(el?: HTMLElement) {
  return el ? el.getBoundingClientRect() : null;
}

function ToothRig({ onReady }: { onReady: () => void }) {
  const outer = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const lensGroup = useRef<THREE.Group>(null!);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const { tooth, lens, guides, scan, pulse, toothMat, rootMat, lensMat } = useMemo(() => {
    const toothMat = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      color: stage.shade.tooth,
      roughness: 0.34,
      metalness: 0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      sheen: 0.15,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#fff0da"),
      specularIntensity: 0.6,
      ior: 1.6,
      envMapIntensity: 1.1,
    });
    // a raiz se dissolve no fundo ("surge da penumbra"): material transparente só para ela
    const rootMat = toothMat.clone();
    rootMat.transparent = true;
    rootMat.depthWrite = false;
    rootMat.onBeforeCompile = (shader) => {
      shader.uniforms.uFade = { value: new THREE.Vector2(CROWN_H - 0.02, CROWN_H + 0.6) };
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
    rootMat.customProgramCacheKey = () => "tooth-root-fade";
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: stage.shade.lens,
      metalness: 0,
      roughness: 0.2,
      transmission: 0.9,
      thickness: 0.3,
      ior: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      iridescence: 0.2,
      emissive: new THREE.Color("#3a2c1c"),
      iridescenceIOR: 1.3,
      iridescenceThicknessMinimum: 120,
      iridescenceThicknessMaximum: 420,
      attenuationColor: new THREE.Color(stage.shade.lens),
      attenuationDistance: 0.55,
      specularIntensity: 1,
      specularColor: new THREE.Color("#fff1dc"),
      envMapIntensity: 2.4,
    });
    const tooth = new THREE.Mesh(createToothGeometry(), [toothMat, rootMat]);
    tooth.updateMorphTargets();
    const lens = new THREE.Mesh(createVeneerGeometry(), lensMat);
    lens.updateMorphTargets();
    lens.renderOrder = 2;

    const guides = new THREE.LineSegments(
      createVeneerGuideGeometry(),
      new THREE.LineBasicMaterial({ color: "#d9ac66", transparent: true, opacity: 0, depthWrite: false }),
    );
    guides.updateMorphTargets();
    guides.renderOrder = 3;

    const ellipse = new THREE.EllipseCurve(0, 0, 0.62, 0.5, 0, Math.PI * 2, false, 0);
    const pts = ellipse.getPoints(120).map((p) => new THREE.Vector3(p.x, 0, p.y));
    const scan = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color: "#e2b878",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );

    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(0.985, 1, 128),
      new THREE.MeshBasicMaterial({
        color: "#d4a45c",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    return { tooth, lens, guides, scan, pulse, toothMat, rootMat, lensMat };
  }, []);

  useEffect(
    () => () => {
      for (const o of [tooth, lens, guides, scan, pulse]) {
        o.geometry.dispose();
        ([] as THREE.Material[]).concat(o.material).forEach((m) => m.dispose());
      }
    },
    [tooth, lens, guides, scan, pulse],
  );

  const mem = useRef({
    started: -1,
    readyCalled: false,
    frames: 0,
    pos: new THREE.Vector3(),
    scale: 1,
    init: false,
    lastOff: 1,
    pulseAt: -10,
    morph: [0, 0],
    lensColor: new THREE.Color(stage.shade.lens),
    toothColor: new THREE.Color(stage.shade.tooth),
  });

  useFrame((state, rawDt) => {
    const m = mem.current;
    const dt = Math.min(rawDt, 1 / 20);
    const t = state.clock.elapsedTime;
    const reduced = stage.reducedMotion;

    if (m.started < 0) m.started = t;
    m.frames++;
    if (!m.readyCalled && m.frames > 2) {
      m.readyCalled = true;
      onReady();
    }
    const introRaw = reduced ? 1 : clamp01((t - m.started - 0.15) / INTRO);
    const intro = easeOutCubic(introRaw);
    stage.intro = intro;

    // ---------- leitura do layout (slots no DOM) ----------
    const vw = state.size.width;
    const vh = state.size.height;
    const winH = window.innerHeight || vh;
    const worldH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const k = worldH / vh;

    const r0 = rectOf(stage.slots.hero);
    const r1 = rectOf(stage.slots.story) ?? r0;
    const r2 = rectOf(stage.slots.sim) ?? r1;
    const sStory = rectOf(stage.sections.story);
    const sSim = rectOf(stage.sections.sim);
    if (!r0 || !r1 || !r2) return;

    const b01 = sStory ? clamp01(1 - sStory.top / winH) : 0;
    const b12 = sSim ? clamp01(1 - sSim.top / winH) : 0;
    const e01 = easeInOut(b01);
    const e12 = easeInOut(b12);
    const p = sStory ? clamp01(-sStory.top / Math.max(1, sStory.height - winH)) : 0;

    const cx = lerp(lerp(r0.left + r0.width / 2, r1.left + r1.width / 2, e01), r2.left + r2.width / 2, e12);
    const cy = lerp(lerp(r0.top + r0.height / 2, r1.top + r1.height / 2, e01), r2.top + r2.height / 2, e12);
    const h = lerp(lerp(r0.height, r1.height, e01), r2.height, e12);
    const fit = lerp(lerp(SLOT_CONFIG.hero.fit, SLOT_CONFIG.story.fit, e01), SLOT_CONFIG.sim.fit, e12);
    const focusY = lerp(lerp(SLOT_CONFIG.hero.focusY, SLOT_CONFIG.story.focusY, e01), SLOT_CONFIG.sim.focusY, e12);

    const targetScale = ((h * k) / fit) * lerp(0.82, 1, intro);
    const tx = (cx - vw / 2) * k;
    const ty = (vh / 2 - cy) * k;
    if (!m.init) {
      m.pos.set(tx, ty, 0);
      m.scale = targetScale;
      m.init = true;
    }
    m.pos.x = damp(m.pos.x, tx, 14, dt);
    m.pos.y = damp(m.pos.y, ty, 14, dt);
    m.scale = damp(m.scale, targetScale, 10, dt);
    outer.current.position.copy(m.pos);
    outer.current.scale.setScalar(m.scale);
    inner.current.position.set(0, -focusY, 0);

    // ---------- rotação ----------
    const drag = stage.drag;
    const now = performance.now();
    if (!drag.dragging) {
      drag.y += drag.vy * dt * 1000;
      drag.vy *= Math.exp(-dt * 4);
      if (now - drag.lastInteraction > 2600) {
        const home = Math.round(drag.y / (Math.PI * 2)) * Math.PI * 2;
        drag.y = damp(drag.y, home, 1.6, dt);
        drag.x = damp(drag.x, 0, 1.6, dt);
      }
    }

    const heroRy = reduced ? 0.36 : 0.58 * Math.sin(t * 0.42) + 0.12 * Math.sin(t * 1.07);
    const heroRx = reduced ? 0.08 : 0.08 + 0.05 * Math.sin(t * 0.61);
    const storyRy =
      keys(p, [
        [0, -0.5],
        [0.3, -0.3],
        [0.5, 0.36],
        [0.66, 0.42],
        [0.86, 0.12],
        [1, 0.28],
      ]) + (reduced ? 0 : 0.05 * Math.sin(t * 0.8));
    const storyRx = keys(p, [
      [0, 0.12],
      [0.5, 0.2],
      [0.86, 0.06],
    ]);
    const simRy = reduced ? 0.12 : 0.24 * Math.sin(t * 0.36);
    const simRx = 0.05;

    const introSpin = reduced ? 0 : -1.9 * (1 - intro);
    outer.current.rotation.y = lerp(lerp(heroRy, storyRy, e01), simRy, e12) + drag.y + introSpin;
    outer.current.rotation.x = lerp(lerp(heroRx, storyRx, e01), simRx, e12) + drag.x;
    outer.current.rotation.z = (reduced ? 0 : 0.035 * Math.sin(t * 0.5)) * (1 - e12);

    // ---------- lente ----------
    const loopT = t - m.started - 0.15 - INTRO + LOOP * 0.5;
    let pose = mixPose(mixPose(heroLens(loopT, reduced), storyLens(p), e01), ZERO, e12);
    if (!reduced && introRaw < 1) {
      // entrada: a lente chega voando e encaixa
      const a = 1 - easeInOut(clamp01((introRaw - 0.05) / 0.95));
      pose = { off: pose.off + 3.2 * a, x: pose.x + 0.25 * a, y: pose.y + 0.6 * a, rx: pose.rx - 0.6 * a, ry: pose.ry + 1.2 * a, rz: pose.rz + 0.4 * a };
    }
    const breathe = reduced ? 0 : 0.022 * Math.sin(t * Math.PI) * clamp01(pose.off / FLOAT);
    const sincePulse = t - m.pulseAt;
    const settle = sincePulse < 0.6 ? 0.018 * Math.sin((sincePulse / 0.6) * Math.PI) : 0;
    lensGroup.current.position.set(pose.x, pose.y, pose.off);
    lensGroup.current.rotation.set(pose.rx, pose.ry, pose.rz);
    lensGroup.current.scale.setScalar(1 + breathe + settle);

    if (m.lastOff > 0.035 && pose.off <= 0.035) m.pulseAt = t;
    m.lastOff = pose.off;

    // pulso dourado no encaixe
    const pk = clamp01((t - m.pulseAt) / 1.25);
    const pm = pulse.material as THREE.MeshBasicMaterial;
    pm.opacity = pk < 1 && !reduced ? 0.32 * Math.pow(1 - pk, 2) : 0;
    pulse.position.set(m.pos.x, m.pos.y, 0.4 * m.scale);
    pulse.scale.setScalar(m.scale * lerp(0.4, 0.95, easeOutCubic(pk)));
    pulse.visible = pm.opacity > 0.002;

    // ---------- guias do planejamento + anel de escaneamento ----------
    const zone = e01 * (1 - e12);
    const gm = guides.material as THREE.LineBasicMaterial;
    gm.opacity = 0.85 * smooth(0.28, 0.4, p) * (1 - smooth(0.7, 0.8, p)) * zone;
    guides.visible = gm.opacity > 0.002;
    const sm = scan.material as THREE.LineBasicMaterial;
    sm.opacity = 0.9 * (1 - smooth(0.24, 0.34, p)) * zone;
    scan.visible = sm.opacity > 0.002;
    scan.position.y = 0.55 + 0.42 * Math.sin(t * 1.5);
    const sw = 1 + 0.08 * Math.sin(t * 1.5 + 1.2);
    scan.scale.set(sw, 1, sw);

    // ---------- cor (tonalidade) e formato ----------
    const cl = 1 - Math.exp(-dt * 5);
    m.lensColor.set(stage.shade.lens);
    m.toothColor.set(stage.shade.tooth);
    lensMat.color.lerp(m.lensColor, cl);
    lensMat.attenuationColor.lerp(m.lensColor, cl);
    toothMat.color.lerp(m.toothColor, cl);
    rootMat.color.copy(toothMat.color);

    const si = SHAPE_INDEX[stage.shape];
    const targets = [si === 1 ? 1 : 0, si === 2 ? 1 : 0];
    for (let i = 0; i < 2; i++) m.morph[i] = damp(m.morph[i], targets[i], 5.5, dt);
    for (const o of [tooth, lens, guides]) {
      if (o.morphTargetInfluences) {
        o.morphTargetInfluences[0] = m.morph[0];
        o.morphTargetInfluences[1] = m.morph[1];
      }
    }
  });

  return (
    <>
      <group ref={outer}>
        <group ref={inner}>
          <primitive object={tooth} />
          <primitive object={scan} />
          <primitive object={guides} />
          <group ref={lensGroup}>
            <primitive object={lens} />
          </group>
        </group>
      </group>
      <primitive object={pulse} />
      <Glow target={outer} />
      <Particles target={outer} />
    </>
  );
}

function Lights() {
  const glint = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    glint.current.position.set(Math.sin(t * 0.7) * 3, 1.2 + Math.sin(t * 0.45) * 0.8, 2.4 + Math.cos(t * 0.7));
  });
  return (
    <>
      <ambientLight intensity={0.05} color="#f7eadb" />
      <directionalLight position={[-4, 3, 4]} intensity={0.6} color="#fff3e3" />
      <directionalLight position={[3.5, 1.8, -4]} intensity={4.6} color="#b98c4b" />
      <directionalLight position={[-4, -1.2, -3]} intensity={2.4} color="#c99a55" />
      <pointLight ref={glint} intensity={3} distance={7} decay={1.6} color="#ffe3b5" />
    </>
  );
}

function FrameControl({ active }: { active: boolean }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    setFrameloop(active ? "always" : "never");
  }, [active, setFrameloop]);
  return null;
}

export default function Scene({
  active,
  maxDpr,
  onReady,
  onError,
}: {
  active: boolean;
  maxDpr: number;
  onReady: () => void;
  onError: () => void;
}) {
  return (
    <Canvas
      dpr={[1, maxDpr]}
      gl={{
        antialias: true,
        alpha: false,
        stencil: false,
        powerPreference: "high-performance",
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.02,
      }}
      camera={{ fov: 30, position: [0, 0, 7.5], near: 0.1, far: 40 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onError();
        });
      }}
      style={{ pointerEvents: "none" }}
    >
      <color attach="background" args={["#25190f"]} />
      <FrameControl active={active} />
      <Lights />
      <Suspense fallback={null}>
        <Environment files="/hdr/studio.hdr" environmentIntensity={0.5} />
        <ToothRig onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
