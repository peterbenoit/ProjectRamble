<script setup>
// Read-only shared itinerary view — Feature 9
// See docs/FEATURES_V1.md#feature-9

import { decodeItinerary } from '../../lib/url-encoding.js'

const route = useRoute()

const stops = ref([])
const decodeError = ref(false)

onMounted(() => {
  try {
    const decoded = decodeItinerary(route.params.encoded)
    if (Array.isArray(decoded)) {
      stops.value = decoded
    } else {
      decodeError.value = true
    }
  } catch {
    decodeError.value = true
  }
})

useHead({
  title: computed(() =>
    stops.value.length
      ? `Itinerary — ${stops.value.length} stop${stops.value.length !== 1 ? 's' : ''} — PathWeaver`
      : 'Shared Itinerary — PathWeaver'
  ),
})
</script>

<template>
  <div
    class="min-h-dvh flex flex-col"
    style="background:var(--color-bg);color:var(--color-text-primary);"
  >
    <!-- Header -->
    <header
      class="flex items-center gap-3 px-4 py-4 border-b"
      style="border-color:var(--color-border);"
    >
      <NuxtLink to="/" class="text-sm" style="color:var(--color-accent);">← Map</NuxtLink>
      <h1 class="text-base font-semibold">Shared Itinerary</h1>
    </header>

    <!-- Error state -->
    <div v-if="decodeError" class="flex flex-col items-center justify-center flex-1 px-6 text-center">
      <svg class="w-12 h-12 mb-4" style="color:var(--color-text-muted);"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p class="text-base font-medium mb-1" style="color:var(--color-text-primary);">Link is invalid or expired</p>
      <p class="text-sm" style="color:var(--color-text-secondary);">This URL could not be decoded. The link may be incomplete or corrupted.</p>
      <NuxtLink
        to="/"
        class="mt-6 px-5 py-2.5 rounded-xl text-sm font-medium"
        style="background:var(--color-accent);color:white;"
      >
        Open PathWeaver
      </NuxtLink>
    </div>

    <!-- Stop list -->
    <main v-else class="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
      <p class="text-sm mb-4" style="color:var(--color-text-secondary);">
        {{ stops.length }} stop{{ stops.length !== 1 ? 's' : '' }}
      </p>

      <ol class="flex flex-col gap-3">
        <li
          v-for="(stop, i) in stops"
          :key="stop.id"
          class="flex items-start gap-3 p-4 rounded-2xl"
          style="background:var(--color-surface);border:1px solid var(--color-border);"
        >
          <!-- Number badge -->
          <div
            class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
            style="background:var(--color-accent);color:white;"
          >
            {{ i + 1 }}
          </div>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm" style="color:var(--color-text-primary);">{{ stop.name }}</p>
            <p v-if="stop.address" class="text-xs mt-0.5 truncate" style="color:var(--color-text-muted);">{{ stop.address }}</p>
            <p
              v-if="stop.fieldNote"
              class="text-xs mt-1.5 italic"
              style="color:var(--color-text-secondary);"
            >
              {{ stop.fieldNote }}
            </p>
          </div>

          <!-- Open in Maps -->
          <a
            v-if="stop.location"
            :href="`https://www.google.com/maps/search/?api=1&query=${stop.location.lat},${stop.location.lng}`"
            target="_blank"
            rel="noopener"
            class="shrink-0 p-1.5 rounded-lg mt-0.5"
            style="color:var(--color-accent);"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </li>
      </ol>

      <!-- Navigate all CTA -->
      <a
        v-if="stops.length > 1"
        :href="`https://www.google.com/maps/dir/${stops.map(s => `${s.location.lat},${s.location.lng}`).join('/')}`"
        target="_blank"
        rel="noopener"
        class="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium"
        style="background:var(--color-accent);color:white;"
      >
        Open full route in Google Maps ↗
      </a>
    </main>
  </div>
</template>
