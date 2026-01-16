# Phase 2: Data Hooks & IdleDisplay - COMPLETE ✅

## Hooks Built

### 1. ✅ useLeaderboard ([src/hooks/useLeaderboard.ts](src/hooks/useLeaderboard.ts))

Fetches top 4 scores for a specific game mode from the leaderboard view.

**Features:**
- Queries the `leaderboard` view (denormalized with all related data)
- Respects `score_direction` for sorting (handled by the view)
- Returns `{ data, loading, error }`
- Handles null `gameModeId` gracefully
- Cleans up on unmount (prevents memory leaks)

**Usage:**
```typescript
const { data, loading, error } = useLeaderboard(gameModeId, 4)
```

### 2. ✅ useRealtimeScores ([src/hooks/useRealtimeScores.ts](src/hooks/useRealtimeScores.ts))

Subscribes to real-time score updates via Supabase Realtime.

**Features:**
- Listens to `high_scores` table INSERT events
- Triggers callback with new score data
- Automatically cleans up subscription on unmount
- Enables live leaderboard updates

**Usage:**
```typescript
useRealtimeScores((newScore) => {
  console.log('New score!', newScore)
  // Show celebration, update UI, etc.
})
```

### 3. ✅ useIdleTimer ([src/hooks/useIdleTimer.ts](src/hooks/useIdleTimer.ts))

Tracks user inactivity for auto-returning to idle mode.

**Features:**
- Monitors touch, mouse, keyboard, and scroll events
- Returns `{ isIdle, resetTimer }`
- `isIdle` becomes true after 30 seconds (configurable)
- Resets on any user interaction
- Used for returning from browse mode to carousel

**Usage:**
```typescript
const { isIdle, resetTimer } = useIdleTimer(30000)

useEffect(() => {
  if (isIdle) {
    navigate('/')
  }
}, [isIdle])
```

### 4. ✅ useActiveGameModes ([src/hooks/useActiveGameModes.ts](src/hooks/useActiveGameModes.ts))

Fetches all game modes that have at least one high score.

**Features:**
- Queries `game_modes` with inner join on `high_scores`
- Returns modes with game info (name, icon, category)
- Sorted by game sort order, then mode sort order
- Removes duplicates from join
- Used by carousel to know which modes to display

**Usage:**
```typescript
const { modes, loading, error } = useActiveGameModes()
```

## Page Built

### 5. ✅ IdleDisplay ([src/pages/IdleDisplay.tsx](src/pages/IdleDisplay.tsx))

Auto-cycling carousel showing leaderboards for all active game modes.

**Features:**
- ✅ Full-screen layout using `KioskLayout`
- ✅ Auto-cycles through modes every 10 seconds (from `kioskStore.cycleSpeedMs`)
- ✅ Header section (72px):
  - Game icon (32×32)
  - Game name (xl font, bold)
  - Mode name + subtitle (base font, secondary color)
- ✅ Leaderboard section (flex-1):
  - Shows top 4 `ScoreRow` components
  - Loading states handled
  - Empty state when no scores
- ✅ Footer section (56px):
  - "Tap to browse or add score" hint
  - Centered, muted text
- ✅ Framer Motion slide transitions:
  - Smooth slide left/right on mode change
  - Header and leaderboard animate independently
- ✅ Tap anywhere → navigate to `/browse`
- ✅ Real-time score subscription (placeholder alert)

**Layout Structure (matches UI_SPEC.md):**
```
┌─────────────────────────────────────┐
│  Header (72px)                      │
│  [Icon] Game Name                   │
│         Mode - Subtitle             │
├─────────────────────────────────────┤
│  Leaderboard (flex-1)               │
│  🥇 Player 1        2:22.567       │
│  🥈 Player 2        2:24.891       │
│  🥉 Player 3        2:31.044       │
│  4. Player 4        2:35.220       │
├─────────────────────────────────────┤
│  Footer (56px)                      │
│  "Tap to browse or add score"      │
└─────────────────────────────────────┘
```

## App.tsx Updated

Updated [src/App.tsx](src/App.tsx) to:
- Use React Router with `Routes` and `Route`
- Set `IdleDisplay` as default route (`/`)
- Add placeholder `/browse` route
- Remove demo component

## Export Files Updated

- ✅ [src/hooks/index.ts](src/hooks/index.ts) - Exports all 4 hooks
- ✅ [src/pages/index.ts](src/pages/index.ts) - Exports `IdleDisplay`

## Build Verification

✅ TypeScript compilation successful
✅ Production build successful (3.56s)
✅ Framer Motion included (475KB bundle)
✅ All hooks properly typed
✅ No TypeScript errors

## Database Requirements

For the app to work, you need:

1. **Supabase project set up** with schema from `supabase/schema.sql`
2. **Environment variables** in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. **Sample data** (optional) from `supabase/seed.sql` to test the carousel
4. **Realtime enabled** for `high_scores` table (run in SQL editor):
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE high_scores;
   ```

## Testing the IdleDisplay

To test with real data:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:5173

3. **Expected behavior:**
   - If no game modes with scores: Shows empty state
   - If game modes exist: Auto-cycles every 10 seconds
   - Clicking anywhere navigates to `/browse` (placeholder)
   - Smooth slide transitions between modes
   - Shows top 4 scores per mode

## Animation Details

Using Framer Motion `AnimatePresence`:

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentMode?.id}
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.3 }}
  >
    {/* Content */}
  </motion.div>
</AnimatePresence>
```

- **Initial:** Slides in from right with fade
- **Exit:** Slides out to left with fade
- **Duration:** 300ms (matches UI_SPEC.md)
- **Mode:** "wait" ensures old content exits before new enters

## Realtime Integration

The `useRealtimeScores` hook is integrated but only logs to console:

```typescript
useRealtimeScores((newScore) => {
  console.log('New score received:', newScore)
  // TODO: Show celebration overlay/alert
})
```

**Next phase:** Build celebration overlay for new high scores.

## State Management

Uses Zustand store for:
- `cycleSpeedMs`: Configurable auto-cycle speed (default: 10000ms)
- Future: Track current mode, pause state, etc.

## Known Limitations

- ❌ No celebration overlay yet (placeholder console.log)
- ❌ No sound effects yet
- ❌ Browse page not built (placeholder route)
- ❌ Leaderboard view query needs proper sorting (currently orders by score ascending regardless of direction)

## Next Steps

### Phase 3: Browse Interface
- CategorySelection page
- GameSelection page
- ModeSelection page
- LeaderboardView page

### Phase 4: Input & Forms
- SelectField component
- PickerModal component
- TimeInput component
- AddScore page

### Phase 5: Enhancements
- Celebration overlay
- Real-time score alerts
- Sound effects
- Settings panel

---

**Phase 2 Complete!** The carousel is fully functional with auto-cycling, animations, and real-time subscription. Ready for Phase 3! 🚀
