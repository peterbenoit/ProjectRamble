# Architecture — PathWeaver V1

## Stack decisions

### Framework: Nuxt 3 (Vue 3) + JavaScript

PathWeaver is a client-heavy map application that needs two things beyond a pure SPA: an API
proxy to protect Google API keys, and server-rendered shell pages for shared itinerary URLs.
Nuxt 3 handles both cleanly. Server routes (`server/api/`) replace separate serverless
functions. The map canvas and itinerary builder are fully client-side components.

No TypeScript. No React. No Next.js.

### Styling: Tailwind CSS + shadcn-vue

Tailwind for layout and utility classes. shadcn-vue for interactive components (drawer, sheets,
dialogs, tooltips). shadcn-vue components are copied into the project via CLI, not imported
from a package — this is intentional and expected.

### State management: Pinia

The app has four distinct state domains (map, discovery, itinerary, UI) that need to share
data without prop drilling. Pinia is the official Vue store, is lightweight, and works with
Nuxt 3's SSR hydration without extra config.

Do not use provide/inject for map or itinerary state.

### Maps: Google Maps JavaScript API via @googlemaps/js-api-loader

Loaded once as a singleton in `lib/google-maps.js`. The loader is initialized client-side
only (inside `onMounted`). The map instance is stored in a Pinia slice, not in component
state, so it persists across component re-renders without remounting.

### Drag and drop: vuedraggable

Used for the itinerary stop list. vuedraggable wraps SortableJS, is accessible,
touch-friendly, and works natively with Vue 3's `v-for`.

### URL encoding: lz-string

Itinerary data is serialized to JSON, compressed with `lz-string`'s
`compressToEncodedURIComponent`, and appended as a URL parameter. The reverse is applied on
the `/share/[encoded]` route. No server involvement.

### PWA: vite-plugin-pwa

vite-plugin-pwa handles service worker generation and registration natively in the Vite/Nuxt
build pipeline. See the offline strategy section below.

---

## Folder structure

```
pathweaver/
├── pages/
│   ├── index.vue                    # Main view — full-screen map + UI chrome
│   └── share/
│       └── [encoded].vue            # Decodes URL param, renders read-only itinerary
│
├── server/
│   └── api/
│       └── places/
│           ├── nearby.get.js        # Proxies Google Places Nearby Search
│           ├── details.get.js       # Proxies Google Places Details
│           └── autocomplete.get.js  # Proxies Google Places Autocomplete
│
├── components/
│   ├── map/
│   │   ├── MapCanvas.vue        # Mounts Google Maps, manages map instance lifecycle
│   │   ├── BywayLayer.vue       # Renders byway polylines from GeoJSON data
│   │   ├── POIMarkers.vue       # Renders place markers from discovery results
│   │   └── UserLocation.vue     # Renders current location marker
│   ├── discovery/
│   │   ├── SearchBar.vue        # Google Places Autocomplete input
│   │   └── POICard.vue          # Tap-target info card for a map pin
│   ├── itinerary/
│   │   ├── ItineraryDrawer.vue  # Slide-up bottom sheet (shadcn-vue Sheet)
│   │   ├── StopList.vue         # vuedraggable sortable list container
│   │   ├── StopItem.vue         # Individual draggable stop row
│   │   └── FieldNoteInput.vue   # Inline text annotation for a stop
│   └── ui/                      # shadcn-vue components (auto-generated, do not hand-edit)
│
├── composables/
│   ├── useLocation.js           # Layered location resolution (see Location section below)
│   ├── useItinerary.js          # Itinerary CRUD, reorder, proximity sort, URL encode/decode
│   ├── useByways.js             # Loads and filters byway GeoJSON
│   └── usePOISearch.js          # Calls /api/places/nearby and manages results
│
├── data/
│   └── byways/
│       ├── florida.geojson      # Florida scenic byways — static source of truth
│       └── index.js             # Exports byway loader; add new states here
│
├── lib/
│   ├── google-maps.js           # Singleton loader for @googlemaps/js-api-loader
│   ├── places.js                # Typed wrappers for Places API responses
│   ├── url-encoding.js          # lz-string compress/decompress helpers
│   ├── proximity-sort.js        # Nearest-neighbor sort algorithm
│   └── storage.js               # localStorage helpers with JSON parse safety
│
├── stores/
│   ├── map.store.js             # Map instance, center, zoom, active layers
│   ├── discovery.store.js       # POI search results, selected place
│   ├── itinerary.store.js       # Stop list, drawer open state
│   └── index.js                 # Re-exports all stores
│
└── public/
    ├── manifest.json            # PWA manifest
    ├── icon-192.png
    └── icon-512.png
```

