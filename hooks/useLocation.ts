'use client';

import { useEffect } from 'react';
import { useLocationStore } from '@/store/location.store';
import { useMapStore } from '@/store/map.store';

export function useLocation() {
  const locationStore = useLocationStore();
  const setCenter = useMapStore((s) => s.setCenter);

  useEffect(() => {
    const cleanup = locationStore._initialize();
    return cleanup;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync location to map center
  useEffect(() => {
    if (locationStore.coordinates) {
      setCenter(locationStore.coordinates);
    }
  }, [locationStore.coordinates, setCenter]);

  return locationStore;
}
