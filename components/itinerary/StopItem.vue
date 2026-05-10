<script setup>
// Individual draggable stop row — Feature 7
// See docs/FEATURES_V1.md#feature-7 and docs/DATA_SCHEMA.md#itinerarystop

import { useItineraryStore } from '../../stores/itinerary.store.js'

const props = defineProps({
  /** @type {import('../../lib/types').ItineraryStop} */
  stop: {
    type: Object,
    required: true,
  },
})

const store = useItineraryStore()
</script>

<template>
  <div class="flex items-center gap-3 p-3 bg-surface-overlay rounded-lg">
    <!-- TODO: drag handle (SortableJS will use this via handle option) -->
    <!-- TODO: stop number (index + 1) -->
    <!-- TODO: stop name + address -->
    <!-- TODO: field note preview (truncated) — Feature 8 -->
    <!-- TODO: FieldNoteInput (inline expand) — Feature 8 -->
    <!-- TODO: delete button calling store.removeStop(stop.id) -->
  </div>
</template>
