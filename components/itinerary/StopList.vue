<script setup>
// Drag-and-drop sortable stop list — Feature 7
// See docs/FEATURES_V1.md#feature-7
//
// Uses vuedraggable (SortableJS wrapper for Vue 3)
// import draggable from 'vuedraggable'

import { useItineraryStore } from '../../stores/itinerary.store.js'

const store = useItineraryStore()

function onReorder(newStops) {
  store.reorderStops(newStops)
}
</script>

<template>
  <!-- TODO: wrap with <draggable> component from vuedraggable -->
  <!-- TODO: render StopItem for each stop -->
  <!-- TODO: empty state when stops.length === 0 -->
  <div>
    <StopItem
      v-for="stop in store.stops"
      :key="stop.id"
      :stop="stop"
    />
  </div>
</template>
