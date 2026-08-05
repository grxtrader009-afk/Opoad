import { useRef, useMemo, Suspense, Component, type ReactNode } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

export type ScanState = "idle" | "email" | "password" | "auth" | "success" | "failed";

const EARTH_RADIUS = 1.5;

// ─── NASA-style Earth ─────────────────────────────────────────────────────────
function Earth() {
  const meshRef  = useRef<THREE.Mesh>(null!);
  const cloudRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const atmoRef  = useRef<THREE.Mesh>(null!);

  const texture = useLoader(THREE.TextureLoader, "/earth-texture.jpg");

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y  += 0.0016;
    if (cloudRef.current) cloudRef.current.rotation.y += 0.0026;
    groupRef.current.position.y  = Math.sin(t * 0.38) * 0.07;
    if (atmoRef.current) atmoRef.current.rotation.y -= 0.0005;
  });

  return (
    <group ref={groupRef}>
      {/* Main sphere – NASA real texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.62}
          metalness={0.06}
        />
      </mesh>

      {/* White cloud haze */}
      <mesh ref={cloudRef} scale={1.012}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.16}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere – inner cyan rim */}
      <mesh ref={atmoRef} scale={1.055}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.16} side={THREE.BackSide} />
      </mesh>
      {/* Atmosphere – mid haze */}
      <mesh scale={1.13}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      {/* Atmosphere – outer soft blue */}
      <mesh scale={1.25}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#0066cc" transparent opacity={0.045} side={THREE.BackSide} />
      </mesh>
      {/* Atmosphere – wide glow */}
      <mesh scale={1.42}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#003399" transparent opacity={0.025} side={THREE.BackSide} />
      </mesh>

      {/* Blue light emitted by Earth */}
      <pointLight color="#4FD6FF" intensity={2.4} distance={14} />
    </group>
  );
}

