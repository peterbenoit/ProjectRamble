'use client';

import { useCallback, useRef } from 'react';
import type { Coordinates, POI } from '@/types';
import { useDiscoveryStore } from '@/store/discovery.store';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_PREFIX = 'pw_poi_';

function cacheKey(coords: Coordinates) {
  return `${CACHE_PREFIX}${Math.round(coords.lat * 100) / 100}_${Math.round(coords.lng * 100) / 100}`;
}

interface CacheEntry {
  pois: POI[];
  timestamp: number;
}

function readCache(key: string): POI[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.pois;
  } catch {
    return null;
  }
}

function writeCache(key: string, pois: POI[]) {
  try {
    const entry: CacheEntry = { pois, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

export function usePOISearch() {
  const { setPOIs, setLoading, setError } = useDiscoveryStore();
  const lastSearchRef = useRef<{ lat: number; lng: number } | null>(null);

  const search = useCallback(
    async (coords: Coordinates, force = false) => {
      if (!force && lastSearchRef.current) {
        const dlat = Math.abs(coords.lat - lastSearchRef.current.lat);
        const dlng = Math.abs(coords.lng - lastSearchRef.current.lng);
        if (dlat < 0.05 && dlng < 0.05) return; // < ~3 miles, skip
      }

      lastSearchRef.current = coords;
      const key = cacheKey(coords);
      const cached = readCache(key);
      if (cached) {
        setPOIs(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/places/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinates: coords }),
        });

        if (!res.ok) throw new Error('Places API error');

        const pois: POI[] = await res.json();
        setPOIs(pois);
        writeCache(key, pois);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load nearby places');
      } finally {
        setLoading(false);
      }
    },
    [setPOIs, setLoading, setError],
  );

  return { search };
}
