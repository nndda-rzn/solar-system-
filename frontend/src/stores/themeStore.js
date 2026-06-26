import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('theme');
  if (saved) return saved === 'dark';
  return true;
};

const useThemeStore = create((set) => ({
  isDark: getInitialTheme(),
  toggle: () => set((state) => {
    const newDark = !state.isDark;
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
    document.documentElement.classList.toggle('light', !newDark);
    return { isDark: newDark };
  }),
  setDark: () => set({ isDark: true }),
  setLight: () => set({ isDark: false })
}));

export default useThemeStore;
