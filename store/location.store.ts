import { create } from 'zustand';
import type { LocationState, Coordinates } from '@/types';
import { storageGet, storageSet, STORAGE_KEYS } from '@/lib/storage';

const FLORIDA_CENTER: Coordinates = { lat: 27.9944024, lng: -81.7602544 };

interface LocationStore extends LocationState {
  requestPermission: () => void;
  _initialize: () => () => void;
}

let watchId: number | null = null;
let initialized = false;

export const useLocationStore = create<LocationStore>((set, get) => ({
  coordinates: null,
  accuracy: null,
  source: 'default',
  status: 'idle',

  requestPermission: () => {
    if (!navigator.geolocation) return;
    set({ status: 'resolving' });
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        set({ coordinates: coords, accuracy: pos.coords.accuracy, source: 'browser_gps', status: 'resolved' });
        storageSet(STORAGE_KEYS.LOCATION_PERMISSION, 'granted');
      },
      () => {
        set((s) => ({ ...s, status: 'denied' }));
        storageSet(STORAGE_KEYS.LOCATION_PERMISSION, 'denied');
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
    );
  },

  _initialize: () => {
    if (initialized) return () => {};
    initialized = true;

    const cached = storageGet<string>(STORAGE_KEYS.LOCATION_PERMISSION);

    // Set default center immediately
    set({ coordinates: FLORIDA_CENTER, source: 'default', status: 'resolved' });

    // IP geolocation in parallel
    fetch('/api/geocode/ip')
      .then((r) => r.json())
      .then((coords: Coordinates) => {
        const { source } = get();
        if (source !== 'browser_gps') {
          set({ coordinates: coords, source: 'ip_geolocation', status: 'resolved' });
        }
      })
      .catch(() => {});

    if (cached === 'granted') {
      get().requestPermission();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      initialized = false;
    };
  },
}));
