# UI Specification — Game Room Scoreboard

**Version:** 0.9.8  
**Last Updated:** 2025-01-21

---

## Design System

### Display Targets

| Target | Resolution | Orientation | Primary Use |
|--------|------------|-------------|-------------|
| Pi Kiosk | 800x480 | Landscape | Display + Touch input |
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
| Primary actions | 56px x 56px |
| List items | 56px height |
| Icon buttons | 48px x 48px |
| Close buttons | 44px x 44px |

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
  clock: 48px # Idle screen clock

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

### Kiosk Layout (800x480)

```
+------------------------------------------------------------+
| [Icon] Game Name                                    10:45  | 64px
|        Mode — Detail                                   PM  |
+------------------------------------------------------------+
|                                                            |
|  +------------------------------------------------------+  |
|  | 🥇  [Avatar]  Player Name              2:22.567     |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | 🥈  [Avatar]  Player Name              2:24.891     |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | 🥉  [Avatar]  Player Name              2:31.044     |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  |  4   [Avatar]  Player Name              2:35.220     |  | 72px
|  +------------------------------------------------------+  |
|                                                            |
+------------------------------------------------------------+
| ⚙️          Tap to browse  ● ○ ○           [QR]           | 56px
+------------------------------------------------------------+
```

### Clock Feature

```yaml
component: IdleClock
position: header right (kiosk), below title (mobile)
format: "10:45 PM" (12-hour with AM/PM)
font_size: 
  kiosk: 48px (inline style for readability)
  mobile: 20px
color: text-primary
update_interval: 1 minute
```

### QR Code Feature

```yaml
component: QRCodeButton
location: footer, right of carousel dots
icon: QrCode (Lucide)
size: 24px icon in 44px touch target

on_tap: opens QRCodeModal

modal:
  content:
    - title: "Scan to Connect"
    - QR code (256x256) containing "http://{PI_IP}:4173"
    - IP address text below QR
    - "Tap anywhere to close"
  
  dismiss: tap outside or tap QR area
```

---

## Screen: Category Selection

### Kiosk Layout (4x2 Grid)

```
+------------------------------------------------------------+
| <- Back           CATEGORIES                      + Add v   | 56px
+------------------------------------------------------------+
|                                                            |
|  +----------+ +----------+ +----------+ +----------+       |
|  |          | |          | |          | |          |       |
|  |  Racing  | |   Golf   | |  Party   | |  Darts   |       | ~180px
|  |    🏎️    | |    ⛳    | |    🎉    | |    🎯    |       |
|  +----------+ +----------+ +----------+ +----------+       |
|                                                            |
|  +----------+ +----------+ +----------+ +----------+       |
|  |          | |          | |          | |          |       |
|  | Pinball  | |Platformer| |   RPG    | |  Other   |       | ~180px
|  |    🕹️    | |    🎮    | |    ⚔️    | |    🧩    |       |
|  +----------+ +----------+ +----------+ +----------+       |
|                                                            |
+------------------------------------------------------------+
```

### CategoryButton Component

```yaml
CategoryButton:
  size: 
    kiosk: "180px x 180px"
    mobile: "full width, 80px height"
  
  layout:
    direction: "column (kiosk) | row (mobile)"
    gap: 8px
    padding: 16px
    
  icon:
    component: "Lucide icon based on category"
    size: "48px (kiosk) | 32px (mobile)"
    color: "category color"
    
  label:
    font_size: "18px"
    color: "text-primary"
    weight: "semibold"
    
  background:
    default: "bg-background-card"
    active: "bg-background-elevated"
    
  border:
    width: 2px
    color: "category color (20% opacity)"
    radius: 12px
    
  animation:
    scale_on_press: 0.98
    duration: 150ms
```

---

## Screen: Game Selection

### Layout

```
+------------------------------------------------------------+
| <- Categories     RACING                          + Add v   | 56px
+------------------------------------------------------------+
|                                                            |
|  +------------------------------------------------------+  |
|  | [Platform] Mario Kart 8 Deluxe                    >  |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | [Platform] F1 24                                  >  |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | [Platform] Forza Horizon 5                        >  |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | [Platform] Assetto Corsa Competizione             >  |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | [Platform] iRacing                                >  |  | 72px
|  +------------------------------------------------------+  |
|                                                            |
+------------------------------------------------------------+
```

### GameCard Component

```yaml
GameCard:
  height: 72px
  padding: "16px horizontal"
  
  layout:
    direction: row
    align: center
    gap: 16px
    
  platform_badge:
    visible: true
    font_size: 12px
    color: text-muted
    background: bg-background-elevated
    padding: "4px 8px"
    border_radius: 4px
    
  game_name:
    font_size: 18px
    color: text-primary
    weight: medium
    truncate: true
    
  chevron:
    icon: ChevronRight
    size: 24px
    color: text-muted
    
  background:
    default: bg-background-card
    active: bg-background-elevated
    
  animation:
    translateX_on_press: 4px
```

