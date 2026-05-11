// Proxies Google Places Nearby Search (New API)
// See docs/API_INTEGRATIONS.md#server-route-nearby-search
// Request body: { coordinates: { lat, lng }, radiusMeters?, types? }

import { normalizePlacesResult } from '~/lib/places.js'

export default defineEventHandler(async (event) => {
  const { coordinates, radiusMeters = 16093, types = ['park', 'natural_feature', 'campground'] } =
    await readBody(event)

  const apiKey = useRuntimeConfig().googlePlacesApiKey

  if (
    !coordinates ||
    typeof coordinates.lat !== 'number' ||
    typeof coordinates.lng !== 'number' ||
    !isFinite(coordinates.lat) ||
    !isFinite(coordinates.lng)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'coordinates.lat and coordinates.lng must be finite numbers' })
  }

  const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,' +
        'places.rating,places.userRatingCount,places.primaryType,' +
        'places.currentOpeningHours,places.websiteUri,places.nationalPhoneNumber',
    },
    body: JSON.stringify({
      includedTypes: types,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: coordinates.lat, longitude: coordinates.lng },
          radius: radiusMeters,
        },
      },
    }),
  })

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Places API error' })
  }

  const data = await response.json()
  return (data.places ?? []).map(normalizePlacesResult)
})
