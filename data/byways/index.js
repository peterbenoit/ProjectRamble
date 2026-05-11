// Byway GeoJSON loader — see docs/API_INTEGRATIONS.md#static-data-byways-geojson
// Add new state files here as the app expands beyond Florida.

import floridaByways from './florida.geojson'

const SUPPORTED_STATES = ['florida']
const BYWAY_DATA = {
  florida: floridaByways,
}

/** @type {Record<string, object>} */
const bywayCache = {}

/**
 * Loads the GeoJSON FeatureCollection for a given state.
 * Results are cached in memory after the first load.
 *
 * @param {'florida'} state
 * @returns {Promise<object>} GeoJSON FeatureCollection
 */
export async function loadByways(state = 'florida') {
  if (!SUPPORTED_STATES.includes(state)) {
    throw new Error(`Unsupported state: ${state}`)
  }
  if (bywayCache[state]) return bywayCache[state]

  bywayCache[state] = BYWAY_DATA[state]
  return bywayCache[state]
}

export function getAllSupportedStates() {
  return [...SUPPORTED_STATES]
}
