import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'border border-blue-500 text-blue-400 hover:bg-blue-500/20',
  ghost: 'text-white/70 hover:text-white hover:bg-white/10',
  danger: 'bg-red-500 hover:bg-red-600 text-white'
};

const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  return (
    <motion.button
      className={`rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
