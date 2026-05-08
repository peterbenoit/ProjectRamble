# Ramble (working title: PathWeaver)

A map-first PWA that unifies POI discovery, scenic byway overlays, and multi-stop itinerary
building. No accounts, no database, no app store.

---

## Stack

- **Next.js 15** App Router + TypeScript
- **Tailwind CSS** + **shadcn/ui** (components installed via CLI, not npm)
- **Zustand 5** for all shared state — do NOT use React Context for map or itinerary state
- **Google Maps JavaScript API** via `@googlemaps/js-api-loader` — singleton, client-side only
- **dnd-kit** for drag-and-drop in the itinerary drawer
- **lz-string** for URL-encoded itinerary sharing
- **Serwist** for PWA service worker
- **Vercel** for deployment

## Docs — read these before building any feature

| Doc | What's in it |
|---|---|
| `docs/PRODUCT_BRIEF.md` | Scope, out-of-scope list, success criteria |
| `docs/ARCHITECTURE.md` | Folder structure, key patterns, offline strategy |
| `docs/FEATURES_V1.md` | All 12 features with acceptance criteria |
| `docs/DATA_SCHEMA.md` | Every TypeScript interface, Zustand store shapes, localStorage keys |
| `docs/API_INTEGRATIONS.md` | Route Handler implementations, env vars, Google Cloud setup |
| `docs/UI_DESIGN.md` | Color tokens, map style JSON, component wireframes |

---

## Rules — do not deviate from these

**API keys**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is used ONLY by the Maps JS loader in the browser
- `GOOGLE_PLACES_API_KEY` is used ONLY inside Route Handlers — never in any client file
- All Places API calls go through `/api/places/*` Route Handlers, never called directly from the browser

**Map instance**
- Initialized once in `MapCanvas.tsx` via `useEffect` with empty dependency array
- Stored in Zustand `map.store.ts`, not in component state
- Never reinitialize the map on re-render

**Byway rendering**
- Use `google.maps.Polyline` instances directly — do NOT use the Google Maps Data layer
- Color comes from `feature.properties.color` in the GeoJSON
- GeoJSON lives in `data/byways/florida.geojson` — it is static, not fetched from an API

**State**
- Zustand for map, discovery, itinerary, and UI state
- No React Context for these domains
- Itinerary persists to localStorage on every change via Zustand middleware

**Offline**
- Google Maps base tiles are NOT cached (ToS violation) — this is intentional and documented
- GeoJSON, app shell, and Places API responses ARE cached via Serwist
- Do not attempt to work around the tile caching restriction

**shadcn/ui**
- Install components with `npx shadcn@latest add [component]`
- Do not hand-edit files in `components/ui/`
- Use Sheet or Drawer (Vaul) for slide-up panels, Sonner for toasts

**TypeScript**
- All shared interfaces live in `types/index.ts`
- Do not define interfaces inline in component files
- The full schema is in `docs/DATA_SCHEMA.md` — use it

---

## How to work

Build one feature at a time. Each feature in `docs/FEATURES_V1.md` has acceptance criteria
that define done. Start with Feature 1 (Map canvas) and work forward.

Before writing any code for a feature, read the relevant section in FEATURES_V1.md and
cross-reference ARCHITECTURE.md for the applicable patterns.

When in doubt about a type or interface, check `docs/DATA_SCHEMA.md` before inventing one.

---

## Project structure (abbreviated)

```
app/
  page.tsx                  # Main map view — full screen
  share/[encoded]/page.tsx  # Read-only shared itinerary
  api/places/*/route.ts     # Google Places proxies
components/
  map/                      # MapCanvas, BywayLayer, POIMarkers, UserLocation
  discovery/                # SearchBar, POICard
  itinerary/                # ItineraryDrawer, StopList, StopItem, FieldNoteInput
  ui/                       # shadcn/ui (do not edit)
data/byways/
  florida.geojson           # Static byway data — source of truth
  index.ts                  # Typed loader, designed for multi-state expansion
hooks/                      # useLocation, useItinerary, useByways, usePOISearch
lib/                        # google-maps.ts, places.ts, url-encoding.ts, proximity-sort.ts, storage.ts
store/                      # map.store.ts, discovery.store.ts, itinerary.store.ts
types/index.ts              # All shared TypeScript interfaces
```
