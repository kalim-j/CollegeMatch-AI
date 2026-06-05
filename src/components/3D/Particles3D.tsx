'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function ParticleField({ count = 100 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create stable positions and velocities
  const positions = useRef(new Float32Array(count * 3));
  const velocities = useRef(new Float32Array(count * 3));

  // Initialize once
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    
    // Simple init if positions are empty
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    if (clock.getElapsedTime() < 0.1) {
      for (let i = 0; i < count * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 20;
        posArray[i + 1] = (Math.random() - 0.5) * 20;
        posArray[i + 2] = (Math.random() - 0.5) * 20;

        velocities.current[i] = (Math.random() - 0.5) * 0.02;
        velocities.current[i + 1] = (Math.random() - 0.5) * 0.02;
        velocities.current[i + 2] = (Math.random() - 0.5) * 0.02;
      }
      posAttr.needsUpdate = true;
      return;
    }

    // Update positions
    for (let i = 0; i < count * 3; i += 3) {
      posArray[i] += velocities.current[i];
      posArray[i + 1] += velocities.current[i + 1];
      posArray[i + 2] += velocities.current[i + 2];

      // Boundary collision check
      if (Math.abs(posArray[i]) > 10) velocities.current[i] *= -1;
      if (Math.abs(posArray[i + 1]) > 10) velocities.current[i + 1] *= -1;
      if (Math.abs(posArray[i + 2]) > 10) velocities.current[i + 2] *= -1;

      // Small gravity factor
      velocities.current[i + 1] -= 0.00005;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#7c3aed" sizeAttenuation />
    </points>
  );
}

export default function Particles3D({ count = 100 }: { count?: number }) {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ParticleField count={count} />
      </Canvas>
    </div>
  );
}
