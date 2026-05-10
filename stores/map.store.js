import { defineStore } from 'pinia'

// Map state — see docs/DATA_SCHEMA.md#pinia-store-shapes
export const useMapStore = defineStore('map', {
  state: () => ({
    /** @type {google.maps.Map | null} */
    map: null,
    /** @type {{ lat: number, lng: number }} */
    center: { lat: 27.9944, lng: -81.7603 }, // Florida default
    zoom: 7,
    /** @type {string[]} Active layer toggle keys */
    activeLayers: ['byways'],
  }),

  getters: {
    isBywaysVisible: (state) => state.activeLayers.includes('byways'),
  },

  actions: {
    setMap(mapInstance) {
      this.map = mapInstance
    },
    setCenter(coords) {
      this.center = coords
    },
    setZoom(level) {
      this.zoom = level
    },
    toggleLayer(key) {
      const idx = this.activeLayers.indexOf(key)
      if (idx === -1) {
        this.activeLayers.push(key)
      } else {
        this.activeLayers.splice(idx, 1)
      }
    },
  },
})
