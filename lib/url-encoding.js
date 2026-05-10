import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'

// URL-encoded itinerary sharing helpers
// See docs/ARCHITECTURE.md#url-encoded-sharing and docs/FEATURES_V1.md#feature-9

/**
 * Encodes a stop array into a compressed URL-safe string.
 * @param {import('./types').ItineraryStop[]} stops
 * @returns {string}
 */
export function encodeItinerary(stops) {
  return compressToEncodedURIComponent(JSON.stringify(stops))
}

/**
 * Decodes a compressed URL parameter back into a stop array.
 * Returns null if decoding fails.
 * @param {string} encoded
 * @returns {import('./types').ItineraryStop[] | null}
 */
export function decodeItinerary(encoded) {
  try {
    const raw = decompressFromEncodedURIComponent(encoded)
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Builds the full share URL for the current itinerary.
 * @param {import('./types').ItineraryStop[]} stops
 * @returns {string}
 */
export function buildShareUrl(stops) {
  const encoded = encodeItinerary(stops)
  return `/share/${encoded}`
}
