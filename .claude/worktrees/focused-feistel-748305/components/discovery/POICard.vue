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
import { useMapStore } from '../../stores/map.store.js'
import { haversineDistance } from '../../lib/proximity-sort.js'

const discoveryStore = useDiscoveryStore()
const mapStore = useMapStore()
const { hasStop, addStop } = useItinerary()

const poi = computed(() => discoveryStore.selectedPOI)
const isVisible = computed(() => !!poi.value)
const alreadyAdded = computed(() => poi.value && hasStop(poi.value.id))
const isByway = computed(() => poi.value?.types?.includes('byway'))

const distanceMiles = computed(() => {
  if (!poi.value?.location || !mapStore.center) return null
  const d = haversineDistance(mapStore.center, poi.value.location)
  return d < 0.1 ? null : d.toFixed(1)
})

function dismiss() {
  discoveryStore.clearSelection()
}

function handleAdd() {
  if (!alreadyAdded.value) addStop(poi.value)
}

function googleMapsUrl(p) {
  if (!p?.location) return '#'
  return `https://www.google.com/maps/search/?api=1&query=${p.location.lat},${p.location.lng}&query_place_id=${p.id}`
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="isVisible"
      class="absolute bottom-0 left-0 right-0 z-20 md:bottom-auto md:top-4 md:left-auto md:right-4 md:w-80
             max-h-[40vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
      style="background:var(--color-surface);border:1px solid var(--color-border);"
    >
      <!-- Header -->
      <div class="flex items-start justify-between p-4 pb-2">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium mb-0.5" style="color:var(--color-accent);"
            v-if="poi.types?.length">
            {{ isByway ? 'Scenic Byway' : poi.types[0].replace(/_/g, ' ') }}
          </p>
          <h3 class="text-base font-semibold leading-tight" style="color:var(--color-text-primary);">{{ poi.name }}</h3>
        </div>
        <button
          class="ml-3 p-1.5 rounded-lg shrink-0"
          style="background:var(--color-surface-2);"
          @click="dismiss"
        >
          <svg class="w-4 h-4" style="color:var(--color-text-secondary);"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Details -->
      <div class="px-4 pb-4 space-y-1.5">
        <p v-if="poi.address" class="text-sm" style="color:var(--color-text-secondary);">{{ poi.address }}</p>

        <div class="flex items-center gap-3 text-sm" style="color:var(--color-text-secondary);">
          <span v-if="poi.rating">★ {{ poi.rating }}
            <span v-if="poi.userRatingsTotal" class="text-xs" style="color:var(--color-text-muted);"> ({{ poi.userRatingsTotal.toLocaleString() }})</span>
          </span>
          <span v-if="distanceMiles">{{ distanceMiles }} mi away</span>
        </div>

        <p v-if="poi.openNow !== undefined" class="text-sm"
          :style="`color:${poi.openNow ? 'var(--color-success)' : 'var(--color-error)'};`">
          {{ poi.openNow ? 'Open now' : 'Closed' }}
        </p>

        <!-- Byway-specific fields -->
        <template v-if="isByway && poi._byway">
          <p v-if="poi._byway.length_mi" class="text-sm" style="color:var(--color-text-secondary);">{{ poi._byway.length_mi }} miles</p>
          <p v-if="poi._byway.description" class="text-sm" style="color:var(--color-text-secondary);">{{ poi._byway.description }}</p>
          <a v-if="poi._byway.url" :href="poi._byway.url" target="_blank" rel="noopener"
            class="text-sm underline" style="color:var(--color-accent);">Official website ↗</a>
        </template>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 px-4 pb-4">
        <button
          class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity"
          :style="alreadyAdded
            ? 'background:var(--color-surface-2);color:var(--color-text-muted);'
            : 'background:var(--color-accent);color:white;'"
          :disabled="alreadyAdded"
          @click="handleAdd"
        >
          {{ alreadyAdded ? 'In Itinerary' : 'Add to Itinerary' }}
        </button>
        <a
          :href="googleMapsUrl(poi)"
          target="_blank"
          rel="noopener"
          class="flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium"
          style="background:var(--color-surface-2);color:var(--color-text-secondary);border:1px solid var(--color-border);"
        >
          Maps ↗
        </a>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
@media (min-width: 768px) {
  .slide-up-enter-from, .slide-up-leave-to { transform: translateY(0) scale(0.95); }
}
</style>
