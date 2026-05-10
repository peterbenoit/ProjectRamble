<script setup>
// Full-screen Google Maps canvas — Feature 1
// See docs/FEATURES_V1.md#feature-1 and docs/ARCHITECTURE.md#map-instance-lifecycle
//
// Rules:
//   - Initialize map ONCE in onMounted using getGoogleMaps() from lib/google-maps.js
//   - Store the map instance in useMapStore().setMap()
//   - Never reinitialize on re-render (use an initialized guard ref)
//   - Apply MAP_STYLE from lib/map-style.js
//   - Hide all default Google controls

import { getGoogleMaps } from '../../lib/google-maps.js'
import { MAP_STYLE } from '../../lib/map-style.js'
import { useMapStore } from '../../stores/map.store.js'

const mapEl = ref(null)
const mapStore = useMapStore()
const initialized = ref(false)

onMounted(async () => {
  if (initialized.value) return
  initialized.value = true

  // TODO: call getGoogleMaps(), create map instance, call mapStore.setMap()
  // TODO: apply MAP_STYLE and hide default controls
  // TODO: listen for idle event to detect significant pan/zoom for POI refresh
  // TODO: listen for click on empty map area to clear selected POI
})
</script>

<template>
  <div ref="mapEl" class="absolute inset-0" />
</template>
