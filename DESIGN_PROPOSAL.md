# 🛰️ GlobeNews Live — "Orbital Command" UI Redesign Proposal

## Design Vision

**"You're not reading the news. You're commanding a orbital intelligence station."**

Current OSINT dashboards look like cluttered spreadsheets. We will transform GlobeNews Live into a **spatial, cinematic intelligence interface** that feels like a fusion of:
- Palantir Gotham (data density + clarity)
- Cyberpunk 2077 UI (immersive, diegetic)
- Apple Vision Pro spatial computing (depth, layering, focus)
- Bloomberg Terminal (information density for power users)
- Hollywood war room interfaces (emotional impact, legibility at distance)

---

## 1. Core Design Principles

### A. Depth Over Flatness
Every element exists on a Z-axis layer:
- **Z-0**: The map/globe (full-bleed background)
- **Z-1**: Ambient threat glow (subtle colored atmospheric haze)
- **Z-2**: Data blades/panels (floating above the map)
- **Z-3**: Modal overlays and focus elements
- **Z-4**: Breaking alerts and critical notifications

### B. Information Architecture: The "Blade" System
Instead of 20+ widgets scattered in a grid, we organize content into **6 primary blades** that slide in from screen edges:

| Blade | Position | Content |
|-------|----------|---------|
| **Signal Blade** | Left edge | Live intel feed, threat classification, breaking alerts |
| **Theater Blade** | Right edge | Regional context, country deep-dives, risk indices |
| **Market Blade** | Bottom edge | Tickers, prediction markets, trading charts |
| **Tracking Blade** | Right edge (tabbed) | Flights, ships, earthquakes, cyber events |
| **Command Blade** | Top edge | Global threat level, time, mode switches, search |
| **Synthesis Blade** | Center-right (floating) | AI briefs, causality graph, scenario simulator |

Users can collapse/expand blades. On large screens, multiple blades can be visible simultaneously.

### C. Typography as Visual Hierarchy
- **Display numbers** (conflict counts, threat percentages) use a massive, monospaced font at 48-96px
- **Headlines** use a condensed sans-serif for scanability
- **Body text** stays small (11-12px) to maximize data density
- **Labels** are always uppercase, tracked out, and dimmed

### D. Adaptive Ambience
The entire interface responds to the global threat level:
- **LOW**: Cool blue ambient glow, calm breathing animations
- **GUARDED**: Neutral cyan accents, normal refresh rates
- **ELEVATED**: Warm amber edge lighting, faster pulse
- **HIGH**: Orange atmospheric haze, urgent micro-animations
- **SEVERE**: Deep red washes the viewport, critical elements strobe gently, non-essential UI fades back

---

## 2. New Color System: "Void Spectrum"

We move away from the generic "green hacker terminal" aesthetic to a more sophisticated, threat-responsive palette.

### Background Layers
```
--void-deepest:    #030508    // True black, map background
--void-deep:       #080c14    // Page background
--void-mid:        #0d1320    // Panel backs
--void-raised:     #141b2d    // Elevated surfaces
--void-shallow:    #1e2940    // Interactive elements
```

### Accent Spectrum (Threat-Responsive)
Instead of flat colors, we use **glowing neon accents** with CSS box-shadow layers:

```
// CRITICAL — Plasma Red
--critical-500: #ff1a1a
--critical-glow: 0 0 20px rgba(255, 26, 26, 0.4), 0 0 60px rgba(255, 26, 26, 0.1)

// HIGH — Warning Amber
--high-500: #ff9500
--high-glow: 0 0 20px rgba(255, 149, 0, 0.3), 0 0 50px rgba(255, 149, 0, 0.08)

// ELEVATED — Caution Gold
--elevated-500: #f0c000

// GUARDED — Ice Blue
--guarded-500: #00d4ff
--guarded-glow: 0 0 20px rgba(0, 212, 255, 0.25)

// LOW — Signal Green
--low-500: #00ff9d
--low-glow: 0 0 20px rgba(0, 255, 157, 0.2)

// Information — Electric Violet
--info-500: #8b5cf6
--info-glow: 0 0 20px rgba(139, 92, 246, 0.25)
```

