# Data Schema — PathWeaver V1

All TypeScript interfaces live in `types/index.ts`. This document is the source of truth
for every data shape used in the application.

---

## Coordinates

All coordinate pairs throughout the app use this shape. Matches Google Maps LatLngLiteral.

```typescript
interface Coordinates {
  lat: number;
  lng: number;
}
```

---

## Byway (GeoJSON feature properties)

Byways are stored as GeoJSON FeatureCollections in `data/byways/[state].geojson`.
The geometry is a `LineString` or `MultiLineString`. Properties follow this schema.

```typescript
interface BywayProperties {
  id: string;              // Unique ID, e.g. "fl-001"
  name: string;            // Full official name
  state: string;           // Two-letter state code, e.g. "FL"
  designation: BywayDesignation[];
  length_miles: number;
  description: string;     // 1-3 sentence description
  counties: string[];      // Counties the byway passes through
  url: string;             // Official byway website or state agency URL
  color: string;           // Hex color for polyline rendering, e.g. "#4A90D9"
  tags: BywayTag[];
}

type BywayDesignation =
  | "florida_scenic"
  | "national_scenic"
  | "all_american_road"
  | "state_historic";

type BywayTag =
  | "coastal"
  | "historic"
  | "nature"
  | "photography"
  | "wildlife"
  | "urban"
  | "forest"
  | "heritage";
```

### GeoJSON file structure

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "state": "florida",
    "state_code": "FL",
    "source": "Florida Department of Transportation",
    "source_url": "https://fdot.gov",
    "version": "1.0.0",
    "updated": "2024-01-01"
  },
  "features": [
    {
      "type": "Feature",
      "id": "fl-001",
      "geometry": {
        "type": "LineString",
        "coordinates": [[-81.311, 29.900], [-81.312, 29.910]]
      },
      "properties": {
        "id": "fl-001",
        "name": "A1A Scenic and Historic Coastal Byway",
        "state": "FL",
        "designation": ["florida_scenic", "national_scenic"],
        "length_miles": 72,
        "description": "Runs along Florida's northeast Atlantic coast through historic towns and coastal ecosystems.",
        "counties": ["St. Johns", "Flagler", "Volusia"],
        "url": "https://fdot.gov/environment/scenic-highways/a1a",
        "color": "#4A90D9",
        "tags": ["coastal", "historic", "photography"]
      }
    }
  ]
}
```

### Adding new states

To add byway data for a new state:
1. Create `data/byways/[state-code-lowercase].geojson` following the same structure
2. Add the state code to the `SUPPORTED_STATES` array in `data/byways/index.ts`
3. The loader in `data/byways/index.ts` handles the rest dynamically

---

## Stop

A stop is a single entry in an itinerary. It can originate from a Google Place, a byway
waypoint, or a user-dropped custom pin.

```typescript
interface Stop {
  id: string;                    // UUID, generated client-side
  type: StopType;
  name: string;
  coordinates: Coordinates;
  address?: string;              // Formatted address from Places API
  placeId?: string;              // Google Places place_id (for POI and byway stops)
  bywayId?: string;              // Byway feature ID if type === "byway_waypoint"
  fieldNote?: string;            // User annotation, max 280 chars
  addedAt: number;               // Unix timestamp (Date.now())
}

type StopType = "poi" | "byway_waypoint" | "custom";
```

---

## Itinerary

The active working itinerary. One itinerary is active at a time. Stored in Zustand and
persisted to localStorage.

```typescript
interface Itinerary {
  id: string;            // UUID, generated when the itinerary is first modified
  name?: string;         // Optional user-provided name (V1: not used, reserved)
  stops: Stop[];
  createdAt: number;     // Unix timestamp
  updatedAt: number;     // Unix timestamp, updated on every change
}
```

---

## Shared itinerary (URL payload)

The data that is serialized, compressed, and embedded in a share URL. This is a subset of
`Itinerary` — only what the recipient needs to reconstruct the view.

```typescript
interface SharedItinerary {
  v: 1;                    // Schema version. Increment if the shape changes.
  name?: string;
  stops: SharedStop[];
}

interface SharedStop {
  id: string;
  type: StopType;
  name: string;
  coordinates: Coordinates;
  address?: string;
  fieldNote?: string;
  bywayId?: string;
}
```

The `placeId` and `addedAt` fields are omitted from the shared payload to reduce URL length.

### Encoding process

```typescript
// Encoding (in lib/url-encoding.ts)
import LZString from 'lz-string';

function encodeItinerary(itinerary: SharedItinerary): string {
  const json = JSON.stringify(itinerary);
  return LZString.compressToEncodedURIComponent(json);
}

function decodeItinerary(encoded: string): SharedItinerary | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as SharedItinerary;
  } catch {
    return null;
  }
}
```

Share URL format: `https://pathweaver.app/share/[encoded]`

---

## POI (Google Places result, normalized)

Raw Google Places API responses are normalized to this shape before being stored or
rendered. This decouples the app from Places API version changes.

```typescript
interface POI {
  placeId: string;
  name: string;
  type: string;                  // Primary type from Places API, e.g. "park"
  coordinates: Coordinates;
  address: string;               // formattedAddress from Places API
  distanceMiles?: number;        // Calculated client-side from user location
  rating?: number;               // 0-5
  ratingCount?: number;
  openNow?: boolean;
  websiteUrl?: string;
  phoneNumber?: string;
}
```

---

## Location state

Used in the `useLocation` hook and location Zustand slice.

```typescript
interface LocationState {
  coordinates: Coordinates | null;
  accuracy: number | null;           // Meters
  source: LocationSource;
  status: LocationStatus;
}

type LocationSource = "browser_gps" | "ip_geolocation" | "default";
type LocationStatus = "idle" | "resolving" | "resolved" | "denied" | "error";
```

---

## localStorage keys

All localStorage access goes through `lib/storage.ts`. Keys are prefixed to avoid
collisions.

| Key | Type | Description |
|---|---|---|
| `pw_itinerary` | `Itinerary` | The current active itinerary |
| `pw_drawer_open` | `boolean` | Last known drawer open/closed state |
| `pw_byways_visible` | `boolean` | Byways layer toggle state |
| `pw_location_permission` | `"granted" \| "denied" \| "unknown"` | Cached permission state |
| `pw_map_provider` | Reserved | Not used V1; reserved for possible provider toggle |

---

## Zustand store shapes

### map.store.ts

```typescript
interface MapStore {
  mapInstance: google.maps.Map | null;
  center: Coordinates;
  zoom: number;
  bywaysVisible: boolean;
  setMapInstance: (map: google.maps.Map) => void;
  setCenter: (center: Coordinates) => void;
  setZoom: (zoom: number) => void;
  toggleByways: () => void;
}
```

### discovery.store.ts

```typescript
interface DiscoveryStore {
  pois: POI[];
  selectedPOI: POI | null;
  selectedBywayId: string | null;
  isLoading: boolean;
  error: string | null;
  setPOIs: (pois: POI[]) => void;
  selectPOI: (poi: POI | null) => void;
  selectByway: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

### itinerary.store.ts

```typescript
interface ItineraryStore {
  itinerary: Itinerary;
  drawerOpen: boolean;
  addStop: (stop: Omit<Stop, 'id' | 'addedAt'>) => void;
  removeStop: (id: string) => void;
  reorderStops: (stops: Stop[]) => void;
  sortByProximity: (origin: Coordinates) => void;
  updateFieldNote: (id: string, note: string) => void;
  setDrawerOpen: (open: boolean) => void;
  clearItinerary: () => void;
  getShareURL: () => string;
}
```
