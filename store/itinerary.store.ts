import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Itinerary, Stop, Coordinates } from '@/types';
import { storageGet, storageSet, STORAGE_KEYS } from '@/lib/storage';
import { sortByProximity } from '@/lib/proximity-sort';
import { encodeItinerary, itineraryToShared } from '@/lib/url-encoding';

function newItinerary(): Itinerary {
  const now = Date.now();
  return { id: uuidv4(), stops: [], createdAt: now, updatedAt: now };
}

function persist(itinerary: Itinerary) {
  storageSet(STORAGE_KEYS.ITINERARY, itinerary);
}

interface ItineraryStore {
  itinerary: Itinerary;
  drawerOpen: boolean;
  addStop: (stop: Omit<Stop, 'id' | 'addedAt'>) => void;
  removeStop: (id: string) => void;
  reorderStops: (stops: Stop[]) => void;
  sortByProximity: (origin: Coordinates) => void;
  updateFieldNote: (id: string, note: string) => void;
  setDrawerOpen: (open: boolean) => void;
  clearItinerary: () => void;
  getShareURL: () => string;
}

export const useItineraryStore = create<ItineraryStore>((set, get) => ({
  itinerary: storageGet<Itinerary>(STORAGE_KEYS.ITINERARY) ?? newItinerary(),
  drawerOpen: storageGet<boolean>(STORAGE_KEYS.DRAWER_OPEN) ?? false,

  addStop: (stop) =>
    set((s) => {
      const now = Date.now();
      const newStop: Stop = { ...stop, id: uuidv4(), addedAt: now };
      const updated: Itinerary = {
        ...s.itinerary,
        stops: [...s.itinerary.stops, newStop],
        updatedAt: now,
      };
      persist(updated);
      return { itinerary: updated };
    }),

  removeStop: (id) =>
    set((s) => {
      const updated: Itinerary = {
        ...s.itinerary,
        stops: s.itinerary.stops.filter((st) => st.id !== id),
        updatedAt: Date.now(),
      };
      persist(updated);
      return { itinerary: updated };
    }),

  reorderStops: (stops) =>
    set((s) => {
      const updated: Itinerary = { ...s.itinerary, stops, updatedAt: Date.now() };
      persist(updated);
      return { itinerary: updated };
    }),

  sortByProximity: (origin) =>
    set((s) => {
      const sorted = sortByProximity(s.itinerary.stops, origin);
      const updated: Itinerary = { ...s.itinerary, stops: sorted, updatedAt: Date.now() };
      persist(updated);
      return { itinerary: updated };
    }),

  updateFieldNote: (id, note) =>
    set((s) => {
      const stops = s.itinerary.stops.map((st) =>
        st.id === id ? { ...st, fieldNote: note.slice(0, 280) } : st,
      );
      const updated: Itinerary = { ...s.itinerary, stops, updatedAt: Date.now() };
      persist(updated);
      return { itinerary: updated };
    }),

  setDrawerOpen: (open) => {
    storageSet(STORAGE_KEYS.DRAWER_OPEN, open);
    set({ drawerOpen: open });
  },

  clearItinerary: () => {
    const fresh = newItinerary();
    persist(fresh);
    set({ itinerary: fresh });
  },

  getShareURL: () => {
    const { itinerary } = get();
    const shared = itineraryToShared(itinerary);
    const encoded = encodeItinerary(shared);
    return `${window.location.origin}/share/${encoded}`;
  },
}));
