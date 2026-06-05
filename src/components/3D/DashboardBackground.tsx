'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function SlowParticleDrift() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 40;

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
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.008;
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.02;
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
        size={0.08}
        color="#8b5cf6"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

export default function DashboardBackground() {
  return (
    <div className="fixed inset-0 -z-20 w-full h-full pointer-events-none overflow-hidden select-none bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-50">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ pointerEvents: 'none' }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.9} />
        <SlowParticleDrift />
      </Canvas>
    </div>
  );
}
