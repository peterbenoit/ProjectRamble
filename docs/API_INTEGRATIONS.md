# API Integrations — PathWeaver V1

---

## Google Maps JavaScript API

**Used for:** Rendering the map canvas, handling map events, rendering Polyline overlays
for byways, rendering markers for POIs and user location.

**Loaded client-side only** via `@googlemaps/js-api-loader` as a singleton.

### lib/google-maps.ts

```typescript
import { Loader } from '@googlemaps/js-api-loader';

let loader: Loader | null = null;
let googleMaps: typeof google.maps | null = null;

export async function getGoogleMaps(): Promise<typeof google.maps> {
  if (googleMaps) return googleMaps;

  if (!loader) {
    loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }

  await loader.load();
  googleMaps = google.maps;
  return googleMaps;
}
```

Call `getGoogleMaps()` inside `useEffect` in `MapCanvas.tsx`. Never call it at module level
or in server components.

### Required Google Cloud APIs

Enable all of the following in your Google Cloud project:

- Maps JavaScript API
- Places API (New) — or legacy Places API; see note below
- Geocoding API

### Maps style

The map uses a custom dark style JSON. Store this in `lib/map-style.ts` and pass it to the
`Map` constructor as the `styles` option. See UI_DESIGN.md for the style specification.

---

## Google Places API (server-side proxy)

**All Places API calls are proxied through Next.js Route Handlers.** The browser never calls
Google Places directly. This keeps `GOOGLE_PLACES_API_KEY` off the client.

### Places API version note

Use the **Places API (New)** endpoints (`/v1/places:searchNearby`, `/v1/places/[id]`,
`/v1/places:autocomplete`). These are the current recommended endpoints as of 2024.
The legacy endpoints (`/maps/api/place/nearbysearch`) still work but are deprecated.

### Route Handler: Nearby Search

**File:** `app/api/places/nearby/route.ts`

**Client calls:** `POST /api/places/nearby`

**Request body:**
```typescript
{
  coordinates: { lat: number; lng: number };
  radiusMeters?: number;   // Default: 16093 (10 miles)
  types?: string[];        // Default: ["park", "natural_feature", "campground"]
}
```

**Response:** Array of normalized `POI` objects (see DATA_SCHEMA.md)

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { coordinates, radiusMeters = 16093, types = ['park', 'natural_feature', 'campground'] } =
    await req.json();

  const response = await fetch(
    'https://places.googleapis.com/v1/places:searchNearby',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
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
  );

  if (!response.ok) {
    return NextResponse.json({ error: 'Places API error' }, { status: 502 });
  }

  const data = await response.json();
  const pois = (data.places ?? []).map(normalizePlacesResult);
  return NextResponse.json(pois);
}
```

Write `normalizePlacesResult` in `lib/places.ts` to convert the raw API response to the
`POI` interface defined in DATA_SCHEMA.md.

---

### Route Handler: Place Details

**File:** `app/api/places/details/route.ts`

**Client calls:** `GET /api/places/details?placeId=[id]`

**Response:** Single `POI` object with full detail fields populated

**Implementation:** Call `https://places.googleapis.com/v1/places/[placeId]` with the
appropriate field mask. Use a broader field mask than Nearby Search to include opening hours,
website, and phone number.

---

### Route Handler: Autocomplete

**File:** `app/api/places/autocomplete/route.ts`

**Client calls:** `POST /api/places/autocomplete`

**Request body:**
```typescript
{
  input: string;
  sessionToken: string;    // UUID, generated per search session in the client
  locationBias?: {         // Optional bias toward user's current location
    lat: number;
    lng: number;
  };
}
```

**Response:**
```typescript
{
  suggestions: Array<{
    placeId: string;
    text: string;              // Primary display text
    secondaryText?: string;    // e.g., "Florida, United States"
  }>;
}
```

**Implementation:** Call `https://places.googleapis.com/v1/places:autocomplete`. Restrict
results to the US using `includedRegionCodes: ['us']`.

**Session token note:** Generate a new UUID at the start of each autocomplete session
(when the user focuses the input). Pass the same token for all autocomplete requests in
that session, then pass it with the final Details request. This groups the session for
billing purposes and reduces cost.

---

### Route Handler: IP Geolocation

**File:** `app/api/geocode/ip/route.ts`

**Client calls:** `GET /api/geocode/ip`

**Purpose:** Returns an approximate location for the requesting IP address. Used to give the
map a plausible initial center before browser geolocation resolves.

**Implementation options (choose one):**

Option A — Use a free IP geolocation service. [ip-api.com](https://ip-api.com/json) allows
1,500 requests/minute on the free tier with no API key. Call it from the Route Handler, not
from the client.

```typescript
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? '8.8.8.8';  // Fallback

  const response = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,status`);
  const data = await response.json();

  if (data.status !== 'success') {
    // Return Florida center as default
    return NextResponse.json({ lat: 27.9944024, lng: -81.7602544 });
  }

  return NextResponse.json({ lat: data.lat, lng: data.lon });
}
```

Option B — Use the Vercel Edge Runtime's `geo` object (available on Vercel Pro). More
reliable but requires a paid Vercel plan.

---

## Environment variables

```bash
# .env.local

# Exposed to the browser. Restrict to your domain(s) in Google Cloud Console.
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Never exposed to the browser. Restrict to server IP in Google Cloud Console.
GOOGLE_PLACES_API_KEY=AIza...
```

You can use two separate API keys (recommended) or one key with both referrer and IP
restrictions. If using one key, use it for both variables.

### Vercel environment setup

1. Go to your Vercel project → Settings → Environment Variables
2. Add both variables to Production, Preview, and Development environments
3. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: set as "Plain Text" with referrer restriction
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

```typescript
// data/byways/index.ts

import type { FeatureCollection } from 'geojson';
import type { BywayProperties } from '@/types';

const SUPPORTED_STATES = ['florida'] as const;
type SupportedState = typeof SUPPORTED_STATES[number];

const bywayCache: Partial<Record<SupportedState, FeatureCollection>> = {};

export async function loadByways(state: SupportedState = 'florida'):
  Promise<FeatureCollection<GeoJSON.Geometry, BywayProperties>> {
  if (bywayCache[state]) return bywayCache[state]!;

  const data = await import(`./${state}.geojson`);
  bywayCache[state] = data.default;
  return data.default;
}

export function getAllSupportedStates() {
  return SUPPORTED_STATES;
}
```

GeoJSON imports require `"resolveJsonModule": true` in `tsconfig.json`.
