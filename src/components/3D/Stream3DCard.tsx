'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function RotatingIcon() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={2}>
      <group ref={meshRef}>
        {/* Outer icosahedron */}
        <mesh>
          <icosahedronGeometry args={[0.8, 0]} />
          <meshPhongMaterial color="#7c3aed" wireframe emissive="#a78bfa" />
        </mesh>

        {/* Inner octahedron */}
        <mesh scale={0.6}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhongMaterial color="#a78bfa" emissive="#7c3aed" shininess={100} />
        </mesh>
      </group>
    </Float>
  );
}

export default function Stream3DCard({
  name,
  count,
  color,
  desc,
  courses,
  onClick,
}: {
  name: string;
  icon?: any;
  count: string;
  color: string;
  desc?: string;
  courses?: string[];
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl relative
        bg-white/70 backdrop-blur-xl border border-purple-200/50
        overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col"
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 3D Canvas container with fixed height */}
      <div className="h-40 relative w-full bg-gradient-to-b from-purple-50/50 to-transparent">
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-2, 5, -2]} intensity={0.5} />
          <RotatingIcon />
        </Canvas>
        
        {/* Count Badge */}
        <span className="absolute top-4 right-4 bg-purple-600 text-white font-semibold text-xs px-2.5 py-1 rounded-full shadow-lg">
          {count}
        </span>
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-gray-900 font-bold text-lg group-hover:text-purple-600 transition-colors">
            {name}
          </h3>
          {desc && (
            <p className="text-gray-500 text-xs mt-1 mb-3 line-clamp-2 leading-relaxed">
              {desc}
            </p>
          )}
        </div>

        <div>
          {courses && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {courses.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 text-sm font-semibold text-purple-600 group-hover:gap-2 transition-all">
            Explore
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
