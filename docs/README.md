# PathWeaver

**Working title.** A unified exploration and routing engine for the US.

PathWeaver merges three separate tools — [Florida's Scenic Byways](https://floridascenicbyways.com), [RouteHub](https://route-hub.com), and [ParkFindr](https://parkfindr.app) — into a single, cohesive application. It surfaces nearby points of interest, overlays curated scenic corridors on the map, and lets you stitch stops into a shareable, optimized itinerary. All without accounts, databases, or app store installs.

---

## What it does

- Shows parks, trailheads, and green spaces near your current location via Google Places
- Overlays curated scenic byways as color-coded polylines (Florida at launch, designed for expansion)
- Lets you tap any POI or byway stop to add it to an itinerary queue
- Itinerary builder: drag to reorder, proximity sort, annotate stops with field notes
- Shares itineraries via compressed URL — no server, no account
- Hands off to Google Maps for turn-by-turn navigation
- Installable PWA with offline data layer

---

## Setup

### Prerequisites

- Node.js 20+
- A Google Cloud project with the following APIs enabled:
  - Maps JavaScript API
  - Places API (New)
  - Geocoding API

### Environment variables

Create a `.env.local` file in the project root:

```
# Used by the Maps JS API loader in the browser.
# Restrict this key by HTTP referrer in Google Cloud Console.
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# Used by server-side Route Handlers only. Never exposed to the browser.
# Restrict this key by IP in Google Cloud Console.
GOOGLE_PLACES_API_KEY=your_key_here
```

### Install and run

```bash
npm install
npm run dev
```

---

## Project structure

```
pathweaver/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # Main map view
│   ├── share/[encoded]/page.tsx        # Read-only shared itinerary view
│   └── api/
│       ├── places/nearby/route.ts      # Nearby search proxy
│       ├── places/details/route.ts     # Place details proxy
│       └── places/autocomplete/route.ts
├── components/
│   ├── map/                            # Map canvas and overlay layers
│   ├── discovery/                      # POI cards and search
│   ├── itinerary/                      # Drawer, stop list, drag-and-drop
│   └── ui/                             # shadcn/ui components
├── data/
│   └── byways/
│       ├── florida.geojson
│       └── index.ts                    # Byway loader (designed for expansion)
├── hooks/                              # useLocation, useItinerary, usePOISearch, etc.
├── lib/                                # Utilities: maps loader, url encoding, proximity sort
├── types/
│   └── index.ts                        # All shared TypeScript interfaces
├── public/
│   └── manifest.json                   # PWA manifest
└── docs/                               # Full project documentation
    ├── PRODUCT_BRIEF.md
    ├── ARCHITECTURE.md
    ├── FEATURES_V1.md
    ├── DATA_SCHEMA.md
    ├── API_INTEGRATIONS.md
    └── UI_DESIGN.md
```

---

## Documentation

Start with [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) for the full context, scope, and what is explicitly out of scope for V1.

---

## Deployment

Vercel. Zero additional configuration needed beyond the environment variables above.

---

## Related projects (superseded by PathWeaver)

- [floridascenicbyways.com](https://floridascenicbyways.com)
- [route-hub.com](https://route-hub.com)
- [parkfindr.app](https://parkfindr.app)
