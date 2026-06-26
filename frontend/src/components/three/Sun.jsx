import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loadSunTexture } from '../../utils/textureLoader';

function createGlowTexture(innerColor, outerColor) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.4, outerColor);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const Sun = () => {
  const meshRef = useRef();
  const glowRef = useRef();

  const texture = useMemo(() => loadSunTexture(), []);

  const glowTexture = useMemo(() =>
    createGlowTexture('rgba(255,215,0,0.8)', 'rgba(255,140,0,0.3)'),
    []
  );

  const innerGlowTexture = useMemo(() =>
    createGlowTexture('rgba(255,165,0,0.6)', 'rgba(255,100,0,0.15)'),
    []
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
    if (glowRef.current) {
      const scale = 18 + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      glowRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          color="#FFD700"
          emissive="#FF8C00"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={0}
        />
      </mesh>

      <sprite ref={glowRef} scale={[18, 18, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <sprite scale={[12, 12, 1]}>
        <spriteMaterial
          map={innerGlowTexture}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <pointLight color="#FFD700" intensity={3} distance={800} decay={1} />
    </group>
  );
};

export default Sun;
