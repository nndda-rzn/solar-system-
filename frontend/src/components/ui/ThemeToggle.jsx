import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../stores/themeStore';

const ThemeToggle = () => {
  const { isDark, toggle } = useThemeStore();

  return (
    <button onClick={toggle} className="p-2 text-white/70 hover:text-white transition-colors">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
