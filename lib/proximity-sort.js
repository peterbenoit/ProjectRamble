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
  if (!stops.length) return []
  const remaining = [...stops]
  const sorted = []
  let current = origin

  while (remaining.length) {
    let nearestIdx = 0
    let nearestDist = haversineDistance(current, remaining[0].location)

    for (let i = 1; i < remaining.length; i++) {
      const d = haversineDistance(current, remaining[i].location)
      if (d < nearestDist) {
        nearestDist = d
        nearestIdx = i
      }
    }

    sorted.push(remaining[nearestIdx])
    current = remaining[nearestIdx].location
    remaining.splice(nearestIdx, 1)
  }

  return sorted
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
