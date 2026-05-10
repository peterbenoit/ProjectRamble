// Normalizes raw Places API (New) responses into the POI shape.
// See docs/DATA_SCHEMA.md#poi and docs/API_INTEGRATIONS.md#server-route-nearby-search

/**
 * @param {Object} raw - Raw place object from Places API (New) /v1/places response
 * @returns {import('./types').POI}
 */
export function normalizePlacesResult(raw) {
  return {
    id: raw.id,
    name: raw.displayName?.text,
    location: raw.location
      ? { lat: raw.location.latitude, lng: raw.location.longitude }
      : undefined,
    address: raw.formattedAddress,
    phone: raw.nationalPhoneNumber,
    website: raw.websiteUri,
    rating: raw.rating,
    userRatingsTotal: raw.userRatingCount,
    types: raw.primaryType ? [raw.primaryType] : [],
    openNow: raw.currentOpeningHours?.openNow,
  }
}