---

## Key patterns

### API key security

Two API keys. One is public, one is private.

`NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` — used only by the Maps JS API loader in the browser.
Restrict this key in Google Cloud Console to your production domain (and localhost for dev).

`GOOGLE_PLACES_API_KEY` — used only inside Nuxt server routes. Never referenced in any
client-side file. Restrict this key to your Vercel server IP range in Google Cloud Console.

All Places API calls (Nearby Search, Details, Autocomplete) flow through server routes at
`/api/places/*`. The browser never calls Google Places directly.

### Map instance lifecycle

The Google Maps instance is initialized once in `MapCanvas.vue` inside `onMounted` with a
`initialized` guard ref so it only runs once. The instance reference is stored in Pinia
(`stores/map.store.js`). Other components that need to add overlays or listeners read the map
instance from the store rather than receiving it as a prop.

This pattern prevents the map from remounting when parent components re-render.

### Byway rendering

Byways are loaded from the static GeoJSON file at build time (not via API). Each feature in
the GeoJSON is rendered as a `google.maps.Polyline` in `BywayLayer.vue`. The color comes from
`feature.properties.color`. Click listeners on each polyline open the POI detail card with the
byway's metadata.

Do not use the Google Maps Data layer for byway rendering. Use Polyline instances directly for
better performance and click control.

### Itinerary persistence

The active itinerary is stored in Pinia during the session. On every change, it is also
written to `localStorage` via a Pinia `$subscribe` callback in `stores/itinerary.store.js`.
On app load, the store reads from localStorage first.

This means itineraries survive page refreshes and app restarts without any server involvement.

### URL-encoded sharing

When a user taps "Share," `lib/url-encoding.js` serializes the current itinerary to JSON,
compresses it with `lz-string.compressToEncodedURIComponent`, and constructs a URL in the
format `/share/[encoded]`.

The `/share/[encoded]` page decodes the URL parameter and renders a read-only itinerary view.
If decoding fails, it renders a "link expired or invalid" state.

---

## Offline strategy

### What is cached

- **App shell**: All JS bundles, CSS, and static assets are cached on first load via the
  vite-plugin-pwa service worker using a Cache First strategy
- **Byway GeoJSON**: The static GeoJSON files in `/data/byways/` are cached on first load
- **Places API responses**: Cached in a separate cache bucket with a 24-hour TTL using a
  Stale While Revalidate strategy
- **Itinerary data**: Stored in localStorage, not the service worker cache — always available

### What is NOT cached (and why)

**Google Maps base map tiles are not cached.** Google's Terms of Service explicitly prohibit
offline tile caching of the Maps JavaScript API. Attempting to cache tiles via service worker
intercept violates the ToS and is not implemented here.

**Practical impact:** When the user is offline, the map canvas shows a gray/blank background.
However:
- All byway polylines remain visible (rendered from cached GeoJSON)
- All saved POI markers remain visible (rendered from cached Places data)
- The full itinerary is visible and editable (localStorage)
- Proximity sort, drag reorder, and field notes all work offline
- The app shell loads instantly

### Service worker configuration (vite-plugin-pwa)

Configure in `nuxt.config.js`. Cache the app shell with Cache First, Places responses with
Stale While Revalidate (max 24h, max 50 entries), and GeoJSON data with Cache First
(versioned by file hash).

---

## Environment variables

| Variable | Used where | Purpose |
|---|---|---|
| `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client (browser) | Maps JS API loader |
| `GOOGLE_PLACES_API_KEY` | Server (server routes) | Places API calls |

Both must be set in `.env` for development and in Vercel project settings for production.

---

## Dependencies

```json
{
  "dependencies": {
    "nuxt": "^3.x",
    "@googlemaps/js-api-loader": "^1.16.x",
    "vuedraggable": "^4.x",
    "lz-string": "^1.5.x",
    "@pinia/nuxt": "^0.x",
    "pinia": "^2.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "vite-plugin-pwa": "^0.x",
    "@nuxtjs/tailwindcss": "^6.x",
    "eslint": "^9.x"
  }
}
```

shadcn-vue components are installed individually via the shadcn-vue CLI
(`npx shadcn-vue@latest add sheet drawer`). They are not listed as npm dependencies.
