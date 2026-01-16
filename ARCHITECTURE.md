# Game Room Scoreboard

A Raspberry Pi-based kiosk application for displaying and managing high scores across a variety of games—from Mario Kart to darts to racing sims.

## Project Overview

**Hardware:** Raspberry Pi 4B (4GB) with touchscreen in Smart Pi Kiosk stand

**Backend:** Supabase (PostgreSQL + Realtime + Storage)

**Frontend:** React + TypeScript + Vite + Tailwind CSS + Framer Motion

**Display Mode:** Chromium kiosk mode, auto-cycling through leaderboards

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE CLOUD                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  PostgreSQL │  │  Realtime   │  │   Storage   │  │   Auth    │  │
│  │  (Tables)   │  │ (WebSocket) │  │  (Avatars)  │  │  (Anon)   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / WSS
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Pi Kiosk     │    │  Phone/Web    │    │  Phone/Web    │
│  (Display +   │    │  (Score       │    │  (Admin -     │
│   Input)      │    │   Input)      │    │   Future)     │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## Database Schema

See `/supabase/schema.sql` for the complete schema.

### Key Tables

| Table | Purpose |
|-------|---------|
| `players` | Player profiles with names and avatars |
| `teams` | Team definitions (future use) |
| `games` | Parent game containers (e.g., "Mario Kart 8 Deluxe") |
| `game_modes` | Specific scoreable contexts (e.g., "Rainbow Road - Time Trial") |
| `high_scores` | Individual score records |

### Score Interpretation

Scores are stored as `BIGINT` and interpreted based on `game_mode.score_format`:

| Format | Storage | Display Example |
|--------|---------|-----------------|
| `integer` | Raw value | 47 pts, 15 throws |
| `time_ms` | Milliseconds | 2:22.567 (stored as 142567) |
| `time_seconds` | Seconds | 4:56 (stored as 296) |
| `decimal_2` | Value × 100 | 98.45% (stored as 9845) |
| `level` | Encoded digits | World 8-4 (stored as 84) |

### Score Direction

`game_mode.score_direction` determines leaderboard sorting:
- `lower_better`: Golf strokes, race times, darts throws
- `higher_better`: Points, eliminations, completion %

---

## Application Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component, routing
├── index.css                   # Tailwind imports + global styles
│
├── lib/
│   ├── supabase.ts             # Supabase client initialization
│   ├── types.ts                # TypeScript types (generated from schema)
│   └── utils.ts                # Score formatting, time helpers
│
├── hooks/
│   ├── useGames.ts             # Fetch games list
│   ├── useGameModes.ts         # Fetch modes for a game
│   ├── useLeaderboard.ts       # Fetch & subscribe to scores
│   ├── usePlayers.ts           # Fetch & manage players
│   └── useRealtimeScores.ts    # Realtime subscription logic
│
├── components/
│   ├── layout/
│   │   ├── KioskLayout.tsx     # Full-screen container
│   │   └── Header.tsx          # Game/mode title display
│   │
│   ├── display/
│   │   ├── ScoreCarousel.tsx   # Auto-cycling score display
│   │   ├── LeaderboardCard.tsx # Single leaderboard view
│   │   ├── ScoreRow.tsx        # Individual score entry
│   │   ├── PlayerAvatar.tsx    # Avatar with fallback
│   │   ├── ScoreValue.tsx      # Formatted score display
│   │   └── NewScoreAnimation.tsx # Celebration animation
│   │
│   ├── input/
│   │   ├── ScoreInputModal.tsx # Modal for entering scores
│   │   ├── GamePicker.tsx      # Game selection
│   │   ├── ModePicker.tsx      # Mode selection
│   │   ├── PlayerPicker.tsx    # Player selection/creation
│   │   ├── ScoreInput.tsx      # Score value input
│   │   └── TimeInput.tsx       # Time-specific input (mm:ss.mmm)
│   │
│   ├── players/
│   │   ├── PlayerManager.tsx   # Player CRUD interface
│   │   ├── AvatarUpload.tsx    # Avatar upload component
│   │   └── PlayerCard.tsx      # Player display card
│   │
│   └── ui/
│       ├── Button.tsx          # Styled button
│       ├── Modal.tsx           # Modal wrapper
│       ├── TouchRipple.tsx     # Touch feedback effect
│       └── LoadingSpinner.tsx  # Loading state
│
├── pages/
│   ├── KioskDisplay.tsx        # Main auto-cycling display
│   ├── ManualBrowse.tsx        # Touch-to-browse mode
│   ├── AddScore.tsx            # Score input flow
│   └── Settings.tsx            # Configuration (cycle speed, etc.)
│
└── stores/
    └── kioskStore.ts           # Zustand store for UI state
