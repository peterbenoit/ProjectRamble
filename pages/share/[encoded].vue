<script setup>
// Read-only shared itinerary view
// See docs/FEATURES_V1.md#feature-9 and docs/ARCHITECTURE.md#url-encoded-sharing

import { decompressFromEncodedURIComponent } from 'lz-string'

const route = useRoute()

// TODO: decode the URL parameter and parse the stop list
// Use decompressFromEncodedURIComponent(route.params.encoded)
// On failure, set an error state — do not throw
const stops = ref([])
const decodeError = ref(false)

onMounted(() => {
  try {
    const raw = decompressFromEncodedURIComponent(route.params.encoded)
    stops.value = JSON.parse(raw)
  } catch {
    decodeError.value = true
  }
})

useHead({ title: 'Shared Itinerary — PathWeaver' })
</script>

<template>
  <div class="min-h-dvh bg-surface text-white p-4">
    <!-- TODO: render static map with numbered stop markers -->
    <!-- TODO: render stop list (name, address, field notes) -->
    <!-- TODO: render error state when decodeError is true -->
    <div v-if="decodeError">
      <p>This link has expired or is invalid.</p>
    </div>
    <div v-else>
      <pre>{{ stops }}</pre>
    </div>
  </div>
</template>
