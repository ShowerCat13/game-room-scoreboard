# UI Specification — Game Room Scoreboard

**Version:** 1.0.0-beta  
**Last Updated:** Post-Alpha Sprint

---

## Design System

### Display Targets

| Target | Resolution | Orientation | Primary Use |
|--------|------------|-------------|-------------|
| Pi Kiosk | 800×480 | Landscape | Display + Touch input |
| Mobile | Variable | Portrait | Score entry |
| Tablet | Variable | Either | Browse + Entry |
| Desktop | Variable | Landscape | Development |

### Breakpoints

```css
/* Tailwind config */
screens: {
  'kiosk': { 'raw': '(width: 800px) and (height: 480px)' },
  'mobile': { 'max': '640px' },
  'tablet': { 'min': '641px', 'max': '1024px' },
  'desktop': { 'min': '1025px' },
}
```

### Touch Targets

| Context | Minimum Size |
|---------|--------------|
| Primary actions | 56px × 56px |
| List items | 56px height |
| Icon buttons | 48px × 48px |
| Close buttons | 44px × 44px |

### Typography

```yaml
font_family:
  sans: "'Inter', system-ui, sans-serif"
  mono: "'JetBrains Mono', monospace"

sizes:
  xs: 14px    # Hints, timestamps
  sm: 16px    # Secondary text
  base: 18px  # Body text (minimum)
  lg: 24px    # Headings, important
  xl: 28px    # Large headings
  xxl: 32px   # Score values
  clock: 48px # Idle screen clock (NEW)

weights:
  normal: 400
  medium: 500
  semibold: 600
  bold: 700
```

### Spacing Scale

```yaml
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
```

### Color Tokens

```yaml
colors:
  background:
    primary: "#0f0f0f"     # Main background
    card: "#1a1a1a"        # Card surfaces
    elevated: "#252525"    # Modals, inputs
  
  text:
    primary: "#ffffff"
    secondary: "#a1a1a1"
    muted: "#6b6b6b"
  
  category:
    racing: "#ef4444"      # Red
    golf: "#22c55e"        # Green
    party: "#f59e0b"       # Amber
    darts: "#3b82f6"       # Blue
    pinball: "#a855f7"     # Purple
    platformer: "#ec4899"  # Pink
    rpg: "#06b6d4"         # Cyan
    other: "#6b7280"       # Gray
  
  medals:
    gold: "#ffd700"
    silver: "#c0c0c0"
    bronze: "#cd7f32"
  
  status:
    success: "#22c55e"
    error: "#ef4444"
    warning: "#f59e0b"
```

### Icons (Lucide React)

Replace all emoji with Lucide icons for cross-platform compatibility:

| Category | Icon | Component |
|----------|------|-----------|
| Racing | `Car` | `<Car />` |
| Golf | `Flag` | `<Flag />` |
| Party | `PartyPopper` | `<PartyPopper />` |
| Darts | `Target` | `<Target />` |
| Pinball | `Joystick` | `<Joystick />` |
| Platformer | `Gamepad2` | `<Gamepad2 />` |
| RPG | `Swords` | `<Swords />` |
| Other | `Puzzle` | `<Puzzle />` |
| 1st Place | `Medal` | `<Medal />` with gold color |
| 2nd Place | `Medal` | `<Medal />` with silver color |
| 3rd Place | `Medal` | `<Medal />` with bronze color |
| Settings | `Settings` | `<Settings />` |
| QR Code | `QrCode` | `<QrCode />` |
| Clock | `Clock` | `<Clock />` |

---

## Responsive Layouts

### KioskLayout Component

```tsx
// Detects if running on Pi kiosk or other device
function KioskLayout({ children }) {
  const isKiosk = useMediaQuery('(width: 800px) and (height: 480px)')
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  if (isKiosk) {
    return (
      <div className="w-[800px] h-[480px] bg-background-primary overflow-hidden">
        {children}
      </div>
    )
  }
  
  // Mobile/tablet: fill viewport
  return (
    <div className="min-h-screen bg-background-primary">
      {children}
    </div>
  )
}
```

---

## Screen: Idle Display

The default screen showing auto-cycling leaderboards.

### Kiosk Layout (800×480)

