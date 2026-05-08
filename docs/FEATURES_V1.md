# Features — PathWeaver V1

Each feature below is written as a spec with acceptance criteria. These define done.
Anything not listed here is out of scope for V1.

---

## Feature 1: Map canvas

**What it is:** A full-screen Google Maps canvas that is the primary interface. The map fills
the viewport. All UI chrome sits on top of it as overlays.

**Acceptance criteria:**
- Map fills 100% of the viewport on mobile and desktop with no visible gap or scroll
- Map renders immediately on load using IP-based geolocation as the initial center (see
  Feature 2 for location resolution detail)
- Default zoom level is appropriate for a 10-mile discovery radius (approximately zoom 12)
- Map style uses a dark, low-saturation custom style (see UI_DESIGN.md for style JSON)
- Map controls (zoom buttons, fullscreen, street view) are hidden; replaced with custom UI
- Map is touch-friendly: pinch-to-zoom and pan work correctly on mobile
- The map does NOT reinitialize or flicker when the itinerary drawer opens or closes
- Tapping an empty area of the map closes any open info card or panel

---

## Feature 2: Location resolution

**What it is:** The map is never blank. Location resolves through a layered fallback system
inherited from ParkFindr.

**Resolution order:**
1. If browser geolocation permission was previously granted, call it immediately on load —
   no prompt
2. In parallel, call IP geolocation via `/api/geocode/ip` to get an approximate position
   while waiting for browser permission
3. On first visit, show a location permission modal after a short delay (not immediately
   on load — give the page time to render first)
4. If everything fails or the user declines, center on Florida as the default (not NYC —
   this app starts as a Florida byways product)

**Acceptance criteria:**
- The map shows a plausible center within 1 second of page load on a normal connection
- The permission modal does not appear on return visits if permission was previously granted
- Granting permission smoothly re-centers the map to the precise browser location; no flash
  or full-page reload
- Declining permission does not break the app; discovery still works from the map center
- The user's precise location is shown as a distinct marker (pulsing blue dot)

---

## Feature 3: POI discovery

**What it is:** Nearby parks, trailheads, and green spaces are shown as markers on the map,
fetched via the Google Places Nearby Search API through the server-side proxy.

**Search types to include:**
- `park`
- `natural_feature`
- `campground`
- `hiking_area` (if available in Places API response)

**Acceptance criteria:**
- POI markers load automatically when the user's location is resolved
- Markers are visually distinct from byway overlays (see UI_DESIGN.md)
- Tapping a marker opens a POI info card (see Feature 5)
- When the user pans or zooms significantly (>30% of current viewport), markers refresh to
  reflect the new map area — but are NOT refreshed on every small pan
- A loading indicator is shown while Places data is fetching
- If the Places API call fails, a non-blocking error message is shown; the map remains
  functional
- Results are cached locally (IndexedDB or localStorage) for 24 hours; the same area does
  not re-fetch if recently loaded

---

## Feature 4: Scenic byways layer

**What it is:** Florida's officially designated scenic byways rendered as color-coded
polylines on the map from static GeoJSON data.

**Acceptance criteria:**
- All Florida byway routes from `data/byways/florida.geojson` are rendered as polylines
  on the map
- Each byway has a distinct color defined in its GeoJSON properties
- Byway polylines are visible at zoom levels 7 and above; simplified/hidden below zoom 7
  to avoid clutter
- Tapping a byway polyline opens a byway info card (see Feature 5)
- Byways render from cached GeoJSON and are visible when the user is offline
- A toggle in the map UI allows the byways layer to be shown or hidden
- The byways layer does not interfere with POI marker tap targets

---

## Feature 5: Info cards

**What it is:** A card that appears when a user taps a POI marker or a byway polyline.
Provides key details and an "Add to Itinerary" action.

**POI info card shows:**
- Place name
- Place type (e.g., "State Park", "Trailhead")
- Address
- Distance from current location
- Google Maps rating and review count (if available)
- Opening hours (if available from Places Details)
- "Add to Itinerary" button
- "View in Google Maps" link (opens Google Maps to the place)

**Byway info card shows:**
- Byway name
- State designation (e.g., "Florida Scenic Highway")
- Length in miles
- Description (from GeoJSON properties)
- Counties the route passes through
- Link to the official byway website
- "Add Waypoint to Itinerary" button (adds the tapped point on the polyline as a stop)

**Acceptance criteria:**
- Card animates up from the bottom of the screen (bottom sheet style on mobile)
- Card does not cover more than 40% of the map height when open
- Card can be dismissed by tapping the map, swiping down, or tapping a close button
- "Add to Itinerary" adds the place to the itinerary store and shows a brief confirmation
  toast ("Added to itinerary")
