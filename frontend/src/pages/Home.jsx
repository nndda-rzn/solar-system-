import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import TypewriterText from '../components/ui/TypewriterText';
import Button from '../components/ui/Button';
import Starfield from '../components/three/Starfield';
import Sun from '../components/three/Sun';
import Planet from '../components/three/Planet';
import AsteroidBelt from '../components/three/AsteroidBelt';
import usePlanetStore from '../stores/planetStore';

const DISPLAY_RADIUS = { Mercury: 0.3, Venus: 0.45, Earth: 0.5, Mars: 0.4, Jupiter: 1.5, Saturn: 1.2, Uranus: 0.8, Neptune: 0.75 };
const DISPLAY_DISTANCE = { Mercury: 8, Venus: 15, Earth: 22, Mars: 30, Jupiter: 45, Saturn: 65, Uranus: 100, Neptune: 140 };

const Home = () => {
  const { planets, fetchPlanets } = usePlanetStore();

  useEffect(() => { fetchPlanets(); }, [fetchPlanets]);

  const planetDisplayData = planets.map(p => ({
    name: p.name, nameIndo: p.nameIndo,
    radius: DISPLAY_RADIUS[p.name] || 0.5,
    distance: DISPLAY_DISTANCE[p.name] || 20,
    orbitalPeriod: p.orbitalPeriod, rotationPeriod: p.rotationPeriod,
    color: p.color, texture: p.name.toLowerCase(),
    moons: [], hasRing: p.name === 'Saturn'
  }));

  return (
    <div className="relative">
      <div className="absolute inset-0">
        <Canvas gl={{ logarithmicDepthBuffer: true }}>
          <PerspectiveCamera makeDefault position={[0, 30, 55]} near={0.1} far={2000} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 0]} intensity={4} distance={900} decay={1.5} color="#FFFAF0" />
          <directionalLight position={[50, 30, 50]} intensity={0.3} color="#ffffff" />
          <Suspense fallback={null}>
            <Starfield count={4000} />
            <Sun />
            {planetDisplayData.map((p) => (
              <Planet key={p.name} planet={p} speedMultiplier={25} />
            ))}
            <AsteroidBelt count={600} innerRadius={28} outerRadius={42} />
            <EffectComposer>
              <Bloom intensity={0.6} luminanceThreshold={0.2} luminanceSmoothing={0.95} mipmapBlur />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
            <TypewriterText text="TATA SURYA" speed={100} />
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl drop-shadow-md">
            Jelajahi keindahan dan keajaiban tata surya kita secara interaktif
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/explore"><Button size="lg">Mulai Eksplorasi</Button></Link>
            <Link to="/quiz"><Button variant="secondary" size="lg">Ikuti Kuis</Button></Link>
          </div>
        </motion.div>
        <motion.div className="absolute bottom-8" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
