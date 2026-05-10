// localStorage helpers — see docs/ARCHITECTURE.md#itinerary-persistence
// and docs/DATA_SCHEMA.md#localstorage-keys

const ITINERARY_KEY = 'pathweaver_itinerary'

/**
 * Reads the persisted itinerary from localStorage.
 * Returns an empty array if nothing is stored or parsing fails.
 * @returns {import('./types').ItineraryStop[]}
 */
export function loadItinerary() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ITINERARY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Persists the itinerary to localStorage.
 * @param {import('./types').ItineraryStop[]} stops
 */
export function saveItinerary(stops) {
  try {
    localStorage.setItem(ITINERARY_KEY, JSON.stringify(stops))
  } catch {
    // Storage quota exceeded or private mode — fail silently
  }
}

/**
 * Clears the persisted itinerary.
 */
export function clearItinerary() {
  localStorage.removeItem(ITINERARY_KEY)
}
