'use client';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1, 4]} />
        <meshPhongMaterial
          color="#7c3aed"
          emissive="#6d28d9"
          wireframe={false}
          shininess={100}
        />
      </mesh>
    </Float>
  );
}

function FloatingBox({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float speed={Math.random() * 2 + 1} rotationIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={0.5}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial
          color={['#2563eb', '#06b6d4', '#10b981'][Math.floor(Math.random() * 3)]}
          emissive="#1e40af"
          shininess={50}
        />
      </mesh>
    </Float>
  );
}

export default function ThreeDBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#7c3aed" />

        <AnimatedSphere />

        {[
          [-1.5, 1, -0.5],
          [1.5, -1, -0.5],
          [0.5, 1.5, -1],
          [-0.5, -1.5, -1],
        ].map((pos, i) => (
          <FloatingBox key={i} position={pos as [number, number, number]} />
        ))}

        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
