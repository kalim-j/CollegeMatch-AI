'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function ScholarshipMedal() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      if (hovered) {
        groupRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Medal Circle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshPhongMaterial color="#FFD700" emissive="#FFA500" shininess={100} />
      </mesh>

      {/* Inner decoration */}
      <mesh position={[0, 0, 0.11]}>
        <circleGeometry args={[0.7, 32]} />
        <meshPhongMaterial color="#FFA500" />
      </mesh>

      {/* Star on medal */}
      <mesh position={[0, 0, 0.12]}>
        <octahedronGeometry args={[0.3]} />
        <meshPhongMaterial color="#FFD700" emissive="#FFD700" />
      </mesh>
    </group>
  );
}

export default function Scholarship3DCard({
  title,
  amount,
}: {
  title: string;
  amount: string;
}) {
  return (
    <div className="relative h-72 rounded-2xl overflow-hidden
      bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
      
      {/* 3D Medal */}
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <ScholarshipMedal />
      </Canvas>

      {/* Info overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4
        bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none">
        <h3 className="text-white font-bold text-sm line-clamp-2">{title}</h3>
        <p className="text-amber-300 font-bold text-lg mt-1">{amount}</p>
      </div>
    </div>
  );
}
