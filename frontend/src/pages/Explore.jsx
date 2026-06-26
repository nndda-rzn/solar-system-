import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import Sun from '../components/three/Sun';
import Planet from '../components/three/Planet';
import OrbitPath from '../components/three/OrbitPath';
import AsteroidBelt from '../components/three/AsteroidBelt';
import Starfield from '../components/three/Starfield';
import usePlanetStore from '../stores/planetStore';

const DISPLAY_RADIUS = { Mercury: 0.3, Venus: 0.45, Earth: 0.5, Mars: 0.4, Jupiter: 1.5, Saturn: 1.2, Uranus: 0.8, Neptune: 0.75 };
const DISPLAY_DISTANCE = { Mercury: 8, Venus: 15, Earth: 22, Mars: 30, Jupiter: 45, Saturn: 65, Uranus: 100, Neptune: 140 };

const Explore = () => {
  const [speed, setSpeed] = useState(10);
  const [showOrbits, setShowOrbits] = useState(true);
  const { planets, fetchPlanets } = usePlanetStore();
  const navigate = useNavigate();

  useEffect(() => { fetchPlanets(); }, [fetchPlanets]);

  const speeds = [{ label: '1x', value: 1 }, { label: '10x', value: 10 }, { label: '50x', value: 50 }, { label: '100x', value: 100 }];

  const planetDisplayData = planets.map(p => ({
    name: p.name, nameIndo: p.nameIndo,
    radius: DISPLAY_RADIUS[p.name] || 0.5,
    distance: DISPLAY_DISTANCE[p.name] || 20,
    orbitalPeriod: p.orbitalPeriod, rotationPeriod: p.rotationPeriod,
    color: p.color, texture: p.name.toLowerCase(),
    moons: [], hasRing: p.name === 'Saturn'
  }));

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0">
        <Canvas gl={{ logarithmicDepthBuffer: true }}>
          <PerspectiveCamera makeDefault position={[0, 40, 90]} near={0.1} far={2000} />
          <OrbitControls enableZoom enablePan minDistance={5} maxDistance={400} enableDamping dampingFactor={0.05} />
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 0, 0]} intensity={3} distance={800} decay={1} color="#FFD700" />
          <directionalLight position={[50, 30, 50]} intensity={0.6} color="#ffffff" />
          <Suspense fallback={null}>
            <Starfield count={4000} />
            <Sun />
            {showOrbits && planetDisplayData.map((p) => (
              <OrbitPath key={`orbit-${p.name}`} radius={p.distance} />
            ))}
            {planetDisplayData.map((p) => (
              <Planet key={p.name} planet={p} speedMultiplier={speed} />
            ))}
            <AsteroidBelt count={800} innerRadius={34} outerRadius={42} />
            <EffectComposer>
              <Bloom intensity={0.4} luminanceThreshold={0.3} luminanceSmoothing={0.9} mipmapBlur />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>
      <div className="absolute top-4 left-4 z-10">
        <GlassPanel className="p-4">
          <h3 className="font-heading text-lg mb-3">Kontrol</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-white/70 block mb-1">Kecepatan</label>
              <div className="flex gap-2">
                {speeds.map((s) => (
                  <button key={s.value} onClick={() => setSpeed(s.value)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${speed === s.value ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showOrbits} onChange={(e) => setShowOrbits(e.target.checked)} className="rounded" />
                <span className="text-sm text-white/70">Tampilkan Orbit</span>
              </label>
            </div>
          </div>
        </GlassPanel>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <GlassPanel className="p-4">
          <h3 className="font-heading text-lg mb-2">Daftar Planet</h3>
          <div className="space-y-1">
            {planets.map((p) => (
              <button key={p.name} onClick={() => navigate(`/planet/${p.name.toLowerCase()}`)}
                className="flex items-center gap-2 text-sm w-full text-left hover:bg-white/10 p-1 rounded transition-colors">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-white/70">{p.nameIndo}</span>
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default Explore;