---

## Screen: Mode Selection

Shows available modes for selected game.

### Layout

```
+------------------------------------------------------------+
| <- Mario Kart 8    SELECT CLASS                   + Add v   | 56px
+------------------------------------------------------------+
|                                                            |
|  +------------------------------------------------------+  |
|  | 150cc Time Trial                                  >  |  | 72px
|  | Best lap times at 150cc                              |  |
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | 200cc Time Trial                                  >  |  | 72px
|  | Best lap times at 200cc                              |  |
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | Mirror Time Trial                                 >  |  | 72px
|  | Best lap times in mirror mode                        |  |
|  +------------------------------------------------------+  |
|                                                            |
+------------------------------------------------------------+
```

### ModeCard Component

```yaml
ModeCard:
  height: auto (min 72px)
  padding: 16px
  
  layout:
    direction: column
    gap: 4px
    
  mode_name:
    font_size: 18px
    color: text-primary
    weight: medium
    
  description:
    font_size: 14px
    color: text-secondary
    lines: 1
    optional: true
    
  score_format_badge:
    visible: if different from game default
    shows: "Time" | "Points" | "Golf" etc.
    
  chevron:
    position: right, vertically centered
```

---

## Screen: Detail Selection (Tracks/Courses)

### Layout

```
+------------------------------------------------------------+
| <- 150cc TT        SELECT TRACK                   + Add v   | 56px
+------------------------------------------------------------+
|                                                            |
|  +------------------------------------------------------+  |
|  | Mario Kart Stadium                                >  |  | 56px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | Water Park                                        >  |  | 56px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | Sweet Sweet Canyon                                >  |  | 56px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | Thwomp Ruins                                      >  |  | 56px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | Mario Circuit                                     >  |  | 56px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | ...more tracks (scrollable)                          |  |
|  +------------------------------------------------------+  |
|                                                            |
+------------------------------------------------------------+
```

### DetailCard Component

```yaml
DetailCard:
  height: 56px
  padding: "12px 16px"
  
  layout:
    direction: row
    align: center
    justify: space-between
    
  detail_name:
    font_size: 16px
    color: text-primary
    
  chevron:
    icon: ChevronRight
    color: text-muted
```

---

## Screen: Leaderboard View

### Layout

```
+------------------------------------------------------------+
| <- Rainbow Road    LEADERBOARD                    + Add v   | 56px
+------------------------------------------------------------+
|                                                            |
|  +------------------------------------------------------+  |
|  | 🥇  [Avatar]  Mike                     1:58.234     |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | 🥈  [Avatar]  Sarah                    2:01.456     |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  | 🥉  [Avatar]  Emma                     2:03.789     |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  |  4   [Avatar]  Andrew                  2:05.123     |  | 72px
|  +------------------------------------------------------+  |
|  +------------------------------------------------------+  |
|  |  5   [Avatar]  James                   2:08.456     |  | 72px
|  +------------------------------------------------------+  |
|                                                            |
+------------------------------------------------------------+
```

---

## Screen: Add Score

### Layout

```
+------------------------------------------------------------+
| <- Back              ADD SCORE                              | 56px
+------------------------------------------------------------+
|                                                            |
|  Game                                                      |
|  +------------------------------------------------------+  |
|  | Mario Kart 8 Deluxe                               v  |  | 56px
|  +------------------------------------------------------+  |
|                                                            |
|  Class                                                     |
|  +------------------------------------------------------+  |
|  | 150cc Time Trial                                  v  |  | 56px
|  +------------------------------------------------------+  |
|                                                            |
|  Track                                                     |
|  +------------------------------------------------------+  |
|  | Rainbow Road                                      v  |  | 56px
|  +------------------------------------------------------+  |
|                                                            |
|  Player                                                    |
|  +------------------------------------------------------+  |
|  | Andrew                                            v  |  | 56px
|  +------------------------------------------------------+  |
|                                                            |
|  +------------------------------------------------------+  |
|  |              [  Time Input: MM:SS.mmm  ]             |  | 80px
|  +------------------------------------------------------+  |
|                                                            |
|  +------------------------------------------------------+  |
|  |                    [ Submit Score ]                  |  | 56px
|  +------------------------------------------------------+  |
|                                                            |
+------------------------------------------------------------+
```

---

## Component: ScoreRow

### Anatomy

```
+------------------------------------------------------------+
|  [Rank]  [Avatar]  [Name]                         [Score]  |
+------------------------------------------------------------+
```

