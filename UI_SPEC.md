# UI Specification

Structured specifications for each screen. Use this document when building React components.

---

## Global Constraints

```yaml
display:
  width: 800px
  height: 480px
  orientation: landscape

touch_targets:
  minimum_height: 56px
  minimum_width: 56px

typography:
  font_family: "'Inter', system-ui, sans-serif"
  font_family_mono: "'JetBrains Mono', monospace"
  sizes:
    xs: 14px
    sm: 16px
    base: 18px
    lg: 24px
    xl: 28px
    xxl: 32px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px

colors:
  background:
    primary: "#0f0f0f"
    card: "#1a1a1a"
    elevated: "#252525"
  text:
    primary: "#ffffff"
    secondary: "#a1a1a1"
    muted: "#6b6b6b"
  category:
    racing: "#ef4444"
    golf: "#22c55e"
    party: "#f59e0b"
    darts: "#3b82f6"
    pinball: "#a855f7"
    platformer: "#ec4899"
    rpg: "#06b6d4"
    other: "#6b7280"
  medals:
    gold: "#ffd700"
    silver: "#c0c0c0"
    bronze: "#cd7f32"

animations:
  transition_fast: 150ms
  transition_normal: 300ms
  transition_slow: 500ms
  easing: "cubic-bezier(0.4, 0, 0.2, 1)"
```

---

## Screen: Idle Display (Carousel)

The default screen. Auto-cycles through game modes that have scores.

### Layout Structure

```yaml
screen: IdleDisplay
route: "/"
fullscreen: true

layout:
  type: flex
  direction: column
  
sections:
  - name: header
    height: 72px
    content:
      - game_icon (32x32, left aligned)
      - game_name (xl font, bold)
      - mode_name_and_subtitle (base font, secondary color, below game name)
    
  - name: leaderboard
    height: 320px (flex: 1)
    content:
      - score_rows (max 4 visible)
      - each row: 72px height
      - row contains: rank, player_avatar, player_name, score_value
    
  - name: footer
    height: 56px
    content:
      - hint_text: "Tap to browse or add score"
      - centered, muted color, sm font
```

### Score Row Component

```yaml
component: ScoreRow
height: 72px
padding: "0 16px"
layout: flex row, align center, justify space-between

elements:
  - rank_badge:
      width: 40px
      content: medal emoji (🥇🥈🥉) for 1-3, number for 4+
      font: lg, bold
      
  - player_info:
      layout: flex row, align center, gap 12px
      children:
        - avatar:
            size: 48x48
            border_radius: 50%
            fallback: first letter of name on colored background
        - name:
            font: lg
            color: text.primary
            
  - score_value:
      font: xl, mono
      color: text.primary
      text_align: right
      # Format based on game_mode.score_format
```

### Behavior

```yaml
behavior:
  auto_cycle:
    enabled: true
    interval: 10000ms (configurable)
    transition: slide left + fade
    skip_empty_modes: true
    
  on_tap_anywhere:
    action: navigate to "/browse"
    
  on_new_score_realtime:
    action: show NewScoreAlert overlay
    duration: 5000ms
    sound: fanfare (if 1st place) or chime
```

### Data Requirements

```yaml
data:
  query: |
    SELECT * FROM leaderboard 
    WHERE game_mode_id = :current_mode_id
    ORDER BY 
      CASE WHEN score_direction = 'lower_better' THEN score ELSE -score END
    LIMIT 4
    
  realtime_subscription:
    table: high_scores
    event: INSERT
```

---

## Screen: Category Selection

First level of browse hierarchy. Shows game categories as a grid.

### Layout Structure

```yaml
screen: CategorySelection
route: "/browse"

layout:
  type: flex
  direction: column

sections:
  - name: header
    height: 56px
    layout: flex row, justify space-between, align center
    padding: "0 16px"
    content:
      - back_button:
          icon: "←"
          width: 56px
          on_tap: navigate to "/" (or go back)
      - title:
          text: "CATEGORIES"
          font: lg, bold
          # Only show if not showing "+ Add Score"
      - add_score_button:
          text: "+ Add Score"
          font: base
          color: text.secondary
          on_tap: navigate to "/add-score"

  - name: category_grid
    height: 368px (flex: 1)
    padding: 16px
    layout: grid
    grid:
      columns: 3
      rows: 2
      gap: 16px
    content:
      - category_buttons (6 total, one per category)

  - name: footer
    height: 56px
    content:
      - idle_timer_hint: "30s idle → returns to auto mode"
      - centered, muted, xs font
```

### Category Button Component

