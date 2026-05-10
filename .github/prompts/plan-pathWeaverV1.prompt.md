# Plan: PathWeaver V1 — Implementation Checklist

The Nuxt app lives in `.claude/worktrees/focused-feistel-748305/`. All work happens there. The project root is just docs + data.

> **How to use this checklist:** Work one phase at a time. Complete all items in a phase before moving to the next. Each phase's tasks are independent within the phase but depend on prior phases being done.

**Before anything else — git sync:**
- Run `git pull` inside the worktree directory

---

## What's already done ✅
- All 3 server route proxies (places, autocomplete, details, IP geolocation)
- `lib/storage.js`, `lib/url-encoding.js`, `lib/google-maps.js`, `data/byways/index.js`
- `nuxt.config.js`, `app.vue`, `pages/index.vue` (shell structure)
- `FieldNoteInput.vue` (UI done, needs store wired)
- `haversineDistance()` in proximity-sort.js

---

## Phase 1 — Core data layer
- [ ] **1a.** `lib/places.js` — implement `normalizePlacesResult()` (maps raw API → POI shape)
- [ ] **1b.** `lib/proximity-sort.js` — implement `sortByProximity()` (nearest-neighbor greedy)
- [ ] **1c.** `lib/map-style.js` — paste dark map style JSON from UI_DESIGN.md

## Phase 2 — Pinia stores
- [ ] **2a.** `stores/map.store.js` — `setMap`, `setCenter`, `setZoom`, `toggleLayer`
- [ ] **2b.** `stores/discovery.store.js` — `setResults`, `selectPOI`, `clearSelection`, `setSearchQuery`, `setSearching`
- [ ] **2c.** `stores/itinerary.store.js` — all actions + `$subscribe` watcher for localStorage persistence

## Phase 3 — Composables
- [ ] **3a.** `composables/useLocation.js` — layered resolution (cached geolocation → IP in parallel → 800ms modal → Florida fallback)
- [ ] **3b.** `composables/usePOISearch.js` — `searchNearby()` with loading state + error toast. Ensure `searchNearby()` handles API errors gracefully by displaying a non-blocking error toast and retrying the request up to 3 times before giving up; the map must remain functional on failure.
- [ ] **3c.** `composables/useItinerary.js` — wire all methods: add/remove/reorder/note/sort/share/openInMaps

## Phase 4 — Map components
- [ ] **4a.** `components/map/MapCanvas.vue` — init map, apply style, hide controls, idle → POI refresh, click → clear selection
- [ ] **4b.** `components/map/BywayLayer.vue` — render Polylines from GeoJSON, toggle visibility, hide below zoom 7, click → info card
- [ ] **4c.** `components/map/POIMarkers.vue` — render AdvancedMarkerElements, click → select POI, clean up on results change
- [ ] **4d.** `components/map/UserLocation.vue` — pulsing blue dot, update on coords change

## Phase 5 — Discovery UI
- [ ] **5a.** Install shadcn-vue Sheet + Drawer. If these components already exist in `components/ui/`, verify their functionality and update if necessary. Run: `npx shadcn-vue@latest add sheet drawer`
- [ ] **5b.** `components/discovery/SearchBar.vue` — floating input, debounced autocomplete, select → re-center + search
- [ ] **5c.** `components/discovery/POICard.vue` — render POI details, Add/In Itinerary button, dismiss behavior, mobile bottom sheet / desktop side panel

## Phase 6 — Itinerary UI
- [ ] **6a.** `components/itinerary/StopItem.vue` — drag handle, number, name, note preview, delete
- [ ] **6b.** `components/itinerary/StopList.vue` — wrap with `<draggable>`, empty state
- [ ] **6c.** `components/itinerary/ItineraryDrawer.vue` — FAB with badge, drawer with Sort/Share/OpenInMaps

## Phase 7 — Sharing & PWA
- [ ] **7a.** `pages/share/[encoded].vue` — **MISSING**, must be created from scratch; decode URL, render read-only list + static map
- [ ] **7b.** Verify `public/manifest.json` has correct icons/display/theme
- [ ] **7c.** Confirm 192px + 512px PWA icons exist in `public/`

## Phase 8 — Hardening
- [ ] **8a.** `server/api/places/nearby.post.js` — add coordinate validation (400 if lat/lng missing/non-numeric)

## Phase 9 — Responsive layout
- [ ] **9a.** No horizontal scroll from 320px to 2560px
- [ ] **9b.** POICard: side panel on ≥768px, bottom sheet on mobile
- [ ] **9c.** ItineraryDrawer: side panel on ≥1280px, slide-up on mobile/tablet
- [ ] **9d.** Touch targets ≥44×44px for all interactive elements

## Phase 10 — Tests
- [ ] **10a.** Install vitest + happy-dom: `npm install --save-dev vitest happy-dom`
- [ ] **10b.** Create `vitest.config.js` with `environment: 'happy-dom'` and `include: ['tests/**/*.test.js']`
- [ ] **10c.** Add `"test": "vitest run"` and `"postbuild": "vitest run"` to `package.json` scripts so tests run automatically after every `npm run build`
- [ ] **10d.** Write unit tests for each completed lib file (`tests/lib/`): `places.test.js`, `proximity-sort.test.js`, `storage.test.js`, `url-encoding.test.js`
- [ ] **10e.** Write store action tests (`tests/stores/`): `itinerary.store.test.js` covering addStop, removeStop, reorderStops, updateFieldNote, sortByProximity
- [ ] **10f.** Write composable tests (`tests/composables/`): `useItinerary.test.js` covering share URL generation and openInGoogleMaps URL format
- [ ] **10g.** Run `npm test` — all tests must pass before the build is considered complete

## Phase 11 — Verification
- [ ] `npm run dev` — no console errors
- [ ] Map renders dark style, centered on Florida
- [ ] Location resolves via IP fallback within 1s
- [ ] POI markers appear after location resolves
- [ ] Byway polylines visible at zoom ≥7
- [ ] Search bar autocomplete returns suggestions
- [ ] Add stop → appears in itinerary drawer
- [ ] Field note saves on type
- [ ] Share URL decodes correctly on `/share/[encoded]`
- [ ] "Open in Google Maps" constructs correct waypoint URL
- [ ] Lighthouse PWA audit passes
- [ ] Mobile (375px) + desktop (1440px) smoke test
