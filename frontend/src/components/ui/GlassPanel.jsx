import { motion } from 'framer-motion';

const GlassPanel = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassPanel;
