// Layered location resolution — see docs/ARCHITECTURE.md#key-patterns
// and docs/FEATURES_V1.md#feature-2
//
// Resolution order:
//   1. Cached browser geolocation (if previously granted)
//   2. IP geolocation via /api/geocode/ip (runs in parallel)
//   3. Permission prompt modal (shown once, after short delay)
//   4. Florida center fallback

export function useLocation() {
  const coords = ref(null)         // { lat, lng } — best available
  const isResolved = ref(false)
  const permissionState = ref('prompt') // 'granted' | 'denied' | 'prompt'

  // TODO: on mount, check navigator.permissions.query({ name: 'geolocation' })
  // TODO: if granted, call navigator.geolocation.getCurrentPosition immediately
  // TODO: in parallel, fetch /api/geocode/ip and set coords as initial estimate
  // TODO: if prompt, show permission modal after 800ms delay (not immediately)
  // TODO: if denied, leave coords at IP-based estimate or Florida center
  // TODO: expose a requestPermission() for the modal confirm button

  return {
    coords,
    isResolved,
    permissionState,
  }
}
