-- ============================================================================
-- HALLOWEEN 2026 - PARTY LOCKDOWN (OPTIONAL, REVIEW BEFORE RUNNING)
-- ============================================================================
--
-- The default schema lets anyone holding the anon key update or delete
-- anything. The anon key ships in the web app, so any guest who scans the
-- QR code could wipe scores. Deleting a game also cascades to all of its
-- scores.
--
-- This script removes anon UPDATE and DELETE on every table. Guests can
-- still view the leaderboard, create players and submit times.
--
-- Trade-off: while this is applied, the in-app Manage screen can't edit or
-- delete anything, and avatar uploads can't be saved to a player. Do
-- cleanup (such as removing a joke entry) in the Supabase dashboard
-- Table Editor, which is not affected by these policies.
--
-- To undo after the party, run the RESTORE section at the bottom.
--
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can update scores"  ON high_scores;
DROP POLICY IF EXISTS "Anyone can delete scores"  ON high_scores;
DROP POLICY IF EXISTS "Anyone can update players" ON players;
DROP POLICY IF EXISTS "Anyone can delete players" ON players;
DROP POLICY IF EXISTS "Anyone can update games"   ON games;
DROP POLICY IF EXISTS "Anyone can delete games"   ON games;
DROP POLICY IF EXISTS "Anyone can update modes"   ON game_modes;
DROP POLICY IF EXISTS "Anyone can delete modes"   ON game_modes;
DROP POLICY IF EXISTS "Anyone can update details" ON game_details;
DROP POLICY IF EXISTS "Anyone can delete details" ON game_details;


-- ============================================================================
-- RESTORE (run after the party to return to the original open policies)
-- ============================================================================
--
-- CREATE POLICY "Anyone can update scores"  ON high_scores  FOR UPDATE USING (true);
-- CREATE POLICY "Anyone can delete scores"  ON high_scores  FOR DELETE USING (true);
-- CREATE POLICY "Anyone can update players" ON players      FOR UPDATE USING (true);
-- CREATE POLICY "Anyone can delete players" ON players      FOR DELETE USING (true);
-- CREATE POLICY "Anyone can update games"   ON games        FOR UPDATE USING (true);
-- CREATE POLICY "Anyone can delete games"   ON games        FOR DELETE USING (true);
-- CREATE POLICY "Anyone can update modes"   ON game_modes   FOR UPDATE USING (true);
-- CREATE POLICY "Anyone can delete modes"   ON game_modes   FOR DELETE USING (true);
-- CREATE POLICY "Anyone can update details" ON game_details FOR UPDATE USING (true);
-- CREATE POLICY "Anyone can delete details" ON game_details FOR DELETE USING (true);
