import { useMemo } from 'react';
import * as THREE from 'three';
import { atmosphereVertexShader, atmosphereFragmentShader } from '../../utils/shaders';

// Atmosphere colors for each planet
const atmosphereColors = {
  earth: { color: '#4a90d9', intensity: 0.8, power: 4.0 },
  venus: { color: '#e6c229', intensity: 0.6, power: 3.5 },
  mars: { color: '#c1440e', intensity: 0.3, power: 3.0 },
  jupiter: { color: '#d8ca9d', intensity: 0.4, power: 3.0 },
  saturn: { color: '#ead6b8', intensity: 0.35, power: 3.0 },
  uranus: { color: '#d1e7e7', intensity: 0.5, power: 3.5 },
  neptune: { color: '#5b5ddf', intensity: 0.5, power: 3.5 }
};

const Atmosphere = ({ planetName, radius }) => {
  const atmosphereConfig = atmosphereColors[planetName.toLowerCase()];
  
  if (!atmosphereConfig) return null;

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        atmosphereColor: { value: new THREE.Color(atmosphereConfig.color) },
        atmosphereIntensity: { value: atmosphereConfig.intensity },
        atmospherePower: { value: atmosphereConfig.power }
      },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, [atmosphereConfig]);

  return (
    <mesh scale={[1.08, 1.08, 1.08]}>
      <sphereGeometry args={[radius, 32, 32]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
};

export default Atmosphere;
