'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, OrbitControls } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface College3DShowcaseProps {
  name: string;
  rank: number;
  package: number;
  logo?: string;
  onClick?: () => void;
}

function College3DModel({ rank }: { rank: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ mouse }) => {
    if (groupRef.current && hovered) {
      groupRef.current.rotation.x = mouse.y * 0.3;
      groupRef.current.rotation.y = mouse.x * 0.3;
    }
  });

  useFrame(() => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.x += 0.002;
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Main Building Shape */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 3, 1.5]} />
        <meshPhongMaterial
          color="#7c3aed"
          emissive="#6d28d9"
          shininess={100}
        />
      </mesh>

      {/* Top Roof */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[1.2, 1, 4]} />
        <meshPhongMaterial color="#a78bfa" emissive="#7c3aed" />
      </mesh>

      {/* Windows */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.5 - i * 0.8, 0.76]}>
          <boxGeometry args={[0.3, 0.3, 0.1]} />
          <meshPhongMaterial color="#fbbf24" emissive="#f59e0b" />
        </mesh>
      ))}

      {/* Floating Text */}
      <Float speed={2} rotationIntensity={0}>
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          #{rank}
        </Text>
      </Float>
    </group>
  );
}

export default function College3DShowcase({
  name,
  rank,
  package: pkg,
  onClick,
}: College3DShowcaseProps) {
  return (
    <motion.div
      onClick={onClick}
      className="h-96 rounded-2xl overflow-hidden border-2 border-purple-200 relative cursor-pointer
        bg-gradient-to-br from-slate-50 to-purple-50 hover:shadow-2xl transition-shadow duration-300"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <College3DModel rank={rank} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enableZoom={false}
        />
      </Canvas>

      {/* Overlay Info */}
      <div className="absolute inset-0 flex flex-col justify-end p-4
        bg-gradient-to-t from-black/70 via-transparent to-transparent
        pointer-events-none">
        <h3 className="text-white font-bold text-sm line-clamp-2">{name}</h3>
        <div className="flex gap-3 mt-2 text-xs text-white/80">
          <span>NIRF: #{rank}</span>
          <span>Package: {pkg ? `${pkg}L` : 'N/A'}</span>
        </div>
      </div>
    </motion.div>
  );
}
