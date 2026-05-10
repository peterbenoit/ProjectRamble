// Layered location resolution — see docs/ARCHITECTURE.md#key-patterns
// and docs/FEATURES_V1.md#feature-2
//
// Resolution order:
//   1. Cached browser geolocation (if previously granted)
//   2. IP geolocation via /api/geocode/ip (runs in parallel)
//   3. Permission prompt modal (shown once, after short delay)
//   4. Florida center fallback

// Layered location resolution — see docs/ARCHITECTURE.md#key-patterns
// and docs/FEATURES_V1.md#feature-2
//
// Resolution order:
//   1. Cached browser geolocation (if previously granted)
//   2. IP geolocation via /api/geocode/ip (runs in parallel)
//   3. Permission prompt modal (shown once, after short delay)
//   4. Florida center fallback

const FLORIDA_CENTER = { lat: 27.9944024, lng: -81.7602544 }

export function useLocation() {
  const coords = ref(null)         // { lat, lng } — best available
  const isResolved = ref(false)
  const permissionState = ref('prompt') // 'granted' | 'denied' | 'prompt'
  const showPermissionModal = ref(false)

  // Fetch IP-based estimate in background; only set if we have no better coords yet
  async function _fetchIPLocation() {
    try {
      const data = await $fetch('/api/geocode/ip')
      if (data?.lat && !isResolved.value) {
        coords.value = { lat: data.lat, lng: data.lng }
      }
    } catch {
      // silently fall through to Florida default
    }
  }

  function _setFromPosition(position) {
    coords.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }
    isResolved.value = true
  }

  async function requestPermission() {
    showPermissionModal.value = false
    if (!('geolocation' in navigator)) {
      if (!coords.value) coords.value = FLORIDA_CENTER
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => { permissionState.value = 'granted'; _setFromPosition(pos) },
      () => { permissionState.value = 'denied'; if (!coords.value) coords.value = FLORIDA_CENTER },
    )
  }

  onMounted(async () => {
    // Kick off IP lookup immediately in parallel
    _fetchIPLocation()

    if (!('geolocation' in navigator)) {
      if (!coords.value) coords.value = FLORIDA_CENTER
      isResolved.value = true
      return
    }

    try {
      const perm = await navigator.permissions.query({ name: 'geolocation' })
      permissionState.value = perm.state

      if (perm.state === 'granted') {
        navigator.geolocation.getCurrentPosition(
          (pos) => _setFromPosition(pos),
          () => { if (!coords.value) coords.value = FLORIDA_CENTER },
        )
      } else if (perm.state === 'prompt') {
        // Show modal after 800ms so the map renders first
        setTimeout(() => { showPermissionModal.value = true }, 800)
      } else {
        // denied — stay with IP coords or Florida
        if (!coords.value) coords.value = FLORIDA_CENTER
        isResolved.value = true
      }
    } catch {
      // Permissions API unavailable (e.g. some iOS versions)
      setTimeout(() => { showPermissionModal.value = true }, 800)
    }
  })

  return {
    coords,
    isResolved,
    permissionState,
    showPermissionModal,
    requestPermission,
  }
}
