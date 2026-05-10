// Itinerary composable — thin wrapper over the Pinia store
// See docs/FEATURES_V1.md#feature-7 through #feature-10
// and docs/ARCHITECTURE.md#itinerary-persistence

import { useItineraryStore } from '../stores/itinerary.store.js'
import { buildShareUrl } from '../lib/url-encoding.js'

export function useItinerary() {
  const store = useItineraryStore()

  function addStop(poi) {
    store.addStop(poi)
  }

  function removeStop(id) {
    store.removeStop(id)
  }

  function reorderStops(newOrder) {
    store.reorderStops(newOrder)
  }

  function updateFieldNote(id, note) {
    store.updateFieldNote(id, note)
  }

  function sortByProximity(userCoords) {
    store.sortByProximity(userCoords)
  }

  function getShareUrl() {
    return buildShareUrl(store.stops)
  }

  function openInGoogleMaps() {
    const stops = store.stops
    if (!stops.length) return

    if (stops.length === 1) {
      const { lat, lng } = stops[0].location
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
      return
    }

    const origin = `${stops[0].location.lat},${stops[0].location.lng}`
    const destination = `${stops[stops.length - 1].location.lat},${stops[stops.length - 1].location.lng}`
    const waypoints = stops
      .slice(1, -1)
      .map((s) => `${s.location.lat},${s.location.lng}`)
      .join('|')

    const url = new URL('https://www.google.com/maps/dir/')
    url.searchParams.set('api', '1')
    url.searchParams.set('origin', origin)
    url.searchParams.set('destination', destination)
    if (waypoints) url.searchParams.set('waypoints', waypoints)
    url.searchParams.set('travelmode', 'driving')

    window.open(url.toString(), '_blank')
  }

  return {
    stops: computed(() => store.stops),
    stopCount: computed(() => store.stopCount),
    isDrawerOpen: computed(() => store.isDrawerOpen),
    hasStop: (id) => store.hasStop(id),
    addStop,
    removeStop,
    reorderStops,
    updateFieldNote,
    sortByProximity,
    getShareUrl,
    openInGoogleMaps,
  }
}
