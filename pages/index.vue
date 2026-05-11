<script setup>
// Main map view — full-screen map + UI chrome
// See docs/FEATURES_V1.md (Features 1–4, 6, 7) and docs/ARCHITECTURE.md

import MapCanvas from '../components/map/MapCanvas.vue'
import BywayLayer from '../components/map/BywayLayer.vue'
import POIMarkers from '../components/map/POIMarkers.vue'
import UserLocation from '../components/map/UserLocation.vue'
import DiscoverySearchBar from '../components/discovery/SearchBar.vue'
import DiscoveryPOICard from '../components/discovery/POICard.vue'
import ItineraryDrawer from '../components/itinerary/ItineraryDrawer.vue'

useHead({
  title: 'PathWeaver',
  meta: [
    { name: 'description', content: 'Discover scenic routes and plan multi-stop trips' },
    { name: 'theme-color', content: '#020617' },
  ],
})
</script>

<template>
  <div class="relative h-dvh w-full overflow-hidden bg-surface">
    <!-- Full-screen map canvas — Feature 1 -->
    <MapCanvas />

    <!-- Byway polyline overlay — Feature 4 -->
    <BywayLayer />

    <!-- POI markers — Feature 3 -->
    <POIMarkers />

    <!-- User location dot — Feature 2 -->
    <UserLocation />

    <!-- Search bar overlay — Feature 6 -->
    <DiscoverySearchBar />

    <!-- POI / Byway info card — Feature 5 -->
    <DiscoveryPOICard />

    <!-- Itinerary drawer FAB + slide-up panel — Features 7, 8, 9, 10 -->
    <ItineraryDrawer />
  </div>
</template>
