<script setup>
// Google Places Autocomplete search overlay — Feature 6
// See docs/FEATURES_V1.md#feature-6 and docs/API_INTEGRATIONS.md#server-route-autocomplete

import { useMapStore } from '../../stores/map.store.js'
import { usePOISearch } from '../../composables/usePOISearch.js'

const mapStore = useMapStore()
const { searchNearby } = usePOISearch()

const query = ref('')
const suggestions = ref([])
const sessionToken = ref('')
const isOpen = ref(false)
const inputEl = ref(null)

let debounceTimer = null

function onFocus() {
  sessionToken.value = crypto.randomUUID()
  isOpen.value = true
}

function onBlur() {
  // Delay close so click on suggestion registers first
  setTimeout(() => { isOpen.value = false }, 150)
}

function onClear() {
  query.value = ''
  suggestions.value = []
  isOpen.value = false
  inputEl.value?.focus()
}

async function fetchSuggestions(input) {
  if (input.length < 2) { suggestions.value = []; return }
  const locationBias = mapStore.center
  try {
    const data = await $fetch('/api/places/autocomplete', {
      method: 'POST',
      body: { input, sessionToken: sessionToken.value, locationBias },
    })
    suggestions.value = data.suggestions ?? []
  } catch {
    suggestions.value = []
  }
}

watch(query, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchSuggestions(val), 300)
})

async function selectSuggestion(s) {
  query.value = s.text
  suggestions.value = []
  isOpen.value = false

  if (!s.placeId) return

  try {
    const place = await $fetch(`/api/places/details?placeId=${s.placeId}`)
    if (place?.location) {
      mapStore.map?.panTo(place.location)
      mapStore.map?.setZoom(14)
      await searchNearby(place.location)
    }
  } catch { /* swallow — map remains functional */ }
}
</script>

<template>
  <div class="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-10">
    <div class="relative flex items-center rounded-2xl shadow-lg"
      style="background:var(--color-surface);border:1px solid var(--color-border);">
      <!-- Search icon -->
      <svg class="absolute left-3 shrink-0 w-4 h-4" style="color:var(--color-text-muted);"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>

      <input
        ref="inputEl"
        v-model="query"
        type="text"
        placeholder="Search places…"
        class="w-full py-3 pl-9 pr-9 text-sm bg-transparent outline-none"
        style="color:var(--color-text-primary);"
        autocomplete="off"
        @focus="onFocus"
        @blur="onBlur"
      />

      <!-- Clear button -->
      <button
        v-if="query"
        class="absolute right-3 flex items-center justify-center w-5 h-5 rounded-full"
        style="background:var(--color-surface-2);"
        @click="onClear"
      >
        <svg class="w-3 h-3" style="color:var(--color-text-secondary);"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Suggestions dropdown -->
    <ul
      v-if="isOpen && suggestions.length"
      class="mt-1 rounded-2xl overflow-hidden shadow-lg"
      style="background:var(--color-surface);border:1px solid var(--color-border);"
    >
      <li
        v-for="s in suggestions"
        :key="s.placeId"
        class="flex flex-col px-4 py-3 cursor-pointer text-sm"
        style="border-bottom:1px solid var(--color-border);"
        @mousedown.prevent="selectSuggestion(s)"
      >
        <span style="color:var(--color-text-primary);">{{ s.text }}</span>
        <span class="text-xs" style="color:var(--color-text-muted);">{{ s.secondaryText }}</span>
      </li>
    </ul>
  </div>
</template>
