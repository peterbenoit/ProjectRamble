<script setup>
// Renders the user's current location as a pulsing blue dot — Feature 2
// See docs/FEATURES_V1.md#feature-2

import { useMapStore } from '../../stores/map.store.js'
import { useLocation } from '../../composables/useLocation.js'

const mapStore = useMapStore()
const { coords } = useLocation()

// TODO: watch coords — place/move a blue pulsing dot marker at coords
// TODO: use a custom SVG marker or AdvancedMarkerElement with CSS animation
// TODO: clean up marker on unmount
</script>

<template>
  <!-- Renders imperatively via Google Maps API — no DOM output -->
</template>
