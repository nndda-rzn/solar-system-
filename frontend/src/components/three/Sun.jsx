import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loadSunTexture } from '../../utils/textureLoader';

function createGlowTexture(innerColor, outerColor, innerStop = 0, outerStop = 0.5) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(size/2, size/2, innerStop * size/2, size/2, size/2, outerStop * size/2);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.3, outerColor);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const Sun = () => {
  const meshRef = useRef();
  const coronaRef = useRef();
  const innerGlowRef = useRef();
  const midGlowRef = useRef();

  const texture = useMemo(() => loadSunTexture(), []);

  const coronaTexture = useMemo(() =>
    createGlowTexture('rgba(255,200,50,0.9)', 'rgba(255,100,0,0.2)', 0.35, 0.9),
    []
  );

  const innerGlowTexture = useMemo(() =>
    createGlowTexture('rgba(255,180,0,0.7)', 'rgba(255,140,0,0.1)', 0.45, 0.75),
    []
  );

  const midGlowTexture = useMemo(() =>
    createGlowTexture('rgba(255,220,80,0.5)', 'rgba(255,160,20,0.05)', 0.5, 0.7),
    []
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03;
    }
    if (coronaRef.current) {
      const s = 16 + Math.sin(t * 0.7) * 0.8 + Math.sin(t * 1.3) * 0.4;
      coronaRef.current.scale.set(s, s, 1);
    }
    if (innerGlowRef.current) {
      const s = 10 + Math.sin(t * 0.9) * 0.5 + Math.cos(t * 0.6) * 0.3;
      innerGlowRef.current.scale.set(s, s, 1);
    }
    if (midGlowRef.current) {
      const s = 13 + Math.sin(t * 0.5) * 0.6 + Math.cos(t * 1.1) * 0.3;
      midGlowRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissive="#FF8C00"
          emissiveIntensity={2.5}
          roughness={0.0}
          metalness={0}
        />
      </mesh>

      <sprite ref={coronaRef} scale={[16, 16, 1]}>
        <spriteMaterial
          map={coronaTexture}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <sprite ref={midGlowRef} scale={[13, 13, 1]}>
        <spriteMaterial
          map={midGlowTexture}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <sprite ref={innerGlowRef} scale={[10, 10, 1]}>
        <spriteMaterial
          map={innerGlowTexture}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <pointLight color="#FFD700" intensity={3} distance={800} decay={1} />
    </group>
  );
};

export default Sun;