// ─── Holographic scan rings ────────────────────────────────────────────────────
function ScanRings({ scanState }: { scanState: ScanState }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;
    const active = scanState !== "idle";
    const col =
      scanState === "password"  ? "#ff6040" :
      scanState === "success"   ? "#34d399" :
      scanState === "failed"    ? "#f87171" :
                                  "#00D9FF";

    groupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshBasicMaterial;
      if (!active) {
        mat.opacity = Math.max(0, mat.opacity - 0.03);
        return;
      }
      const speed = scanState === "auth" ? 1.1 : 0.72;
      const phase = ((t * speed + i * 0.32) % 1);
      child.scale.setScalar(1 + phase * 0.55);
      mat.opacity = Math.max(0, (1 - phase) * 0.52);
      mat.color.set(col);
    });
  });

  return (
    <group ref={groupRef}>
      {[2.05, 2.45, 2.85].map((r, i) => (
        <mesh key={i}>
          <torusGeometry args={[r, 0.013, 8, 192]} />
          <meshBasicMaterial color="#00D9FF" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Great-circle network arcs ────────────────────────────────────────────────
function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  const theta = Math.acos(dot);
  if (theta < 0.0001) return a.clone();
  const sinTheta = Math.sin(theta);
  return a.clone().multiplyScalar(Math.sin((1 - t) * theta) / sinTheta)
    .add(b.clone().multiplyScalar(Math.sin(t * theta) / sinTheta));
}

function NetworkArc({
  start, end, color = "#4FD6FF", lift = 0.25, packetSpeed = 0.4, packetOffset = 0,
}: {
  start: THREE.Vector3; end: THREE.Vector3; color?: string;
  lift?: number; packetSpeed?: number; packetOffset?: number;
}) {
  const lineRef   = useRef<THREE.Line>(null!);
  const packetRef = useRef<THREE.Mesh>(null!);
  const haloRef   = useRef<THREE.Mesh>(null!);

  const { geometry, mid } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const m = start.clone().add(end).multiplyScalar(0.5).normalize()
      .multiplyScalar(EARTH_RADIUS + lift);
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const p = slerp(start, end, t);
      p.lerp(m, Math.sin(t * Math.PI) * 0.35);
      pts.push(p);
    }
    return { geometry: new THREE.BufferGeometry().setFromPoints(pts), mid: m };
  }, [start, end, lift]);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * packetSpeed + packetOffset) % 1;
    const p = slerp(start, end, t);
    p.lerp(mid, Math.sin(t * Math.PI) * 0.35);
    if (packetRef.current) packetRef.current.position.copy(p);
    if (haloRef.current) {
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.sin(clock.getElapsedTime() * 4 + packetOffset) * 0.15;
    }
  });

  return (
    <group>
      {/* @ts-expect-error – line primitive */}
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.32} />
      </line>
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function NetworkArcs() {
  const arcs = useMemo(() => {
    const pts = [
      new THREE.Vector3( 0.8,  0.3,  0.5).normalize(),
      new THREE.Vector3(-0.6,  0.4,  0.7).normalize(),
      new THREE.Vector3( 0.2,  0.6, -0.8).normalize(),
      new THREE.Vector3(-0.8, -0.2, -0.5).normalize(),
      new THREE.Vector3( 0.5, -0.5,  0.7).normalize(),
      new THREE.Vector3(-0.3, -0.6,  0.8).normalize(),
      new THREE.Vector3( 0.9, -0.1, -0.4).normalize(),
      new THREE.Vector3(-0.5,  0.5, -0.7).normalize(),
    ];
    return [
      [pts[0], pts[1]], [pts[2], pts[3]], [pts[4], pts[5]], [pts[6], pts[7]],
      [pts[0], pts[2]], [pts[1], pts[3]], [pts[4], pts[6]], [pts[5], pts[7]],
    ] as [THREE.Vector3, THREE.Vector3][];
  }, []);

  return (
    <group>
      {arcs.map(([a, b], i) => (
        <NetworkArc
          key={i}
          start={a.clone().multiplyScalar(EARTH_RADIUS)}
          end={b.clone().multiplyScalar(EARTH_RADIUS)}
          color={i % 2 === 0 ? "#4FD6FF" : "#00D9FF"}
          lift={0.2 + (i % 3) * 0.08}
          packetSpeed={0.3 + (i % 4) * 0.08}
          packetOffset={i * 0.13}
        />
      ))}
    </group>
  );
}

