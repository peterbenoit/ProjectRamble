// Proxies Google Places Details (New API)
// See docs/API_INTEGRATIONS.md#server-route-place-details
// Query param: ?placeId=ChI...

import { normalizePlacesResult } from '~/lib/places.js'

export default defineEventHandler(async (event) => {
  const { placeId } = getQuery(event)

  if (!placeId) {
    throw createError({ statusCode: 400, statusMessage: 'placeId is required' })
  }

  const apiKey = useRuntimeConfig().googlePlacesApiKey

  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'id,displayName,formattedAddress,location,rating,userRatingCount,' +
        'primaryType,currentOpeningHours,regularOpeningHours,websiteUri,nationalPhoneNumber',
    },
  })

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Places API error' })
  }

  const raw = await response.json()
  return normalizePlacesResult(raw)
})
