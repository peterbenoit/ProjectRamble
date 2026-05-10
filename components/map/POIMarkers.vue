<script setup>
// Renders POI markers from discovery results — Feature 3
// See docs/FEATURES_V1.md#feature-3 and docs/UI_DESIGN.md for marker styles

import { useMapStore } from '../../stores/map.store.js'
import { useDiscoveryStore } from '../../stores/discovery.store.js'

const mapStore = useMapStore()
const discoveryStore = useDiscoveryStore()

/** @type {google.maps.marker.AdvancedMarkerElement[]} */
let markers = []

function clearMarkers() {
  markers.forEach((m) => { m.map = null })
  markers = []
}

async function renderMarkers(pois) {
  if (!mapStore.map || !pois.length) { clearMarkers(); return }

  const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker')
  clearMarkers()

  for (const poi of pois) {
    const pin = document.createElement('div')
    pin.className = 'poi-marker'
    pin.innerHTML = `
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:var(--color-accent);display:flex;
        align-items:center;justify-content:center;
        box-shadow:0 2px 6px rgba(0,0,0,.4);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 8c0 5.5-5 11-5 11S7 13.5 7 8a5 5 0 0 1 10 0z"/>
          <circle cx="12" cy="8" r="2"/>
        </svg>
      </div>
    `

    const marker = new AdvancedMarkerElement({
      map: mapStore.map,
      position: poi.location,
      content: pin,
      title: poi.name,
    })

    marker.addListener('click', () => discoveryStore.selectPOI(poi))
    markers.push(marker)
  }
}

watch(() => discoveryStore.results, (pois) => renderMarkers(pois), { immediate: true })

onUnmounted(() => clearMarkers())
</script>

<template>
  <!-- Renders imperatively via Google Maps API — no DOM output -->
</template>
