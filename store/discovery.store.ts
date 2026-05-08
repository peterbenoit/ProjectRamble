import { create } from 'zustand';
import type { POI } from '@/types';

interface DiscoveryStore {
  pois: POI[];
  selectedPOI: POI | null;
  selectedBywayId: string | null;
  isLoading: boolean;
  error: string | null;
  setPOIs: (pois: POI[]) => void;
  selectPOI: (poi: POI | null) => void;
  selectByway: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDiscoveryStore = create<DiscoveryStore>((set) => ({
  pois: [],
  selectedPOI: null,
  selectedBywayId: null,
  isLoading: false,
  error: null,
  setPOIs: (pois) => set({ pois }),
  selectPOI: (poi) => set({ selectedPOI: poi, selectedBywayId: null }),
  selectByway: (id) => set({ selectedBywayId: id, selectedPOI: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
