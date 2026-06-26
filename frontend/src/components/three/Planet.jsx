import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import Moon from './Moon';
import Atmosphere from './Atmosphere';
import { loadPlanetTexture } from '../../utils/textureLoader';

const Planet = ({ planet, speedMultiplier = 1 }) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const angle = useRef(Math.random() * Math.PI * 2);

  // Load texture (real or procedural)
  const texture = useMemo(() => {
    return loadPlanetTexture(planet.texture || planet.name);
  }, [planet.texture, planet.name]);

  // Generate ring texture for Saturn
  const ringTexture = useMemo(() => {
    if (!planet.hasRing) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Create realistic ring gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'rgba(200, 180, 140, 0.05)');
    gradient.addColorStop(0.15, 'rgba(210, 190, 150, 0.7)');
    gradient.addColorStop(0.25, 'rgba(180, 160, 120, 0.2)');
    gradient.addColorStop(0.35, 'rgba(220, 200, 160, 0.8)');
    gradient.addColorStop(0.45, 'rgba(190, 170, 130, 0.3)');
    gradient.addColorStop(0.55, 'rgba(210, 190, 150, 0.75)');
    gradient.addColorStop(0.65, 'rgba(170, 150, 110, 0.15)');
    gradient.addColorStop(0.75, 'rgba(200, 180, 140, 0.6)');
    gradient.addColorStop(0.85, 'rgba(180, 160, 120, 0.25)');
    gradient.addColorStop(1, 'rgba(160, 140, 100, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add ring gap details
    ctx.strokeStyle = 'rgba(100, 80, 60, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.rotation = Math.PI / 2;
    return tex;
  }, [planet.hasRing]);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    
    angle.current += (delta * speedMultiplier) / planet.orbitalPeriod;
    const x = Math.cos(angle.current) * planet.distance;
    const z = Math.sin(angle.current) * planet.distance;

    groupRef.current.position.x = x;
    groupRef.current.position.z = z;

    meshRef.current.rotation.y += delta / planet.rotationPeriod;
    
    if (ringRef.current) {
      ringRef.current.rotation.z = -0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planet sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => navigate(`/planet/${planet.name.toLowerCase()}`)}
        scale={hovered ? 1.1 : 1}
      >
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          color={planet.color}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere effect */}
      <Atmosphere planetName={planet.name} radius={planet.radius} />

      {/* Saturn's ring */}
      {planet.hasRing && ringTexture && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[planet.radius * 1.3, planet.radius * 2.2, 64]} />
          <meshStandardMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
            roughness={0.5}
          />
        </mesh>
      )}

      {/* Glow effect on hover */}
      {hovered && (
        <sprite scale={[planet.radius * 4, planet.radius * 4, 1]}>
          <spriteMaterial color={planet.color} transparent opacity={0.3} />
        </sprite>
      )}

      {/* Moons */}
      {planet.moons && planet.moons.map((moon, index) => (
        <Moon key={index} moon={moon} parentRadius={planet.radius} />
      ))}
    </group>
  );
};

export default Planet;
