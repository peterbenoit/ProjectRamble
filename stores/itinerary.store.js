import { defineStore } from 'pinia'
import { loadItinerary, saveItinerary } from '../lib/storage.js'
import { sortByProximity } from '../lib/proximity-sort.js'

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
    addStop(poi) {
      if (this.hasStop(poi.id)) return
      this.stops.push({
        id: poi.id,
        name: poi.name,
        location: poi.location,
        address: poi.address,
        fieldNote: '',
        addedAt: Date.now(),
        type: 'poi',
      })
      this._persist()
    },
    removeStop(id) {
      this.stops = this.stops.filter((s) => s.id !== id)
      this._persist()
    },
    reorderStops(newOrder) {
      this.stops = newOrder
      this._persist()
    },
    updateFieldNote(id, note) {
      const stop = this.stops.find((s) => s.id === id)
      if (stop) stop.fieldNote = note
      this._persist()
    },
    sortByProximity(userCoords) {
      this.stops = sortByProximity(this.stops, userCoords)
      this.isSorted = true
      this._persist()
    },
    clearAll() {
      this.stops = []
      this.isSorted = false
      this._persist()
    },
    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen
    },
    _persist() {
      saveItinerary(this.stops)
    },
  },
})
