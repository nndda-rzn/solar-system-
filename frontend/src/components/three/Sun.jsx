import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loadSunTexture } from '../../utils/textureLoader';

const Sun = () => {
  const meshRef = useRef();
  const glowRef = useRef();

  const texture = useMemo(() => {
    return loadSunTexture();
  }, []);

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
          color="#FFD700"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <sprite scale={[12, 12, 1]}>
        <spriteMaterial
          color="#FFA500"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <pointLight color="#FFD700" intensity={3} distance={800} decay={1} />
    </group>
  );
};

export default Sun;
