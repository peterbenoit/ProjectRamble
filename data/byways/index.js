// Byway GeoJSON loader — see docs/API_INTEGRATIONS.md#static-data-byways-geojson
// Add new state files here as the app expands beyond Florida.

const SUPPORTED_STATES = ['florida']

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

  const data = await import(`./${state}.geojson`)
  bywayCache[state] = data.default
  return data.default
}

export function getAllSupportedStates() {
  return [...SUPPORTED_STATES]
}
