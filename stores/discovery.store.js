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
    setResults(pois) {
      this.results = pois
    },
    selectPOI(poi) {
      this.selectedPOI = poi
    },
    clearSelection() {
      this.selectedPOI = null
    },
    setSearchQuery(query) {
      this.searchQuery = query
    },
    setSearching(bool) {
      this.isSearching = bool
    },
  },
})
