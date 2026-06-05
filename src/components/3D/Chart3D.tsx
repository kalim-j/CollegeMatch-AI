'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function AnimatedBar({
  position,
  height,
  color,
  label,
}: {
  position: [number, number, number];
  height: number;
  color: string;
  label: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetHeight = useRef(height);

  useFrame(() => {
    if (meshRef.current) {
      const current = meshRef.current.scale.y;
      meshRef.current.scale.y += (targetHeight.current - current) * 0.1;
      meshRef.current.position.y = meshRef.current.scale.y / 2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={[1, 0.1, 1]}>
        <boxGeometry args={[0.6, 1, 0.6]} />
        <meshPhongMaterial color={color} emissive={color} shininess={100} />
      </mesh>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.25}
        color="#374151"
        anchorX="center"
        fontWeight="bold"
      >
        {label}
      </Text>
    </group>
  );
}

function AutoRotatingScene({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

export default function Chart3D({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  return (
    <div className="w-full h-80 rounded-2xl bg-white/70 backdrop-blur border border-purple-100 shadow-sm">
      <Canvas
        camera={{ position: [0, 2, 6], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 10, 5]} intensity={1} />

        <AutoRotatingScene>
          {/* Grid helper */}
          <gridHelper args={[10, 10, '#cbd5e1', '#cbd5e1']} position={[0, -0.01, 0]} />

          {/* Data bars */}
          {data.map((item, i) => (
            <AnimatedBar
              key={i}
              position={[i * 1.5 - (data.length - 1) * 0.75, 0, 0]}
              height={Math.max(item.value / 10, 0.2)}
              color={item.color}
              label={item.label}
            />
          ))}
        </AutoRotatingScene>
      </Canvas>
    </div>
  );
}
