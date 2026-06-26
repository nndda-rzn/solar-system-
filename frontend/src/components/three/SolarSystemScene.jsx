import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Starfield from './Starfield';
import Sun from './Sun';
import Planet from './Planet';
import OrbitPath from './OrbitPath';
import AsteroidBelt from './AsteroidBelt';
import { PLANETS } from '../../data/planets';

const SolarSystemScene = ({ speedMultiplier = 1, showOrbits = true }) => {
  return (
    <div className="w-full h-screen">
      <Canvas gl={{ logarithmicDepthBuffer: true }}>
        <PerspectiveCamera 
          makeDefault 
          position={[0, 40, 90]}
          near={0.1}
          far={2000}
        />
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={5}
          maxDistance={400}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight 
          position={[0, 0, 0]} 
          intensity={3} 
          distance={800} 
          decay={1} 
          color="#FFD700" 
        />
        <directionalLight position={[50, 30, 50]} intensity={0.6} color="#ffffff" />

        <Suspense fallback={null}>
          <Starfield count={4000} />
          <Sun />
          
          {showOrbits && PLANETS.map((planet) => (
            <OrbitPath key={`orbit-${planet.name}`} radius={planet.distance} />
          ))}

          {PLANETS.map((planet) => (
            <Planet
              key={planet.name}
              planet={planet}
              speedMultiplier={speedMultiplier}
            />
          ))}

          <AsteroidBelt count={800} innerRadius={34} outerRadius={42} />

          <EffectComposer>
            <Bloom
              intensity={0.4}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SolarSystemScene;