```
┌────────────────────────────────────────────────────────────┐
│ [Icon] Game Name                                    10:45  │ 64px
│        Mode — Detail                                   PM  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🥇  [Avatar]  Player Name              2:22.567     │  │ 72px
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🥈  [Avatar]  Player Name              2:24.891     │  │ 72px
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🥉  [Avatar]  Player Name              2:31.044     │  │ 72px
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  4   [Avatar]  Player Name              2:35.220     │  │ 72px
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ ⚙️          Tap to browse  ● ○ ○           [QR]           │ 56px
└────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Portrait)

```
┌─────────────────────────────┐
│ [Icon] Game Name            │
│ Mode — Detail        10:45  │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │ 🥇 [Avatar]           │  │
│  │    Player Name        │  │
│  │    2:22.567           │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🥈 [Avatar]           │  │
│  │    Player Name        │  │
│  │    2:24.891           │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 🥉 [Avatar]           │  │
│  │    Player Name        │  │
│  │    2:31.044           │  │
│  └───────────────────────┘  │
│                             │
│  ... (scrollable)           │
│                             │
├─────────────────────────────┤
│ ⚙️   Tap to browse   ● ○ ○  │
└─────────────────────────────┘
```

### Clock Feature (NEW)

```yaml
component: IdleClock
position: header right (kiosk), below title (mobile)
format: "10:45 PM" (12-hour with AM/PM)
font_size: 
  kiosk: 24px (lg)
  mobile: 20px
color: text-secondary
update_interval: 1 minute
```

### QR Code Feature (NEW)

```yaml
component: QRCodeButton
location: footer, right of carousel dots
icon: QrCode (Lucide)
size: 24px icon in 44px touch target

on_tap: opens QRCodeModal

modal:
  content:
    - title: "Scan to Connect"
    - QR code (256×256) containing "http://{PI_IP}:4173"
    - IP address text below QR
    - "Tap anywhere to close"
  
  dismiss: tap outside or tap QR area
```

---

## Screen: Category Selection

### Kiosk Layout (4×2 Grid)

```
┌────────────────────────────────────────────────────────────┐
│ ← Back           CATEGORIES                      + Add ▼   │ 56px
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   🏎️    │ │   ⛳    │ │   🎉    │ │   🎯    │      │
│  │ Racing  │ │  Golf   │ │  Party  │ │  Darts  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   🕹️    │ │   🎮    │ │   ⚔️    │ │   🧩    │      │
│  │ Pinball │ │Platform │ │   RPG   │ │  Other  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                            │
├────────────────────────────────────────────────────────────┤
│              30s idle → returns to auto mode               │ 40px
└────────────────────────────────────────────────────────────┘
```

### Mobile Layout (2×4 Grid)

```
┌─────────────────────────────┐
│ ← Back    CATEGORIES  + Add │
├─────────────────────────────┤
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │   🏎️    │ │   ⛳    │  │
│  │ Racing  │ │  Golf   │  │
│  └──────────┘ └──────────┘  │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │   🎉    │ │   🎯    │  │
│  │  Party  │ │  Darts  │  │
│  └──────────┘ └──────────┘  │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │   🕹️    │ │   🎮    │  │
│  │ Pinball │ │Platform │  │
│  └──────────┘ └──────────┘  │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │   ⚔️    │ │   🧩    │  │
│  │   RPG   │ │  Other  │  │
│  └──────────┘ └──────────┘  │
│                             │
├─────────────────────────────┤
│    30s idle → auto mode     │
└─────────────────────────────┘
```

### + Add Button (Updated)

```yaml
component: AddMenu
trigger: "+ Add" button in header
type: dropdown menu (kiosk) or bottom sheet (mobile)

options:
  - label: "Add Score"
    icon: Plus
    action: navigate to /add-score
    
  - label: "Add Player"
    icon: UserPlus
    action: open NewPlayerModal
    
  - label: "Manage"
    icon: Settings
    action: navigate to /manage
```

---

## Screen: Add Score (Updated for 3-Level)

### Flow Logic

```typescript
// Pseudocode for Add Score steps
const steps = []

steps.push('game')  // Always show game selection

if (selectedGame?.has_modes) {
  steps.push('mode')
}

if (selectedGame?.has_details) {
  steps.push('detail')
}

steps.push('player')
steps.push('score')
```

### Layout

```
┌────────────────────────────────────────────────────────────┐
│ ← Cancel                                       ADD SCORE   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Game         [Mario Kart 8 Deluxe              ▼]        │
│                                                            │
│  Class        [150cc Time Trial                 ▼]        │
│  (mode_label)  (shown if has_modes)                        │
│                                                            │
│  Track        [Rainbow Road                     ▼]        │
│  (detail_label) (shown if has_details)                     │
│                                                            │
│  Player       [Player 1                         ▼]        │
│               [ + New Player ]                             │
│                                                            │
│  Time         ┌──┐ : ┌──┐ . ┌───┐                         │
│  (dynamic)    │1 │   │23│   │456│                         │
│               └──┘   └──┘   └───┘                         │
│                                                            │
│                    [ Save Score ]                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Score Input Components

