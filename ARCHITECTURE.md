# Architecture — Game Room Scoreboard

**Version:** 1.0.0-beta  
**Last Updated:** 2025-01-18

---

## System Overview

A Raspberry Pi-based kiosk application for displaying and managing high scores across a variety of games—from Mario Kart to darts to completion tracking in Stardew Valley.

### Hardware Target
- **Primary:** Raspberry Pi 4B (4GB) with 7" touchscreen (800×480) in Smart Pi Kiosk stand
- **Secondary:** Mobile phones/tablets on same WiFi network
- **Audio:** Speaker connected to Pi for sound effects

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (custom design tokens) |
| Animation | Framer Motion |
| State | Zustand (with localStorage persistence) |
| Backend | Supabase (PostgreSQL + Realtime + Storage) |
| Routing | React Router v6 |
| Icons | Lucide React |

---

## Data Model: 3-Level Hierarchy

The core insight is that different games need different levels of specificity:

```
GAME (Container)
  │
  ├── mode_label: "Mode" | "Class" | "Machine" | "Category" | custom
  ├── detail_label: "Track" | "Course" | "Item" | "Enemy" | custom
  ├── has_modes: boolean
  ├── has_details: boolean
  │
  └── MODE (Level 1 - optional)
        │
        ├── Defines the TYPE of metric being tracked
        ├── Has its own score_format, score_direction, score_unit
        ├── Can override detail_label for this mode
        │
        └── DETAIL (Level 2 - optional)
              │
              ├── Can be shared across all modes (mode_id = NULL)
              ├── Can be mode-specific (mode_id = UUID)
              ├── Can override score settings (rare)
              │
              └── SCORE (The actual value)
```

### Key Principle for RPG/Complex Games

**Mode = TYPE of metric being tracked** (determines score_format)  
**Detail = SPECIFIC items within that metric**

This is crucial for games like Stardew Valley or Fallout 4 where you might track multiple different types of data.

---

## Example Configurations

### Simple Game: Pinball (modes only, no details)
```
Game: Pinball
  has_modes: true
  has_details: false
  mode_label: "Machine"

Modes:
  - Attack From Mars (score: integer, higher_better, "pts")
  - Medieval Madness (score: integer, higher_better, "pts")
  - The Addams Family (score: integer, higher_better, "pts")

Flow: Select Game → Select Machine → Enter Score
```

### Two-Level Game: Mario Kart (shared details across modes)
```
Game: Mario Kart 8 Deluxe
  has_modes: true
  has_details: true
  mode_label: "Class"
  detail_label: "Track"
  default_score_format: time_ms
  default_score_direction: lower_better

Modes:
  - 150cc Time Trial
  - 200cc Time Trial
  - Mirror Time Trial

Details (mode_id = NULL, shared across ALL modes):
  - Mario Kart Stadium
  - Water Park
  - Rainbow Road
  - ... (all 96 tracks)

Flow: Select Game → Select Class → Select Track → Enter Time
```

### Two-Level Game: Mario Golf (format changes by mode)
```
Game: Mario Golf: Super Rush
  has_modes: true
  has_details: true
  mode_label: "Mode"
  detail_label: "Course"

Modes:
  - Standard Golf (score: golf_relative, lower_better)
  - Speed Golf (score: time_seconds, lower_better)

Details (mode_id = NULL, shared across modes):
  - Bonny Greens
  - Ridgerock Lake
  - Balmy Dunes
  - Wildweather Woods
  - Bowser Highlands

Flow: Select Game → Select Mode → Select Course → Enter Score
Note: Score input type changes based on mode (golf score vs time)
```

### Complex RPG: Stardew Valley (mode = metric type)
```
Game: Stardew Valley
  has_modes: true
  has_details: true
  mode_label: "Category"
  detail_label: "Item"
  
Modes (each defines a DIFFERENT TYPE of metric):
  - Completion % 
      score_format: decimal_2
      score_direction: higher_better
      score_unit: "%"
      detail_label_override: "Category"
      
  - Earnings
      score_format: integer
      score_direction: higher_better
      score_unit: "g"
      detail_label_override: "Timeframe"
      
  - Speedrun
      score_format: time_ms
      score_direction: lower_better
      detail_label_override: "Goal"

Details (mode-specific):
  Completion %:
    - Community Center
    - Crafting Recipes
    - Cooking Recipes
    - Fish Caught
    - Items Shipped
    - Museum Artifacts
    - Overall Perfection
    
  Earnings:
    - Year 1 Total
    - Year 2 Total
    - Best Single Season
    - All-Time Total
    
  Speedrun:
    - Community Center (Any%)
    - Grandpa's Evaluation (4 Candles)
    - Perfection (100%)

Flow: Select Game → Select Category → Select Item → Enter Score
```

