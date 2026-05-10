<script setup>
// Renders scenic byway polylines from GeoJSON — Feature 4
// See docs/FEATURES_V1.md#feature-4 and docs/ARCHITECTURE.md#byway-rendering

import { useMapStore } from '../../stores/map.store.js'
import { useDiscoveryStore } from '../../stores/discovery.store.js'
import { useByways } from '../../composables/useByways.js'

const mapStore = useMapStore()
const discoveryStore = useDiscoveryStore()
const { byways, isLoaded } = useByways()

/** @type {google.maps.Polyline[]} */
let polylines = []

function clearPolylines() {
  polylines.forEach((p) => p.setMap(null))
  polylines = []
}

function renderPolylines() {
  if (!mapStore.map || !byways.value) return
  clearPolylines()

  const google = window.google
  const isVisible = mapStore.isBywaysVisible && mapStore.zoom >= 7

  for (const feature of byways.value.features) {
    const color = feature.properties?.color ?? '#3b82f6'
    const geomType = feature.geometry.type
    const coordSets =
      geomType === 'MultiLineString'
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates]

    for (const coords of coordSets) {
      const path = coords.map(([lng, lat]) => ({ lat, lng }))
      const polyline = new google.maps.Polyline({
        path,
        map: mapStore.map,
        strokeColor: color,
        strokeWeight: 4,
        strokeOpacity: 0.8,
        visible: isVisible,
        clickable: true,
      })

      polyline.addListener('click', (e) => {
        discoveryStore.selectPOI({
          id: feature.properties.id,
          name: feature.properties.name,
          location: { lat: e.latLng.lat(), lng: e.latLng.lng() },
          address: feature.properties.state
            ? `${feature.properties.state} Scenic Highway`
            : undefined,
          types: ['byway'],
          _byway: feature.properties,
        })
      })

      polyline.addListener('mouseover', () => {
        polyline.setOptions({ strokeWeight: 6, strokeOpacity: 1.0 })
      })
      polyline.addListener('mouseout', () => {
        polyline.setOptions({ strokeWeight: 4, strokeOpacity: 0.8 })
      })

      polylines.push(polyline)
    }
  }
}

// Render once both map and GeoJSON are ready
watch(
  [() => mapStore.map, isLoaded],
  ([map, loaded]) => { if (map && loaded) renderPolylines() },
  { immediate: true },
)

// Toggle all polylines when layer switch or zoom changes
watch(
  [() => mapStore.isBywaysVisible, () => mapStore.zoom],
  ([visible, zoom]) => {
    const show = visible && zoom >= 7
    polylines.forEach((p) => p.setVisible(show))
  },
)

onUnmounted(() => clearPolylines())
</script>

<template>
  <!-- Renders imperatively via Google Maps API — no DOM output -->
</template>
