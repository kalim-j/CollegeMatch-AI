'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function RotatingTorus() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += hovered ? 0.01 : 0.005;
      meshRef.current.rotation.y += hovered ? 0.015 : 0.008;
      meshRef.current.scale.lerp(
        new THREE.Vector3(hovered ? 1.2 : 1, hovered ? 1.2 : 1, hovered ? 1.2 : 1),
        0.1
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <torusGeometry args={[2, 0.6, 32, 100]} />
      <meshPhongMaterial
        color="#7c3aed"
        emissive="#a78bfa"
        shininess={100}
        wireframe={false}
      />
    </mesh>
  );
}

function DodecahedronParticles({ count = 15 }: { count?: number }) {
  const particlesRef = useRef<THREE.Mesh[]>([]);

  useFrame(() => {
    particlesRef.current.forEach((particle) => {
      if (particle) {
        particle.rotation.x += 0.002;
        particle.rotation.y += 0.003;
        particle.position.y += Math.sin(Date.now() * 0.001) * 0.01;
      }
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        const scale = Math.random() * 0.5 + 0.3;

        return (
          <Float key={i} speed={Math.random() * 2} rotationIntensity={Math.random()}>
            <mesh
              ref={(el) => {
                if (el) particlesRef.current[i] = el;
              }}
              position={[x, y, z]}
              scale={scale}
            >
              <dodecahedronGeometry args={[1, 0]} />
              <meshPhongMaterial
                color={
                  ['#2563eb', '#06b6d4', '#10b981', '#f59e0b'][
                    Math.floor(Math.random() * 4)
                  ]
                }
                emissive="#1e40af"
                wireframe
              />
            </mesh>
          </Float>
        );
      })}
    </>
  );
}

function AnimatedLights() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(clock.elapsedTime) * 5;
      lightRef.current.position.y = Math.cos(clock.elapsedTime * 0.7) * 5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight ref={lightRef} intensity={1.5} color="#7c3aed" />
      <pointLight position={[-10, -10, 10]} intensity={1} color="#2563eb" />
      <pointLight position={[10, 10, -10]} intensity={0.8} color="#06b6d4" />
    </>
  );
}

export default function HomepageBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <AnimatedLights />
        <RotatingTorus />
        <DodecahedronParticles count={20} />
        <OrbitControls
          autoRotate
          enableZoom={false}
          enablePan={false}
          autoRotateSpeed={0.5}
        />
        <EffectComposer>
          <Bloom
            intensity={1}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
        </EffectComposer>
        <Preload all />
      </Canvas>
    </div>
  );
}