```

---

## User Flows

> **For detailed component specifications, layouts, and state management, see `UI_SPEC.md`.**
> 
> The following diagrams provide a high-level overview of user journeys. The UI_SPEC.md file contains structured YAML definitions that should be used when implementing components.

### 1. Idle Display (Primary Mode)

```
┌─────────────────────────────────────────┐
│   🏎️  MARIO KART 8 DELUXE              │
│       Rainbow Road — Time Trial         │
├─────────────────────────────────────────┤
│   🥇  Player 1           2:22.567      │
│   🥈  Player 2           2:24.891      │
│   🥉  Player 3           2:31.044      │
│   4.  Player 4           2:35.220      │
├─────────────────────────────────────────┤
│          Tap to browse or add score     │
└─────────────────────────────────────────┘
            │
            │ (10 second timer)
            ▼
┌─────────────────────────────────────────┐
│   🎯  DARTS                             │
│       501 — Fewest Darts                │
├─────────────────────────────────────────┤
│   🥇  Player 2              15 darts   │
│   🥈  Player 1              18 darts   │
│   🥉  Player 3              21 darts   │
│                                         │
├─────────────────────────────────────────┤
│          Tap to browse or add score     │
└─────────────────────────────────────────┘
```

**Behavior:**
- Auto-cycles through game modes with scores
- Skips modes with no scores (or shows "No scores yet!")
- Cycle speed configurable (default: 10 seconds)
- Subtle transition animations between cards
- Tap anywhere → enters interactive mode

### 2. Interactive Browse Mode

```
User taps screen
       │
       ▼
┌─────────────────────────────────────────┐
│  ←                          + Add Score │
├─────────────────────────────────────────┤
│   CATEGORIES                            │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│   │ Racing  │ │  Golf   │ │  Party  │  │
│   └─────────┘ └─────────┘ └─────────┘  │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│   │  Darts  │ │ Pinball │ │   RPG   │  │
│   └─────────┘ └─────────┘ └─────────┘  │
├─────────────────────────────────────────┤
│       30s idle → returns to auto mode   │
└─────────────────────────────────────────┘
       │
       │ User taps "Racing"
       ▼
┌─────────────────────────────────────────┐
│  ← Categories                + Add Score│
├─────────────────────────────────────────┤
│   RACING                                │
│   ┌─────────────────────────────────┐  │
│   │ 🏎️  Mario Kart 8 Deluxe        │  │
│   └─────────────────────────────────┘  │
│   ┌─────────────────────────────────┐  │
│   │ 🏎️  Assetto Corsa Competizione │  │
│   └─────────────────────────────────┘  │
│   ┌─────────────────────────────────┐  │
│   │ 🏎️  F1 24                       │  │
│   └─────────────────────────────────┘  │
│              ↓ scroll for more          │
└─────────────────────────────────────────┘
       │
       │ User taps game → mode → leaderboard
       ▼
┌─────────────────────────────────────────┐
│  ← ACC                       + Add Score│
├─────────────────────────────────────────┤
│   SPA-FRANCORCHAMPS — GT3               │
│                                         │
│   🥇  Player 1           2:17.456      │
│   🥈  Player 2           2:19.221      │
│   🥉  Player 3           2:22.108      │
│   4.  Player 4           2:25.667      │
├─────────────────────────────────────────┤
│   [GT4]  [Monza]  [Nürburgring]         │
└─────────────────────────────────────────┘
```

### 3. Add Score Flow

```
User taps "+ Add Score"
       │
       ▼
┌─────────────────────────────────────────┐
│  ← Cancel                   ADD SCORE   │
├─────────────────────────────────────────┤
│  Game     [Mario Kart 8 Deluxe     ▼]  │
│  Mode     [Rainbow Road - TT       ▼]  │
│  Player   [Player 1                ▼]  │
│           [ + New Player ]              │
├─────────────────────────────────────────┤
│  Time        ┌──┐ : ┌──┐ . ┌───┐       │
│              │2 │   │22│   │567│       │
│              └──┘   └──┘   └───┘       │
│                                         │
│            [ Save Score ]               │
└─────────────────────────────────────────┘
       │
       │ User taps "Save Score"
       ▼
