# UI Design — PathWeaver V1

---

## Design intent

The UI is a tool, not a product. Every pixel that isn't the map is a pixel that's getting
in the way. The aesthetic should read as "reliable instrument" — something a field
researcher or a rally co-driver would use. High contrast, purposeful, no decoration that
doesn't earn its place.

Reference: the Florida Scenic Byways app's visual language. Dark slates, clean type,
color only where it communicates something.

---

## Color palette

All colors are CSS custom properties defined in `app/globals.css`. Use these throughout
— do not hardcode hex values in components.

```css
:root {
  /* Base */
  --color-bg:         #020617;   /* slate-950 — page background */
  --color-surface:    #0f172a;   /* slate-900 — cards, drawer, panels */
  --color-surface-2:  #1e293b;   /* slate-800 — elevated surfaces, inputs */
  --color-border:     #334155;   /* slate-700 — dividers, input borders */

  /* Text */
  --color-text-primary:   #f8fafc;   /* slate-50 */
  --color-text-secondary: #94a3b8;   /* slate-400 */
  --color-text-muted:     #475569;   /* slate-600 */

  /* Interactive */
  --color-accent:         #3b82f6;   /* blue-500 — primary actions */
  --color-accent-hover:   #2563eb;   /* blue-600 */
  --color-accent-muted:   #1e3a5f;   /* dim blue — selected states */

  /* Feedback */
  --color-success:   #22c55e;   /* green-500 */
  --color-warning:   #f59e0b;   /* amber-500 */
  --color-error:     #ef4444;   /* red-500 */

  /* User location */
  --color-location:  #60a5fa;   /* blue-400 — current location dot */
}
```

---

## Typography

```css
/* In app/layout.tsx, load via next/font/google */
/* Primary: Geist or Inter — clean, legible at small sizes on dark backgrounds */
/* Monospace: Geist Mono — for coordinates, IDs if shown */

body {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}
```

Type scale:

| Use | Size | Weight |
|---|---|---|
| Page title (share view) | 1.25rem | 600 |
| Card / panel heading | 1rem | 600 |
| Body / stop names | 0.9375rem | 400 |
| Secondary / addresses | 0.875rem | 400 |
| Labels / badges | 0.75rem | 500 |
| Field note text | 0.875rem | 400, italic |

---

## Map style

Pass this to the Google Maps `Map` constructor as the `styles` option. Store in
`lib/map-style.ts`.

```typescript
export const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#020617' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#0f2417' }],  /* Dark green tint for parks/nature */
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f2417' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4ade80' }],  /* Green for park labels */
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#253347' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2d4a6e' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e3a5f' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0a1628' }],  /* Dark navy for water */
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#334155' }],
  },
];
```

---

## Map markers

### User location

A pulsing blue dot. Implement as a custom `google.maps.Marker` with a canvas-drawn SVG:

- Outer ring: 20px circle, `var(--color-location)` at 30% opacity, animates pulse
- Inner dot: 10px circle, `var(--color-location)` solid
- No label

### POI markers

Custom pin icon. Use Google Maps `AdvancedMarkerElement` (not the deprecated `Marker` class).

Default state:
- Icon: `lucide-react` `Trees` icon (or `Leaf`), white on `var(--color-accent)` circle
- Size: 32px circle

Selected state (when the info card is open):
- Background: white, icon color `var(--color-accent)`
- Drop shadow added

Itinerary state (when added to the itinerary):
- Small numbered badge overlay showing the stop's position in the itinerary

### Byway polylines

Each byway uses the `color` from its GeoJSON properties.

Default state:
- `strokeWeight: 4`
- `strokeOpacity: 0.8`

Hover/selected state:
- `strokeWeight: 6`
- `strokeOpacity: 1.0`
- Cursor changes to pointer

---

## Key screens

### Main map view

```
┌─────────────────────────────────────────────────┐
│  [Search bar — top, full width, 48px tall]      │
│  [Layers toggle — top right, 36px icon button]  │
│                                                  │
│                                                  │
│              (MAP CANVAS)                        │
│                                                  │
│                                                  │
│                                                  │
│                              [FAB — itinerary]  │
│  [Location button — bottom left, 36px]          │
└─────────────────────────────────────────────────┘
```

