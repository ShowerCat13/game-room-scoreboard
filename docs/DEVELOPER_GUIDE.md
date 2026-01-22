# Game Room Scoreboard - Developer Guide

A modern, touch-friendly high score tracker for home game rooms, built for Raspberry Pi kiosks.

![Version](https://img.shields.io/badge/version-0.9.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-blue)

---

## Project Overview

**Game Room Scoreboard** is a kiosk application designed for a 7" touchscreen (800x480) that displays and tracks high scores for various games - racing, golf, darts, pinball, RPGs, and more.

### Why This Exists

- **Physical presence** - A dedicated scoreboard in the game room creates friendly competition
- **Touch-first** - Big buttons, readable fonts, no keyboard needed
- **Real-time** - Scores sync instantly across all devices
- **Flexible** - Supports any game with a 3-level hierarchy (Game -> Mode -> Detail)

### Key Features

- Auto-cycling leaderboard carousel
- Mobile-responsive for phone score entry
- Celebration animations for new high scores
- Sound effects (Web Audio API)
- 6 theme presets with customization
- Bulk CSV/JSON import
- Real-time sync via Supabase

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS (custom theme) |
| **Animations** | Framer Motion |
| **State** | Zustand (with persistence) |
| **Backend** | Supabase (PostgreSQL + Realtime + Storage) |
| **Routing** | React Router v6 |
| **Icons** | Lucide React |
| **Testing** | Playwright (E2E) |

### Data Model

The core insight is a flexible 3-level hierarchy:

```
GAME -> MODE (optional) -> DETAIL (optional) -> SCORE
```

**Examples:**
```
Mario Kart 8 -> 150cc Time Trial -> Rainbow Road -> 1:58.234
Mario Golf -> Standard -> (none) -> -3
Darts -> 501 -> (none) -> 12 darts
Fallout 4 -> Eliminations -> Super Mutants -> 847
```

### Score Formats

Scores are stored as `BIGINT` and interpreted based on `score_format`:

| Format | Storage | Display | Direction |
|--------|---------|---------|-----------|
| `integer` | Raw value | `1000 pts` | higher_better |
| `time_ms` | Milliseconds | `1:58.234` | lower_better |
| `time_seconds` | Seconds | `4:56` | lower_better |
| `decimal_2` | Value x 100 | `98.45%` | higher_better |
| `golf_relative` | Raw value | `-3`, `E`, `+2` | lower_better |
| `level` | Encoded (x100) | `World 8-4` | higher_better |

### Database Schema

See `schema.sql` for the complete schema. Key tables:

```sql
players         -- id, name, avatar_url
games           -- id, name, category, platform, default_score_format
game_modes      -- id, game_id, name, score_format, score_direction
game_details    -- id, game_id, mode_id, name, score_format (optional override)
high_scores     -- id, player_id, game_id, mode_id, detail_id, score, achieved_at
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- (For kiosk) Raspberry Pi 4 + 7" touchscreen

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/game-room-scoreboard.git
cd game-room-scoreboard
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Run `schema.sql` in the SQL Editor
3. Run `seed.sql` for sample data (optional)
4. Create an `avatars` bucket in Storage (public)
5. Copy your project URL and anon key

### 3. Environment Variables

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5173` - use browser DevTools to emulate 800x480.

### 5. Run Tests

```bash
npm run test:e2e        # Headless
npm run test:e2e:ui     # Interactive UI
npm run test:e2e:headed # Watch in browser
```

---

## Project Structure

```
src/
|-- components/
|   |-- cards/           # CategoryButton, GameCard, ModeCard
|   |-- display/         # PlayerAvatar, RankBadge, ScoreRow, ScoreValue
|   |-- input/           # SelectField, PickerModal, TimeInput, NumericInput, AvatarUpload
|   |-- layout/          # KioskLayout, BrowseHeader
|   |-- management/      # ConfirmDialog, PinModal, EditScoreModal, BulkImportModal
|   |-- overlays/        # CelebrationOverlay, RealtimeScoreAlert, ActionSheet
|   |-- ui/              # BottomSheet
|-- hooks/               # Custom React hooks (data fetching, subscriptions)
|-- lib/
|   |-- supabase.ts      # Supabase client
|   |-- types.ts         # TypeScript types
|   |-- utils.ts         # Formatting utilities
|   |-- scoreParser.ts   # Score parsing for all formats
|-- pages/               # Route components
|-- stores/              # Zustand stores
|-- index.css            # Tailwind + custom CSS
```

---

## Design System

### Constraints

The kiosk has strict constraints that drive all design decisions:

| Constraint | Value | Reason |
|------------|-------|--------|
| **Display size** | 800x480px | 7" Raspberry Pi touchscreen |
| **Touch targets** | >=56px | Finger-friendly |
| **Base font** | 18px | Readable from across room |
| **Max rows** | 4-5 | Limited vertical space |

### Tailwind Theme

Custom tokens in `tailwind.config.js`:

```js
colors: {
  background: {
    primary: 'var(--color-bg-primary)',
    card: 'var(--color-bg-card)',
    elevated: 'var(--color-bg-elevated)',
  },
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
  },
  category: {
    racing: 'var(--color-category-racing)',
    golf: 'var(--color-category-golf)',
    // ...
  }
}
```

### Themes

Themes are applied via CSS custom properties and `data-theme` attribute:

```css
[data-theme="dark"] {
  --color-bg-primary: #0f0f0f;
  --color-bg-card: #1a1a1a;
  /* ... */
}
```

---

## Build-Time Constants

The app injects constants at build time via `vite.config.ts`:

| Constant | Purpose | Usage |
|----------|---------|-------|
| `__LOCAL_IP__` | Local network IP for QR code | `getQrUrl()` in IdleDisplay |

The IP is detected using `os.networkInterfaces()` and injected via Vite's `define` option. The type declaration is in `src/vite-env.d.ts`.

---

## Key Hooks

### Data Fetching

| Hook | Purpose |
|------|---------|
| `useGames()` | Fetch all games |
| `useGameModes(gameId)` | Fetch modes for a game |
| `useGameDetails(gameId, modeId)` | Fetch details |
| `useLeaderboard(modeId, detailId)` | Fetch scores with player info |
| `usePlayers()` | Fetch all players |

### Subscriptions

| Hook | Purpose |
|------|---------|
| `useRealtimeScores()` | Subscribe to score changes |
| `useIdleTimer(timeout)` | Detect user inactivity |

### Management

| Hook | Purpose |
|------|---------|
| `useManagePlayers()` | CRUD for players |
| `useManageGames()` | CRUD for games |
| `useManageScores()` | CRUD for scores |
| `useBulkImport()` | CSV/JSON import |
| `useAvatarUpload()` | Supabase Storage upload |

---

## Testing

### E2E Tests (Playwright)

119 tests covering:
- Navigation and routing
- Score submission flows
- CRUD operations
- Settings and themes
- Visual/accessibility checks

```bash
# Run all tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui

# Single file
npx playwright test tests/navigation.spec.ts
```

### Test Configuration

Tests run at 800x480 viewport to match the kiosk:

```ts
// playwright.config.ts
use: {
  viewport: { width: 800, height: 480 },
}
```

---

## Deployment

### Raspberry Pi Setup

1. **Install OS:** Raspberry Pi OS (64-bit recommended)
2. **Clone repo:** `git clone ... && cd game-room-scoreboard`
3. **Install deps:** `npm install`
4. **Build:** `npm run build`
5. **Serve:**
   ```bash
   npm install -g serve pm2
   pm2 start "serve -s dist -l 4173" --name scoreboard
   pm2 save
   pm2 startup
   ```

### Kiosk Mode (Auto-start Chromium)

Add to `~/.config/autostart/scoreboard.desktop`:

```ini
[Desktop Entry]
Type=Application
Name=Scoreboard
Exec=chromium-browser --kiosk --noerrdialogs --disable-infobars http://localhost:4173
```

### mDNS Setup (scoreboard.local)

```bash
sudo apt install avahi-daemon
sudo hostnamectl set-hostname scoreboard
# Edit /etc/hosts: 127.0.1.1 scoreboard
sudo reboot
```

---

## Extending the App

### Adding a New Score Format

1. Add the format to `schema.sql` enum:
   ```sql
   ALTER TYPE score_format ADD VALUE 'new_format';
   ```

2. Update TypeScript types in `src/lib/types.ts`:
   ```typescript
   export type ScoreFormat = ... | 'new_format'
   ```

3. Add formatter in `src/lib/utils.ts` `formatScore()`:
   ```typescript
   case 'new_format': {
     // Your display logic
     return formattedString
   }
   ```

4. Add parser in `src/lib/scoreParser.ts` `parseScore()`:
   ```typescript
   case 'new_format':
     return parseNewFormat(input)
   ```

5. Add help text in `scoreParser.ts` `getFormatHelpText()`

6. Add input component if needed in `src/components/input/`

### Adding a New Game Category

1. Add to `schema.sql` enum:
   ```sql
   ALTER TYPE game_category ADD VALUE 'new_category';
   ```

2. Update `src/lib/types.ts`:
   ```typescript
   export type GameCategory = ... | 'new_category'
   ```

3. Add category config in `src/components/cards/CategoryButton.tsx`:
   ```typescript
   new_category: {
     color: 'text-category-newcategory',
     bgGradient: 'from-color-500/10 to-transparent',
     glowClass: 'category-glow-newcategory',
     Icon: SomeIcon,
   }
   ```

4. Add CSS variables in `src/index.css` for the theme color

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm run test:e2e`
5. Run type check: `npx tsc --noEmit`
6. Commit: `git commit -m "Add my feature"`
7. Push: `git push origin feature/my-feature`
8. Open a Pull Request

### Code Style

- TypeScript strict mode
- Functional components with hooks
- No `any` types (except Supabase workarounds)
- Tailwind for styling (use design tokens)
- 56px minimum touch targets

### Commit Messages

```
feat: Add bulk import for scores
fix: Correct time parsing for sub-minute times
docs: Update developer guide
refactor: Extract score parser to utility
test: Add E2E tests for settings
```

---

## Roadmap

See [FUTURE_ENHANCEMENTS.md](FUTURE_ENHANCEMENTS.md) for the complete roadmap.

### Known Limitations

- No offline mode (requires network)
- Single household (no multi-tenancy)
- English only (no i18n)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://framer.com/motion) - Animations
- [Lucide](https://lucide.dev) - Icons
- [Playwright](https://playwright.dev) - Testing

---

## Support

- **Issues:** GitHub Issues for bugs and feature requests
- **Discussions:** GitHub Discussions for questions

Happy coding!