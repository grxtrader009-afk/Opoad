import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { getEarthTexture } from "@/lib/earth-texture";
import { useSettings } from "@/lib/settings";

function Earth({ speed, showAtmosphere }: { speed: number; showAtmosphere: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const texture = getEarthTexture();

  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.08 * speed;
    if (glowRef.current) glowRef.current.rotation.y -= dt * 0.02 * speed;
  });

  return (
    <group position={[0, 0.6, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[1.15, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissive={new THREE.Color("#0a2540")}
          emissiveIntensity={0.35}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>
      {showAtmosphere && (
        <>
          <mesh ref={glowRef} scale={1.08}>
            <sphereGeometry args={[1.15, 64, 64]} />
            <meshBasicMaterial color="#4FD6FF" transparent opacity={0.08} side={THREE.BackSide} />
          </mesh>
          <mesh scale={1.18}>
            <sphereGeometry args={[1.15, 32, 32]} />
            <meshBasicMaterial color="#00D9FF" transparent opacity={0.04} side={THREE.BackSide} />
          </mesh>
        </>
      )}
    </group>
  );
}

function OrbitParticles({ count, speed }: { count: number; speed: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.5 + Math.random() * 0.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.15 * speed;
    ref.current.rotation.x += dt * 0.03 * speed;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#4FD6FF"
        size={0.02}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function EnergyCube({
  speed,
  innerCount,
  showInner,
}: {
  speed: number;
  innerCount: number;
  showInner: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Points>(null!);

  const innerPositions = useMemo(() => {
    const arr = new Float32Array(innerCount * 3);
    for (let i = 0; i < innerCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    return arr;
  }, [innerCount]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    group.current.position.y = -1.8 + Math.sin(t * 1.2 * Math.max(speed, 0.001)) * 0.05 * speed;
    group.current.rotation.y += dt * 0.3 * speed;
    ring1.current.rotation.x += dt * 0.8 * speed;
    ring2.current.rotation.z += dt * 0.6 * speed;
    ring3.current.rotation.y += dt * 1.0 * speed;
    if (inner.current) {
      inner.current.rotation.y += dt * 0.5 * speed;
      inner.current.rotation.x += dt * 0.3 * speed;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.04, 0.12, 2.2, 16, 1, true]} />
        <meshBasicMaterial color="#4FD6FF" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial color="#4FD6FF" transparent opacity={0.9} />
      </lineSegments>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#0a1a2a"
          transparent
          opacity={0.15}
          roughness={0}
          metalness={0.2}
          transmission={0.9}
          thickness={0.5}
          clearcoat={1}
          ior={1.4}
        />
      </mesh>

      <mesh ref={ring1}>
        <torusGeometry args={[0.38, 0.006, 12, 64]} />
        <meshBasicMaterial color="#4FD6FF" />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[0.28, 0.005, 12, 64]} />
        <meshBasicMaterial color="#00D9FF" />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[0.18, 0.004, 12, 64]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <pointLight color="#4FD6FF" intensity={2} distance={3} />

      {showInner && (
        <points ref={inner}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[innerPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color="#00D9FF"
            size={0.02}
            transparent
            opacity={0.9}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}

export function Scene() {
  const {
    particleMultiplier,
    animSpeed,
    showStars,
    showAtmosphere,
    showInnerParticles,
    dprMax,
    autoRotate,
  } = useSettings();

  const orbitCount = Math.max(20, Math.round(600 * particleMultiplier));
  const innerCount = Math.max(10, Math.round(120 * particleMultiplier));
  const starCount = Math.max(200, Math.round(2500 * particleMultiplier));

  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, dprMax]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 2, 5]} intensity={1.2} color="#bfe4ff" />
      <directionalLight position={[-4, -1, -2]} intensity={0.6} color="#4FD6FF" />

      <Suspense fallback={null}>
        <Earth speed={animSpeed} showAtmosphere={showAtmosphere} />
        <OrbitParticles count={orbitCount} speed={animSpeed} />
        <EnergyCube speed={animSpeed} innerCount={innerCount} showInner={showInnerParticles} />
      </Suspense>

      {showStars && (
        <Stars
          radius={40}
          depth={30}
          count={starCount}
          factor={3}
          saturation={0}
          fade
          speed={0.5 * animSpeed}
        />
      )}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.15 * animSpeed}
        enableRotate={false}
      />
    </Canvas>
  );
}
