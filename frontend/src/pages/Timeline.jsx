import { motion } from 'framer-motion';
import GlassPanel from '../components/ui/GlassPanel';
import { TIMELINE_EVENTS } from '../data/timeline';

const Timeline = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-4xl text-center mb-8">Timeline Eksplorasi Ruang Angkasa</h1>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-white/20" />

          {TIMELINE_EVENTS.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-8`}
            >
              <GlassPanel className="max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 font-heading text-lg">{event.year}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    event.type === 'MILESTONE' ? 'bg-blue-500/30 text-blue-400' : 'bg-green-500/30 text-green-400'
                  }`}>
                    {event.type}
                  </span>
                </div>
                <h3 className="font-heading text-xl mb-2">{event.title}</h3>
                <p className="text-white/70">{event.description}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Timeline;
