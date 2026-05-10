// Normalizes raw Places API (New) responses into the POI shape.
// See docs/DATA_SCHEMA.md#poi and docs/API_INTEGRATIONS.md#server-route-nearby-search

/**
 * @param {Object} raw - Raw place object from Places API (New) /v1/places response
 * @returns {import('./types').POI}
 */
export function normalizePlacesResult(raw) {
  // TODO: implement normalization
  // Fields to map:
  //   raw.id              → poi.id
  //   raw.displayName.text → poi.name
  //   raw.location        → poi.location { lat, lng }
  //   raw.formattedAddress → poi.address
  //   raw.nationalPhoneNumber → poi.phone
  //   raw.websiteUri      → poi.website
  //   raw.rating          → poi.rating
  //   raw.userRatingCount → poi.userRatingsTotal
  //   raw.primaryType     → poi.types[0]
  //   raw.currentOpeningHours?.openNow → poi.openNow
  return {}
}
