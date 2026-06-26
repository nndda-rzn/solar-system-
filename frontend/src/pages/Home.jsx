import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import TypewriterText from '../components/ui/TypewriterText';
import Button from '../components/ui/Button';
import Starfield from '../components/three/Starfield';
import Sun from '../components/three/Sun';
import Planet from '../components/three/Planet';
import AsteroidBelt from '../components/three/AsteroidBelt';
import { PLANETS } from '../data/planets';

const Home = () => {
  return (
    <div className="relative">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas gl={{ logarithmicDepthBuffer: true }}>
          <PerspectiveCamera 
            makeDefault 
            position={[0, 30, 55]}
            near={0.1}
            far={2000}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.2}
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
            
            {PLANETS.map((p) => (
              <Planet key={p.name} planet={p} speedMultiplier={25} />
            ))}
            
            <AsteroidBelt count={600} innerRadius={28} outerRadius={42} />
            
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

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
            <TypewriterText text="TATA SURYA" speed={100} />
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl drop-shadow-md">
            Jelajahi keindahan dan keajaiban tata surya kita secara interaktif
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/explore">
              <Button size="lg">Mulai Eksplorasi</Button>
            </Link>
            <Link to="/quiz">
              <Button variant="secondary" size="lg">Ikuti Kuis</Button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
