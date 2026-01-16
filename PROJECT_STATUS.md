# Current Progress — Game Room Scoreboard

**Last Updated:** Phase 4 Complete ✅ — Ready for Phase 5

---

## Completed Work

### Phase 1: Core Display Components ✅
- `KioskLayout.tsx` — 800×480 fixed container
- `RankBadge.tsx` — Medal emoji (🥇🥈🥉) or rank number
- `PlayerAvatar.tsx` — 48×48 circular avatar with initial fallback
- `ScoreValue.tsx` — Formatted score display (times, integers, etc.)
- `ScoreRow.tsx` — 72px leaderboard row composing above components

### Phase 2: Idle Carousel ✅
- `IdleDisplay.tsx` — Auto-cycling carousel with Framer Motion transitions
- `useLeaderboard.ts` — Fetches top scores using `get_leaderboard` RPC
- `useActiveGameModes.ts` — Fetches modes with scores
- `useRealtimeScores.ts` — Subscribes to new score INSERT events
- `useIdleTimer.ts` — 30-second inactivity tracker

### Phase 3: Browse Interface ✅
- `CategorySelection.tsx` — 4×2 grid of all 8 categories
- `GameSelection.tsx` — Game list for category
- `ModeSelection.tsx` — Mode list for game
- `LeaderboardView.tsx` — Full leaderboard with card-styled rows
- Supporting hooks: `useGames`, `useGameModes`, `useGame`, `useGameMode`
- Components: `CategoryButton`, `GameCard`, `ModeCard`, `BrowseHeader`

### Phase 4: Add Score Flow ✅
- `AddScore.tsx` — Multi-step score entry form with dynamic input rendering
- `usePlayers.ts` — Fetch players + create new player (with isMounted cleanup)
- `useSubmitScore.ts` — Submit score to Supabase (with isMounted cleanup)
- Input components: `SelectField`, `PickerModal`, `TimeInput`, `NumericInput`, `NewPlayerModal`
- `CelebrationOverlay.tsx` — Post-submission celebration with rank display

**Phase 4 Audit:** PASSED ✅ (6 issues found and resolved)

---

## Current UI State — NEEDS IMPROVEMENT

The current UI is **functional but unfinished**. Screenshots show:
- Flat, lifeless appearance
- Placeholder initials instead of real game icons
- Lacks refinement, depth, and personality
- Feels like a first coding project, not a polished product

**This is NOT intentionally minimal — it's incomplete.**

Phase 5 must address this with genuine UI polish, not just feature additions.

---

## Supabase Status ✅

- Schema created and seeded
- `.env` configured with project URL and anon key
- RLS enabled with open policies (home network use)
- Realtime enabled for `high_scores` table
- Storage buckets ready:
  - `avatars` — Player avatar images
  - `game-icons` — Game artwork (currently empty, user will upload)

---

## File Inventory

```
src/
├── hooks/
│   ├── index.ts
│   ├── useActiveGameModes.ts
│   ├── useGame.ts
│   ├── useGameMode.ts
│   ├── useGameModes.ts
│   ├── useGames.ts
│   ├── useIdleTimer.ts
│   ├── useLeaderboard.ts
│   ├── usePlayers.ts
│   ├── useRealtimeScores.ts
│   └── useSubmitScore.ts
├── components/
│   ├── cards/
│   │   ├── CategoryButton.tsx
│   │   ├── GameCard.tsx
│   │   ├── ModeCard.tsx
│   │   └── index.ts
│   ├── display/
│   │   ├── PlayerAvatar.tsx
│   │   ├── RankBadge.tsx
│   │   ├── ScoreRow.tsx
│   │   ├── ScoreValue.tsx
│   │   └── index.ts
│   ├── input/
│   │   ├── NewPlayerModal.tsx
│   │   ├── NumericInput.tsx
│   │   ├── PickerModal.tsx
│   │   ├── SelectField.tsx
│   │   ├── TimeInput.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── BrowseHeader.tsx
│   │   ├── KioskLayout.tsx
│   │   └── index.ts
│   └── overlays/
│       ├── CelebrationOverlay.tsx
│       └── index.ts
├── pages/
│   ├── AddScore.tsx
│   ├── CategorySelection.tsx
│   ├── GameSelection.tsx
│   ├── IdleDisplay.tsx
│   ├── LeaderboardView.tsx
│   ├── ModeSelection.tsx
│   └── index.ts
├── lib/
│   ├── supabase.ts
│   ├── types.ts
│   └── utils.ts
├── stores/
│   └── kioskStore.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## Next Steps

### Phase 5: Polish & Management Features

Phase 5 is substantial. It includes UI refinement AND new functionality.

#### Part 1: UI Refinement

**Goal:** Make the UI feel finished and polished, not redesigned.

**Problems to fix:**
- Flat, lifeless cards need subtle depth (shadows, borders, gradients)
- Category buttons need visual weight and better touch feedback
- Game list items feel cheap — need refinement
- Score rows need better visual hierarchy
- Celebration overlay needs more impact (confetti particles, better animation)
- Forms feel utilitarian — need warmth

**Approach:**
- Add subtle shadows and border treatments
- Improve active states with better visual feedback
- Add micro-animations (scale on press, smooth transitions)
- Consider subtle gradients or glow effects for emphasis
- The 800×480 resolution works fine with high-contrast, clean design
- "Intentionally retro" (1985 arcade aesthetic) is acceptable; "lazy late-90s" is not

**Game Icons:**
- Currently showing placeholder initials (F4, FN, C2)
- Should display real game artwork
- Images go in Supabase Storage bucket: `game-icons`
- User will upload images manually
- Components must support displaying uploaded icons with fallback to initials

#### Part 2: Management Features (Accessible from Idle Screen)

**Player Management:**
- Add new players (name, optional avatar upload)
- Edit existing players (change name, update avatar)
- Delete players (with confirmation dialog)

**Game Management:**
- Add new games (name, platform, category, icon upload)
- Edit existing games
- Delete games (with confirmation — cascades to modes and scores)

**Game Mode Management:**
- Add modes to a game (name, subtitle, score_format, score_direction, score_unit)
- Edit existing modes
- Delete modes (with confirmation — cascades to scores)

**Score Management:**
- Edit scores (change the value)
- Delete scores (with confirmation dialog)

**UI Pattern:**
- Management accessible from idle screen (gear icon or "Manage" button)
- Could be a dedicated `/manage` route or modal-based
- Should be simple and guided — friends and family will use this
- All destructive actions require confirmation: "Are you sure you want to delete [X]?"

#### Part 3: Admin PIN Protection

- Simple 4-digit PIN to access destructive actions (delete game/player/score)
- PIN stored in localStorage or kioskStore
- Initial PIN set on first use, changeable in Settings
- Non-destructive actions (add, edit) don't require PIN
- Prevents accidental deletion by casual users

#### Part 4: Sound Effects

**Install:**
```bash
npm install howler
npm install -D @types/howler
```

**Create:** `src/lib/sounds.ts`
```typescript
import { Howl } from 'howler'

