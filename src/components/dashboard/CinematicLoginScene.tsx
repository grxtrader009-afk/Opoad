import { useRef, useMemo, Suspense, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { getEarthTexture } from "@/lib/earth-texture";

const EARTH_RADIUS = 1.5;

// ─── Earth ───────────────────────────────────────────────────────────────────
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const cloudRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const atmo1Ref = useRef<THREE.Mesh>(null!);
  const texture = getEarthTexture();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y += 0.0025;
    // Clouds drift slightly faster than the surface
    if (cloudRef.current) cloudRef.current.rotation.y += 0.0035;
    // Gentle floating
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.1;
    // Slow atmospheric counter-rotation
    if (atmo1Ref.current) atmo1Ref.current.rotation.y -= 0.0008;
  });

  return (
    <group ref={groupRef}>
      {/* Main sphere — continents + subtle city-light emissive */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive={new THREE.Color("#0a1830")}
          emissiveIntensity={0.55}
          roughness={0.7}
          metalness={0.08}
        />
      </mesh>

      {/* Cloud layer — soft white haze drifting slightly faster */}
      <mesh ref={cloudRef} scale={1.015}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>

      {/* Inner atmosphere — blue rim */}
      <mesh ref={atmo1Ref} scale={1.06}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.14} side={THREE.BackSide} />
      </mesh>
      {/* Mid atmosphere haze */}
      <mesh scale={1.14}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      {/* Outer glow */}
      <mesh scale={1.28}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#0044cc" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
      {/* Blue point light from Earth */}
      <pointLight color="#4FD6FF" intensity={2.0} distance={10} />
    </group>
  );
}

// ─── Great-circle network arcs with traveling data packets ───────────────────
function slerp(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  const theta = Math.acos(dot);
  if (theta < 0.0001) return a.clone();
  const sinTheta = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / sinTheta;
  const w2 = Math.sin(t * theta) / sinTheta;
  return a.clone().multiplyScalar(w1).add(b.clone().multiplyScalar(w2));
}

function NetworkArc({
  start,
  end,
  color = "#4FD6FF",
  lift = 0.25,
  packetSpeed = 0.4,
  packetOffset = 0,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color?: string;
  lift?: number;
  packetSpeed?: number;
  packetOffset?: number;
}) {
  const lineRef = useRef<THREE.Line>(null!);
  const packetRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);

  const { geometry, mid } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 64;
    const m = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(
      EARTH_RADIUS + lift,
    );
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = slerp(start, end, t);
      // Bulge the arc outward toward `mid`
      const bulge = Math.sin(t * Math.PI);
      p.lerp(m, bulge * 0.35);
      pts.push(p);
    }
    return { geometry: new THREE.BufferGeometry().setFromPoints(pts), mid: m };
  }, [start, end, lift]);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * packetSpeed + packetOffset) % 1;
    const p = slerp(start, end, t);
    const bulge = Math.sin(t * Math.PI);
    p.lerp(mid, bulge * 0.35);
    if (packetRef.current) packetRef.current.position.copy(p);
    if (haloRef.current) {
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.2 + Math.sin(clock.getElapsedTime() * 4 + packetOffset) * 0.15;
    }
  });

  return (
    <group>
      {/* @ts-expect-error — line primitive */}
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.35} />
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
    // Pairs of normalized surface points (rough continent anchors)
    const pts = [
      new THREE.Vector3(0.8, 0.3, 0.5).normalize(),
      new THREE.Vector3(-0.6, 0.4, 0.7).normalize(),
      new THREE.Vector3(0.2, 0.6, -0.8).normalize(),
      new THREE.Vector3(-0.8, -0.2, -0.5).normalize(),
      new THREE.Vector3(0.5, -0.5, 0.7).normalize(),
      new THREE.Vector3(-0.3, -0.6, 0.8).normalize(),
      new THREE.Vector3(0.9, -0.1, -0.4).normalize(),
      new THREE.Vector3(-0.5, 0.5, -0.7).normalize(),
    ];
    const pairs: Array<[THREE.Vector3, THREE.Vector3]> = [
      [pts[0], pts[1]],
      [pts[2], pts[3]],
      [pts[4], pts[5]],
      [pts[6], pts[7]],
      [pts[0], pts[2]],
      [pts[1], pts[3]],
      [pts[4], pts[6]],
      [pts[5], pts[7]],
    ];
    return pairs;
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

