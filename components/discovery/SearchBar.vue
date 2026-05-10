<script setup>
// Google Places Autocomplete search overlay — Feature 6
// See docs/FEATURES_V1.md#feature-6 and docs/API_INTEGRATIONS.md#server-route-autocomplete
//
// Rules:
//   - Search input floats over the map (absolute positioned)
//   - Calls /api/places/autocomplete after 2+ characters (debounced ~300ms)
//   - Selecting a suggestion re-centers the map and triggers POI search
//   - Generate a new sessionToken UUID on input focus
//   - On mobile: prevent keyboard from resizing the map (100dvh layout)

import { useMapStore } from '../../stores/map.store.js'
import { usePOISearch } from '../../composables/usePOISearch.js'

const mapStore = useMapStore()
const { searchNearby } = usePOISearch()

const query = ref('')
const suggestions = ref([])
const sessionToken = ref('')

// TODO: generate sessionToken on focus (crypto.randomUUID())
// TODO: debounce watcher on query — call /api/places/autocomplete
// TODO: on suggestion select — fetch place details, re-center map, searchNearby
// TODO: on clear — reset suggestions and return to current location
</script>

<template>
  <!-- TODO: floating search input + suggestions dropdown -->
  <div class="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-10">
    <!-- SearchBar UI goes here -->
  </div>
</template>
