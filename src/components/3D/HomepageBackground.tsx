'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Preload } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function GlowingConstellation() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 80;

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sz[i] = Math.random() * 0.15 + 0.05;
    }
    return [pos, sz];
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#a78bfa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingWireframeRing() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.03;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, -2]}>
        <torusGeometry args={[3.2, 0.9, 16, 64]} />
        <meshBasicMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </Float>
  );
}

export default function HomepageBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden select-none bg-gradient-to-br from-[#f0f4ff] via-purple-50/20 to-[#f0f4ff] dark:from-[#05071a] dark:via-[#0c0f2b] dark:to-[#05071a]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ pointerEvents: 'none' }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#c084fc" />
        <FloatingWireframeRing />
        <GlowingConstellation />
        <Preload all />
      </Canvas>
    </div>
  );
}