// ─── Single orbit node (satellite/drone) ─────────────────────────────────────
function OrbitNode({
  orbitRadius,
  speed,
  offset,
  color,
  size = 0.03,
  shape = "sphere",
}: {
  orbitRadius: number;
  speed: number;
  offset: number;
  color: string;
  size?: number;
  shape?: "sphere" | "box";
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = t * speed + offset;
    meshRef.current.position.x = Math.cos(angle) * orbitRadius;
    meshRef.current.position.z = Math.sin(angle) * orbitRadius;
    // Slow self-rotation
    meshRef.current.rotation.y += 0.05;
    meshRef.current.rotation.x += 0.03;
    // Trail glow pulse
    if (trailRef.current) {
      const m = trailRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.15 + Math.sin(t * 3 + offset) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        {shape === "box" ? (
          <boxGeometry args={[size, size, size]} />
        ) : (
          <sphereGeometry args={[size, 8, 8]} />
        )}
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Soft halo behind each node */}
      <mesh ref={trailRef}>
        <sphereGeometry args={[size * 3, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ─── Orbit ring + its nodes ──────────────────────────────────────────────────
function OrbitRing({
  radius,
  tiltX,
  tiltZ,
  speed,
  color,
  opacity,
  nodes,
}: {
  radius: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  color: string;
  opacity: number;
  nodes: Array<{ speed: number; offset: number; shape?: "sphere" | "box"; size?: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    groupRef.current.rotation.y += dt * speed * 0.08;
  });

  const ringPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);

  const ringGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(ringPoints),
    [ringPoints],
  );

  return (
    <group ref={groupRef} rotation={[tiltX, 0, tiltZ]}>
      {/* @ts-expect-error — line primitive */}
      <line geometry={ringGeo}>
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </line>
      {nodes.map((n, i) => (
        <OrbitNode
          key={i}
          orbitRadius={radius}
          speed={n.speed}
          offset={n.offset}
          color={color}
          size={n.size ?? 0.03}
          shape={n.shape ?? "sphere"}
        />
      ))}
    </group>
  );
}

// ─── Energy particles ────────────────────────────────────────────────────────
function EnergyParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.9 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
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
      <pointsMaterial
        color="#4FD6FF"
        size={0.016}
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Nebula / cosmic dust ─────────────────────────────────────────────────────
function NebulaDust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.006;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#58E7FF"
        size={0.06}
        transparent
        opacity={0.18}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Mouse-parallax scene wrapper ────────────────────────────────────────────
function SceneContent({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    groupRef.current.rotation.x +=
      (mouseY * 0.18 - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.y +=
      (mouseX * 0.18 - groupRef.current.rotation.y) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <Earth />
      <NetworkArcs />

      {/* Ring 1 — inner, fast, cyan */}
      <OrbitRing
        radius={2.1}
        tiltX={0.35}
        tiltZ={0.1}
        speed={1.0}
        color="#4FD6FF"
        opacity={0.5}
        nodes={[
          { speed: 0.7, offset: 0 },
          { speed: 0.7, offset: Math.PI * 0.67 },
          { speed: 0.7, offset: Math.PI * 1.34 },
        ]}
      />

      {/* Ring 2 — mid, reverse, softer */}
      <OrbitRing
        radius={2.7}
        tiltX={-0.55}
        tiltZ={0.25}
        speed={-0.6}
        color="#00D9FF"
        opacity={0.35}
        nodes={[
          { speed: -0.5, offset: Math.PI * 0.5, shape: "box", size: 0.04 },
          { speed: -0.5, offset: Math.PI * 1.5, shape: "box", size: 0.04 },
          { speed: -0.5, offset: 0, shape: "sphere" },
          { speed: -0.5, offset: Math.PI, shape: "sphere" },
        ]}
      />

      {/* Ring 3 — outer, slow, pale */}
      <OrbitRing
        radius={3.4}
        tiltX={0.8}
        tiltZ={-0.4}
        speed={0.35}
        color="#58E7FF"
        opacity={0.22}
        nodes={[
          { speed: 0.3, offset: 0, size: 0.025 },
          { speed: 0.3, offset: Math.PI * 0.8, size: 0.025 },
        ]}
      />

      {/* Ring 4 — equatorial faint dash */}
      <OrbitRing
        radius={3.9}
        tiltX={0.05}
        tiltZ={0.05}
        speed={-0.2}
        color="#80FFFF"
        opacity={0.12}
        nodes={[]}
      />

      <EnergyParticles count={400} />
    </group>
  );
}

// ─── WebGL error boundary ─────────────────────────────────────────────────────
class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return null; // silent fallback — CSS background still shows
    return this.props.children;
  }
}

// ─── Public export ────────────────────────────────────────────────────────────
export function CinematicLoginScene({
  mouseX,
  mouseY,
}: {
  mouseX: number;
  mouseY: number;
}) {
  return (
    <WebGLErrorBoundary>
      <Canvas
        camera={{ position: [0, 0.4, 6.2], fov: 46 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 4, 5]} intensity={2.8} color="#bfe4ff" />
        <directionalLight position={[-4, -1, -3]} intensity={0.9} color="#4FD6FF" />
        <pointLight position={[8, 6, 2]} intensity={12} color="#fff8d0" distance={30} />

        <Suspense fallback={null}>
          <SceneContent mouseX={mouseX} mouseY={mouseY} />
        </Suspense>

        <Stars radius={90} depth={60} count={4000} factor={4.5} saturation={0} fade speed={0.25} />
        <NebulaDust count={600} />
      </Canvas>
    </WebGLErrorBoundary>
  );
}
