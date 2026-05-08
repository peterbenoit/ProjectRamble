import type { FeatureCollection } from 'geojson';
import type { BywayProperties } from '@/types';

const SUPPORTED_STATES = ['florida'] as const;
type SupportedState = (typeof SUPPORTED_STATES)[number];

const bywayCache: Partial<Record<SupportedState, FeatureCollection<GeoJSON.Geometry, BywayProperties>>> = {};

export async function loadByways(
  state: SupportedState = 'florida',
): Promise<FeatureCollection<GeoJSON.Geometry, BywayProperties>> {
  if (bywayCache[state]) return bywayCache[state]!;

  const data = await import(`./${state}.geojson`);
  bywayCache[state] = data.default;
  return data.default;
}

export function getAllSupportedStates() {
  return SUPPORTED_STATES;
}