┌─────────────────────────────────────────┐
│                                         │
│         🎉  NEW HIGH SCORE!  🎉         │
│                                         │
│             Player 1                    │
│             2:22.567                    │
│            🥇 1st Place!                │
│                                         │
│         ✨ (confetti + fanfare) ✨       │
└─────────────────────────────────────────┘
       │
       │ (3 seconds)
       ▼
   Returns to display mode
```

### 4. Realtime Update (From Phone)

```
Phone user submits score via web app
              │
              ▼
       Supabase receives INSERT
              │
              ▼
       Realtime broadcasts to Pi
              │
              ▼
┌─────────────────────────────────────────┐
│                                         │
│        ⚡ NEW RECORD! ⚡                 │
│                                         │
│   Player 2 just set a new best!         │
│                                         │
│   🎯 Darts — 501                        │
│      14 darts 🥇                        │
│                                         │
│   (🔊 fanfare plays, auto-dismiss 5s)   │
└─────────────────────────────────────────┘
              │
              ▼
       Returns to carousel
```

---

## Visual Design Guidelines

### Display Specifications

**Resolution:** 800 × 480 pixels (7" diagonal)

This compact resolution requires careful design:

| Constraint | Guideline |
|------------|-----------|
| Leaderboard rows | 4-5 max visible at once |
| Touch targets | 56px minimum height |
| Body font size | 18px minimum |
| Score/title font | 24-32px |
| Layout | Single column only |
| Padding | Generous (16-24px) to prevent mis-taps |

```
┌─────────────────────────────────────────┐
│  800px                                  │
│  ┌───────────────────────────────────┐  │
│  │  Header: Game + Mode (64px)       │  │ 480px
│  ├───────────────────────────────────┤  │
│  │  Score Row 1 (72px)               │  │
│  │  Score Row 2 (72px)               │  │
│  │  Score Row 3 (72px)               │  │
│  │  Score Row 4 (72px)               │  │
│  ├───────────────────────────────────┤  │
│  │  Footer hint (48px)               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Color Palette

```css
/* Background */
--bg-primary: #0f0f0f;      /* Near black */
--bg-card: #1a1a1a;          /* Card background */
--bg-elevated: #252525;      /* Modals, inputs */

/* Accent colors by category */
--racing: #ef4444;           /* Red */
--golf: #22c55e;             /* Green */
--party: #f59e0b;            /* Amber */
--darts: #3b82f6;            /* Blue */
--pinball: #a855f7;          /* Purple */
--platformer: #ec4899;       /* Pink */
--rpg: #06b6d4;              /* Cyan */

/* Text */
--text-primary: #ffffff;
--text-secondary: #a1a1a1;
--text-muted: #6b6b6b;

/* Medals */
--gold: #ffd700;
--silver: #c0c0c0;
--bronze: #cd7f32;
```

### Typography

```css
/* Use a gaming-friendly font stack */
font-family: 'Inter', system-ui, sans-serif;

/* Scores should be monospace for alignment */
.score-value {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}
```

### Animation Principles

1. **Transitions between leaderboards:** Subtle slide/fade (300ms)
2. **New score celebration:** Particles/confetti burst (2-3 seconds)
3. **Touch feedback:** Ripple effect on tap
4. **Loading states:** Skeleton shimmer, not spinners
5. **Score updates:** Brief highlight glow on changed rows

### Sound Effects

The kiosk has a speaker—use audio sparingly but effectively:

| Event | Sound | Duration |
|-------|-------|----------|
| New high score (1st place) | Fanfare / victory jingle | 2-3s |
| New score (not 1st) | Subtle chime | 0.5s |
| Touch feedback | Soft click (optional) | 0.1s |
| Error | Low tone | 0.3s |

**Implementation notes:**
- Use Web Audio API or Howler.js for low-latency playback
- Keep sounds short and non-annoying (will be heard frequently)
- Provide a mute toggle in settings
- Pre-load audio files to avoid delays

```typescript
// lib/sounds.ts
import { Howl } from 'howler'

export const sounds = {
  fanfare: new Howl({ src: ['/sounds/fanfare.mp3'], volume: 0.7 }),
  chime: new Howl({ src: ['/sounds/chime.mp3'], volume: 0.5 }),
  click: new Howl({ src: ['/sounds/click.mp3'], volume: 0.3 }),
}
```

### Kiosk-Specific Considerations

- **Touch targets:** Minimum 48px height
- **No hover states:** Design for touch only
- **High contrast:** Readable from across the room
- **Screen burn-in prevention:** Subtle position shifts, dim on inactivity
- **Error recovery:** Auto-reconnect on network issues, show offline indicator

---

## Technical Implementation Notes

### Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Realtime Subscription Pattern

