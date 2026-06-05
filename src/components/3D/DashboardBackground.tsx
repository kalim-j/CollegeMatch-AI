'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Preload } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function SlowParticleDrift() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.015;
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.03;
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
        size={0.15}
        color="#8b5cf6"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingBackgroundShapes() {
  const mesh1 = useRef<THREE.Mesh>(null);
  const mesh2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (mesh1.current) {
      mesh1.current.rotation.x = elapsed * 0.05;
      mesh1.current.rotation.y = elapsed * 0.08;
    }
    if (mesh2.current) {
      mesh2.current.rotation.x = elapsed * -0.06;
      mesh2.current.rotation.z = elapsed * 0.07;
    }
  });

  return (
    <>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh ref={mesh1} position={[-3, 2, -3]}>
          <dodecahedronGeometry args={[1.2, 0]} />
          <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.08} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.7}>
        <mesh ref={mesh2} position={[3, -2, -3]}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.08} />
        </mesh>
      </Float>
    </>
  );
}

export default function DashboardBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none overflow-hidden select-none bg-gradient-to-br from-[#f0f4ff] via-purple-50/20 to-[#f0f4ff] dark:from-[#05071a] dark:via-[#0c0f2b] dark:to-[#05071a]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ pointerEvents: 'none' }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.9} />
        <SlowParticleDrift />
        <FloatingBackgroundShapes />
        <Preload all />
      </Canvas>
    </div>
  );
}