### ScoreRow Specification

```yaml
ScoreRow:
  height: 72px (kiosk) | auto (mobile)
  padding: "12px 16px"
  
  layout:
    kiosk:
      direction: row
      align: center
      gap: 16px
    mobile:
      direction: column
      padding: 16px
      
  rank_badge:
    width: 48px
    font_size: 24px (number) | medal icon for 1-3
    alignment: center
    
  avatar:
    size: 48px
    border_radius: 50%
    fallback: initials with generated color
    
  player_name:
    font_size: 18px
    color: text-primary
    weight: medium
    flex: 1
    truncate: true
    
  score_value:
    font_family: mono
    font_size: 24px
    color: text-primary
    weight: bold
    
  background:
    default: transparent
    first_place: "subtle gold gradient"
    second_place: "subtle silver gradient"  
    third_place: "subtle bronze gradient"
```

---

## Component: SelectField

```yaml
SelectField:
  height: 56px
  
  layout:
    direction: row
    align: center
    padding: "0 16px"
    
  label:
    position: above field
    font_size: 14px
    color: text-secondary
    margin_bottom: 8px
    
  value:
    font_size: 18px
    color: text-primary
    flex: 1
    
  placeholder:
    color: text-muted
    
  chevron:
    icon: ChevronDown
    color: text-muted
    
  border:
    width: 1px
    color: text-muted (30% opacity)
    radius: 8px
    
  on_tap: opens PickerModal with options
```

---

## Component: PickerModal

```yaml
PickerModal:
  position: bottom sheet (mobile) | center modal (kiosk)
  max_height: 70vh
  
  header:
    height: 56px
    title: field label
    close_button: X icon (44px touch target)
    
  search:
    visible: if options > 10
    height: 48px
    placeholder: "Search..."
    
  options_list:
    scrollable: true
    item_height: 56px
    
  option_item:
    padding: "16px"
    font_size: 18px
    selected_indicator: checkmark icon
    active_background: bg-background-elevated
```

---

## Component: TimeInput

For `time_ms` and `time_seconds` score formats.

```yaml
TimeInput:
  layout:
    direction: row
    gap: 8px
    align: center
    
  segments:
    - minutes: 2 digits, max 59
    - seconds: 2 digits, max 59  
    - milliseconds: 3 digits (time_ms only)
    
  segment_style:
    width: 64px (min/sec) | 80px (ms)
    height: 56px
    font_family: mono
    font_size: 24px
    text_align: center
    border: 1px solid text-muted
    border_radius: 8px
    
  separator:
    character: ":" or "."
    font_size: 24px
    color: text-muted
    
  interaction:
    tap_segment: opens numeric keypad
    auto_advance: move to next segment when filled
```

---

## Component: NumericInput

For `integer` and `decimal_2` score formats.

```yaml
NumericInput:
  height: 56px
  
  display:
    font_family: mono
    font_size: 24px
    text_align: center
    
  keypad:
    position: below input or modal
    keys: 0-9, backspace, decimal (if decimal_2)
    key_size: 56px
    
  validation:
    integer: whole numbers only
    decimal_2: max 2 decimal places
```

---

## Component: CelebrationOverlay

```yaml
CelebrationOverlay:
  trigger: on successful score submission
  
  variants:
    first_place:
      confetti: gold particles
      sound: fanfare
      duration: 3000ms
      message: "🥇 NEW HIGH SCORE!"
      
    other_placement:
      confetti: standard multicolor
      sound: chime
      duration: 2000ms
      message: "Score recorded!"
      
  layout:
    position: fixed, full screen
    background: semi-transparent black
    content: centered
    
  animation:
    entrance: scale up + fade in
    confetti: particle explosion from center
    exit: fade out
    
  interaction:
    tap_anywhere: dismiss early
```

---

## State Management

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

## Theme System

### Theme Definitions

```yaml
themes:
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
```

### Theme Implementation

```css
/* Applied via data-theme attribute on <html> */
[data-theme="light"] {
  --color-background-primary: #f8fafc;
  --color-text-primary: #111111;
  /* ... */
}
```

### Text Color Override

For accessibility when theme colors don't provide enough contrast:

| Override | Effect |
|----------|--------|
| Auto (default) | Use theme's text colors |
| Light | Force #ffffff text |
| Dark | Force #111111 text |

---

## Settings Page — Theme Section

```yaml
ThemeSection:
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
```

---

## Light Theme Adjustments

For light theme, certain elements need color overrides:

```yaml
light_theme_overrides:
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
```

---

## Accessibility

- All touch targets >= 56px
- Color not sole indicator (icons + text)
- Sufficient contrast ratios
- Focus visible states (for keyboard testing)
- Screen reader labels on icon-only buttons