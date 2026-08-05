import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { getEarthTexture } from "@/lib/earth-texture";

// Elliptical orbit parameters
const ORBIT_A = 0.9;  // semi-major axis (X)
const ORBIT_B = 0.38; // semi-minor axis (Z) — ellipse depth
const ORBIT_TILT = 0.12; // orbital plane tilt (Y offset, single frequency = clean ellipse)
const ORBIT_SPEED = 0.38; // radians/s — one full orbit ~16 s
const EARTH_RADIUS = 0.68;

function OrbitalEarth() {
  const earthRef = useRef<THREE.Mesh>(null!);
  const orbitRef = useRef<THREE.Group>(null!);
  const texture = getEarthTexture();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Self-rotation
    earthRef.current.rotation.y += 0.006;
    // Slight axial tilt wobble for realism
    earthRef.current.rotation.z = Math.sin(t * 0.12) * 0.04;

    // Elliptical orbital motion (single-frequency = clean ellipse, no figure-8)
    const angle = t * ORBIT_SPEED;
    orbitRef.current.position.x = Math.cos(angle) * ORBIT_A;
    orbitRef.current.position.z = Math.sin(angle) * ORBIT_B;
    orbitRef.current.position.y = Math.sin(angle) * ORBIT_TILT;

    // Perspective scaling: closer to camera (positive Z) → slightly bigger
    const depth = (orbitRef.current.position.z + ORBIT_B) / (ORBIT_B * 2);
    const s = 0.82 + depth * 0.36;
    orbitRef.current.scale.setScalar(s);
  });

  return (
    <group ref={orbitRef}>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.6}
          metalness={0.05}
          emissive={new THREE.Color("#0d2a4a")}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Inner atmosphere — bright blue rim */}
      <mesh scale={1.06}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.28}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer atmosphere haze */}
      <mesh scale={1.22}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function OrbitPath() {
  // Visible elliptical orbit trail ring (flat ellipse)
  const ringRef = useRef<THREE.Line>(null!);

  const points: THREE.Vector3[] = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * ORBIT_A,
        Math.sin(angle) * ORBIT_TILT,
        Math.sin(angle) * ORBIT_B
      )
    );
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    // @ts-expect-error — primitive line
    <line ref={ringRef} geometry={geometry}>
      <lineBasicMaterial color="#38bdf8" transparent opacity={0.22} />
    </line>
  );
}

function SunGlow() {
  // Subtle sun flare positioned off to one side
  return (
    <>
      <mesh position={[2.2, 1.2, -1.5]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color="#fff8d0" />
      </mesh>
      <pointLight position={[2.2, 1.2, -1.5]} intensity={0.6} color="#fff8d0" distance={8} />
    </>
  );
}

export function LoginEarthScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 3.6], fov: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Primary sun — strong warm key light */}
      <pointLight position={[4, 3, 2.5]} intensity={14} color="#fff5d0" />
      {/* Fill light so lit side is vivid */}
      <directionalLight position={[2, 1, 3]} intensity={3.5} color="#ffffff" />
      {/* Ambient — enough to see continents on dark side */}
      <ambientLight intensity={0.35} />
      {/* Blue rim from left — atmospheric scatter */}
      <directionalLight position={[-3, 0.5, -1]} intensity={1.2} color="#38bdf8" />

      <Suspense fallback={null}>
        <OrbitalEarth />
        <OrbitPath />
        <SunGlow />
      </Suspense>

      <Stars
        radius={35}
        depth={25}
        count={1800}
        factor={2.2}
        saturation={0}
        fade
        speed={0.25}
      />
    </Canvas>
  );
}
