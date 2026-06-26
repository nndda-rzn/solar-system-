import { useState } from 'react';
import { motion } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import { PLANETS } from '../data/planets';

const Compare = () => {
  const [selected, setSelected] = useState([]);

  const togglePlanet = (planet) => {
    if (selected.find(p => p.name === planet.name)) {
      setSelected(selected.filter(p => p.name !== planet.name));
    } else if (selected.length < 3) {
      setSelected([...selected, planet]);
    }
  };

  const maxRadius = Math.max(...PLANETS.map(p => p.radius));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-4xl text-center mb-8">Perbandingan Planet</h1>
        
        <GlassPanel className="mb-8">
          <p className="text-white/70 mb-4">Pilih 2-3 planet untuk dibandingkan:</p>
          <div className="flex flex-wrap gap-2">
            {PLANETS.map((planet) => (
              <button
                key={planet.name}
                onClick={() => togglePlanet(planet)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selected.find(p => p.name === planet.name)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {planet.nameIndo}
              </button>
            ))}
          </div>
        </GlassPanel>

        {selected.length >= 2 && (
          <div className="grid md:grid-cols-3 gap-6">
            {selected.map((planet, index) => (
              <motion.div
                key={planet.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassPanel>
                  <div className="text-center mb-4">
                    <div
                      className="w-24 h-24 rounded-full mx-auto mb-4"
                      style={{
                        backgroundColor: planet.color,
                        transform: `scale(${0.3 + (planet.radius / maxRadius) * 0.7})`
                      }}
                    />
                    <h3 className="font-heading text-xl">{planet.nameIndo}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Radius</span>
                      <span>{planet.radius.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Jarak</span>
                      <span>{planet.distance} AU</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Orbital Period</span>
                      <span>{planet.orbitalPeriod} hari</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Bulan</span>
                      <span>{planet.moons?.length || 0}</span>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Compare;
