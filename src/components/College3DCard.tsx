'use client';
import { Canvas } from '@react-three/fiber';
import { Float, Text, RoundedBox } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function CollegeBox({ name, rank }: { name: string; rank: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <RoundedBox args={[2, 2.5, 0.5]} radius={0.05} smoothness={4}>
          <meshPhongMaterial
            color="#7c3aed"
            emissive="#6d28d9"
            shininess={100}
          />
        </RoundedBox>
      </mesh>
      <Text position={[0, 0, 0.3]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
        #{rank}
      </Text>
    </Float>
  );
}

interface College3DCardProps {
  name: string;
  rank: number;
  package: number;
  onClick?: () => void;
}

export default function College3DCard({
  name,
  rank,
  package: pkg,
  onClick,
}: College3DCardProps) {
  return (
    <motion.div
      className="cursor-pointer h-64 rounded-2xl overflow-hidden relative
        bg-white/70 backdrop-blur-xl border border-purple-200
        shadow-lg hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.05, rotateY: 5 }}
      onClick={onClick}
    >
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <CollegeBox name={name} rank={rank} />
      </Canvas>
      <div className="absolute inset-0 flex flex-col justify-end p-4
        bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <h3 className="text-white font-bold text-sm line-clamp-1">{name}</h3>
        <p className="text-white/80 text-xs">{pkg ? `${pkg}L avg package` : 'Placement data N/A'}</p>
      </div>
    </motion.div>
  );
}