The search bar is sticky at the top. The FAB (Floating Action Button) is bottom-right with
a count badge when stops are present. The location recenter button is bottom-left.

### Info card (bottom sheet, mobile)

```
┌─────────────────────────────────────────────────┐
│  ————  (drag handle)                            │
│  Place Name                         ★ 4.2 (128) │
│  State Park · 2.3 miles away                    │
│  123 Main St, Ocala FL 32801                    │
│  Open now · Closes 8:00 PM                      │
│                                                  │
│  [+ Add to Itinerary]  [View in Google Maps ↗]  │
└─────────────────────────────────────────────────┘
```

Height: max 45vh. Drag handle at top. Dismiss by swipe-down or tap outside.

### Itinerary drawer (slide-up, mobile)

```
┌─────────────────────────────────────────────────┐
│  ————  (drag handle)                            │
│  My Route (3 stops)         [Sort] [Share] [✕]  │
│  ─────────────────────────────────────────────  │
│  ⠿  1  Paynes Prairie             [✕]           │
│       State Preserve · Park                     │
│       "Good for wildlife at dawn" — field note  │
│  ─────────────────────────────────────────────  │
│  ⠿  2  Micanopy Historic District [✕]           │
│       Historic Town Center                      │
│       [+ Add a note]                            │
│  ─────────────────────────────────────────────  │
│  ⠿  3  Marjorie Kinnan Rawlings   [✕]           │
│       Historic State Park                       │
│                                                  │
│  [Open in Google Maps →]                        │
└─────────────────────────────────────────────────┘
```

The `⠿` icon is the drag handle per stop. "Sort" triggers proximity sort. "Share" copies
the encoded URL to clipboard. The drawer can be partially collapsed showing just the handle
and stop count.

### Shared itinerary view (/share/[encoded])

A static read-only page. No map interaction. Styled consistently with the app.

```
PathWeaver

My Saturday Route · 3 stops

[Static Google Maps embed or iframe showing all stops as pins]

1  Paynes Prairie State Preserve
   State Park · Micanopy, FL
   "Good for wildlife at dawn"

2  Micanopy Historic District
   Historic Town Center · Micanopy, FL

3  Marjorie Kinnan Rawlings Historic State Park
   Historic State Park · Cross Creek, FL

[Open in Google Maps →]

Built with PathWeaver
```

---

## Component behavior notes

### Drawer animations

Use `shadcn/ui` Sheet or Drawer component (Vaul-based). The drawer animates up from the
bottom with a spring easing. Do not use `transition: all` — be specific about what
properties are animated to avoid jank on low-end devices.

### Toast notifications

Use `shadcn/ui` Sonner (toast). Position: bottom-center on mobile, bottom-right on desktop.
Duration: 2500ms. Used for "Added to itinerary," "Link copied," and error states.

### Loading states

- POI fetch: pulse skeleton markers on the map (3–4 placeholder pins) while loading
- App initial load: the map renders immediately; POIs overlay onto it as they arrive
- No full-page loading spinners

### Accessibility

- All interactive elements have visible focus styles (`outline: 2px solid var(--color-accent)`)
- FAB, location button, layer toggle: all have `aria-label`
- Itinerary stops in the drawer: drag handle has `aria-roledescription="sortable"`
- Info cards are announced as they open (`aria-live="polite"` on the card container)
- Color is never the only means of conveying information (byway colors also have labels)
- Minimum touch target: 44x44px (enforced via Tailwind `min-w-[44px] min-h-[44px]`)

---

## PWA manifest

```json
{
  "name": "PathWeaver",
  "short_name": "PathWeaver",
  "description": "Discover scenic routes and plan multi-stop trips across the US",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#020617",
  "theme_color": "#020617",
  "orientation": "any",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

Icons should use the accent blue (`#3b82f6`) on the dark background (`#020617`) for
consistency with the app aesthetic.