```yaml
# Based on effective score_format
integer:
  component: NumericInput
  props:
    suffix: unit (e.g., "pts", "darts")
    
time_ms:
  component: TimeInput
  props:
    show_milliseconds: true
    
time_seconds:
  component: TimeInput
  props:
    show_milliseconds: false
    
decimal_2:
  component: DecimalInput
  props:
    decimal_places: 2
    suffix: unit
    
golf_relative:
  component: GolfInput (NEW)
  props:
    # Shows +/- buttons and E for even
    # Stored as integer (-4, 0, +3)
    
level:
  component: LevelInput
  props:
    # Two number fields: World [_]-[_]
```

### GolfInput Component (NEW)

```yaml
component: GolfInput
layout: horizontal

elements:
  - minus_button:
      icon: Minus
      size: 56px
      on_tap: decrement value
      
  - display:
      width: 80px
      font: xxl, mono
      content: formatted value (-4, E, +3)
      
  - plus_button:
      icon: Plus
      size: 56px
      on_tap: increment value

initial_value: 0 (even par)
```

---

## Screen: Detail Selection (NEW)

When a game has details, show this screen after mode selection.

### Layout

```
┌────────────────────────────────────────────────────────────┐
│ ← Back to Modes                                  + Add     │
├────────────────────────────────────────────────────────────┤
│ MARIO KART 8 DELUXE                                        │
│ 150cc Time Trial                                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Select Track:                                             │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Mario Kart Stadium                              →   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Water Park                                      →   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Sweet Sweet Canyon                              →   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                    (scrollable)                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Component: ScoreRow

### Kiosk Layout (Horizontal)

```yaml
component: ScoreRow
height: 72px
layout: flex row, align center

structure:
  ┌─────────────────────────────────────────────────────────┐
  │ [Rank]  [Avatar]  [Name.................]  [Score]     │
  │  40px    48px              flex-1            120px       │
  └─────────────────────────────────────────────────────────┘
```

### Mobile Layout (Stacked)

```yaml
component: ScoreRow
min_height: 80px
layout: flex row, with internal stacking

structure:
  ┌─────────────────────────────────────────┐
  │ [Rank] [Avatar]  Player Name            │
  │                  2:22.567               │
  └─────────────────────────────────────────┘
  
  # Rank and avatar on left
  # Name and score stacked on right
```

### Responsive Implementation

```tsx
function ScoreRow({ rank, player, score, format, unit }) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
  if (isMobile) {
    return (
      <div className="flex items-center gap-3 p-3">
        <RankBadge rank={rank} />
        <PlayerAvatar player={player} size={40} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{player.name}</div>
          <div className="font-mono text-lg">
            <ScoreValue value={score} format={format} unit={unit} />
          </div>
        </div>
      </div>
    )
  }
  
  // Kiosk layout
  return (
    <div className="flex items-center gap-4 h-[72px] px-4">
      <RankBadge rank={rank} />
      <PlayerAvatar player={player} size={48} />
      <div className="flex-1 font-semibold truncate">{player.name}</div>
      <div className="font-mono text-xl">
        <ScoreValue value={score} format={format} unit={unit} />
      </div>
    </div>
  )
}
```

---

## Component: CategoryButton

### Specification

```yaml
component: CategoryButton
size:
  kiosk: ~180×150 (fills grid cell)
  mobile: ~160×130 (fills 2-column grid)

layout: flex column, align center, justify center
background: background-card with category tint
border: 1px solid with category color
border_radius: 12px

elements:
  - icon:
      component: Lucide icon (NOT emoji)
      size: 32px
      color: category color
      
  - label:
      font: lg, bold
      color: category color
      margin_top: 8px

states:
  default:
    opacity: 1
  active:
    transform: scale(0.98)
    background: slightly darker
```

---

## Component: RankBadge

### Specification

```yaml
component: RankBadge
size: 40×40

ranks:
  1:
    icon: Medal (Lucide)
    color: medals.gold
  2:
    icon: Medal (Lucide)
    color: medals.silver
  3:
    icon: Medal (Lucide)
    color: medals.bronze
  4+:
    content: number
    font: lg, bold
    color: text.muted
```

---

## Manage Screen (Updated)

### Tab Structure

```yaml
tabs:
  - Players
  - Games
  - Modes (shown when game selected)
  - Details (NEW - shown when game selected)
  - Scores
