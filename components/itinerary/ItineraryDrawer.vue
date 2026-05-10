<script setup>
// Slide-up itinerary drawer + floating action button — Features 7, 9, 10
// See docs/FEATURES_V1.md#feature-7, #feature-9, #feature-10
//
// Behavior:
//   - FAB shows stop count badge when stops exist
//   - Drawer: partial (handle + count) or fully open
//   - "Sort by proximity" button — calls useItinerary().sortByProximity
//   - "Share" button — calls useItinerary().getShareUrl, copies to clipboard
//   - "Open in Google Maps" button — calls useItinerary().openInGoogleMaps
//   - Drawer open state persists to localStorage

import { useItinerary } from '../../composables/useItinerary.js'
import { useItineraryStore } from '../../stores/itinerary.store.js'

const store = useItineraryStore()
const { stops, stopCount, isDrawerOpen } = useItinerary()
</script>

<template>
  <!-- FAB -->
  <button
    class="absolute bottom-6 right-6 z-20 h-14 w-14 rounded-full bg-accent shadow-lg"
    @click="store.toggleDrawer()"
  >
    <!-- TODO: icon + badge showing stopCount -->
  </button>

  <!-- Drawer — use shadcn-vue Sheet or Drawer component -->
  <!-- TODO: implement slide-up panel with StopList, Sort, Share, OpenInMaps -->
</template>