### UI Neutrals
```
--text-primary:   #f0f4f8    // Headlines, primary data
--text-secondary: #b8c5d6    // Body, descriptions
--text-tertiary:  #6b7a8f    // Labels, metadata
--text-dim:       #3d4d61    // Inactive, disabled
--border-subtle:  rgba(255, 255, 255, 0.06)
--border-default: rgba(255, 255, 255, 0.1)
--border-active:  rgba(255, 255, 255, 0.2)
```

---

## 3. Typography System

### Font Stack
- **Display / Numbers**: `Inter` or `SF Pro Display` (we'll use `Inter` from Google Fonts)
- **Monospace / Data**: `JetBrains Mono` (already in use, keep it)
- **Condensed / Headers**: `Oswald` or `Barlow Condensed` for scanability

### Type Scale
| Token | Size | Weight | Use Case |
|-------|------|--------|----------|
| `display-hero` | 72px | 200 (thin) | Main threat level, big counters |
| `display-large` | 48px | 300 | Theater names, major stats |
| `display` | 32px | 400 | Panel titles, section headers |
| `heading` | 18px | 500 | Widget titles |
| `label` | 10px | 600 | Uppercase labels, timestamps |
| `body` | 12px | 400 | Descriptions, news text |
| `caption` | 10px | 400 | Metadata, source names |
| `mono-data` | 14px | 500 | Prices, coordinates, counts |

---

## 4. Layout Architecture

### Desktop: The "Orbital" Layout (1920x1080 optimal)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [LOGO]  THREAT: SEVERE          UTC 14:32:18    [WAR ROOM] [TV]  │  ← Command Blade (64px)
├──────────┬──────────────────────────────────────────┬──────────────┤
│          │                                          │              │
│  SIGNAL  │                                          │   THEATER    │
│  BLADE   │                                          │   BLADE      │
│  (340px) │         MAP / GLOBE (FULL-BLEED)         │   (380px)    │
│          │                                          │              │
│  Live    │         ← Z-0 Background Layer →         │   Country    │
│  Feed    │                                          │   Risks      │
│          │    ┌─────────────────────────────┐       │              │
│  Threat  │    │   SYNTHESIS BLADE           │       │   Tracking   │
│  Class   │    │   (AI Brief / Causality)    │       │   (tabbed)   │
│          │    │   Floating, collapsible     │       │              │
│  Breaking│    └─────────────────────────────┘       │              │
│  Alerts  │                                          │              │
│          │                                          │              │
├──────────┴──────────────────────────────────────────┴──────────────┤
│  [SPX +0.32%] [OIL +1.15%] [GOLD -0.21%] [BTC $67,234] ...        │  ← Market Blade (56px)
└─────────────────────────────────────────────────────────────────────┘
```

### Key Layout Innovations

1. **Full-Bleed Map Background**
   - The map/globe occupies the ENTIRE viewport behind the UI
   - Blades float above with `backdrop-filter: blur(20px) saturate(180%)`
   - When a blade expands, the map subtly darkens behind it (spotlight effect)

2. **Collapsible Blades**
   - Each blade has a "collapse to rail" state
   - Collapsed blades show only icons + key indicator dots
   - Hovering a rail previews the blade content

3. **Focus Mode**
   - Press `F` or click the focus button
   - All blades collapse to rails
   - Map/globe takes 95% of the screen
   - Only breaking alerts remain visible

4. **Synthesis Blades Are Floating**
   - AI Brief, Causality Graph, and Scenario Simulator float as "orbiting" panels
   - They can be dragged, minimized to pills, or docked to edges
   - This makes them feel like "tools" rather than static widgets

### Mobile: The "Tactical HUD" Layout
Instead of 4 boring tabs, we use a **radial menu** + **swipeable blades**:
- Bottom-center: Floating action button that opens a radial command menu
- Swipe from left edge: Signal Blade
- Swipe from right edge: Theater Blade
- Swipe from bottom: Market Blade
- Pinch: Zoom map
- Double-tap: Toggle focus mode

---

## 5. Component Design Language

### A. The "Holographic Card"

Every panel/blade uses this visual treatment:

```css
.holo-card {
  background: 
    linear-gradient(135deg, rgba(20, 27, 45, 0.85) 0%, rgba(13, 19, 32, 0.9) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-left: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}
```

**Chromatic edge effect** (the "mindblowing" detail):
```css
.holo-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 40%,
    transparent 60%,
    rgba(255, 255, 255, 0.05) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: ...
  pointer-events: none;
}
```

### B. Data Cells / List Items

Signal feed items become **"Intel Cards"**:
- Left edge: 3px severity color strip that glows
- Top row: Source name + timestamp (tertiary color)
- Middle: Headline (primary color, 12px)
- Bottom: Category pill + region pill
- Hover: Card lifts (translateY -2px), glow intensifies
- Critical items have a **subtle strobe** on the left edge

### C. The Threat Orb

Replace the boring "DEFCON" text with a **Threat Orb** — a 3D-looking sphere in the top-left that changes color and pulse speed based on threat level:
- LOW: Slow cyan breathe
- SEVERE: Fast red strobe with particle aura
- Clicking it opens the global situation summary

### D. Metric Displays

Numbers that matter are displayed as **"Big Data"**:
```
┌─────────────────┐
│      47         │  ← 72px, thin weight
│  ACTIVE WARS    │  ← 10px, uppercase, tracked
└─────────────────┘
```

### E. The Timeline Scrubber

A **cinematic horizontal timeline** at the bottom of the map area (above the market ticker):
- Shows the last 24 hours as a heat strip
- Brighter = more activity
- Click and drag to scrub back in time
- This is the foundation for the "Time Machine" feature

---

## 6. Motion & Animation System

### A. Page Load Sequence
1. **0ms**: Screen is black
2. **200ms**: Map grid lines fade in
3. **400ms**: Threat Orb pulses to life
4. **600ms**: Command Blade drops in from top
5. **800ms**: Side blades slide in
6. **1000ms**: Data starts populating with a "typewriter" reveal
7. **1200ms**: Market ticker begins scrolling

### B. Data Update Animations
- New signals: **Slide in from left** + severity glow flash
- Market changes: **Number rolls** (slot machine effect) for price changes
- Map markers: **Pop in** with elastic easing
- Threat level change: **Orb color morphs** over 1s, ambient glow shifts

### C. Micro-interactions
- Hover on any card: **Lift + glow intensify** (150ms)
- Click on signal: **Ripple effect** + map pans to relevant region
- Collapse blade: **Spring physics** snap to rail
- Critical alert: **Viewport edge pulse** (subtle, doesn't cause seizures)

### D. The "Heartbeat"
Every 30 seconds, a **subtle scanline** passes across the viewport — this reassures users the system is live without being distracting.

---

## 7. Key Screen Redesigns

### Dashboard View (Default)
- Full-bleed map with floating blades
- Synthesis panel docked top-right
- Timeline scrubber visible
- Market ticker at bottom

### War Room View
- Three.js globe becomes the entire viewport
- UI reduces to a **circular HUD** around the edges
- Only the most critical data orbits the globe
- Theater selector becomes a **radial menu** at the bottom

### TV Mode
- Zero chrome, full-screen map/globe
- Auto-rotating through theaters every 60s
- Large, legible overlays for key stats
- Designed for wall displays and news broadcasts

### Focus Mode
- 95% map visibility
- All blades collapsed to rails
- Only breaking alerts and the threat orb remain prominent
- Perfect for analysts who need maximum spatial context

---

## 8. Specific UI Innovations ("No One Has Done This")

### 8.1 The "Pulse Wall" — Ambient Threat Atmosphere
Instead of just changing accent colors, the **entire viewport background** subtly shifts hue based on threat level:
- A massive, blurred radial gradient behind the map slowly pulses
- Color matches the current threat level
- On SEVERE, the pulse quickens and the red hue deepens
- This creates **emotional immersion** without cognitive load

### 8.2 Chromatic Aberration on Focus
When a user focuses on a specific region or event:
- The focused element gets a **subtle RGB split** on its edges
- Everything else desaturates slightly
- This mimics a camera lens focusing and draws the eye naturally

### 8.3 The "Data Constellation" — Signal Graph View
Toggle the map to show signals as nodes in a force-directed graph:
- Related signals connect with glowing edges
- Cluster density = regional intensity
- Users can literally **see the narrative web** of global events

### 8.4 Holographic Tooltips
All tooltips use a **glass pyramid** aesthetic:
- Triangular pointer
- Blurred background
- Subtle inner glow matching the content severity
- Never obscure the map behind them

### 8.5 The "Ghost Rail" — Predictive Path Visualization
On the map, show **faded ghost lines** for:
- Predicted flight paths of military aircraft
- Likely shipping diversions
- Projected storm paths
- This makes the interface feel **predictive**, not just reactive

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Day 1-2)
- [ ] Replace color system in `globals.css` and `tailwind.config.ts`
- [ ] Implement new typography system (import Inter + Barlow Condensed)
- [ ] Build the `HoloCard` primitive component
- [ ] Create the `Blade` layout primitive (collapsible side panels)

### Phase 2: Layout Rebuild (Day 3-4)
- [ ] Rebuild `page.tsx` with the Orbital Layout
- [ ] Implement Command Blade, Signal Blade, Theater Blade
- [ ] Add Focus Mode toggle
- [ ] Build the Market Blade ticker

### Phase 3: Visual Polish (Day 5-6)
- [ ] Add ambient threat pulse (viewport background gradient)
- [ ] Implement the Threat Orb component
- [ ] Add timeline scrubber UI
- [ ] Build cinematic transitions between views

### Phase 4: Advanced Effects (Day 7)
- [ ] Chromatic aberrration focus effect
- [ ] Data constellation graph view toggle
- [ ] Ghost rail predictive overlays on map
- [ ] Mobile Tactical HUD layout

---

## 10. File Changes Required

| File | Change |
|------|--------|
| `src/app/globals.css` | Complete rewrite with new design tokens |
| `tailwind.config.ts` | New colors, fonts, animations |
| `src/app/layout.tsx` | Import Inter + Barlow Condensed |
| `src/app/page.tsx` | Rebuild with Orbital Layout + Blades |
| `src/components/Header.tsx` | Convert to Command Blade |
| `src/components/SignalFeed.tsx` | Redesign as Intel Cards |
| `src/components/CustomDashboard.tsx` | Integrate into blade system |
| `src/components/WorldMap.tsx` | Add ambient overlay + ghost rails |
| **NEW** `src/components/ui/HoloCard.tsx` | Base panel primitive |
| **NEW** `src/components/ui/Blade.tsx` | Collapsible side panel |
| **NEW** `src/components/ui/ThreatOrb.tsx` | 3D threat indicator |
| **NEW** `src/components/ui/TimelineScrubber.tsx` | Time machine UI |
| **NEW** `src/components/ui/MarketRail.tsx` | Bottom ticker blade |

---

## Summary

This redesign transforms GlobeNews Live from a "dashboard with many widgets" into a **spatial intelligence command station**. The key differentiators:

1. **Blade-based layout** — clean, organized, scalable
2. **Full-bleed map background** — immersive, cinematic
3. **Threat-responsive ambience** — the UI breathes with the world
4. **Holographic glass UI** — premium, futuristic aesthetic
5. **Advanced visual effects** — chromatic aberrration, ghost rails, data constellations
6. **Multiple view modes** — Dashboard, War Room, TV Mode, Focus Mode

This is not just a reskin. It's a **reimagining of how humans interact with real-time global intelligence**.
