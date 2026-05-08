# Architecture — PathWeaver V1

## Stack decisions

### Framework: Next.js 15 (App Router) + TypeScript

**Why not another framework:**
PathWeaver is a client-heavy map application, but it needs two things that rule out a pure SPA:
an API proxy to protect Google API keys, and server-rendered shell pages for shared itinerary
URLs. Next.js 15 App Router handles both cleanly. Route Handlers replace the separate Vercel
serverless functions used in RouteHub. The Map canvas and itinerary builder are fully
client-side components (`'use client'`).

### Styling: Tailwind CSS + shadcn/ui

Tailwind for layout and utility classes. shadcn/ui for interactive components (drawer, sheets,
dialogs, tooltips). shadcn components are copied into the project, not imported from a
package — this is intentional and expected.

### State management: Zustand

The app has four distinct state domains (map, discovery, itinerary, UI) that need to share
data without prop drilling, and without triggering full-tree re-renders on every map move.
Zustand is lightweight, has no boilerplate, and plays well with Next.js App Router.

Do not use React Context for map or itinerary state. Context will cause unnecessary re-renders
on the map canvas.

### Maps: Google Maps JavaScript API via @googlemaps/js-api-loader

Loaded once as a singleton in `lib/google-maps.ts`. The loader is initialized client-side
only. The map instance is stored in a Zustand slice, not in component state, so it persists
across component re-renders.

### Drag and drop: dnd-kit

Used for the itinerary stop list. dnd-kit is accessible, touch-friendly, and does not require
a specific rendering model (works with any list structure).

### URL encoding: lz-string

Itinerary data is serialized to JSON, compressed with `lz-string`'s
`compressToEncodedURIComponent`, and appended as a URL parameter. The reverse is applied on
the `/share/[encoded]` route. No server involvement.

### PWA: Serwist

Serwist (the maintained fork of workbox-window) handles service worker generation and
registration. See the offline strategy section below.

---

## Folder structure

