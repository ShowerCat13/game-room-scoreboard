# Changelog

All notable changes to Game Room Scoreboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-beta] — 2025-01-20

### 🎉 Beta Release

First beta release with all planned features implemented. Ready for real-world testing.

### Added

#### ALPHA-006: Responsive CSS for Mobile
- **Mobile-first responsive layouts** for all pages
- Breakpoints: 480px (small phones), 640px (large phones), 800px (kiosk)
- Flexible grids that adapt to screen width
- Touch targets remain ≥56px on all devices
- Score rows stack vertically on narrow screens
- New CSS classes: `.responsive-grid`, `.idle-*`, `.browse-*`

#### ALPHA-003: CRUD Discoverability
- **Action Sheet component** — Bottom sheet menu pattern
- **+Add button now opens menu** with three options:
  - Add Score (primary action)
  - Add Player (opens inline modal)
  - Manage... (navigates to /manage)
- Available on all browse pages (Category, Game, Mode, Detail, Leaderboard)
- Swipe down or tap outside to dismiss

#### ALPHA-009: Avatar Upload Discoverability
- **Camera icon overlay** on player avatars in edit form
- Visual affordance shows avatars are tappable
- **AvatarUpload component** with:
  - Instant preview before upload completes
  - Loading spinner during upload
  - X button to remove existing avatar
  - File validation (images only, max 2MB)
- **useAvatarUpload hook** for Supabase Storage integration
- Requires `avatars` bucket in Supabase Storage

#### ALPHA-014: Bulk CSV/JSON Import
- **Smart paste box** — Auto-detects CSV vs JSON format
- **Fuzzy name matching** — Matches "mario kart" to "Mario Kart 8"
- **Score format parsing** based on game/mode settings:
  - `time_ms`: `1:23.456` or `83.456` → milliseconds
  - `time_seconds`: `4:56` or `296` → seconds
  - `golf_relative`: `-6`, `+2`, `0`, `E` → relative to par
  - `integer`: `1000`, `47` → raw value
  - `decimal_2`: `98.45` → stored as 9845
  - `level`: `8-4` → encoded value
- **Validation preview** shows errors/warnings before import
- **Batch insert** in chunks of 50 for performance
- **scoreParser.ts** utility for parsing all score formats

#### ALPHA-015: Score Editing UI
- **Edit button** (pencil icon) on score rows in Manage
- **EditScoreModal** with smart input selection:
  - TimeInput for `time_ms` and `time_seconds`
  - NumericInput for `integer`, `decimal_2`, `golf_relative`
- Shows current score and context (player, game, mode)
- Uses existing `updateScore` hook

### Changed
- **BrowseHeader** now accepts `onAddScore`, `onAddPlayer`, `onManage` props
- **Manage.tsx** includes bulk import button in Scores tab
- **Player form modal** now includes AvatarUpload component
- **index.css** includes responsive utility classes

### New Components
| Component | Location | Purpose |
|-----------|----------|---------|
| ActionSheet | `components/overlays/` | Bottom sheet menu |
| BottomSheet | `components/ui/` | Base sheet component |
| AvatarUpload | `components/input/` | Avatar upload with camera overlay |
| EditScoreModal | `components/management/` | Score editing modal |
| BulkImportModal | `components/management/` | CSV/JSON import UI |

### New Hooks
| Hook | Purpose |
|------|---------|
| useAvatarUpload | Supabase Storage upload/delete |
| useBulkImport | CSV/JSON parsing, validation, batch insert |

### New Utilities
| File | Purpose |
|------|---------|
| scoreParser.ts | Parse score strings for all formats |

