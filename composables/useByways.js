// Byway GeoJSON loader — see docs/ARCHITECTURE.md#byway-rendering
// and docs/FEATURES_V1.md#feature-4

import { loadByways } from '../data/byways/index.js'

export function useByways() {
  const byways = ref(null)   // GeoJSON FeatureCollection
  const isLoaded = ref(false)

  // TODO: on mount, call loadByways('florida') and store in byways
  // TODO: expose filter by zoom level (hide below zoom 7)

  onMounted(async () => {
    byways.value = await loadByways('florida')
    isLoaded.value = true
  })

  return {
    byways,
    isLoaded,
  }
}
