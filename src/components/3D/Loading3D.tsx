'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function LoadingSpinner() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.01;
      groupRef.current.rotation.y += 0.015;
      groupRef.current.rotation.z += 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={2}>
      <group ref={groupRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI * 0.66) * 1.5, Math.sin(i * Math.PI * 0.66) * 1.5, 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshPhongMaterial
              color={['#7c3aed', '#2563eb', '#06b6d4'][i]}
              emissive={['#a78bfa', '#60a5fa', '#22d3ee'][i]}
            />
          </mesh>
        ))}

        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[2, 0.2, 32, 100]} />
          <meshPhongMaterial color="#7c3aed" wireframe />
        </mesh>
      </group>
    </Float>
  );
}

export default function Loading3D() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-48 h-48">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} intensity={1} />
          <LoadingSpinner />
        </Canvas>
      </div>
    </div>
  );
}