// ─── Orbit node ───────────────────────────────────────────────────────────────
function OrbitNode({
  orbitRadius, speed, offset, color, size = 0.03, shape = "sphere",
}: {
  orbitRadius: number; speed: number; offset: number; color: string;
  size?: number; shape?: "sphere" | "box";
}) {
  const meshRef  = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const angle = clock.getElapsedTime() * speed + offset;
    meshRef.current.position.x = Math.cos(angle) * orbitRadius;
    meshRef.current.position.z = Math.sin(angle) * orbitRadius;
    meshRef.current.rotation.y += 0.05;
    meshRef.current.rotation.x += 0.03;
    if (trailRef.current) {
      (trailRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.sin(clock.getElapsedTime() * 3 + offset) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        {shape === "box" ? <boxGeometry args={[size, size, size]} /> : <sphereGeometry args={[size, 8, 8]} />}
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={trailRef}>
        <sphereGeometry args={[size * 3, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ─── Orbit ring ───────────────────────────────────────────────────────────────
function OrbitRing({
  radius, tiltX, tiltZ, speed, color, opacity, nodes,
}: {
  radius: number; tiltX: number; tiltZ: number; speed: number;
  color: string; opacity: number;
  nodes: { speed: number; offset: number; shape?: "sphere" | "box"; size?: number }[];
}) {
  const groupRef  = useRef<THREE.Group>(null!);
  const ringGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [radius]);

  useFrame((_, dt) => { groupRef.current.rotation.y += dt * speed * 0.08; });

  return (
    <group ref={groupRef} rotation={[tiltX, 0, tiltZ]}>
      {/* @ts-expect-error – line primitive */}
      <line geometry={ringGeo}>
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </line>
      {nodes.map((n, i) => (
        <OrbitNode key={i} orbitRadius={radius} speed={n.speed} offset={n.offset}
          color={color} size={n.size ?? 0.03} shape={n.shape ?? "sphere"} />
      ))}
    </group>
  );
}

// ─── Energy particles ─────────────────────────────────────────────────────────
function EnergyParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.9 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.03;
    ref.current.rotation.x += dt * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#4FD6FF" size={0.016} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── Nebula dust ──────────────────────────────────────────────────────────────
function NebulaDust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, [count]);
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.006; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#58E7FF" size={0.06} transparent opacity={0.18} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── Mouse-parallax scene wrapper ─────────────────────────────────────────────
function SceneContent({ mouseX, mouseY, scanState }: {
  mouseX: number; mouseY: number; scanState: ScanState;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    groupRef.current.rotation.x += (mouseY * 0.15 - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.y += (mouseX * 0.15 - groupRef.current.rotation.y) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <Earth />
      <NetworkArcs />
      <ScanRings scanState={scanState} />

      {/* Ring 1 – inner, fast, cyan */}
      <OrbitRing radius={2.1} tiltX={0.35} tiltZ={0.1} speed={1.0} color="#4FD6FF" opacity={0.5}
        nodes={[
          { speed: 0.7, offset: 0 },
          { speed: 0.7, offset: Math.PI * 0.67 },
          { speed: 0.7, offset: Math.PI * 1.34 },
        ]}
      />
      {/* Ring 2 – mid, reverse */}
      <OrbitRing radius={2.7} tiltX={-0.55} tiltZ={0.25} speed={-0.6} color="#00D9FF" opacity={0.35}
        nodes={[
          { speed: -0.5, offset: Math.PI * 0.5, shape: "box", size: 0.04 },
          { speed: -0.5, offset: Math.PI * 1.5, shape: "box", size: 0.04 },
          { speed: -0.5, offset: 0, shape: "sphere" },
          { speed: -0.5, offset: Math.PI, shape: "sphere" },
        ]}
      />
      {/* Ring 3 – outer, slow */}
      <OrbitRing radius={3.4} tiltX={0.8} tiltZ={-0.4} speed={0.35} color="#58E7FF" opacity={0.22}
        nodes={[
          { speed: 0.3, offset: 0, size: 0.025 },
          { speed: 0.3, offset: Math.PI * 0.8, size: 0.025 },
        ]}
      />
      {/* Ring 4 – equatorial faint */}
      <OrbitRing radius={3.9} tiltX={0.05} tiltZ={0.05} speed={-0.2} color="#80FFFF" opacity={0.12} nodes={[]} />

      <EnergyParticles count={400} />
    </group>
  );
}

// ─── WebGL error boundary ─────────────────────────────────────────────────────
class WebGLErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

// ─── Public export ────────────────────────────────────────────────────────────
export function CinematicLoginScene({
  mouseX, mouseY, scanState = "idle",
}: {
  mouseX: number;
  mouseY: number;
  scanState?: ScanState;
}) {
  return (
    <WebGLErrorBoundary>
      <Canvas
        camera={{ position: [0, 0, 6.0], fov: 48 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.18} />
        <directionalLight position={[5, 4, 5]}   intensity={3.2} color="#bfe4ff" />
        <directionalLight position={[-4, -1, -3]} intensity={1.0} color="#4FD6FF" />
        {/* Warm sun from far right */}
        <pointLight position={[10, 5, 3]} intensity={14} color="#fff8e0" distance={35} />

        <Suspense fallback={null}>
          <SceneContent mouseX={mouseX} mouseY={mouseY} scanState={scanState} />
        </Suspense>

        <Stars radius={90} depth={60} count={4000} factor={4.5} saturation={0} fade speed={0.22} />
        <NebulaDust count={600} />
      </Canvas>
    </WebGLErrorBoundary>
  );
}
