<script setup>
// Renders scenic byway polylines from GeoJSON — Feature 4
// See docs/FEATURES_V1.md#feature-4 and docs/ARCHITECTURE.md#byway-rendering
//
// Rules:
//   - Use google.maps.Polyline instances directly — NOT the Data layer
//   - Color from feature.properties.color
//   - Show at zoom >= 7, hide below
//   - Click on polyline opens POI card (set discovery store selectedPOI)
//   - Watch map store activeLayers to toggle visibility

import { useMapStore } from '../../stores/map.store.js'
import { useByways } from '../../composables/useByways.js'

const mapStore = useMapStore()
const { byways, isLoaded } = useByways()

// TODO: watch isLoaded and mapStore.map — when both are ready, render polylines
// TODO: watch mapStore.isBywaysVisible — show/hide all polylines
// TODO: watch mapStore.zoom — hide polylines below zoom 7
// TODO: clean up polylines with setMap(null) on unmount
</script>

<template>
  <!-- Renders imperatively via Google Maps API — no DOM output -->
</template>
