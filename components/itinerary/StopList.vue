<script setup>
// Drag-and-drop sortable stop list — Feature 7
// See docs/FEATURES_V1.md#feature-7

import draggable from 'vuedraggable'
import { useItineraryStore } from '../../stores/itinerary.store.js'
import StopItem from './StopItem.vue'

const store = useItineraryStore()

// vuedraggable needs a local v-model copy; sync back via reorderStops
const localStops = computed({
  get: () => store.stops,
  set: (val) => store.reorderStops(val),
})
</script>

<template>
  <!-- Empty state -->
  <div
    v-if="!store.stops.length"
    class="flex flex-col items-center justify-center py-12 text-center"
  >
    <svg class="w-10 h-10 mb-3" style="color:var(--color-text-muted);"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M9 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>
      <polyline points="13 2 13 9 16 9"/>
      <path d="M18 2H9l-4 7h18l-1-7h-4"/>
      <line x1="12" y1="12" x2="12" y2="20"/>
      <line x1="9" y1="16" x2="15" y2="16"/>
    </svg>
    <p class="text-sm font-medium" style="color:var(--color-text-secondary);">No stops yet</p>
    <p class="text-xs mt-1" style="color:var(--color-text-muted);">Tap a pin or byway and choose “Add to Itinerary”</p>
  </div>

  <!-- Draggable list -->
  <draggable
    v-else
    v-model="localStops"
    item-key="id"
    handle=".drag-handle"
    animation="150"
    class="flex flex-col gap-2"
  >
    <template #item="{ element, index }">
      <StopItem :stop="element" :index="index" />
    </template>
  </draggable>
</template>
