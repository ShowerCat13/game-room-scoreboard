# Testing Phase 2 - IdleDisplay

## Prerequisites

Before testing, you need:

1. **Supabase Project Setup**
2. **Environment Variables**
3. **Sample Data in Database**

## Setup Instructions

### 1. Create `.env` file

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from: Supabase Dashboard → Settings → API

### 2. Run Database Schema

In Supabase SQL Editor, run:
```sql
-- Copy entire contents of supabase/schema.sql
-- Paste and execute
```

### 3. Add Sample Data

In Supabase SQL Editor, run:
```sql
-- Copy entire contents of supabase/seed.sql
-- Paste and execute
```

This creates:
- Sample players
- Sample games (Mario Kart, Darts, etc.)
- Sample game modes
- Sample high scores

### 4. Enable Realtime

In Supabase SQL Editor, run:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE high_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_modes;
```

## Running the App

```bash
npm run dev
```

Visit: http://localhost:5173

## Expected Behavior

### If Database is Empty

You should see:
```
┌─────────────────────────────────────┐
│                                     │
│         No scores yet!              │
│    Be the first to set a record     │
│                                     │
│   Tap to browse games or add score  │
│                                     │
└─────────────────────────────────────┘
```

### If Database Has Sample Data

You should see:

1. **Auto-cycling carousel**
   - Changes every 10 seconds
   - Smooth slide transitions
   - Shows different game modes

2. **Header displays:**
   - Game icon (if available)
   - Game name (e.g., "Mario Kart 8 Deluxe")
   - Mode name + subtitle (e.g., "Rainbow Road — Time Trial")

3. **Leaderboard shows:**
   - Top 4 scores
   - Medal emojis (🥇🥈🥉) for 1st-3rd
   - Player avatars (colored fallbacks with initials)
   - Formatted scores based on type

4. **Footer shows:**
   - "Tap to browse or add score"

5. **Clicking anywhere:**
   - Navigates to `/browse` (placeholder page)

## Testing Realtime Updates

### In Browser Console:

Check for realtime connection:
```javascript
// Should see: "New score received: {...}" when scores are added
```

### Add a Score Manually:

In Supabase SQL Editor:
```sql
INSERT INTO high_scores (game_mode_id, player_id, score)
VALUES (
  (SELECT id FROM game_modes LIMIT 1),
  (SELECT id FROM players LIMIT 1),
  100000
);
```

You should see in browser console:
```
New score received: { id: "...", game_mode_id: "...", ... }
```

## Troubleshooting

### "Loading game modes..." forever

**Problem:** Can't connect to Supabase or no data

**Solutions:**
1. Check `.env` file has correct credentials
2. Check Supabase project is running
3. Check schema is created
4. Check you have at least one game mode with scores

### No scores showing for a mode

**Problem:** Database query returns empty

**Solutions:**
1. Check the mode has entries in `high_scores` table
2. Check RLS policies allow read access
3. Check browser console for errors

### TypeScript errors

**Problem:** Import issues or type mismatches

**Solutions:**
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Animations not smooth

**Problem:** Framer Motion not working correctly

**Solutions:**
1. Check Framer Motion is installed: `npm list framer-motion`
2. Check browser console for errors
3. Try disabling animations temporarily

## Manual Testing Checklist

- [ ] App loads without errors
- [ ] Shows loading state initially
- [ ] Shows empty state if no data
- [ ] Shows carousel if data exists
- [ ] Auto-cycles every 10 seconds
- [ ] Smooth slide transitions
- [ ] Header updates correctly
- [ ] Shows correct number of scores (max 4)
- [ ] Medal emojis show for top 3
- [ ] Avatar fallbacks work (colored circles)
- [ ] Scores formatted correctly (times, integers, etc.)
- [ ] Footer hint visible
- [ ] Clicking navigates to /browse
- [ ] Realtime subscription works (console logs)
- [ ] No console errors
- [ ] No TypeScript errors

## Performance Testing

### Check Render Performance:

In browser DevTools → Performance:
1. Record for 30 seconds
2. Should see smooth 60fps
3. No layout thrashing
4. Animations should be GPU-accelerated

### Check Bundle Size:

```bash
npm run build
```

Expected output:
```
dist/index.html                   ~0.5 KB
dist/assets/index-*.css          ~8-9 KB
dist/assets/index-*.js          ~470 KB (includes Framer Motion)
```

## Next: Test with Real Raspberry Pi

1. Build for production: `npm run build`
2. Copy `dist/` to Raspberry Pi
3. Serve with: `npm run preview -- --host`
4. Test touch interactions
5. Verify 800×480 display looks correct
6. Test auto-cycling in kiosk mode

---

**Ready to test!** Make sure you have Supabase credentials and sample data before starting.
