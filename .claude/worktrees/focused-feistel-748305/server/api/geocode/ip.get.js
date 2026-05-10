// IP-based approximate geolocation
// See docs/API_INTEGRATIONS.md#server-route-ip-geolocation
// Returns { lat, lng } — falls back to Florida center on failure

const FLORIDA_CENTER = { lat: 27.9944024, lng: -81.7602544 }

export default defineEventHandler(async (event) => {
  const ip =
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getHeader(event, 'x-real-ip') ||
    '8.8.8.8'

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,status`)
    const data = await response.json()

    if (data.status !== 'success') return FLORIDA_CENTER
    return { lat: data.lat, lng: data.lon }
  } catch {
    return FLORIDA_CENTER
  }
})
