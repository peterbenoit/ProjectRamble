<script setup>
// Renders the user's current location as a pulsing blue dot — Feature 2
// See docs/FEATURES_V1.md#feature-2

import { useMapStore } from '../../stores/map.store.js'
import { useLocation } from '../../composables/useLocation.js'

const mapStore = useMapStore()
const { coords, showPermissionModal, requestPermission } = useLocation()

let locationMarker = null

async function placeMarker(position) {
  if (!mapStore.map) return

  const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker')

  const dot = document.createElement('div')
  dot.innerHTML = `
    <div style="position:relative;width:20px;height:20px;">
      <div class="location-pulse" style="
        position:absolute;inset:0;border-radius:50%;
        background:var(--color-location);opacity:0.3;
        animation:pulse 2s ease-out infinite;
      "></div>
      <div style="
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        width:10px;height:10px;border-radius:50%;
        background:var(--color-location);
        border:2px solid white;
        box-shadow:0 0 6px rgba(96,165,250,0.6);
      "></div>
    </div>
  `

  if (locationMarker) locationMarker.map = null

  locationMarker = new AdvancedMarkerElement({
    map: mapStore.map,
    position,
    content: dot,
    zIndex: 999,
  })

  // Pan map to user location on first fix
  mapStore.map.panTo(position)
  if (mapStore.zoom < 12) mapStore.map.setZoom(12)
}

watch(
  () => coords.value,
  (pos) => { if (pos) placeMarker(pos) },
  { immediate: true },
)

watch(() => mapStore.map, (map) => {
  if (map && coords.value) placeMarker(coords.value)
})

onUnmounted(() => { if (locationMarker) locationMarker.map = null })
</script>

<template>
  <!-- Renders imperatively via Google Maps API — no DOM output -->

  <!-- Location permission modal -->
  <Teleport to="body">
    <div
      v-if="showPermissionModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style="background:rgba(0,0,0,0.6);"
    >
      <div class="w-full max-w-sm rounded-2xl p-6"
        style="background:var(--color-surface);border:1px solid var(--color-border);">
        <h2 class="text-base font-semibold mb-2" style="color:var(--color-text-primary);">Use your location?</h2>
        <p class="text-sm mb-4" style="color:var(--color-text-secondary);">
          PathWeaver works best centered on where you are. Your location is never stored or shared.
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style="background:var(--color-accent);color:white;"
            @click="requestPermission"
          >
            Allow
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style="background:var(--color-surface-2);color:var(--color-text-secondary);border:1px solid var(--color-border);"
            @click="showPermissionModal = false"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
@keyframes pulse {
  0%   { transform: scale(1); opacity: 0.3; }
  70%  { transform: scale(2.5); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
</style>
