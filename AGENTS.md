# Ramble (working title: PathWeaver)

A map-first PWA that unifies POI discovery, scenic byway overlays, and multi-stop itinerary
building. No accounts, no database, no app store.

---

## Stack

- **Nuxt 3** (Vue 3) + **JavaScript** — no TypeScript, no React, no Next.js
- **Tailwind CSS** + **shadcn-vue** (components installed via CLI, not npm)
- **Pinia** for all shared state — do NOT use Vuex or provide/inject for map or itinerary state
- **Google Maps JavaScript API** via `@googlemaps/js-api-loader` — singleton, client-side only
- **vuedraggable** (SortableJS) for drag-and-drop in the itinerary drawer
- **lz-string** for URL-encoded itinerary sharing
- **vite-plugin-pwa** for PWA service worker
- **Vercel** for deployment

## Docs — read these before building any feature

| Doc | What's in it |
|---|---|
| `docs/PRODUCT_BRIEF.md` | Scope, out-of-scope list, success criteria |
| `docs/ARCHITECTURE.md` | Folder structure, key patterns, offline strategy |
| `docs/FEATURES_V1.md` | All 12 features with acceptance criteria |
| `docs/DATA_SCHEMA.md` | Every JS data shape, Pinia store shapes, localStorage keys |
| `docs/API_INTEGRATIONS.md` | Server route implementations, env vars, Google Cloud setup |
| `docs/UI_DESIGN.md` | Color tokens, map style JSON, component wireframes |

---

## Rules — do not deviate from these

**Language**
- All code is JavaScript — no TypeScript, no `.ts` files, no type annotations
- Use JSDoc comments only where a data shape is non-obvious
- No `.tsx`, no `interface`, no `type` keyword

**Framework**
- Nuxt 3 only — no React, no Next.js, no Remix, no SvelteKit
- Pages go in `pages/`, server routes go in `server/api/`
- Shared logic goes in `composables/` (not `hooks/`)

**API keys**
- `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` is used ONLY by the Maps JS loader in the browser
- `GOOGLE_PLACES_API_KEY` is used ONLY inside server routes — never in any client file
- All Places API calls go through `/api/places/*` server routes, never called directly from the browser

**Map instance**
- Initialized once in `MapCanvas.vue` via `onMounted` with a guard flag
- Stored in Pinia `map.store.js`, not in component state
- Never reinitialize the map on re-render

**Byway rendering**
- Use `google.maps.Polyline` instances directly — do NOT use the Google Maps Data layer
- Color comes from `feature.properties.color` in the GeoJSON
- GeoJSON lives in `data/byways/florida.geojson` — it is static, not fetched from an API

**State**
- Pinia for map, discovery, itinerary, and UI state
- No provide/inject for these domains
- Itinerary persists to localStorage on every change via a Pinia `$subscribe` watcher

**Offline**
- Google Maps base tiles are NOT cached (ToS violation) — this is intentional and documented
- GeoJSON, app shell, and Places API responses ARE cached via vite-plugin-pwa
- Do not attempt to work around the tile caching restriction

**shadcn-vue**
- Install components with `npx shadcn-vue@latest add [component]`
- Do not hand-edit files in `components/ui/`
- Use Sheet or Drawer for slide-up panels, Sonner for toasts

**Data shapes**
- All shared JS data shapes are documented in `docs/DATA_SCHEMA.md`
- Do not invent new shapes inline in component files — add them to the schema doc first

---

## How to work

Build one feature at a time. Each feature in `docs/FEATURES_V1.md` has acceptance criteria
that define done. Start with Feature 1 (Map canvas) and work forward.

Before writing any code for a feature, read the relevant section in FEATURES_V1.md and
cross-reference ARCHITECTURE.md for the applicable patterns.

When in doubt about a data shape, check `docs/DATA_SCHEMA.md` before inventing one.

---

## Project structure (abbreviated)

```
pages/
  index.vue                 # Main map view — full screen
  share/[encoded].vue       # Read-only shared itinerary
server/
  api/places/
    nearby.get.js           # Proxies Google Places Nearby Search
    details.get.js          # Proxies Google Places Details
    autocomplete.get.js     # Proxies Google Places Autocomplete
components/
  map/                      # MapCanvas, BywayLayer, POIMarkers, UserLocation (.vue)
  discovery/                # SearchBar, POICard (.vue)
  itinerary/                # ItineraryDrawer, StopList, StopItem, FieldNoteInput (.vue)
  ui/                       # shadcn-vue (do not edit)
composables/                # useLocation, useItinerary, useByways, usePOISearch
data/byways/
  florida.geojson           # Static byway data — source of truth
  index.js                  # Loader, designed for multi-state expansion
lib/                        # google-maps.js, places.js, url-encoding.js, proximity-sort.js, storage.js
stores/                     # map.store.js, discovery.store.js, itinerary.store.js
```
