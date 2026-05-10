// Nearest-neighbor sort for itinerary stops.
// See docs/ARCHITECTURE.md#itinerary-persistence and docs/FEATURES_V1.md#feature-7

/**
 * Sorts stops using a nearest-neighbor greedy algorithm starting from origin.
 * Does not mutate the input array.
 *
 * @param {import('./types').ItineraryStop[]} stops
 * @param {{ lat: number, lng: number }} origin - User's current location
 * @returns {import('./types').ItineraryStop[]}
 */
export function sortByProximity(stops, origin) {
  // TODO: implement nearest-neighbor sort
  // 1. Start from origin
  // 2. At each step, pick the unvisited stop closest to the current position
  // 3. Repeat until all stops are visited
  // Use haversineDistance() below for distance calculation
  return [...stops]
}

/**
 * Haversine distance in miles between two lat/lng points.
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number}
 */
export function haversineDistance(a, b) {
  const R = 3958.8 // Earth radius in miles
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(h))
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}