- If the place is already in the itinerary, the button reads "In Itinerary" and is disabled
- On desktop, the card appears as a side panel rather than a bottom sheet

---

## Feature 6: Search

**What it is:** A search bar overlay on the map that uses Google Places Autocomplete to find
places and locations anywhere in the US.

**Acceptance criteria:**
- Search input is visible but non-intrusive; does not cover the map excessively
- Autocomplete suggestions appear after 2+ characters are typed
- Selecting a suggestion re-centers the map to that location and triggers a new POI search
- Search is biased toward the user's current location to surface relevant results first
- Clearing the search returns focus to the current location
- On mobile, the keyboard does not cause the map to resize (use `height: 100dvh` and
  appropriate viewport handling)

---

## Feature 7: Itinerary builder

**What it is:** A slide-up drawer that holds the user's current itinerary (list of stops).
The core workflow inherited from RouteHub.

**Acceptance criteria:**
- Drawer is triggered by a persistent floating action button on the map
- Drawer shows a count badge on the FAB when stops are present (e.g., "3")
- Stops are displayed in a numbered list with name, type, and field note preview
- Stops can be reordered by dragging (dnd-kit); works on mobile touch and desktop mouse
- "Sort by proximity" button reorders stops using the nearest-neighbor algorithm
  (starting from current location)
- Each stop has a delete button
- An empty state is shown when the itinerary has no stops
- The drawer can be partially open (showing a handle and count) or fully open
- Drawer open/closed state persists across page refreshes (localStorage)

---

## Feature 8: Field notes

**What it is:** A short text annotation that can be added to any itinerary stop.

**Acceptance criteria:**
- Each stop in the itinerary has an inline "Add note" affordance
- Tapping it reveals a text input (max 280 characters)
- Notes are saved immediately to the itinerary store (no save button required)
- Notes are included when the itinerary is encoded into a shared URL
- Notes are visible in the read-only shared itinerary view

---

## Feature 9: Itinerary sharing

**What it is:** URL-encoded sharing of the full itinerary. No server, no account.

**Acceptance criteria:**
- A "Share" button in the itinerary drawer generates a compressed URL
- The URL is copied to the clipboard on tap with a confirmation toast ("Link copied")
- The URL routes to `/share/[encoded]`
- The shared view shows the full itinerary: stop names, order, addresses, and field notes
- The shared view renders a static (non-interactive) map showing all stops as markers
  with numbered pins
- If the encoded URL is malformed or cannot be decoded, a clear error state is shown
- Share URLs remain valid indefinitely (they are self-contained — no server expiry)
- The URL is short enough to share via SMS for itineraries up to 10 stops (lz-string
  compression makes this feasible)

---

## Feature 10: Google Maps handoff

**What it is:** One tap sends the full itinerary to Google Maps as waypoints for
turn-by-turn navigation.

**Acceptance criteria:**
- "Open in Google Maps" button is present in the itinerary drawer
- Tapping it constructs a Google Maps directions URL with all stops as waypoints and opens
  it in a new tab
- The origin is the first stop in the list; the destination is the last stop; all middle
  stops are waypoints
- If there is only one stop, the URL opens that place directly in Google Maps
- If there are no stops, the button is disabled
- The handoff works correctly on both mobile (opens Google Maps app if installed) and
  desktop (opens maps.google.com)

---

## Feature 11: PWA installation

**What it is:** The app is installable as a PWA on iOS, Android, and desktop Chrome.

**Acceptance criteria:**
- `manifest.json` includes correct name, icons (192px and 512px), display mode (`standalone`),
  theme color, and background color
- Service worker is registered on first load
- App shell (HTML, JS, CSS, static assets) is cached on first load
- Byway GeoJSON files are cached on first load
- Cached Places API responses are served when offline (stale-while-revalidate)
- The app functions when launched from the home screen with no network connection:
  the UI renders, the itinerary is visible, byway polylines are visible, the map canvas
  shows a gray base (Google Maps tiles are not cached — see Architecture doc)
- iOS: Add to Home Screen prompt behavior and icon are correct (no white border artifact)
- Lighthouse PWA audit passes all required criteria

---

## Feature 12: Responsive layout

**What it is:** The app is designed mobile-first but is fully usable on a 27-inch desktop.

**Breakpoints:**
- Mobile: < 768px — bottom sheet drawers, full-width cards, FAB for itinerary
- Tablet: 768px–1280px — side panel for info cards, bottom sheet for itinerary
- Desktop: > 1280px — side panel for itinerary drawer, side panel for info cards, both
  visible simultaneously without covering the map

**Acceptance criteria:**
- No horizontal scroll at any viewport width from 320px to 2560px
- Touch targets are at minimum 44x44px on mobile
- Map remains fully interactive at all breakpoints
- The itinerary and an info card can be open simultaneously on desktop without one
  obscuring the other
