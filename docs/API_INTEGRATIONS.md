# API Integrations — PathWeaver V1

---

## Google Maps JavaScript API

**Used for:** Rendering the map canvas, handling map events, rendering Polyline overlays
for byways, rendering markers for POIs and user location.

**Loaded client-side only** via `@googlemaps/js-api-loader` as a singleton.

### lib/google-maps.js

```js
import { Loader } from '@googlemaps/js-api-loader'

let loader = null
let googleMaps = null

export async function getGoogleMaps() {
  if (googleMaps) return googleMaps

  if (!loader) {
    loader = new Loader({
      apiKey: useRuntimeConfig().public.googleMapsApiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    })
  }

  await loader.load()
  googleMaps = google.maps
  return googleMaps
}
```

Call `getGoogleMaps()` inside `onMounted` in `MapCanvas.vue`. Never call it at module level
or in server-side code.

### Required Google Cloud APIs

Enable all of the following in your Google Cloud project:

- Maps JavaScript API
- Places API (New) — or legacy Places API; see note below
- Geocoding API

### Maps style

The map uses a custom dark style JSON. Store this in `lib/map-style.js` and pass it to the
`Map` constructor as the `styles` option. See UI_DESIGN.md for the style specification.

---

## Google Places API (server-side proxy)

**All Places API calls are proxied through Nuxt server routes.** The browser never calls
Google Places directly. This keeps `GOOGLE_PLACES_API_KEY` off the client.

### Places API version note

Use the **Places API (New)** endpoints (`/v1/places:searchNearby`, `/v1/places/[id]`,
`/v1/places:autocomplete`). These are the current recommended endpoints as of 2024.
The legacy endpoints (`/maps/api/place/nearbysearch`) still work but are deprecated.

### Server route: Nearby Search

**File:** `server/api/places/nearby.post.js`

**Client calls:** `POST /api/places/nearby`

**Request body:**
```json
{
  "coordinates": { "lat": 27.99, "lng": -81.76 },
  "radiusMeters": 16093,
  "types": ["park", "natural_feature", "campground"]
}
```

**Response:** Array of normalized POI objects (see DATA_SCHEMA.md)

**Implementation:**
```js
export default defineEventHandler(async (event) => {
  const { coordinates, radiusMeters = 16093, types = ['park', 'natural_feature', 'campground'] } =
    await readBody(event)

  const response = await fetch(
    'https://places.googleapis.com/v1/places:searchNearby',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.primaryType,places.currentOpeningHours,places.websiteUri,places.nationalPhoneNumber',
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
    }
  )

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Places API error' })
  }

  const data = await response.json()
  return (data.places ?? []).map(normalizePlacesResult)
})
```

Write `normalizePlacesResult` in `lib/places.js` to convert the raw API response to the
POI shape defined in DATA_SCHEMA.md.

---

### Server route: Place Details

**File:** `server/api/places/details.get.js`

**Client calls:** `GET /api/places/details?placeId=[id]`

**Response:** Single POI object with full detail fields populated

**Implementation:** Call `https://places.googleapis.com/v1/places/[placeId]` with the
appropriate field mask. Use a broader field mask than Nearby Search to include opening hours,
website, and phone number.

---

### Server route: Autocomplete

**File:** `server/api/places/autocomplete.post.js`

**Client calls:** `POST /api/places/autocomplete`

**Request body:**
```json
{
  "input": "blue spring",
  "sessionToken": "uuid-here",
  "locationBias": { "lat": 27.99, "lng": -81.76 }
}
```

**Response:**
```json
{
  "suggestions": [
    { "placeId": "ChI...", "text": "Blue Spring State Park", "secondaryText": "Florida, United States" }
  ]
}
```

**Implementation:** Call `https://places.googleapis.com/v1/places:autocomplete`. Restrict
results to the US using `includedRegionCodes: ['us']`.

**Session token note:** Generate a new UUID at the start of each autocomplete session
(when the user focuses the input). Pass the same token for all autocomplete requests in
that session, then pass it with the final Details request. This groups the session for
billing purposes and reduces cost.

---

### Server route: IP Geolocation

**File:** `server/api/geocode/ip.get.js`

**Client calls:** `GET /api/geocode/ip`

**Purpose:** Returns an approximate location for the requesting IP address. Used to give the
map a plausible initial center before browser geolocation resolves.

```js
export default defineEventHandler(async (event) => {
  const ip =
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getHeader(event, 'x-real-ip') ||
    '8.8.8.8'

  const response = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,status`)
  const data = await response.json()

  if (data.status !== 'success') {
    return { lat: 27.9944024, lng: -81.7602544 }  // Florida center default
  }

  return { lat: data.lat, lng: data.lon }
})
```

ip-api.com allows 1,500 requests/minute on the free tier with no API key.

---

## Environment variables

```bash
# .env

# Exposed to the browser via useRuntimeConfig().public
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Server-only. Never exposed to the browser.
GOOGLE_PLACES_API_KEY=AIza...
```

Configure in `nuxt.config.js`:

```js
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
})
```

### Vercel environment setup

1. Go to your Vercel project → Settings → Environment Variables
2. Add both variables to Production, Preview, and Development environments
3. `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY`: set as "Plain Text" with referrer restriction
4. `GOOGLE_PLACES_API_KEY`: set as "Sensitive" (Vercel will hide it from logs)

---

## Google Cloud Console setup checklist

- [ ] Create a new Google Cloud project (or use existing)
- [ ] Enable Maps JavaScript API
- [ ] Enable Places API (New)
- [ ] Enable Geocoding API
- [ ] Create API key #1 for the browser:
  - Application restrictions: HTTP referrers
  - Add `localhost:3000/*` (development)
  - Add `pathweaver.app/*` (production — update to actual domain)
  - API restrictions: Maps JavaScript API only
- [ ] Create API key #2 for the server:
  - Application restrictions: IP addresses
  - Add your Vercel server IPs (or leave unrestricted during development, restrict before launch)
  - API restrictions: Places API (New), Geocoding API

---

## Rate limits and cost notes

- Google Maps JavaScript API: priced per map load (first $200/month free)
- Places Nearby Search: $32 per 1,000 requests (first $200/month free)
- Places Autocomplete: $2.83 per 1,000 requests (first $200/month free)
- IP geolocation (ip-api.com): free up to 1,500/min, no key required

To control costs in production:
- Cache Nearby Search results client-side for 24 hours (same area does not re-fetch)
- Use autocomplete session tokens to group billing
- Consider setting a budget alert in Google Cloud Console

---

## Static data: byways GeoJSON

The byway data is loaded from `data/byways/` as static files. No API call is made.

```js
// data/byways/index.js

const bywayCache = {}

export async function loadByways(state = 'florida') {
  if (bywayCache[state]) return bywayCache[state]
  const data = await import(`./${state}.geojson`)
  bywayCache[state] = data.default
  return data.default
}

export function getAllSupportedStates() {
  return ['florida']
}
```

GeoJSON imports require `json` handling in the Vite/Nuxt build (enabled by default in Nuxt 3).
