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
    // TODO: setMap(mapInstance)
    // TODO: setCenter(coords)
    // TODO: setZoom(level)
    // TODO: toggleLayer(key)
  },
})