```
pathweaver/
├── app/
│   ├── layout.tsx               # Root layout: fonts, PWA meta, Zustand provider wrapper
│   ├── page.tsx                 # Main view — full-screen map + UI chrome
│   ├── share/
│   │   └── [encoded]/
│   │       └── page.tsx         # Server component: decodes URL, renders read-only itinerary
│   └── api/
│       └── places/
│           ├── nearby/
│           │   └── route.ts     # Proxies Google Places Nearby Search
│           ├── details/
│           │   └── route.ts     # Proxies Google Places Details
│           └── autocomplete/
│               └── route.ts     # Proxies Google Places Autocomplete
│
├── components/
│   ├── map/
│   │   ├── MapCanvas.tsx        # Mounts Google Maps, manages map instance lifecycle
│   │   ├── BywayLayer.tsx       # Renders byway polylines from GeoJSON data
│   │   ├── POIMarkers.tsx       # Renders place markers from discovery results
│   │   └── UserLocation.tsx     # Renders current location marker
│   ├── discovery/
│   │   ├── SearchBar.tsx        # Google Places Autocomplete input
│   │   └── POICard.tsx          # Tap-target info card for a map pin
│   ├── itinerary/
│   │   ├── ItineraryDrawer.tsx  # Slide-up bottom sheet (shadcn Sheet)
│   │   ├── StopList.tsx         # dnd-kit sortable list container
│   │   ├── StopItem.tsx         # Individual draggable stop row
│   │   └── FieldNoteInput.tsx   # Inline text annotation for a stop
│   └── ui/                      # shadcn/ui components (auto-generated, do not hand-edit)
│
├── data/
│   └── byways/
│       ├── florida.geojson      # Florida scenic byways — static source of truth
│       └── index.ts             # Exports typed byway loader; add new states here
│
├── hooks/
│   ├── useLocation.ts           # Layered location resolution (see Location section below)
│   ├── useItinerary.ts          # Itinerary CRUD, reorder, proximity sort, URL encode/decode
│   ├── useByways.ts             # Loads and filters byway GeoJSON
│   └── usePOISearch.ts          # Calls /api/places/nearby and manages results
│
├── lib/
│   ├── google-maps.ts           # Singleton loader for @googlemaps/js-api-loader
│   ├── places.ts                # Typed wrappers for Places API responses
│   ├── url-encoding.ts          # lz-string compress/decompress helpers
│   ├── proximity-sort.ts        # Nearest-neighbor sort algorithm (from RouteHub)
│   └── storage.ts               # localStorage helpers with JSON parse safety
│
├── store/
│   ├── map.store.ts             # Map instance, center, zoom, active layers
│   ├── discovery.store.ts       # POI search results, selected place
│   ├── itinerary.store.ts       # Stop list, drawer open state
│   └── index.ts                 # Re-exports all stores
│
├── types/
│   └── index.ts                 # All shared TypeScript interfaces (see DATA_SCHEMA.md)
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

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — used only by the Maps JS API loader in the browser.
Restrict this key in Google Cloud Console to your production domain (and localhost for dev).

`GOOGLE_PLACES_API_KEY` — used only inside Next.js Route Handlers. Never referenced in any
client-side file. Restrict this key to your Vercel server IP range in Google Cloud Console.

All Places API calls (Nearby Search, Details, Autocomplete) flow through Route Handlers at
`/api/places/*`. The browser never calls Google Places directly.

### Map instance lifecycle

The Google Maps instance is initialized once in `MapCanvas.tsx` using a `useEffect` with an
empty dependency array. The instance reference is stored in Zustand (`map.store.ts`). Other
components that need to add overlays or listeners read the map instance from the store rather
than receiving it as a prop.

This pattern prevents the map from remounting when parent components re-render.

### Byway rendering

Byways are loaded from the static GeoJSON file at build time (not via API). Each feature in
the GeoJSON is rendered as a `google.maps.Polyline` in `BywayLayer.tsx`. The color comes from
`feature.properties.color`. Click listeners on each polyline open the POI detail card with the
byway's metadata.

Do not use the Google Maps Data layer for byway rendering. Use Polyline instances directly for
better performance and click control.

### Itinerary persistence

The active itinerary is stored in Zustand during the session. On every change, it is also
written to `localStorage` via a Zustand middleware subscriber. On app load, `useItinerary`
reads from localStorage first.

This means itineraries survive page refreshes and app restarts without any server involvement.

### URL-encoded sharing

When a user taps "Share," `lib/url-encoding.ts` serializes the current itinerary to JSON,
compresses it with `lz-string.compressToEncodedURIComponent`, and constructs a URL in the
format `/share/[encoded]`.

The `/share/[encoded]` page is a Next.js server component that decodes the parameter on the
server and renders a read-only itinerary view. If decoding fails, it renders a "link expired
or invalid" state.

---

## Offline strategy

### What is cached

- **App shell**: All JS bundles, CSS, and static assets are cached on first load via the
  Serwist service worker using a Cache First strategy
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

This is the same behavior as the Florida's Scenic Byways PWA predecessor. The data layer is
what matters when you're actually out on a trail.

### Service worker configuration (Serwist)

Configure in `next.config.ts`. Cache the app shell with Cache First, Places responses with
Stale While Revalidate (max 24h, max 50 entries), and GeoJSON data with Cache First
(versioned by file hash).

---

## Environment variables

| Variable | Used where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client (browser) | Maps JS API loader |
| `GOOGLE_PLACES_API_KEY` | Server (Route Handlers) | Places API calls |

Both must be set in `.env.local` for development and in Vercel project settings for production.

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@googlemaps/js-api-loader": "^1.16.x",
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "lz-string": "^1.5.x",
    "zustand": "^5.x",
    "serwist": "^9.x",
    "@serwist/next": "^9.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/google.maps": "^3.x",
    "tailwindcss": "^3.x",
    "eslint": "^9.x"
  }
}
```

shadcn/ui components are installed individually via the shadcn CLI (`npx shadcn@latest add
sheet drawer`). They are not listed as npm dependencies.