```yaml
component: CategoryButton
size: fills grid cell (approx 240x168 each)
min_height: 56px

layout: flex column, align center, justify center
background: colors.background.card
border: 1px solid colors.background.elevated
border_radius: 8px

elements:
  - icon:
      size: 32px
      # Optional: category-specific icon
  - label:
      font: lg, bold
      color: category color (e.g., racing = red)
      text: category name, capitalized

on_tap:
  action: navigate to "/browse/:category"
  
hover_state: none (touch only)
active_state: 
  background: colors.background.elevated
  transform: scale(0.98)
```

### Behavior

```yaml
behavior:
  idle_timeout:
    duration: 30000ms
    action: navigate to "/" (return to carousel)
    reset_on: any touch event
```

---

## Screen: Game Selection

Shows games within a selected category.

### Layout Structure

```yaml
screen: GameSelection
route: "/browse/:category"

layout:
  type: flex
  direction: column

sections:
  - name: header
    height: 56px
    layout: flex row, justify space-between, align center
    padding: "0 16px"
    content:
      - back_button:
          text: "← Categories"
          on_tap: navigate to "/browse"
      - add_score_button:
          text: "+ Add Score"
          on_tap: navigate to "/add-score"

  - name: title
    height: 40px
    padding: "0 16px"
    content:
      - category_name:
          text: category name uppercase (e.g., "RACING")
          font: base, bold
          color: category color

  - name: game_list
    height: remaining (scrollable if needed)
    padding: "8px 16px"
    layout: flex column
    gap: 12px
    content:
      - game_cards (one per game in category)
```

### Game Card Component

```yaml
component: GameCard
height: 72px
padding: "0 16px"
background: colors.background.card
border_radius: 8px

layout: flex row, align center, gap 16px

elements:
  - game_icon:
      size: 48x48
      border_radius: 8px
      fallback: colored square with first letter
      
  - game_info:
      layout: flex column
      children:
        - name:
            font: lg, bold
        - platform:
            font: sm
            color: text.secondary

on_tap:
  action: navigate to "/browse/:category/:gameId"
```

### Scrolling

```yaml
scroll:
  direction: vertical
  show_scrollbar: false (or thin, subtle)
  scroll_snap: none
  overflow_indicator: gradient fade at bottom if more content
```

---

## Screen: Mode Selection

Shows game modes within a selected game.

### Layout Structure

```yaml
screen: ModeSelection
route: "/browse/:category/:gameId"

layout:
  type: flex
  direction: column

sections:
  - name: header
    height: 56px
    content:
      - back_button:
          text: "← [Game Name]" (abbreviated if long)
          on_tap: navigate back to game list
      - add_score_button

  - name: title
    height: 48px
    padding: "0 16px"
    content:
      - game_icon (24x24)
      - game_name (lg, bold)

  - name: mode_list
    height: remaining (scrollable)
    padding: "8px 16px"
    layout: flex column
    gap: 8px
    content:
      - mode_cards (one per game_mode)
```

### Mode Card Component

```yaml
component: ModeCard
height: 64px
padding: "12px 16px"
background: colors.background.card
border_radius: 8px

layout: flex row, justify space-between, align center

elements:
  - mode_info:
      layout: flex column
      children:
        - name:
            font: base, bold
            text: mode.name (e.g., "Rainbow Road")
        - subtitle:
            font: sm
            color: text.secondary
            text: mode.subtitle (e.g., "Time Trial") or null
            
  - score_count_badge:
      # Optional: show number of scores recorded
      font: sm
      color: text.muted
      text: "{n} scores" or empty if 0

on_tap:
  action: navigate to "/browse/:category/:gameId/:modeId"
```

### Grouping (Optional Enhancement)

```yaml
grouping:
  # For games with context-based modes (e.g., racing sims)
  # Group by context field (e.g., "class" for GT3/GT4)
  group_by: mode.context.class (if present)
  group_header:
    font: sm, bold
    color: text.muted
    margin_top: 16px
```

---

## Screen: Leaderboard View

Full leaderboard for a specific game mode.

### Layout Structure

```yaml
screen: LeaderboardView
route: "/browse/:category/:gameId/:modeId"

layout:
  type: flex
  direction: column

sections:
  - name: header
    height: 56px
    content:
      - back_button:
          text: "← [Game abbrev]"
      - add_score_button

  - name: title
    height: 56px
    padding: "8px 16px"
    content:
      - mode_name (lg, bold)
      - mode_subtitle (sm, secondary) — on same line or below

  - name: leaderboard
    height: remaining (~312px)
    padding: "0 16px"
    layout: flex column
    gap: 8px
    scrollable: true
    content:
      - score_rows (ScoreRow component, same as IdleDisplay)

  - name: related_modes_bar
    height: 56px
    # Optional: quick navigation to related modes
    content:
      - horizontal scrollable chips
      - each chip: related mode name (e.g., "GT4", "Monza")
      - on_tap: navigate to that mode
```