### Complex RPG: Fallout 4 (mode = metric type)
```
Game: Fallout 4
  has_modes: true
  has_details: true
  mode_label: "Category"
  detail_label: "Target"

Modes (each defines a DIFFERENT TYPE of metric):
  - Eliminations
      score_format: integer
      score_direction: higher_better
      score_unit: "kills"
      detail_label_override: "Enemy"
      
  - Completion %
      score_format: decimal_2
      score_direction: higher_better
      score_unit: "%"
      detail_label_override: "Category"
      
  - Quests Completed
      score_format: integer
      score_direction: higher_better
      score_unit: "quests"
      detail_label_override: "Quest Line"

Details (mode-specific):
  Eliminations:
    - Deathclaw
    - Super Mutant
    - Synth
    - Raider
    - Feral Ghoul
    - Mirelurk
    - Behemoth
    
  Completion %:
    - Main Quest
    - Side Quests
    - Bobbleheads
    - Magazines
    - Locations Discovered
    - Overall
    
  Quests Completed:
    - Main Story
    - Brotherhood of Steel
    - Railroad
    - Institute
    - Minutemen

Flow: Select Game → Select Category → Select Target → Enter Score
```

### Platformer: Super Mario Bros Wonder (levels are mode-specific)
```
Game: Super Mario Bros Wonder
  has_modes: true
  has_details: true
  mode_label: "World"
  detail_label: "Level"
  default_score_format: time_seconds
  default_score_direction: lower_better

Modes:
  - World 1 - Pipe-Rock Plateau
  - World 2 - Fluff-Puff Peaks
  - World 3 - Shining Falls
  - ... (6 worlds)

Details (mode-specific - each world has its own levels):
  World 1:
    - Welcome to the Flower Kingdom!
    - Piranha Plants on Parade
    - Scram, Skedaddlers!
    - Jewel-Block Cave
    - Condart Fortress
    
  World 2:
    - Bulrush Coming Through!
    - Fluff-Puff Peaks Summit
    - ...

Flow: Select Game → Select World → Select Level → Enter Time
```

---

## Anti-Pattern: What NOT To Do

❌ **WRONG: Using categories as modes for RPGs**
```
Fallout 4
├── Mode: Wildlife
│   └── Details: Radstag, Deathclaw, Mirelurk
├── Mode: Raiders  
│   └── Details: Raider, Gunner, Triggerman
├── Mode: Synths
│   └── Details: Gen 1, Gen 2, Courser
```

This is wrong because:
1. All these details track the same METRIC (kill counts)
2. The mode doesn't change the score_format
3. You can't track completion % or quest counts this way

✅ **CORRECT: Using metric types as modes**
```
Fallout 4
├── Mode: Eliminations (integer, kills)
│   └── Details: Deathclaw, Super Mutant, Raider, Synth...
├── Mode: Completion % (decimal_2, %)
│   └── Details: Main Quest, Bobbleheads, Magazines...
├── Mode: Quests Completed (integer, quests)
│   └── Details: Brotherhood, Railroad, Institute...
```

This is correct because:
1. Each mode represents a DIFFERENT TYPE of metric
2. The score_format changes appropriately
3. You can track multiple dimensions of gameplay

---

## Database Schema

### Enum Types

```sql
CREATE TYPE score_direction AS ENUM ('lower_better', 'higher_better');

CREATE TYPE score_format AS ENUM (
  'integer',        -- 47 pts, 15 darts, 13 kills
  'time_ms',        -- 2:22.567 (stored as milliseconds)
  'time_seconds',   -- 4:56 (stored as seconds)  
  'decimal_2',      -- 12.20 in, 98.45% (stored as value × 100)
  'golf_relative',  -- -4, E, +3 (stored as integer relative to par)
  'level'           -- World 8-4 (stored as encoded digits)
);

CREATE TYPE game_category AS ENUM (
  'racing', 'golf', 'party', 'darts', 
  'pinball', 'platformer', 'rpg', 'other'
);
```

