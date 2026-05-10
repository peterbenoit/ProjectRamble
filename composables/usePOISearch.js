// POI search composable — calls /api/places/nearby and manages results
// See docs/FEATURES_V1.md#feature-3 and docs/API_INTEGRATIONS.md#server-route-nearby-search

import { useDiscoveryStore } from '../stores/discovery.store.js'

export function usePOISearch() {
  const store = useDiscoveryStore()

  /**
   * Fetches POIs near the given coordinates.
   * Results are cached for 24h by the service worker.
   * @param {{ lat: number, lng: number }} coords
   */
  async function searchNearby(coords) {
    // TODO: implement
    // 1. Set store.isSearching = true
    // 2. POST to /api/places/nearby with coords
    // 3. On success, call store.setResults(pois)
    // 4. On failure, show a non-blocking toast (do not crash the map)
    // 5. Set store.isSearching = false
  }

  return {
    results: computed(() => store.results),
    isSearching: computed(() => store.isSearching),
    searchNearby,
  }
}
