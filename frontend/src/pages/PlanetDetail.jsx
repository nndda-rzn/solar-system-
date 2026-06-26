import { useEffect, Suspense, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import * as THREE from 'three';
import GlassPanel from '../components/ui/GlassPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { generatePlanetTexture } from '../utils/planetTextures';
import usePlanetStore from '../stores/planetStore';

const PlanetModel = ({ planet }) => {
  const meshRef = useRef();
  const texture = useMemo(() => {
    const canvas = generatePlanetTexture(planet.name);
    return new THREE.CanvasTexture(canvas);
  }, [planet.name]);

  useFrame((_, delta) => { if (meshRef.current) meshRef.current.rotation.y += delta * 0.5; });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
      </mesh>
    </>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/10">
    <span className="text-white/50 text-sm">{label}</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);

const PlanetDetail = () => {
  const { name } = useParams();
  const { selectedPlanet, fetchPlanetByName, isLoading } = usePlanetStore();

  useEffect(() => { fetchPlanetByName(name); }, [name, fetchPlanetByName]);

  if (isLoading) return <LoadingSpinner />;
  if (!selectedPlanet) return (
    <div className="min-h-screen flex items-center justify-center text-white">Planet tidak ditemukan</div>
  );

  const planet = selectedPlanet;
  const facts = typeof planet.facts === 'string' ? JSON.parse(planet.facts) : planet.facts;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-6">
        <ArrowLeft size={20} className="mr-2" />Kembali
      </Link>
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <GlassPanel className="h-96">
            <Suspense fallback={<LoadingSpinner />}>
              <Canvas><PlanetModel planet={planet} /></Canvas>
            </Suspense>
          </GlassPanel>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <GlassPanel className="h-full">
            <h2 className="font-heading text-3xl mb-4">{planet.nameIndo}</h2>
            <div className="space-y-3">
              <InfoRow label="Nama Inggris" value={planet.name} />
              <InfoRow label="Radius" value={`${planet.radius.toLocaleString()} km`} />
              <InfoRow label="Jarak dari Matahari" value={`${planet.distanceFromSun} juta km`} />
              <InfoRow label="Massa" value={`${planet.mass.toExponential(3)} kg`} />
              <InfoRow label="Suhu" value={`${planet.temperature}\u00B0C`} />
              <InfoRow label="Gravitasi" value={`${planet.gravity} m/s\u00B2`} />
              <InfoRow label="Jumlah Bulan" value={planet.moons} />
              <InfoRow label="Atmosfer" value={planet.atmosphere} />
            </div>
            <div className="mt-6">
              <h3 className="font-heading text-lg mb-2">Fakta Unik</h3>
              <ul className="space-y-2">
                {facts.map((fact, i) => (
                  <li key={i} className="text-white/70 text-sm flex items-start">
                    <span className="text-yellow-400 mr-2">*</span>{fact}
                  </li>
                ))}
              </ul>
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
};

export default PlanetDetail;
