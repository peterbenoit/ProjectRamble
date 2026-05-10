# Data Schema — PathWeaver V1

All shared data shapes are documented here and used as JSDoc in JavaScript files where
non-obvious. Do not define shapes inline in component files — add them here first.

No TypeScript. No interfaces. Plain JavaScript objects with JSDoc for IDE hints where helpful.

---

## Coordinates

All coordinate pairs throughout the app use this shape. Matches Google Maps LatLngLiteral.

```js
// { lat: number, lng: number }
```

---

## Byway (GeoJSON feature properties)

Byways are stored as GeoJSON FeatureCollections in `data/byways/[state].geojson`.
The geometry is a `LineString` or `MultiLineString`. Properties follow this schema.

```js
/**
 * @typedef {Object} BywayProperties
 * @property {string} id        - Unique ID, e.g. "fl-001"
 * @property {string} name      - Full official name
 * @property {string} state     - Two-letter state code, e.g. "FL"
 * @property {string} color     - Hex color for the polyline, e.g. "#2E7D32"
 * @property {number} length_mi - Length in miles
 * @property {string} [description] - Optional short description
 * @property {string} [url]     - Optional link to more info
 */
```

---

## POI (Place of Interest)

Returned from `/api/places/nearby` and `/api/places/details`. Normalized from the Google
Places API response.

```js
/**
 * @typedef {Object} POI
 * @property {string} id            - Google Places place_id
 * @property {string} name
 * @property {{ lat: number, lng: number }} location
 * @property {string} [address]     - Formatted address
 * @property {string} [phone]
 * @property {string} [website]
 * @property {number} [rating]      - 0–5
 * @property {number} [userRatingsTotal]
 * @property {string[]} [types]     - Google Places type strings
 * @property {string} [photoRef]    - Google Places photo reference
 * @property {boolean} [openNow]
 */
```

---

## ItineraryStop

A single stop in the itinerary. Extends POI with user-added fields.

```js
/**
 * @typedef {Object} ItineraryStop
 * @property {string} id            - Matches POI id (place_id)
 * @property {string} name
 * @property {{ lat: number, lng: number }} location
 * @property {string} [address]
 * @property {string} [fieldNote]   - User's free-text annotation
 * @property {number} addedAt       - Unix timestamp (Date.now())
 * @property {'poi' | 'byway'} type
 */
```

---

## Pinia store shapes

### map.store.js

```js
{
  map: null,          // google.maps.Map instance or null
  center: { lat: 27.9944, lng: -81.7603 },  // Florida default
  zoom: 7,
  activeLayers: ['byways']  // layer toggle keys
}
```

### discovery.store.js

```js
{
  results: [],        // POI[]
  selectedPOI: null,  // POI | null
  isSearching: false,
  searchQuery: ''
}
```

### itinerary.store.js

```js
{
  stops: [],          // ItineraryStop[]
  isDrawerOpen: false,
  isSorted: false
}
```

---

## localStorage keys

| Key | Value | Written by |
|---|---|---|
| `pathweaver_itinerary` | JSON-serialized `ItineraryStop[]` | `stores/itinerary.store.js` `$subscribe` |

---

## URL share format

`/share/[encoded]` where `encoded` is `lz-string.compressToEncodedURIComponent(JSON.stringify(stops))`.

Decoded by the `pages/share/[encoded].vue` page component. Decoding failures render an error state.
