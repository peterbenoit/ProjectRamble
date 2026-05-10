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
  index: {
    type: Number,
    required: true,
  },
})

const store = useItineraryStore()
</script>

<template>
  <div class="flex items-start gap-3 p-3 rounded-xl"
    style="background:var(--color-surface-2);border:1px solid var(--color-border);">

    <!-- Drag handle -->
    <div
      class="drag-handle mt-0.5 shrink-0 cursor-grab flex flex-col gap-1 py-1"
      style="color:var(--color-text-muted);"
    >
      <span class="block w-4 h-0.5 rounded" style="background:currentColor;"></span>
      <span class="block w-4 h-0.5 rounded" style="background:currentColor;"></span>
      <span class="block w-4 h-0.5 rounded" style="background:currentColor;"></span>
    </div>

    <!-- Stop number -->
    <div
      class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
      style="background:var(--color-accent);color:white;"
    >
      {{ index + 1 }}
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium truncate" style="color:var(--color-text-primary);">{{ stop.name }}</p>
      <p v-if="stop.address" class="text-xs truncate" style="color:var(--color-text-muted);">{{ stop.address }}</p>
      <FieldNoteInput :stop-id="stop.id" :note="stop.fieldNote ?? ''" />
    </div>

    <!-- Delete -->
    <button
      class="shrink-0 p-1.5 rounded-lg mt-0.5"
      style="color:var(--color-text-muted);"
      @click="store.removeStop(stop.id)"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
      </svg>
    </button>
  </div>
</template>