### Supabase Setup Required
```sql
-- Create avatars bucket for player photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

### Upgrade from 0.9.7
No database schema changes. Simply:
```bash
git pull origin main
npm install
npm run build
pm2 restart scoreboard
```

---

## [0.9.7] — 2025-01-20

### Added

#### ALPHA-013: E2E Testing with Playwright
- **104 passing tests** covering all major functionality
- Test suites:
  - `navigation.spec.ts` — Routing, back buttons, browse hierarchy
  - `settings.spec.ts` — Theme switching, sound, display settings
  - `score-submission.spec.ts` — Form elements, validation
  - `score-flow.spec.ts` — End-to-end submission flows
  - `crud-operations.spec.ts` — Create, Read, Update, Delete operations
  - `realtime-edge-cases.spec.ts` — Error handling, persistence, features
  - `management.spec.ts` — Tab navigation, basic structure
  - `visual-accessibility.spec.ts` — Touch targets, fonts, viewport
- New npm scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:report`
- Playwright configuration for 800×480 kiosk viewport

#### ALPHA-012: Theme System
- **6 theme presets:**
  - Dark (default) — Classic dark mode with subtle grays
  - Light — Clean light mode with high contrast text
  - OLED — Pure black backgrounds for OLED screens
  - Cyberpunk — Neon cyan/magenta accents on dark
  - Retro — Warm amber/orange arcade tones
  - Nature — Forest greens and earth tones
- **Theme customization:**
  - Text color override (auto/light/dark) for readability
  - Reset to theme defaults button
  - All settings persist via localStorage
- CSS custom properties for all colors
- Theme applied via `data-theme` attribute on `<html>`

#### ALPHA-011: QR Code & mDNS
- **QR code popup** on idle display for mobile access
- Shows scannable QR code with device URL
- **mDNS support** — Access via `http://scoreboard.local:4173`
- Setup instructions in PI_MDNS_SETUP.md

#### ALPHA-010: Clock Display
- **12-hour clock** on idle display header
- Updates every minute
- Format: `12:34 PM`
- Readable from across the room

#### ALPHA-005: Lucide React Icons
- **Replaced all emoji icons** with Lucide React icons
- Cross-platform compatibility (no more [] on Pi)
- Category icons: Car, Flag, PartyPopper, Target, Disc3, Gamepad2, Swords, LayoutGrid
- Medal icons: Medal (gold), Award (silver), Trophy (bronze)
- Consistent styling with theme colors

### Changed
- **Light theme contrast** — Darkened text colors (#111111) for better readability
- **Settings page reorganization** — Added Theme section with visual theme buttons
- **package.json** — Version 0.9.7, added Playwright and qrcode dependencies

### Fixed
- Light theme medal colors now use solid colors instead of gradients
- Category colors darkened for light theme readability
- Podium gradients use CSS overrides for light theme
- Avatar ring colors adjusted per theme

---

## [0.9.5] — 2025-01-18

### 🚨 Breaking Changes

#### Database Schema Restructure
The data model was redesigned for a flexible 3-level hierarchy:
```
GAME → MODE (optional) → DETAIL (optional) → SCORE
```

See schema.sql for full details.

### Added
- 3-Level Hierarchy (Game → Mode → Detail)
- NumericInput negative value support
- Golf relative scoring (+3, E, -2)
- Comprehensive seed data (10 games, 96 MK8 tracks, etc.)

### Fixed
- ALPHA-004: Game mode data model restructured
- ALPHA-007: Golf scoring shows relative to par
- ALPHA-008: Comprehensive game/track/course data

---

## [0.9.0] — Alpha Release

### Added
- Initial implementation
- Idle carousel with auto-cycling leaderboards
- Browse interface (Category → Game → Mode)
- Add Score flow
- Celebration overlay with confetti
- Realtime score updates
- Sound effects (Web Audio API)
- Settings panel
- Management UI
- Admin PIN protection
- Supabase backend integration
- Raspberry Pi deployment support

---

## Version History

| Version | Date | Status |
|---------|------|--------|
| 1.0.0-beta | 2025-01-20 | Current (Beta) |
| 0.9.7 | 2025-01-20 | Theme System |
| 0.9.5 | 2025-01-18 | Schema Migration |
| 0.9.0 | 2025-01 | Alpha (Deprecated) |

---

## Test Commands

```bash
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Interactive test UI
npm run test:e2e:headed  # Watch tests run in browser
npm run test:e2e:report  # View HTML report
```