```typescript
// hooks/useRealtimeScores.ts
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeScores(onNewScore: (score: Score) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('high_scores_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'high_scores',
        },
        (payload) => {
          onNewScore(payload.new as Score)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onNewScore])
}
```

### Score Formatting Utility

```typescript
// lib/utils.ts
export function formatScore(
  value: number,
  format: ScoreFormat,
  unit?: string | null
): string {
  switch (format) {
    case 'time_ms': {
      const minutes = Math.floor(value / 60000)
      const seconds = Math.floor((value % 60000) / 1000)
      const ms = value % 1000
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
    }
    case 'time_seconds': {
      const minutes = Math.floor(value / 60)
      const seconds = value % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    case 'decimal_2':
      return `${(value / 100).toFixed(2)}${unit ? ` ${unit}` : ''}`
    case 'level':
      return `World ${Math.floor(value / 10)}-${value % 10}`
    case 'integer':
    default:
      return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`
  }
}
```

### Auto-Cycle Logic

```typescript
// components/display/ScoreCarousel.tsx
const CYCLE_INTERVAL = 10000 // 10 seconds

export function ScoreCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const gameModes = useActiveGameModes() // modes with scores

  useEffect(() => {
    if (isPaused || gameModes.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % gameModes.length)
    }, CYCLE_INTERVAL)

    return () => clearInterval(timer)
  }, [isPaused, gameModes.length])

  const handleTouch = () => {
    setIsPaused(true)
    // Navigate to browse mode
  }

  // ... render current leaderboard with AnimatePresence
}
```

---

## Raspberry Pi Deployment

### Initial Setup

```bash
# Install Node.js (use NodeSource for latest LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Install Chromium if not present
sudo apt-get install -y chromium-browser

# Clone and build the app
git clone <repo-url> ~/scoreboard
cd ~/scoreboard
npm install
npm run build
```

### Kiosk Mode Configuration

```bash
# /home/pi/.config/autostart/scoreboard.desktop
[Desktop Entry]
Type=Application
Name=Scoreboard
Exec=/home/pi/scoreboard/start-kiosk.sh
```

```bash
# ~/scoreboard/start-kiosk.sh
#!/bin/bash

# Wait for network
sleep 5

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide cursor after 3 seconds of inactivity
unclutter -idle 3 &

# Start Chromium in kiosk mode
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-restore-session-state \
  --no-first-run \
  --start-fullscreen \
  --app=http://localhost:4173
```

### Running the App

```bash
# Option 1: Serve the built app (production)
npm run preview -- --host

# Option 2: Use a process manager
npm install -g pm2
pm2 start "npm run preview -- --host" --name scoreboard
pm2 save
pm2 startup
```

### Screen Burn-in Prevention

Add to the app's idle behavior:
- Dim screen to 50% after 5 minutes of no interaction
- Add subtle random position offset (±5px) every cycle
- Option: Full screen dim/off after 30 minutes (wake on touch)

---

## Development Workflow

### Local Development

```bash
# Start dev server with hot reload
npm run dev

# Generate Supabase types (run after schema changes)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types.ts
```

### Environment Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Testing on Pi

```bash
# From your dev machine, build and copy to Pi
npm run build
rsync -avz dist/ pi@raspberrypi.local:~/scoreboard/dist/

# Or develop directly on Pi with the dev server
# (slower but allows hot reload testing)
```

---

## Phase 2: Companion Web App (Future)

A lightweight PWA for score input from phones:

- Same Supabase backend
- Mobile-optimized input forms
- QR code on Pi display for easy access
- Push notifications for "you've been dethroned!"

---

## Open Questions / Decisions

1. ~~**Offline behavior:**~~ Network is stable; low priority
2. **Score deletion:** Allow from Pi, or admin-only via separate interface?
3. **Multiple Pi displays:** Share the same Supabase, show different categories?
4. ~~**Sound effects:**~~ ✓ Speaker available, sounds included in design

---

## Getting Started with Claude Code

When you open Claude Code in this project directory, you can prompt it with:

> "Read the ARCHITECTURE.md and UI_SPEC.md files. The UI_SPEC.md contains structured YAML definitions for every screen, component, and state. Scaffold the React application following these specifications. Start with the basic Supabase connection, type definitions, and the IdleDisplay screen."

**Key files for Claude Code:**
- `ARCHITECTURE.md` — High-level overview, data flow, tech decisions
- `UI_SPEC.md` — Structured component specs (layouts, dimensions, colors, behaviors)
- `supabase/schema.sql` — Database schema reference

Claude Code will have the full context to build this systematically.
