'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import Link from 'next/link';

function StatCube({ value, color }: { value: number; label: string; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5}>
      <group>
        <mesh ref={meshRef}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhongMaterial color={color} emissive={color} shininess={100} />
        </mesh>

        {/* Number display */}
        <Text
          position={[0, 0, 0.51]}
          fontSize={0.35}
          color="white"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {value}
        </Text>
      </group>
    </Float>
  );
}

export default function AdminStats3D({
  stats,
}: {
  stats: Array<{ value: number; label: string; color: string; hexColor: string; link?: string }>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const content = (
          <div
            className="h-56 rounded-2xl overflow-hidden relative cursor-pointer
              bg-white/70 backdrop-blur-xl border border-purple-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <Canvas camera={{ position: [0, 0, 2.3], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[5, 5, 5]} intensity={1.5} />
              <StatCube
                value={stat.value}
                label={stat.label}
                color={stat.hexColor}
              />
            </Canvas>
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </div>
            <span className="absolute top-3 right-3 text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 shadow-sm">
              Live
            </span>
          </div>
        );

        if (stat.link) {
          return (
            <Link key={i} href={stat.link}>
              {content}
            </Link>
          );
        }

        return <div key={i}>{content}</div>;
      })}
    </div>
  );
}