### Empty State

```yaml
empty_state:
  condition: no scores for this mode
  content:
    - icon: trophy outline (muted)
    - text: "No scores yet"
    - subtext: "Be the first!"
    - add_score_button (prominent)
```

---

## Screen: Add Score

Multi-step form for entering a new score.

### Layout Structure

```yaml
screen: AddScore
route: "/add-score"

layout:
  type: flex
  direction: column

sections:
  - name: header
    height: 56px
    content:
      - cancel_button:
          text: "← Cancel"
          on_tap: navigate back
      - title:
          text: "ADD SCORE"
          font: lg, bold

  - name: form
    height: remaining
    padding: 16px
    layout: flex column
    gap: 16px
    content:
      - game_picker
      - mode_picker (dependent on game selection)
      - player_picker
      - score_input (type depends on mode.score_format)
      - submit_button
```

### Form Field Components

```yaml
component: SelectField
height: 56px
background: colors.background.card
border_radius: 8px
padding: "0 16px"

layout: flex row, justify space-between, align center

elements:
  - label:
      font: sm
      color: text.secondary
      position: above or inline-start
  - value:
      font: base
  - chevron:
      icon: "▼"
      color: text.muted

on_tap:
  action: open PickerModal for this field
```

```yaml
component: PickerModal
type: bottom sheet or full overlay
background: colors.background.elevated

layout:
  - header: title + close button
  - search_input (optional, for long lists)
  - scrollable_list of options
  - each option: 56px height, tap to select and close
```

```yaml
component: ScoreInput
# Varies by score_format

integer_input:
  type: numeric keypad or number input
  height: 80px
  font: xxl, mono
  
time_ms_input:
  layout: flex row, gap 8px
  fields:
    - minutes (2 digit, 0-59)
    - separator ":"
    - seconds (2 digit, 0-59)
    - separator "."
    - milliseconds (3 digit, 0-999)
  each field:
    width: proportional
    font: xxl, mono
    background: colors.background.card
    text_align: center
    
time_seconds_input:
  # Same as time_ms but without milliseconds
  
decimal_2_input:
  type: number with 2 decimal places
  suffix: unit (e.g., "%")
  
level_input:
  layout: flex row
  fields:
    - world_number (1 digit)
    - separator "-"
    - level_number (1 digit)
```

```yaml
component: SubmitButton
height: 56px
background: gradient or solid accent color
border_radius: 8px
font: lg, bold
text: "Save Score"

states:
  disabled:
    condition: form incomplete
    background: muted
    color: text.muted
  loading:
    show spinner, disable tap
```

### New Player Sub-flow

```yaml
sub_flow: NewPlayer
trigger: tap "+ New Player" in player picker

modal:
  - name_input:
      placeholder: "Enter name"
      auto_focus: true
      max_length: 30
  - avatar_upload:
      optional: true
      tap to open camera/gallery
  - create_button:
      text: "Create Player"
      on_tap: insert player, select them, close modal
```

---

## Overlay: New Score Celebration

Shown after successfully saving a score.

### Layout Structure

```yaml
overlay: NewScoreCelebration
type: fullscreen overlay
background: semi-transparent dark with blur

layout: flex column, align center, justify center

content:
  - confetti_animation (canvas or Lottie)
  
  - celebration_text:
      condition: score is new 1st place
      text: "🎉 NEW HIGH SCORE! 🎉"
      font: xl, bold
      
  - celebration_text_alt:
      condition: score is not 1st place
      text: "Score Saved!"
      font: xl, bold
      
  - player_name:
      font: lg
      margin_top: 16px
      
  - score_value:
      font: xxl, mono, bold
      margin_top: 8px
      
  - rank_badge:
      text: "🥇 1st Place!" (or 🥈, 🥉, or "4th Place")
      font: lg
      margin_top: 16px

behavior:
  sound:
    condition: 1st place
    play: fanfare
  sound_alt:
    condition: not 1st place
    play: chime
    
  auto_dismiss:
    delay: 3000ms
    action: navigate to "/" (carousel)
    
  tap_to_dismiss:
    enabled: true
```

---

## Overlay: Realtime Score Alert

Shown when a new score arrives via realtime subscription while in carousel mode.

### Layout Structure

