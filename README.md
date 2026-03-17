> React/Vite SPA showcasing 13 curated architectural doors across Barcelona.
> Pure *maquetación*: pre-designed template PNGs carry all visual design; code does layout and interaction only.

**Repo**: `https://github.com/iraetax-byte/PORTAPORTA.git`
**Stack**: React 18 + Vite 7 — No routing library, no CSS framework. Inline styles, custom cursor, film grain overlay.
**Fonts**: Helvetica Neue (woff2, 5 weights) + Snell Roundhand. All generated text is white only.

---

## Architecture Overview

### Views

| View | File | Purpose |
|------|------|---------|
| **Home** | `src/views/HomeView.jsx` | Fence-gate intro animation. Hover-only (no clicks). Reveals `title.png`, then auto-transitions to Map. |
| **Map** | `src/views/MapView.jsx` | Zoomable Barcelona map with door markers. Side card popup on marker click. |
| **Gallery** | `src/views/GalleryView.jsx` | Horizontal card carousel with spring animation. Two modes: cards and menu list. |
| **Product** | `src/views/ProductView.jsx` | Full-screen product page per door. Parallax door photo + interactive hotspots. |
| **About** | `src/views/AboutView.jsx` | Info page with style legend. |

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| **Header** | `src/components/Header.jsx` | Logo (90px, right-aligned), nav reveal animation, language selector (CA/EN/ES). Logo click → "door of the day". |
| **LayeredPhotoViewer** | `src/components/LayeredPhotoViewer.jsx` | Interactive PNG composition system with pixel-accurate hover detection via canvas alpha maps. Supports doorknob, spin, fullspin, fall, sticker animations. Video overlay trigger. |
| **CustomCursor** | `src/components/CustomCursor.jsx` | Custom cursor following mouse position. |

### Data

| File | Purpose |
|------|---------|
| `src/data/doors.js` | 13 door entries. 10 main (hasProductPage: true) + 3 extra ("coming soon"). Each has: name (i18n), address, style, year, architect, photo/card/product filenames, mapX/mapY coordinates, hotspots array, details array. |
| `src/data/interactiveLayers.js` | Configuration for LayeredPhotoViewer compositions: wood2, wood4, wood1, wood6, metal1. Defines base images, layer files, animation types, transform origins, zoom parameters. |
| `src/data/i18n.js` | Translation strings for UI labels. |

---

## Image Layering System — CRITICAL CONTEXT

This project uses **three distinct layering approaches** depending on the view. Getting these wrong has been the primary source of bugs across sessions.

### 1. Gallery Cards (door photo BOTTOM, card overlay TOP)

```
┌─────────────────────┐
│ Card PNG (z:2)       │ ← 82% transparent overlay frame with pre-designed text/borders
│ ┌─────────────────┐ │
│ │ Door photo (z:1) │ │ ← Fills entire card area, objectFit: cover
│ └─────────────────┘ │
└─────────────────────┘
```

The card PNG is mostly transparent — only the decorative frame, text labels, and border elements are opaque (~18%). The door photo shows through the transparent areas. **This was the original working approach and should NOT be changed.**

### 2. Map Side Card (card PNG BOTTOM frame, door photo fills rectangle ON TOP)

```
┌─────────────────────┐
│ Card PNG (z:1)       │ ← Bottom layer frame (same card PNGs)
│ ┌──────────┐        │
│ │Door photo│ (z:2)  │ ← Positioned at: top=11.2%, left=27.7%, width=44.6%, height=32.5%
│ │(in rect) │        │   objectFit: cover
│ └──────────┘        │
└─────────────────────┘
```

Here the card PNG acts as a decorative frame at z:1. The door photo is placed ON TOP at z:2, positioned precisely within the black rectangle area of the card design.

### 3. Product View (product PNG BOTTOM frame, door photo fills rectangle ON TOP)

