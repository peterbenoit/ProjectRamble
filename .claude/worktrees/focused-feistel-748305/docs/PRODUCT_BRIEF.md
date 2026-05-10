# Product Brief — PathWeaver V1

## The problem

Discovering a great local spot, finding the most scenic way to get there, and organizing a
multi-stop day trip are three fragmented experiences across multiple disconnected apps. State
agency PDFs, broken microsite links, and mapping apps that treat trip planning as an afterthought.

PathWeaver unifies the three tools its author already built:

| Predecessor | What it did well | What it lacked |
|---|---|---|
| Florida's Scenic Byways | Curated polyline data, offline PWA, GPS discovery | No POI layer, no itinerary building |
| RouteHub | Itinerary builder, drag-reorder, URL sharing, Google Maps handoff | No map context, no discovery layer |
| ParkFindr | Map-first UI, layered location resolution, Google Places POI data | No scenic corridors, no itinerary |

PathWeaver is not a new idea. It's the right architecture for three ideas that were always meant
to be one app.

---

## What PathWeaver is

A map-first, installable web application that does three things in one workflow:

1. **Discover** — surfaces nearby parks, trailheads, and green spaces via Google Places,
   alongside curated scenic byway corridors as map overlays
2. **Queue** — lets users tap anything on the map (POI or byway segment) and add it to a
   running itinerary
3. **Go** — optimizes the stop order, accepts annotated field notes per stop, encodes the
   itinerary into a shareable URL, and hands off to Google Maps for navigation

---

## Target audience

PathWeaver is built for people who already go places and want more out of the experience. Not
for people who need convincing to go outside.

| User | Scenario |
|---|---|
| Road trip planner | Building a multi-day Florida drive and wants to see every scenic corridor at once instead of hunting through state agency PDFs |
| Dog owner | Finding open, paved green spaces near a hotel in an unfamiliar city |
| Nature photographer | Locating trailheads near a specific county or byway segment for low-angle light |
| Florida resident | Discovering designated scenic roads they've driven past without knowing |
| Weekend day-tripper | Building a 4-stop Saturday route, sharing it with a friend before leaving |

---

## V1 scope

### In scope

- Full-screen Google Maps canvas as the primary interface
- Layered location resolution: remembered permission → IP geolocation → consent modal → fallback
- Google Places Nearby Search for parks, trailheads, and green spaces
- Google Places Autocomplete for address/location search
- Florida scenic byways rendered as color-coded polylines from static GeoJSON
- Tap any POI or byway to add it to an itinerary queue
- Itinerary drawer (slide-up panel): view stop list, drag to reorder, proximity sort
- Field notes: short text annotation per stop
- URL-encoded itinerary sharing via lz-string compression (no server, no account)
- Google Maps handoff: one tap sends all stops as waypoints
- PWA: installable, offline data layer (app shell + data cached; base map tiles require
  connectivity — see Architecture doc for detail)
- Responsive: designed for mobile-first, usable on desktop

### Explicitly out of scope for V1

- User accounts or authentication of any kind
- Server-side database or stored routes
- Community route hub or featured user-submitted routes
- Byway data for states other than Florida (data schema supports it; content does not ship V1)
- Offline base map tiles (Google Maps ToS prohibits tile caching; data layers work offline)
- Drive time estimates or ETA calculation (Google Maps handles this post-handoff)
- Native mobile app (iOS/Android)
- Monetization, ads, or premium tier

---

## Success criteria for V1

- A user can open the app on mobile with no prior setup, grant location, and see nearby parks
  and scenic byways within 3 seconds
- A user can build a 5-stop itinerary, reorder it, annotate two stops, and share it via URL
  in under 2 minutes
- A returning user can open the app in airplane mode and see their previously saved itinerary
  and byway data
- The app passes a Lighthouse PWA audit and scores 90+ on accessibility

---

## What comes after V1

These are named so they don't creep into V1 scope. They are real ideas, just not now.

- **V2: Multi-state byways data** — Add additional states to the GeoJSON dataset using the
  schema established in V1
- **V3: Community circuits** — Featured user-submitted itineraries via URL-encoded sharing
  (no accounts required; moderated by the author)
- **V4: Field Notes layer** — Allow annotated pins to be bundled into a shared URL and
  rendered for the recipient
