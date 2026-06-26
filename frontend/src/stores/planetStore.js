import { create } from 'zustand';
import { planetService } from '../services/planetService';

const usePlanetStore = create((set, get) => ({
  planets: [],
  selectedPlanet: null,
  isLoading: false,
  error: null,

  fetchPlanets: async () => {
    if (get().planets.length > 0) return;
    set({ isLoading: true });
    try {
      const response = await planetService.getAll();
      const planets = response.data ?? response;
      set({ planets, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPlanetByName: async (name) => {
    set({ isLoading: true });
    try {
      const response = await planetService.getAll();
      const planets = response.data ?? response;
      const found = planets.find(p => p.name.toLowerCase() === name.toLowerCase());
      set({ selectedPlanet: found, isLoading: false });
      return found;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  selectPlanet: (planet) => set({ selectedPlanet: planet }),
  clearSelection: () => set({ selectedPlanet: null })
}));

export default usePlanetStore;