export const sounds = {
  fanfare: new Howl({ src: ['/sounds/fanfare.mp3'], volume: 0.7, preload: true }),
  chime: new Howl({ src: ['/sounds/chime.mp3'], volume: 0.5, preload: true }),
  click: new Howl({ src: ['/sounds/click.mp3'], volume: 0.3, preload: true }),
}
```

**Sound files needed in `public/sounds/`:**
- `fanfare.mp3` — Victory jingle (2-3 seconds) for 1st place
- `chime.mp3` — Subtle success (0.5 seconds) for other placements
- `click.mp3` — Soft tap feedback (0.1 seconds) optional

**Integration:**
- CelebrationOverlay: fanfare for rank 1, chime for others
- Realtime score alerts: fanfare/chime based on rank
- Optional: click on button taps

#### Part 5: Realtime Score Alert

**Create:** `src/components/overlays/RealtimeScoreAlert.tsx`

When scores arrive via realtime while on idle carousel:
- Toast slides in from top
- Shows: "⚡ NEW RECORD!" + player name + game/mode + score + rank
- Auto-dismisses after 5 seconds
- Plays appropriate sound
- Does not navigate away from carousel

#### Part 6: Settings Panel

**Create:** `src/pages/Settings.tsx`

**Route:** `/settings`

**Options:**
- Cycle speed: [5s, 10s, 15s, 30s] — default 10s
- Sound effects: Toggle on/off
- Celebration duration: [3s, 5s, 7s] — default 5s (increased from 3s)
- Idle dim timeout: [Never, 5min, 15min, 30min]
- Change admin PIN
- Link to Player Management
- Link to Game Management

**Update:** `src/stores/kioskStore.ts` with settings state (persist to localStorage)

#### Part 7: Screen Burn-in Prevention

**Create:** `src/hooks/useScreenSaver.ts`

- Position jitter: ±5px random offset on each carousel cycle
- Idle dimming: Dim to 50% brightness after configurable timeout
- Deep idle: Further dim to 10% after 30min
- Wake on any touch event

---

### Phase 6: End-to-End Testing

Add automated testing with Playwright or Vitest.

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Test Coverage:**
- Score submission flow (happy path)
- Player creation flow
- Form validation (required fields, format constraints)
- Navigation (browse hierarchy, back buttons)
- Realtime updates (mock Supabase subscription)
- Idle timer behavior
- Management flows (add/edit/delete with PIN)

---

## Key Constraints (Maintain Throughout)

| Constraint | Requirement |
|------------|-------------|
| Display | 800×480 pixels exactly |
| Touch targets | 56px minimum height/width |
| Font sizes | 18px base minimum |
| Hover states | None — use `active:` only |
| Colors | Design tokens only (no hardcoded Tailwind) |
| TypeScript | No `any` types (except documented Supabase workaround) |
| Cleanup | isMounted pattern in async hooks |
| Exports | All components exported from index.ts |

---

## Zero Tech Debt Policy

We maintain strict zero tech debt between phases:
- Every issue found in audit must be fixed before approval
- No "we'll fix it later" — fix it now
- No hardcoded values that should be tokens
- No missing error/loading states
- No incomplete implementations

---

## Known Limitations

1. **Supabase TypeScript inference:** Insert operations require `(supabase as any)` cast due to manual Database types. Documented in hooks with explanatory comments.

2. **Display size:** App designed for 800×480. On larger screens during development, layout appears off-center — this is expected.

---

## Environment Setup

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build
npx tsc --noEmit     # Type check
```

## Key Documentation Files

| File | Purpose |
|------|---------|
| `PROJECT_STATUS.md` | This file — current state and roadmap |
| `UI_SPEC.md` | Component specs (dimensions, colors, spacing) |
| `ARCHITECTURE.md` | System overview, database schema, user flows |
| `schema.sql` | Database schema reference |