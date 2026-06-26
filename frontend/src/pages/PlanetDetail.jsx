import { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import * as THREE from 'three';
import GlassPanel from '../components/ui/GlassPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { planetService } from '../services/planetService';
import { generatePlanetTexture } from '../utils/planetTextures';

// 3D Planet component for detail view
const PlanetModel = ({ planet }) => {
  const meshRef = useRef();
  
  // Generate procedural texture
  const texture = useMemo(() => {
    const canvas = generatePlanetTexture(planet.name);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [planet.name]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    </>
  );
};

const PlanetDetail = () => {
  const { name } = useParams();
  const [planet, setPlanet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanet = async () => {
      try {
        const { data } = await planetService.getAll();
        const found = data.find(p => p.name.toLowerCase() === name);
        setPlanet(found);
      } catch (error) {
        console.error('Error fetching planet:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlanet();
  }, [name]);

  if (loading) return <LoadingSpinner />;
  if (!planet) return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Planet tidak ditemukan
    </div>
  );

  const facts = typeof planet.facts === 'string' ? JSON.parse(planet.facts) : planet.facts;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Kembali
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 3D Planet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GlassPanel className="h-96">
            <Suspense fallback={<LoadingSpinner />}>
              <Canvas>
                <PlanetModel planet={planet} />
              </Canvas>
            </Suspense>
          </GlassPanel>
        </motion.div>

        {/* Planet Info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassPanel className="h-full">
            <h2 className="font-heading text-3xl mb-4">{planet.nameIndo}</h2>
            
            <div className="space-y-3">
              <InfoRow label="Nama Inggris" value={planet.name} />
              <InfoRow label="Radius" value={`${planet.radius.toLocaleString()} km`} />
              <InfoRow label="Jarak dari Matahari" value={`${planet.distanceFromSun} juta km`} />
              <InfoRow label="Massa" value={`${planet.mass.toExponential(3)} kg`} />
              <InfoRow label="Suhu" value={`${planet.temperature}°C`} />
              <InfoRow label="Gravitasi" value={`${planet.gravity} m/s²`} />
              <InfoRow label="Jumlah Bulan" value={planet.moons} />
              <InfoRow label="Atmosfer" value={planet.atmosphere} />
            </div>

            <div className="mt-6">
              <h3 className="font-heading text-lg mb-2">Fakta Unik</h3>
              <ul className="space-y-2">
                {facts.map((fact, index) => (
                  <li key={index} className="text-white/70 text-sm flex items-start">
                    <span className="text-yellow-400 mr-2">*</span>
                    {fact}
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

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/10">
    <span className="text-white/50 text-sm">{label}</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);

export default PlanetDetail;