### Tables

```sql
-- PLAYERS
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GAMES (Top-level container)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category game_category NOT NULL,
  platform TEXT,
  icon_url TEXT,
  
  -- Hierarchy configuration
  mode_label TEXT DEFAULT 'Mode',
  detail_label TEXT DEFAULT 'Track',
  has_modes BOOLEAN DEFAULT true,
  has_details BOOLEAN DEFAULT true,
  
  -- Default score settings
  default_score_format score_format DEFAULT 'integer',
  default_score_direction score_direction DEFAULT 'higher_better',
  default_score_unit TEXT,
  
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GAME MODES (Level 1)
CREATE TABLE game_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Override game's score settings (null = inherit from game)
  score_format score_format,
  score_direction score_direction,
  score_unit TEXT,
  
  -- Override detail_label for this mode
  detail_label_override TEXT,
  
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GAME DETAILS (Level 2)
CREATE TABLE game_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mode_id UUID REFERENCES game_modes(id) ON DELETE CASCADE,  -- NULL = shared
  name TEXT NOT NULL,
  
  -- Override score settings (rare)
  score_format score_format,
  score_direction score_direction,
  score_unit TEXT,
  
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- HIGH SCORES
CREATE TABLE high_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mode_id UUID REFERENCES game_modes(id) ON DELETE SET NULL,
  detail_id UUID REFERENCES game_details(id) ON DELETE SET NULL,
  score BIGINT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Score Format Inheritance

When displaying/entering a score, the format is determined by:

```typescript
const effectiveFormat = 
  detail?.score_format ??      // 1. Detail override (rare)
  mode?.score_format ??        // 2. Mode setting (common for RPGs)
  game.default_score_format;   // 3. Game default (fallback)
```

---

## UI Flow

### Browse Navigation
```
Categories → Games → Modes → Details → Leaderboard
                      ↓         ↓
                (skip if    (skip if
              !has_modes)  !has_details)
```

### Add Score Flow
```
┌─────────────────────────────────────┐
│  Step 1: Select Game                │
│  [Mario Kart 8 Deluxe        ▼]     │
├─────────────────────────────────────┤
│  Step 2: Select Class (if has_modes)│
│  [150cc Time Trial           ▼]     │
├─────────────────────────────────────┤
│  Step 3: Select Track (if has_det.) │
│  [Rainbow Road               ▼]     │
├─────────────────────────────────────┤
│  Step 4: Select Player              │
│  [Andrew                     ▼]     │
├─────────────────────────────────────┤
│  Step 5: Enter Score                │
│  (input type based on effective     │
│   score_format from inheritance)    │
├─────────────────────────────────────┤
│          [ Save Score ]             │
└─────────────────────────────────────┘
```

---

## Responsive Design

### Breakpoints
- **Kiosk:** 800×480 (fixed layout)
- **Mobile Portrait:** max-width 640px (stacked layout)
- **Tablet/Desktop:** flexible layout

### Key Adaptations
| Element | Kiosk | Mobile |
|---------|-------|--------|
| Category grid | 4×2 | 2×4 |
| Score row | Horizontal | Stacked |
| Touch targets | 56px | 56px |

---

## Pi Deployment

### Production Setup
```bash
# Install dependencies
sudo npm install -g pm2 serve

# Build and start
npm run build
pm2 start "serve -s dist -l 4173" --name scoreboard
pm2 save
pm2 startup

# Kiosk mode
chromium --kiosk http://localhost:4173
```

---

## File Structure

```
src/
├── components/
│   ├── display/      # PlayerAvatar, RankBadge, ScoreRow, ScoreValue
│   ├── cards/        # CategoryButton, GameCard, ModeCard
│   ├── input/        # SelectField, PickerModal, TimeInput, NumericInput
│   ├── layout/       # KioskLayout, BrowseHeader
│   ├── management/   # ConfirmDialog, PinModal
│   └── overlays/     # CelebrationOverlay, RealtimeScoreAlert
├── hooks/            # Data fetching + subscriptions
├── lib/              # Utilities, Supabase client, types
├── pages/            # Route components
└── stores/           # Zustand state management
```