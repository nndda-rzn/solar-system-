import { create } from 'zustand';
import { planetService } from '../services/planetService';

const usePlanetStore = create((set) => ({
  planets: [],
  selectedPlanet: null,
  isLoading: false,
  error: null,

  fetchPlanets: async () => {
    set({ isLoading: true });
    try {
      const { data } = await planetService.getAll();
      set({ planets: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  selectPlanet: (planet) => set({ selectedPlanet: planet }),
  clearSelection: () => set({ selectedPlanet: null })
}));

export default usePlanetStore;
