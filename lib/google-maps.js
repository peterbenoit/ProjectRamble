import { Loader } from '@googlemaps/js-api-loader'

// Singleton Maps loader — see docs/ARCHITECTURE.md#map-instance-lifecycle
// and docs/API_INTEGRATIONS.md#google-maps-javascript-api
//
// Call getGoogleMaps() inside onMounted() in MapCanvas.vue only.
// Never call at module level or in server-side code.

let loader = null
let googleNamespace = null

export async function getGoogleMaps() {
  if (googleNamespace) return googleNamespace

  if (!loader) {
    const { public: { googleMapsApiKey } } = useRuntimeConfig()
    if (!googleMapsApiKey) {
      throw new Error('NUXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured')
    }

    loader = new Loader({
      apiKey: googleMapsApiKey,
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker'],
    })
  }

  await loader.load()
  googleNamespace = window.google
  return googleNamespace
}
