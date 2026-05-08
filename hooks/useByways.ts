'use client';

import { useEffect, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import type { BywayProperties } from '@/types';
import { loadByways } from '@/data/byways';

export function useByways() {
  const [byways, setByways] = useState<FeatureCollection<GeoJSON.Geometry, BywayProperties> | null>(null);

  useEffect(() => {
    loadByways('florida').then(setByways).catch(console.error);
  }, []);

  return byways;
}
