// POI search composable — calls /api/places/nearby and manages results
// See docs/FEATURES_V1.md#feature-3 and docs/API_INTEGRATIONS.md#server-route-nearby-search

import { useDiscoveryStore } from '../stores/discovery.store.js'

const MAX_RETRIES = 3

export function usePOISearch() {
  const store = useDiscoveryStore()

  /**
   * Fetches POIs near the given coordinates.
   * Results are cached for 24h by the service worker.
   * @param {{ lat: number, lng: number }} coords
   */
  async function searchNearby(coords) {
    store.setSearching(true)
    let lastError

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const pois = await $fetch('/api/places/nearby', {
          method: 'POST',
          body: { coordinates: coords },
        })
        store.setResults(pois)
        store.setSearching(false)
        return
      } catch (err) {
        lastError = err
        if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, attempt * 500))
      }
    }

    store.setSearching(false)
    // Non-blocking toast — use useNuxtApp().$toast if Sonner is configured,
    // otherwise log to console so the map stays functional
    if (typeof useNuxtApp !== 'undefined') {
      try { useNuxtApp().$toast?.error('Could not load nearby places') } catch { /* noop */ }
    }
    console.warn('[usePOISearch] searchNearby failed after retries:', lastError)
  }

  return {
    results: computed(() => store.results),
    isSearching: computed(() => store.isSearching),
    searchNearby,
  }
}