```

### Details Tab (NEW)

```
┌────────────────────────────────────────────────────────────┐
│ ← Settings                 MANAGE                          │
├────────────────────────────────────────────────────────────┤
│ [Players] [Games] [Modes] [Details] [Scores]               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Game: [Mario Kart 8 Deluxe  ▼]                            │
│ Mode: [All Modes / 150cc TT ▼]  (optional filter)         │
│                                                            │
│  + Add Detail                                              │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Mario Kart Stadium            [✏️] [🗑️]           │  │
│  │  Available for: All modes                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Water Park                    [✏️] [🗑️]           │  │
│  │  Available for: All modes                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Add/Edit Detail Modal

```yaml
fields:
  - name:
      label: "Detail Name"
      placeholder: "e.g., Rainbow Road"
      required: true
      
  - mode_scope:
      label: "Available for"
      type: select
      options:
        - value: null, label: "All modes in this game"
        - value: mode_id, label: "{mode.name} only"
      default: null
      
  - score_override:
      label: "Override score settings?"
      type: toggle
      default: false
      
  - score_format: (shown if override enabled)
  - score_direction: (shown if override enabled)
  - score_unit: (shown if override enabled)
```

---

## Animation Specifications

### Transitions

```yaml
page_transition:
  type: fade + slide
  duration: 200ms
  easing: ease-out

modal_enter:
  type: fade + scale
  from: opacity 0, scale 0.95
  to: opacity 1, scale 1
  duration: 200ms

modal_exit:
  type: fade
  duration: 150ms

carousel_transition:
  type: slide left + fade
  duration: 300ms
  easing: ease-in-out

touch_feedback:
  type: scale
  to: scale 0.98
  duration: 100ms
```

### Celebration Overlay

```yaml
duration: 5000ms (configurable)

elements:
  - confetti:
      type: particle burst
      count: 50
      colors: [gold, silver, category color]
      
  - title:
      text: "🎉 NEW HIGH SCORE! 🎉" (if 1st) or "Score Saved!"
      animation: scale bounce
      
  - rank:
      text: "🥇 1st Place!" (with appropriate medal)
      
  - score:
      font: xxl, mono, bold
      
sound:
  1st_place: fanfare (2-3s)
  other: chime (0.5s)
```

---

## State Management

### Zustand Store Structure

```typescript
interface KioskState {
  // Settings (persisted)
  soundEnabled: boolean
  soundVolume: number
  cycleSpeedMs: number
  celebrationDurationMs: number
  adminPin: string | null
  
  // UI State
  isIdleMode: boolean
  currentCarouselIndex: number
  
  // Browse state
  selectedCategory: GameCategory | null
  selectedGame: Game | null
  selectedMode: GameMode | null
  selectedDetail: GameDetail | null
  
  // Add Score form
  formGame: Game | null
  formMode: GameMode | null
  formDetail: GameDetail | null
  formPlayer: Player | null
  formScoreValue: number | null
  
  // Realtime
  pendingAlertScoreId: string | null
  
  // Actions
  // ... setters for all state
}
```

---

## Routing

```typescript
const routes = [
  { path: '/', element: <IdleDisplay /> },
  { path: '/browse', element: <CategorySelection /> },
  { path: '/browse/:category', element: <GameSelection /> },
  { path: '/browse/:category/:gameId', element: <ModeSelection /> },
  { path: '/browse/:category/:gameId/:modeId', element: <DetailSelection /> },
  { path: '/browse/:category/:gameId/:modeId/:detailId', element: <LeaderboardView /> },
  { path: '/add-score', element: <AddScore /> },
  { path: '/manage', element: <Manage /> },
  { path: '/settings', element: <Settings /> },
]
```

Note: Not all routes require all params. If a game has no modes, skip to details. If no details, skip to leaderboard.

---

Theme System
Theme Definitions
Insert after "Color Tokens" section:
yamlthemes:
  dark:  # Default
    background:
      primary: "#0f0f0f"
      card: "#1a1a1a"
      elevated: "#252525"
    text:
      primary: "#ffffff"
      secondary: "#a1a1a1"
      muted: "#6b6b6b"
      
  light:
    background:
      primary: "#f8fafc"
      card: "#ffffff"
      elevated: "#f1f5f9"
    text:
      primary: "#111111"
      secondary: "#374151"
      muted: "#6b7280"
      
  oled:
    background:
      primary: "#000000"
      card: "#0a0a0a"
      elevated: "#141414"
    text:
      primary: "#ffffff"
      secondary: "#a1a1a1"
      muted: "#6b6b6b"
      
  cyberpunk:
    background:
      primary: "#0a0a0f"
      card: "#12121a"
      elevated: "#1a1a25"
    text:
      primary: "#00fff5"  # Cyan
      secondary: "#ff00ff" # Magenta
      muted: "#00cccc"
    accent: "#ff00ff"
    
  retro:
    background:
      primary: "#1a0f0a"
      card: "#2a1a10"
      elevated: "#3a2515"
    text:
      primary: "#ffb347"  # Orange
      secondary: "#ffd700" # Gold
      muted: "#cc8030"
    accent: "#ff6b35"
    
  nature:
    background:
      primary: "#0a1a0f"
      card: "#102515"
      elevated: "#15301a"
    text:
      primary: "#90ee90"  # Light green
      secondary: "#98d8aa"
      muted: "#5a9a6a"
    accent: "#228b22"
