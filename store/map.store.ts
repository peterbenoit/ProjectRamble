import { create } from 'zustand';
import type { Coordinates } from '@/types';

interface MapStore {
  mapInstance: google.maps.Map | null;
  center: Coordinates;
  zoom: number;
  bywaysVisible: boolean;
  setMapInstance: (map: google.maps.Map) => void;
  setCenter: (center: Coordinates) => void;
  setZoom: (zoom: number) => void;
  toggleByways: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  mapInstance: null,
  center: { lat: 27.9944024, lng: -81.7602544 }, // Florida center
  zoom: 12,
  bywaysVisible: true,
  setMapInstance: (map) => set({ mapInstance: map }),
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  toggleByways: () => set((s) => ({ bywaysVisible: !s.bywaysVisible })),
}));
