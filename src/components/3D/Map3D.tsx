'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function AnimatedMarker({
  position,
  color,
  label,
}: {
  position: [number, number, number];
  color: string;
  label: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.z = Math.sin(clock.elapsedTime * 2) * 0.3;
      groupRef.current.rotation.z += 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhongMaterial color={color} emissive={color} wireframe transparent opacity={0.3} />
      </mesh>

      {/* Inner sphere */}
      <mesh position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshPhongMaterial color={color} emissive={color} shininess={100} />
      </mesh>

      {/* Floating label */}
      <Text position={[0, -0.5, 0]} fontSize={0.25} color="black" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

function IndiaBoundary() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[4, 5, 0.05]} />
      <meshPhongMaterial color="#7c3aed" opacity={0.1} transparent />
    </mesh>
  );
}

export default function Map3D() {
  const colleges = [
    { pos: [0, 2, 0], color: '#7c3aed', name: 'IIT Delhi' },
    { pos: [-1, 1, 0], color: '#2563eb', name: 'NIT Trichy' },
    { pos: [1, -1, 0], color: '#06b6d4', name: 'BITS Goa' },
    { pos: [-1.5, -2, 0], color: '#10b981', name: 'Anna Univ' },
    { pos: [1.5, 0, 0], color: '#f59e0b', name: 'MIT Pune' },
  ];

  return (
    <div className="w-full h-96 rounded-2xl bg-white/70 backdrop-blur border border-purple-100 p-2 shadow-inner">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <IndiaBoundary />

        {colleges.map((college, i) => (
          <Float
            key={i}
            speed={Math.random() * 2 + 1}
            rotationIntensity={0.3}
          >
            <AnimatedMarker
              position={college.pos as [number, number, number]}
              color={college.color}
              label={college.name}
            />
          </Float>
        ))}

        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
      </Canvas>
    </div>
  );
}
