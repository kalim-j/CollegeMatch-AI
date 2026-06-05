'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function FlyingBox({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const speedRef = useRef({
    x: (Math.random() - 0.5) * 0.02,
    y: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02,
  });

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x += speedRef.current.x;
      meshRef.current.position.y += speedRef.current.y;
      meshRef.current.position.z += speedRef.current.z;

      // Bounce off walls
      if (Math.abs(meshRef.current.position.x) > 5)
        speedRef.current.x *= -1;
      if (Math.abs(meshRef.current.position.y) > 5)
        speedRef.current.y *= -1;
      if (Math.abs(meshRef.current.position.z) > 5)
        speedRef.current.z *= -1;

      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshPhongMaterial color={color} emissive={color} shininess={100} />
    </mesh>
  );
}

export default function DashboardBackground() {
  const colors = ['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {Array.from({ length: 12 }).map((_, i) => (
          <FlyingBox
            key={i}
            position={[
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
            ]}
            color={colors[i % colors.length]}
          />
        ))}

        <OrbitControls
          autoRotate
          autoRotateSpeed={0.5}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
