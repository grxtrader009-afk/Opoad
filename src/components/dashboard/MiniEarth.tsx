import { useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import earthTex from "@/assets/earth.jpg";

function MiniEarthSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, earthTex);

  useFrame((_, dt) => {
    meshRef.current.rotation.y += dt * 0.15;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          emissive={new THREE.Color("#0a2540")}
          emissiveIntensity={0.4}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Atmosphere rim */}
      <mesh scale={1.08}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#4FD6FF" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.2}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#00D9FF" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function MiniParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useRef(
    (() => {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 1.1 + Math.random() * 0.4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        arr[i * 3 + 2] = r * Math.cos(phi);
      }
      return arr;
    })(),
  );

  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.1;
    ref.current.rotation.x += dt * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#4FD6FF"
        size={0.015}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function MiniEarth() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 2, 4]} intensity={1.5} color="#bfe4ff" />
      <directionalLight position={[-3, -1, -2]} intensity={0.5} color="#4FD6FF" />
      <Suspense fallback={null}>
        <MiniEarthSphere />
        <MiniParticles count={80} />
      </Suspense>
      <Stars radius={15} depth={10} count={500} factor={2} saturation={0} fade speed={0.3} />
    </Canvas>
  );
}