```
┌──────────────────────────────┐
│ Product PNG (z:1)             │ ← Full-screen frame with all pre-designed text/layout
│ ┌────────┐                   │
│ │Door    │ (z:2)             │ ← Positioned at: top=5.8%, left=3.2%, width=41.7%, height=88.4%
│ │photo   │ + parallax        │   With ±12px parallax mouse tracking
│ │(in     │ + hotspots (z:3)  │   Interactive hotspot zones overlay the door photo
│ │rect)   │                   │
│ └────────┘                   │
└──────────────────────────────┘
```

The product PNG contains ALL text and design. ZERO generated text should appear. Product PNG at z:1, door photo at z:2 with parallax and overflow:hidden, interactive hotspot zones at z:3.

---

## Fence Animation (HomeView) — KNOWN ISSUE

### How It Should Work (from old working build)
The old build used a **container + image** approach for each fence half:

```
OLD (WORKING):
  Left Container:  position:absolute, left:0, bottom:0, width:"50%", height:"100%", overflow:hidden
  Left Image:      position:absolute, bottom:0, right:0, width:"200%", height:auto, minHeight:"100%"
                   objectFit:cover, objectPosition:"right bottom"
                   filter: brightness(0.6) contrast(1.1)

  Right Container: position:absolute, right:0, bottom:0, width:"50%", height:"100%", overflow:hidden
  Right Image:     position:absolute, bottom:0, left:0, width:"200%", height:auto, minHeight:"100%"
                   objectFit:cover, objectPosition:"left bottom"

  Reveal: Container transform: translateX(±105%)
  Timing: 1.2s cubic-bezier(0.4, 0, 0.2, 1)
```

Key insight: Each **container** is 50% screen width with overflow:hidden. Each **image** inside is 200% of its container (= 100% of screen width). The image is anchored to the inner edge (right:0 for left fence, left:0 for right fence). This means the ornamental gate details at the center of each image meet at the screen center.

### Current State (BROKEN)
The current version places bare `<img>` tags without containers:

```
CURRENT (BROKEN):
  Left img:  right:"50%", width:"60vw", bottom:0
  Right img: left:"50%", width:"60vw", bottom:0
```

This approach doesn't clip the images properly and the 60vw width may not show enough of the gate details. The fence images are 2000x1001 (landscape), with the ornamental ironwork in the center-right (left fence) and center-left (right fence) areas.

### FIX NEEDED
Restore the container+image approach from the old build. Each half gets a 50%-width container with overflow:hidden, and the image inside is 200% width anchored to the edge nearest screen center.

---

## Gallery — REGRESSION ANALYSIS

### Old Build (Working)
The old gallery used a simpler card structure without card PNG overlays:

```
OLD GALLERY CARD:
  - Door photo: position:absolute, inset:0, objectFit:cover
    filter: brightness(0.55) contrast(1.08) saturate(0.85)
  - Gradient overlay: position:absolute, bottom:0, height:40%
    background: linear-gradient(transparent, rgba(0,0,0,0.85))
  - No card PNG overlay at all
  - Hover: translateY(-8px) scale(1.02)
  - Card container: border: 1px solid rgba(255,255,255,0.1)
```

### Current Build
The current gallery adds card PNG overlay on top of the door photo, which is the desired direction:

```
CURRENT GALLERY CARD:
  - Door photo (z:1): position:absolute, inset:0, objectFit:cover, objectPosition:center top
  - Card PNG (z:2): position:absolute, inset:0, objectFit:fill, pointerEvents:none
  - No gradient overlay (the card PNG provides the visual frame)
  - Hover: translateY(-10px) scale(1.03)
  - borderRadius: 12px, overflow: hidden
```

### Assessment
The current gallery approach (door photo bottom + card PNG overlay) is correct per the design intent. However:
- The old build's filter `brightness(0.55) contrast(1.08) saturate(0.85)` on door photos created a moody look that may be missed
- The old build's gradient overlay added depth that the card PNG may or may not replicate
- The `borderRadius: 12px` is new and may not match the card PNG edges

---

