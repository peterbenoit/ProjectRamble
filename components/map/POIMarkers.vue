<script setup>
// Renders POI markers from discovery results — Feature 3
// See docs/FEATURES_V1.md#feature-3 and docs/UI_DESIGN.md for marker styles
//
// Rules:
//   - One google.maps.Marker (or AdvancedMarkerElement) per POI in discovery store
//   - Clicking a marker sets discovery store selectedPOI
//   - Markers must be cleaned up when results change (remove old before adding new)

import { useMapStore } from '../../stores/map.store.js'
import { useDiscoveryStore } from '../../stores/discovery.store.js'

const mapStore = useMapStore()
const discoveryStore = useDiscoveryStore()

// TODO: watch discoveryStore.results — clear old markers, add new ones
// TODO: click handler: discoveryStore.selectPOI(poi)
// TODO: clean up all markers on unmount
</script>

<template>
  <!-- Renders imperatively via Google Maps API — no DOM output -->
</template>
