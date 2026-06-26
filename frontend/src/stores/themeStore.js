import { create } from 'zustand';

const useThemeStore = create((set) => ({
  isDark: true,
  toggle: () => set((state) => ({ isDark: !state.isDark })),
  setDark: () => set({ isDark: true }),
  setLight: () => set({ isDark: false })
}));

export default useThemeStore;
