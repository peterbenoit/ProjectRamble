// Proxies Google Places Autocomplete (New API)
// See docs/API_INTEGRATIONS.md#server-route-autocomplete
// Request body: { input, sessionToken, locationBias? }

export default defineEventHandler(async (event) => {
  const { input, sessionToken, locationBias } = await readBody(event)

  if (!input || !sessionToken) {
    throw createError({ statusCode: 400, statusMessage: 'input and sessionToken are required' })
  }

  const apiKey = useRuntimeConfig().googlePlacesApiKey

  const body = {
    input,
    sessionToken,
    includedRegionCodes: ['us'],
  }

  if (locationBias) {
    body.locationBias = {
      circle: {
        center: { latitude: locationBias.lat, longitude: locationBias.lng },
        radius: 50000,
      },
    }
  }

  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Places API error' })
  }

  const data = await response.json()

  return {
    suggestions: (data.suggestions ?? []).map((s) => ({
      placeId: s.placePrediction?.placeId,
      text: s.placePrediction?.structuredFormat?.mainText?.text,
      secondaryText: s.placePrediction?.structuredFormat?.secondaryText?.text,
    })),
  }
})
