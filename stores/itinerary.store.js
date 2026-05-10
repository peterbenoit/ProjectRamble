import { defineStore } from 'pinia'
import { loadItinerary, saveItinerary } from '../lib/storage.js'

// Itinerary state — see docs/DATA_SCHEMA.md#pinia-store-shapes
export const useItineraryStore = defineStore('itinerary', {
  state: () => ({
    /** @type {import('../docs/DATA_SCHEMA').ItineraryStop[]} */
    stops: loadItinerary(),
    isDrawerOpen: false,
    isSorted: false,
  }),

  getters: {
    stopCount: (state) => state.stops.length,
    hasStop: (state) => (id) => state.stops.some((s) => s.id === id),
  },

  actions: {
    // TODO: addStop(poi)           — push to stops, persist to localStorage
    // TODO: removeStop(id)         — filter stops, persist
    // TODO: reorderStops(newOrder) — replace stops array, persist
    // TODO: updateFieldNote(id, note)
    // TODO: sortByProximity(userCoords) — use lib/proximity-sort.js
    // TODO: clearAll()
    // TODO: toggleDrawer()
    // TODO: _persist()             — calls saveItinerary(this.stops)
  },
})
