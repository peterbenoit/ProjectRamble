# Development Guide — PathWeaver

## Prerequisites

- Node.js 20+
- A Google Cloud project with Maps JS API and Places API (New) enabled
- Two Google API keys (see `docs/API_INTEGRATIONS.md#google-cloud-console-setup-checklist`)

---

## First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your API keys
cp .env.example .env

# 3. Install shadcn-vue components needed for the UI
npx shadcn-vue@latest add sheet drawer sonner button badge textarea

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Project structure

Every file that needs implementation has a `// TODO:` comment describing exactly what to build.
Read the referenced doc section before implementing — the docs are the source of truth.

```
app.vue                     # Root — just <NuxtPage />
pages/
  index.vue                 # Main map view (assembles all components)
  share/[encoded].vue       # Read-only shared itinerary
server/api/
  places/nearby.post.js     # → POST /api/places/nearby
  places/details.get.js     # → GET  /api/places/details?placeId=
  places/autocomplete.post.js # → POST /api/places/autocomplete
  geocode/ip.get.js         # → GET  /api/geocode/ip
components/
  map/MapCanvas.vue         # Feature 1 — map init
  map/BywayLayer.vue        # Feature 4 — polyline rendering
  map/POIMarkers.vue        # Feature 3 — marker rendering
  map/UserLocation.vue      # Feature 2 — blue dot
  discovery/SearchBar.vue   # Feature 6 — autocomplete search
  discovery/POICard.vue     # Feature 5 — info card
  itinerary/ItineraryDrawer.vue # Features 7, 9, 10
  itinerary/StopList.vue    # Feature 7 — drag list
  itinerary/StopItem.vue    # Feature 7 — stop row
  itinerary/FieldNoteInput.vue  # Feature 8 — inline note
stores/
  map.store.js              # Map instance + layer toggles
  discovery.store.js        # POI results + selected POI
  itinerary.store.js        # Stop list + drawer state
composables/
  useLocation.js            # Layered location resolution
  useItinerary.js           # Itinerary CRUD + sharing
  useByways.js              # GeoJSON loader
  usePOISearch.js           # Places Nearby caller
lib/
  google-maps.js            # Singleton Maps loader
  places.js                 # normalizePlacesResult()
  url-encoding.js           # lz-string encode/decode
  proximity-sort.js         # Nearest-neighbor sort
  storage.js                # localStorage helpers
  map-style.js              # Dark map style JSON
data/byways/
  florida.geojson           # Static byway data (do not edit)
  index.js                  # loadByways() loader
```

---

## Build order (recommended)

Work through features in this order — each builds on the previous:

1. **MapCanvas.vue** — get the map on screen first (Feature 1)
2. **useLocation + UserLocation** — location resolution (Feature 2)
3. **BywayLayer** — static polylines from GeoJSON (Feature 4)
4. **Server routes** — all four `/api/` routes (prerequisite for Features 3 + 6)
5. **POI search** — markers + discovery store (Feature 3)
6. **SearchBar** — autocomplete input (Feature 6)
7. **POICard** — info card + Add to Itinerary (Feature 5)
8. **Itinerary stores + drawer** — stop list, drag, sort (Feature 7)
9. **FieldNoteInput** — inline annotations (Feature 8)
10. **Sharing + Google Maps handoff** — URL encode + waypoints URL (Features 9 + 10)
11. **PWA** — verify manifest, service worker, offline behavior (Feature 11)
12. **Responsive layout** — breakpoint polish (Feature 12)

---

## Key constraints (do not work around these)

| Constraint | Reason |
|---|---|
| `getGoogleMaps()` only in `onMounted` | Maps JS API is browser-only; SSR will break |
| Map initialized once with guard ref | Re-initialization causes a blank map and broken state |
| All Places calls go through `/api/places/*` | Keeps `GOOGLE_PLACES_API_KEY` off the client |
| Use `google.maps.Polyline` for byways, not Data layer | Better click control and performance |
| No TypeScript | Project uses plain JavaScript — see CLAUDE.md |
| No React, no Next.js | Vue 3 / Nuxt 3 only — see CLAUDE.md |

---

## shadcn-vue components

Install components individually as needed:

```bash
npx shadcn-vue@latest add sheet       # Slide-up panels
npx shadcn-vue@latest add drawer      # Bottom drawer (mobile)
npx shadcn-vue@latest add sonner      # Toast notifications
npx shadcn-vue@latest add button
npx shadcn-vue@latest add badge
npx shadcn-vue@latest add textarea
```

Do not hand-edit files in `components/ui/`. Re-run the CLI to update them.

---

## Environment variables

| Variable | Where used |
|---|---|
| `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `lib/google-maps.js` → browser Maps loader |
| `GOOGLE_PLACES_API_KEY` | All `server/api/places/*` routes |

Nuxt automatically exposes `NUXT_PUBLIC_*` vars to the browser via `useRuntimeConfig().public`.
The private key is only available server-side via `useRuntimeConfig().googlePlacesApiKey`.

---

## Deployment

```bash
# Vercel (automatic on push to main)
vercel deploy

# Or build locally
npm run build
npm run preview
```

Set both env vars in Vercel project settings → Environment Variables.
