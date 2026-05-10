<script setup>
// Info card for a selected POI or byway — Feature 5
// See docs/FEATURES_V1.md#feature-5
//
// Behavior:
//   - Shown when discovery store has a selectedPOI
//   - Bottom sheet on mobile (< 768px), side panel on desktop
//   - Dismissed by tapping map, swiping down, or close button
//   - "Add to Itinerary" adds to itinerary store; shows "In Itinerary" if already added
//   - Max 40% of map height when open

import { useDiscoveryStore } from '../../stores/discovery.store.js'
import { useItinerary } from '../../composables/useItinerary.js'

const discoveryStore = useDiscoveryStore()
const { hasStop, addStop } = useItinerary()

const poi = computed(() => discoveryStore.selectedPOI)
const isVisible = computed(() => !!poi.value)
const alreadyAdded = computed(() => poi.value && hasStop(poi.value.id))

function dismiss() {
  discoveryStore.clearSelection()
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="absolute bottom-0 left-0 right-0 z-20 max-h-[40vh] overflow-y-auto
                                  bg-surface-raised rounded-t-2xl p-4">
      <!-- TODO: render POI name, type, address, distance, rating, hours -->
      <!-- TODO: "Add to Itinerary" / "In Itinerary" button -->
      <!-- TODO: "View in Google Maps" link -->
      <!-- TODO: close button -->
    </div>
  </Transition>
</template>
