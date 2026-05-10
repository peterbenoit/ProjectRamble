<script setup>
// Slide-up itinerary drawer + floating action button — Features 7, 9, 10
// See docs/FEATURES_V1.md#feature-7, #feature-9, #feature-10

import { useItinerary } from '../../composables/useItinerary.js'
import { useItineraryStore } from '../../stores/itinerary.store.js'
import { useLocation } from '../../composables/useLocation.js'

const store = useItineraryStore()
const { stops, stopCount, isDrawerOpen, sortByProximity, getShareUrl, openInGoogleMaps } = useItinerary()
const { coords } = useLocation()

async function handleShare() {
  const url = getShareUrl()
  const full = window.location.origin + url
  try {
    await navigator.clipboard.writeText(full)
    // Simple visual feedback — replace with Sonner toast when configured
    alert('Link copied!')
  } catch {
    prompt('Copy this link:', full)
  }
}

function handleSort() {
  if (!coords.value) return
  sortByProximity(coords.value)
}
</script>

<template>
  <!-- FAB -->
  <button
    class="absolute bottom-6 right-6 z-20 h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
    style="background:var(--color-accent);"
    @click="store.toggleDrawer()"
  >
    <!-- List icon -->
    <svg class="w-6 h-6" style="color:white;" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
    <!-- Stop count badge -->
    <span
      v-if="stopCount > 0"
      class="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
      style="background:var(--color-error);color:white;"
    >
      {{ stopCount }}
    </span>
  </button>

  <!-- Drawer overlay -->
  <Transition name="fade">
    <div
      v-if="isDrawerOpen"
      class="absolute inset-0 z-30"
      style="background:rgba(0,0,0,0.5);"
      @click="store.toggleDrawer()"
    />
  </Transition>

  <!-- Drawer panel -->
  <Transition name="slide-up">
    <div
      v-if="isDrawerOpen"
      class="absolute bottom-0 left-0 right-0 z-40 rounded-t-2xl flex flex-col"
      style="background:var(--color-surface);max-height:80dvh;"
    >
      <!-- Handle -->
      <div class="flex justify-center pt-3 pb-1">
        <div class="w-10 h-1 rounded-full" style="background:var(--color-border);"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3">
        <h2 class="text-base font-semibold" style="color:var(--color-text-primary);">
          Itinerary
          <span v-if="stopCount" class="ml-1 text-sm font-normal" style="color:var(--color-text-muted);">{{ stopCount }} stop{{ stopCount > 1 ? 's' : '' }}</span>
        </h2>
        <button @click="store.toggleDrawer()" style="color:var(--color-text-muted);">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Stop list -->
      <div class="flex-1 overflow-y-auto px-4 pb-2">
        <StopList />
      </div>

      <!-- Actions -->
      <div v-if="stopCount > 0" class="flex gap-2 px-4 py-3"
        style="border-top:1px solid var(--color-border);">
        <button
          class="flex-1 py-2.5 rounded-xl text-sm font-medium"
          style="background:var(--color-surface-2);color:var(--color-text-secondary);border:1px solid var(--color-border);"
          @click="handleSort"
        >
          Sort by proximity
        </button>
        <button
          class="flex-1 py-2.5 rounded-xl text-sm font-medium"
          style="background:var(--color-surface-2);color:var(--color-text-secondary);border:1px solid var(--color-border);"
          @click="handleShare"
        >
          Share
        </button>
        <button
          class="flex-1 py-2.5 rounded-xl text-sm font-medium"
          style="background:var(--color-accent);color:white;"
          @click="openInGoogleMaps"
        >
          Navigate
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
