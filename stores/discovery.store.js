import { defineStore } from 'pinia'

// Discovery / POI search state — see docs/DATA_SCHEMA.md#pinia-store-shapes
export const useDiscoveryStore = defineStore('discovery', {
  state: () => ({
    /** @type {import('../docs/DATA_SCHEMA').POI[]} */
    results: [],
    /** @type {import('../docs/DATA_SCHEMA').POI | null} */
    selectedPOI: null,
    isSearching: false,
    searchQuery: '',
  }),

  actions: {
    // TODO: setResults(pois)
    // TODO: selectPOI(poi)
    // TODO: clearSelection()
    // TODO: setSearchQuery(query)
    // TODO: setSearching(bool)
  },
})
