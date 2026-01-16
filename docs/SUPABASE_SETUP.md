# Supabase Setup Guide

Follow these steps to set up your Supabase backend before building the app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name:** `game-room-scoreboard` (or whatever you like)
   - **Database Password:** Generate a strong one and save it
   - **Region:** Choose closest to you
4. Click "Create new project" and wait for provisioning (~2 minutes)

## 2. Run the Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql` and paste it
4. Click "Run" (or Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned" - that's correct!

## 3. Run the Seed Data

1. Still in SQL Editor, click "New query"
2. Copy the entire contents of `supabase/seed.sql` and paste it
3. Click "Run"
4. Verify by going to **Table Editor** → You should see your games and modes

## 4. Set Up Storage Buckets

1. Go to **Storage** (left sidebar)
2. Click "New bucket"
3. Create bucket: `avatars`
   - Toggle "Public bucket" ON
   - Click "Create bucket"
4. Create bucket: `game-icons`
   - Toggle "Public bucket" ON
   - Click "Create bucket"

### Storage Policies

For each bucket, you need to add policies:

1. Click on the `avatars` bucket
2. Click "Policies" tab
3. Click "New Policy" → "For full customization"
4. Add these policies:

**SELECT (view) policy:**
- Policy name: `Anyone can view avatars`
- Allowed operation: SELECT
- Target roles: (leave empty for all)
- USING expression: `true`

**INSERT (upload) policy:**
- Policy name: `Anyone can upload avatars`
- Allowed operation: INSERT
- Target roles: (leave empty for all)
- WITH CHECK expression: `true`

**UPDATE policy:**
- Policy name: `Anyone can update avatars`
- Allowed operation: UPDATE
- Target roles: (leave empty for all)
- USING expression: `true`

**DELETE policy:**
- Policy name: `Anyone can delete avatars`
- Allowed operation: DELETE
- Target roles: (leave empty for all)
- USING expression: `true`

Repeat for `game-icons` bucket.

## 5. Enable Realtime

1. Go to **Database** → **Replication** (or **Publications**)
2. Find `supabase_realtime` publication
3. Enable these tables:
   - `high_scores` ✓
   - `players` ✓
   - `games` ✓
   - `game_modes` ✓

Alternatively, this was already done in schema.sql via:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE high_scores;
-- etc.
```

## 6. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for the app):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGci...` (the long one under "Project API keys")

## 7. Test the Setup

In SQL Editor, run:

```sql
-- Check games were created
SELECT name, platform, category FROM games ORDER BY sort_order;

-- Check game modes
SELECT g.name as game, gm.name as mode, gm.subtitle, gm.score_format 
FROM game_modes gm 
JOIN games g ON gm.game_id = g.id 
LIMIT 20;

-- Test the leaderboard function (once you have scores)
-- SELECT * FROM get_leaderboard('your-mode-uuid-here', 10);
```

## 8. Add a Test Score

```sql
-- First, get a player ID and game mode ID
SELECT id, name FROM players LIMIT 1;
SELECT id, name, subtitle FROM game_modes WHERE name = 'Rainbow Road' LIMIT 1;

-- Insert a test score (replace UUIDs with real ones from above)
INSERT INTO high_scores (game_mode_id, player_id, score)
VALUES (
  'your-game-mode-id',
  'your-player-id',
  142567  -- 2:22.567 for a time_ms format
);

-- Verify it worked
SELECT * FROM leaderboard WHERE mode_name = 'Rainbow Road';
```

## Environment Variables for the App

Create a `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Next Steps

Your backend is ready! Now you can:

1. Add your real player names and upload avatars
2. Upload game icons to the `game-icons` bucket
3. Start building the React frontend

---

## Troubleshooting

### "permission denied" errors
- Check that RLS policies are correctly set up
- Verify you're using the anon key, not the service role key

### Realtime not working
- Check that tables are added to the `supabase_realtime` publication
- Verify your Supabase plan supports realtime (free tier does)

### Storage upload fails
- Check bucket is set to public
- Verify storage policies are in place

### Types not matching
- Regenerate types after schema changes:
  ```bash
  npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types.ts
  ```