Theme Implementation
css/* Applied via data-theme attribute on <html> */
[data-theme="light"] {
  --color-background-primary: #f8fafc;
  --color-text-primary: #111111;
  /* ... */
}
Text Color Override
For accessibility when theme colors don't provide enough contrast:
OverrideEffectAuto (default)Use theme's text colorsLightForce #ffffff textDarkForce #111111 text

Settings Page — Theme Section
Add after existing Settings sections:
Theme Selection
yamlThemeSection:
  layout: 
    container: "flex flex-col gap-4"
    
  header:
    text: "Theme"
    style: "text-lg font-semibold text-text-primary"
    
  theme_grid:
    layout: "grid grid-cols-3 gap-2"
    items:
      - button:
          label: "Dark"
          active_style: "ring-2 ring-accent-primary"
          preview: "bg-[#0f0f0f] border border-gray-700"
      - button:
          label: "Light"
          preview: "bg-[#f8fafc] border border-gray-300"
      - button:
          label: "OLED"
          preview: "bg-black border border-gray-800"
      - button:
          label: "Cyber"
          preview: "bg-[#0a0a0f] border border-cyan-500"
      - button:
          label: "Retro"
          preview: "bg-[#1a0f0a] border border-orange-500"
      - button:
          label: "Nature"
          preview: "bg-[#0a1a0f] border border-green-500"
          
  text_override:
    label: "Text Color"
    type: "button_group"
    options:
      - { value: "auto", label: "Auto" }
      - { value: "light", label: "Light" }
      - { value: "dark", label: "Dark" }
      
  reset_button:
    label: "Reset to Defaults"
    style: "text-sm text-text-muted"

IdleDisplay — Clock Component
Add to IdleDisplay page spec:
Clock
yamlClock:
  location: "header, right side"
  
  layout:
    container: "flex items-center"
    
  time_display:
    format: "12-hour with AM/PM"
    example: "12:34 PM"
    font: "text-lg font-medium font-mono"
    color: "text-text-primary"
    
  update_interval: "60 seconds"
  
  implementation:
    - Use useEffect with setInterval
    - Update every minute (not every second)
    - Format: h:mm A (using date-fns or native)

IdleDisplay — QR Code Popup
Add to IdleDisplay page spec:
QR Code Button
yamlQRButton:
  location: "footer, right side"
  
  button:
    icon: "QrCode from lucide-react"
    size: "w-10 h-10"
    style: "text-text-muted active:text-text-secondary"
    
  behavior:
    on_click: "Toggle QR popup visibility"
QR Code Popup
yamlQRPopup:
  position: "absolute, bottom-right corner above footer"
  
  container:
    style: "bg-white p-4 rounded-lg shadow-lg"
    
  content:
    qr_code:
      size: "150x150"
      data: "http://{hostname}:{port}"
      library: "qrcode.react"
      
    url_text:
      text: "scoreboard.local"
      style: "text-xs text-center font-mono text-gray-600"
      
    hint_text:
      text: "Scan to add scores"
      style: "text-xs text-center text-gray-500"
      
  dismiss:
    trigger: "Click outside popup"
    animation: "fade out"

Light Theme Adjustments
For light theme, certain elements need color overrides:
yamllight_theme_overrides:
  medals:
    gold: "#b8860b"      # Darker gold
    silver: "#708090"    # Slate gray
    bronze: "#8b4513"    # Saddle brown
    
  category_icons:
    # All category colors darkened by ~20%
    racing: "#dc2626"
    golf: "#16a34a"
    party: "#d97706"
    # etc.
    
  podium_gradients:
    # Use solid colors instead of gradients
    first: "bg-[#b8860b]"
    second: "bg-[#708090]"
    third: "bg-[#8b4513]"

## Accessibility

- All touch targets ≥ 56px
- Color not sole indicator (icons + text)
- Sufficient contrast ratios
- Focus visible states (for keyboard testing)
- Screen reader labels on icon-only buttons