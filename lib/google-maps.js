import { Loader } from '@googlemaps/js-api-loader'

// Singleton Maps loader — see docs/ARCHITECTURE.md#map-instance-lifecycle
// and docs/API_INTEGRATIONS.md#google-maps-javascript-api
//
// Call getGoogleMaps() inside onMounted() in MapCanvas.vue only.
// Never call at module level or in server-side code.

let loader = null
let googleMaps = null

export async function getGoogleMaps() {
  if (googleMaps) return googleMaps

  if (!loader) {
    const { public: { googleMapsApiKey } } = useRuntimeConfig()
    loader = new Loader({
      apiKey: googleMapsApiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    })
  }

  await loader.load()
  googleMaps = google.maps
  return googleMaps
}
