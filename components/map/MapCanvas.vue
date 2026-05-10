<script setup>
// Full-screen Google Maps canvas — Feature 1
// See docs/FEATURES_V1.md#feature-1 and docs/ARCHITECTURE.md#map-instance-lifecycle

import { getGoogleMaps } from '../../lib/google-maps.js'
import { MAP_STYLE } from '../../lib/map-style.js'
import { useMapStore } from '../../stores/map.store.js'
import { useDiscoveryStore } from '../../stores/discovery.store.js'
import { usePOISearch } from '../../composables/usePOISearch.js'

const mapEl = ref(null)
const mapStore = useMapStore()
const discoveryStore = useDiscoveryStore()
const { searchNearby } = usePOISearch()
const initialized = ref(false)

// Track last search bounds to detect significant viewport changes (>30%)
let lastSearchCenter = null

onMounted(async () => {
  if (initialized.value) return
  initialized.value = true

  const google = await getGoogleMaps()

  const map = new google.maps.Map(mapEl.value, {
    center: mapStore.center,
    zoom: 12,
    styles: MAP_STYLE,
    disableDefaultUI: true,
    gestureHandling: 'greedy',
    clickableIcons: false,
  })

  mapStore.setMap(map)

  // Sync zoom and center back to store
  map.addListener('zoom_changed', () => mapStore.setZoom(map.getZoom()))
  map.addListener('center_changed', () => {
    const c = map.getCenter()
    mapStore.setCenter({ lat: c.lat(), lng: c.lng() })
  })

  // On idle: refresh POIs if center has moved significantly (>30% of viewport diagonal)
  map.addListener('idle', () => {
    const center = map.getCenter()
    const coords = { lat: center.lat(), lng: center.lng() }

    if (!lastSearchCenter) {
      lastSearchCenter = coords
      searchNearby(coords)
      return
    }

    const bounds = map.getBounds()
    if (!bounds) return
    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()
    const diag = Math.sqrt(
      Math.pow(ne.lat() - sw.lat(), 2) + Math.pow(ne.lng() - sw.lng(), 2),
    )
    const moved = Math.sqrt(
      Math.pow(coords.lat - lastSearchCenter.lat, 2) +
        Math.pow(coords.lng - lastSearchCenter.lng, 2),
    )

    if (moved > diag * 0.3) {
      lastSearchCenter = coords
      searchNearby(coords)
    }
  })

  // Tap on empty map area clears selected POI
  map.addListener('click', () => discoveryStore.clearSelection())
})
</script>

<template>
  <div ref="mapEl" class="absolute inset-0" />
</template>