## Hotspot System — WHAT'S MISSING

### Data Status
All 13 doors currently have `hotspots: []` (empty arrays). This means the ProductView hotspot rendering code exists but **never activates** because there's no data to render.

### What Needs to Happen
Each door's `hotspots` array needs to be populated with objects like:
```js
{
  id: "wood2",
  x: 30,      // % from left of door photo
  y: 45,      // % from top of door photo
  w: 20,      // % width of clickable zone
  h: 25,      // % height of clickable zone
  detail: "wood2hot1.png"  // key into INTERACTIVE_LAYERS
}
```

When a hotspot is clicked, ProductView checks INTERACTIVE_LAYERS for a matching config. If found → opens LayeredPhotoViewer. If not → shows a simple detail image overlay.

### LayeredPhotoViewer is Complete
The component itself (680 lines) is fully implemented with:
- Pixel-accurate hover detection via 256x256 canvas alpha maps
- 5 animation types: doorknob (elastic rotation), spin (continuous), fullspin (360°), fall (metal plate detachment + gravity), sticker (click-to-attach/place)
- Video overlay triggered by cursor crossing horizontal center
- Zoom system for fall layers (click to zoom in/out, overflow:hidden clipping)
- Dual-keyframe CSS trick for animation replay without remounting

### Available Interactive Compositions
Already configured in `interactiveLayers.js`:
- **wood2**: doorknob handle + spinning detail
- **wood4**: doorknob handle + fullspin lock (cerrojo)
- **wood1**: sticker (lift & place)
- **wood6**: video trigger (wood6det1.mp4)
- **metal1**: fall animation (metal plate detaches, falls, fades back) + zoom

### Interactive Photo Assets
Located in `/public/interactivephotos/`:
- wood1hot1.png, wood1det1.png (+ .psd source)
- wood2hot1.png, wood2det1.png, wood2det2.png
- wood4hot1.png, wood4det1.png, wood4det2.png
- wood6hot1.png, wood6det1.mp4
- metal1hot1.png, metal1det1.png

---

## Sidebar / Map Card — Old vs Current

### Old Build (No Card PNG)
The old map sidebar used a simple glass-effect panel:
```
position: fixed, left: 24px, top: 50%, translateY(-50%)
width: 280px, maxHeight: 80vh
background: rgba(12,10,9,0.97), backdropFilter: blur(14px)
border: 1px solid rgba(255,255,255,0.08)
boxShadow: 0 16px 60px rgba(0,0,0,0.7)
zIndex: 30

Photo: objectFit: contain, objectPosition: center top
       filter: brightness(0.72) contrast(1.05)
       height: 180px
Gradient: linear-gradient(transparent 35%, rgba(12,10,9,0.95) 100%)
```

### Current Build (Card-in-Rectangle)
The current map side card uses card PNG as bottom frame with door photo positioned in the black rectangle on top. This is the intended new design.

---

## Product View — Old vs Current

### Old Build
Simple layout: 35% left column (photo, objectFit:contain, centered), 30% right column (text info). No product PNG, no template layering.
```
Photo: maxWidth:100%, maxHeight:100%, objectFit:contain
       filter: brightness(0.8) contrast(1.05)
       border: 1px solid rgba(255,255,255,0.06)
```

### Current Build
Full template approach: product PNG fills screen as bottom frame, door photo fills the left rectangle with parallax + hotspot overlays. **This is the intended direction** — the product PNG already contains all text and design, so zero generated text is needed.

---

## Asset Locations

```
public/
├── media/
│   ├── doors/        porta1-13.png     (door photos, ≤2000px)
│   ├── cards/        card1-10.png      (card templates, ≤2000px)
│   ├── products/     product1-10.png   (product templates, ≤2000px)
│   ├── details/      Detail1-18.png + detail jpgs + wood/metal jpgs
│   ├── map/          barcelona-map.jpg (map background)
│   └── title.png                       (title reveal image)
├── icons/            keylock_icon.png + style icons (gothic, modern, etc.)
├── interactivephotos/  base + layer PNGs + .mp4 for LayeredPhotoViewer
├── fonts/            HelveticaNeue*.woff2 + SnellRoundhand.woff2
├── fenceleft.png     (2000x1001, gate ornament on center-right)
├── fencelright.png   (2000x1001, gate ornament on center-left, mirror)
└── cursor1.png, cursor2.png
```

