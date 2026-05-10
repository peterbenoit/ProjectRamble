<script setup>
// Inline text annotation for a stop — Feature 8
// See docs/FEATURES_V1.md#feature-8
//
// Behavior:
//   - "Add note" tap reveals textarea (max 280 chars)
//   - Saves immediately on input (no save button)
//   - Note is included in share URL and shown in read-only share view

import { useItineraryStore } from '../../stores/itinerary.store.js'

const props = defineProps({
  stopId: { type: String, required: true },
  note: { type: String, default: '' },
})

const store = useItineraryStore()
const isExpanded = ref(!!props.note)
const localNote = ref(props.note)

function onInput() {
  store.updateFieldNote(props.stopId, localNote.value)
}
</script>

<template>
  <div>
    <button v-if="!isExpanded" @click="isExpanded = true" class="text-sm text-accent">
      + Add note
    </button>
    <textarea
      v-else
      v-model="localNote"
      maxlength="280"
      rows="2"
      class="w-full bg-surface text-white text-sm rounded p-2 resize-none"
      placeholder="Add a note…"
      @input="onInput"
    />
  </div>
</template>
