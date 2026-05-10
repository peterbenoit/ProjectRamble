// Itinerary composable — thin wrapper over the Pinia store
// See docs/FEATURES_V1.md#feature-7 through #feature-10
// and docs/ARCHITECTURE.md#itinerary-persistence

import { useItineraryStore } from '../stores/itinerary.store.js'
import { buildShareUrl } from '../lib/url-encoding.js'
import { sortByProximity } from '../lib/proximity-sort.js'

export function useItinerary() {
  const store = useItineraryStore()

  // TODO: addStop(poi) — delegate to store.addStop
  // TODO: removeStop(id) — delegate to store.removeStop
  // TODO: reorderStops(newOrder) — delegate to store.reorderStops
  // TODO: updateFieldNote(id, note) — delegate to store.updateFieldNote
  // TODO: sortByProximity(userCoords) — call lib/proximity-sort then store.reorderStops
  // TODO: getShareUrl() — call lib/url-encoding.buildShareUrl(store.stops)
  // TODO: openInGoogleMaps() — build waypoints URL, window.open

  return {
    stops: computed(() => store.stops),
    stopCount: computed(() => store.stopCount),
    isDrawerOpen: computed(() => store.isDrawerOpen),
    hasStop: (id) => store.hasStop(id),
  }
}
