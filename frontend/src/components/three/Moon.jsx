import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generatePlanetTexture } from '../../utils/planetTextures';

const Moon = ({ moon, parentRadius }) => {
  const meshRef = useRef();
  const angle = useRef(Math.random() * Math.PI * 2);

  // Generate procedural moon texture
  const texture = useMemo(() => {
    const canvas = generatePlanetTexture('moon');
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    angle.current += delta * 2;
    const x = Math.cos(angle.current) * (parentRadius + moon.distance);
    const z = Math.sin(angle.current) * (parentRadius + moon.distance);

    meshRef.current.position.x = x;
    meshRef.current.position.z = z;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[moon.radius, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        color="#aaaaaa"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};

export default Moon;