All images have been resized to ≤2000px on longest side (preventing chat/context crashes in development tools).

---

## CSS & Animation Reference

### Timing Functions
- **Primary** (snappy): `cubic-bezier(0.23, 1, 0.32, 1)` — 0.3-0.4s interactions
- **Secondary** (smooth): `cubic-bezier(0.4, 0, 0.2, 1)` — 1.2s transitions
- **Elastic** (doorknob): `cubic-bezier(0.34, 1.3, 0.64, 1)` — 0.44s

### Filter Presets
- Gallery card photos: `brightness(0.55) contrast(1.08) saturate(0.85)` (old build, moody)
- Map sidebar photo: `brightness(0.72) contrast(1.05)`
- Product photo: `brightness(0.8) contrast(1.05)`
- Fence images: `brightness(0.6) contrast(1.1)`

### zIndex Stack
```
100,000  Custom cursor overlay
100      Header
50       Modal overlays (detail view, LayeredPhotoViewer)
30       Map sidebar
20       Elevated elements (card hover, filter dots, nav buttons)
10       Fence animation
1-3      Content layers (photo/card/product layering)
```

---

## Immediate Fix Priorities

### 1. FENCE ANIMATION (Critical — blocks entry to app)
**Problem**: Current code puts bare `<img>` tags without overflow containers. The old working code used a `<div>` container per half (50% width, overflow:hidden) with the image inside at 200% width.
**Fix**: Restore the container+image pattern. Left container: left:0, width:50%, overflow:hidden. Image inside: width:200%, right:0, objectPosition:"right bottom". Mirror for right side. Reveal transforms go on the containers, not the images.

### 2. HOTSPOT DATA (Feature gap — hotspots never render)
**Problem**: All doors have `hotspots: []`. The rendering code and LayeredPhotoViewer are ready but have no data to work with.
**Fix**: Populate hotspot arrays for at least doors 1-5 with coordinates mapping clickable zones to detail keys in INTERACTIVE_LAYERS. Cross-reference the door photos against the interactivephotos assets to define accurate x/y/w/h percentages.

### 3. GALLERY VISUAL POLISH
**Problem**: The card-overlay approach is correct but may need filter/gradient adjustments to match the moody aesthetic of the old build.
**Fix**: Consider adding back `filter: brightness(0.55) contrast(1.08) saturate(0.85)` to door photos in gallery cards, and verify borderRadius doesn't clip card PNG edges incorrectly.

---

## Build & Deploy

```bash
# Development
npm install
npx vite          # → http://localhost:5173

# Production build
npx vite build    # outputs to dist/

# Important: index.html must reference /src/main.jsx (not a stale bundle)
# If only ~4 modules transform instead of ~44, check the script tag in index.html
```

---

## Git Setup

```bash
git init
git remote add origin https://github.com/iraetax-byte/PORTAPORTA.git
git add -A
git commit -m "Initial commit"
git push -u origin main
```

Note: The development environment has a read-only mount that prevents git operations directly on the project folder. Git operations may need to be performed from the user's local machine.

---

## Design Philosophy

**Pure maquetación** — the PNG templates (cards, products) carry ALL visual design: typography, layout, borders, decorative elements. The code's job is placement and interaction only. If you find yourself generating text, colored borders, or UI elements that already exist in the template PNGs, you're going the wrong direction.

**Three golden rules:**
1. Never generate text that's already baked into a template PNG
2. Keep the layering order correct per the view (gallery ≠ map ≠ product)
3. All user-facing text is white Helvetica Neue — no accent colors in generated UI