```yaml
overlay: RealtimeScoreAlert
type: toast/banner (not fullscreen)
position: center or slide in from top
background: colors.background.elevated
border_radius: 12px
padding: 24px
max_width: 600px

content:
  - alert_icon:
      text: "⚡"
      font: xl
      
  - title:
      text: "NEW RECORD!"
      font: lg, bold
      
  - player_name:
      text: "[Player] just set a new best!"
      font: base
      margin_top: 8px
      
  - score_context:
      text: "[Game] — [Mode]"
      font: sm
      color: text.secondary
      margin_top: 4px
      
  - score_value:
      font: xl, mono, bold
      margin_top: 8px
      
  - rank_badge:
      condition: score is 1st place
      text: "🥇"

behavior:
  sound: fanfare (if 1st) or chime
  
  auto_dismiss:
    delay: 5000ms
    
  animation:
    enter: slide down + fade in
    exit: fade out
```

---

## Component: Settings Panel

Accessible via long-press on footer or hidden gesture.

### Content

```yaml
screen: Settings
route: "/settings" (or modal)

options:
  - cycle_speed:
      label: "Auto-cycle speed"
      type: select
      values: [5s, 10s, 15s, 30s]
      default: 10s
      
  - sound_enabled:
      label: "Sound effects"
      type: toggle
      default: true
      
  - brightness:
      label: "Screen brightness"
      type: slider
      range: 10-100%
      note: may require system integration
      
  - idle_dim:
      label: "Dim after idle"
      type: select
      values: [Never, 5min, 15min, 30min]
      default: 5min
      
  - player_management:
      label: "Manage Players"
      type: link
      on_tap: navigate to player list with edit/delete
```

---

## State Management

```yaml
global_state:
  store: Zustand (recommended) or React Context
  
  state_shape:
    ui:
      current_route: string
      is_idle_mode: boolean
      idle_timer: number | null
      sound_enabled: boolean
      cycle_speed_ms: number
      
    carousel:
      active_modes: GameMode[] # modes with scores
      current_index: number
      is_paused: boolean
      
    browse:
      selected_category: Category | null
      selected_game: Game | null
      selected_mode: GameMode | null
      
    add_score:
      selected_game: Game | null
      selected_mode: GameMode | null
      selected_player: Player | null
      score_value: number | null
      is_submitting: boolean
      
    realtime:
      pending_alert: HighScore | null
```

---

## Routing Structure

```yaml
routes:
  "/":
    component: IdleDisplay
    
  "/browse":
    component: CategorySelection
    
  "/browse/:category":
    component: GameSelection
    
  "/browse/:category/:gameId":
    component: ModeSelection
    
  "/browse/:category/:gameId/:modeId":
    component: LeaderboardView
    
  "/add-score":
    component: AddScore
    
  "/settings":
    component: Settings

navigation:
  library: react-router-dom (recommended)
  transitions: use Framer Motion AnimatePresence
```

---

## File Structure Reference

```
src/
├── components/
│   ├── layout/
│   │   └── KioskLayout.tsx      # Wrapper with 800x480 constraints
│   ├── display/
│   │   ├── ScoreRow.tsx
│   │   ├── ScoreValue.tsx       # Formats score by type
│   │   ├── PlayerAvatar.tsx
│   │   ├── RankBadge.tsx
│   │   └── Confetti.tsx
│   ├── input/
│   │   ├── SelectField.tsx
│   │   ├── PickerModal.tsx
│   │   ├── TimeInput.tsx
│   │   ├── NumericInput.tsx
│   │   └── NewPlayerModal.tsx
│   ├── cards/
│   │   ├── CategoryButton.tsx
│   │   ├── GameCard.tsx
│   │   └── ModeCard.tsx
│   └── overlays/
│       ├── CelebrationOverlay.tsx
│       └── RealtimeAlert.tsx
├── pages/
│   ├── IdleDisplay.tsx
│   ├── CategorySelection.tsx
│   ├── GameSelection.tsx
│   ├── ModeSelection.tsx
│   ├── LeaderboardView.tsx
│   ├── AddScore.tsx
│   └── Settings.tsx
├── hooks/
│   ├── useGames.ts
│   ├── useGameModes.ts
│   ├── useLeaderboard.ts
│   ├── usePlayers.ts
│   ├── useRealtimeScores.ts
│   └── useIdleTimer.ts
├── lib/
│   ├── supabase.ts
│   ├── types.ts
│   ├── formatScore.ts
│   └── sounds.ts
├── stores/
│   └── kioskStore.ts
└── styles/
    └── index.css
```
