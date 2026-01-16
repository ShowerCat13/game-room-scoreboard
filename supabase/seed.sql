-- ============================================================================
-- GAME ROOM SCOREBOARD - SEED DATA
-- ============================================================================
-- Run this AFTER schema.sql to populate your games and modes
-- Customize player names and add your own scores!
-- ============================================================================

-- ============================================================================
-- SAMPLE PLAYERS (customize these!)
-- ============================================================================

INSERT INTO players (id, name, avatar_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Player 1', NULL),
  ('22222222-2222-2222-2222-222222222222', 'Player 2', NULL);

-- ============================================================================
-- GAMES
-- ============================================================================

-- Racing
INSERT INTO games (id, name, platform, category, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mario Kart 8 Deluxe', 'Switch', 'racing', 10),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'F1 24', 'PC', 'racing', 20),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', 'iRacing', 'PC', 'racing', 21),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', 'Forza Motorsport', 'PC', 'racing', 22),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'Assetto Corsa Competizione', 'PC', 'racing', 23);

-- Golf
INSERT INTO games (id, name, platform, category, sort_order) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mario Golf: Super Rush', 'Switch', 'golf', 30);

-- Party
INSERT INTO games (id, name, platform, category, sort_order) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Super Mario Party', 'Switch', 'party', 40),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'Mario Party Superstars', 'Switch', 'party', 41);

-- Darts
INSERT INTO games (id, name, platform, category, sort_order) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Darts', 'Physical', 'darts', 50);

-- Pinball
INSERT INTO games (id, name, platform, category, sort_order) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Pinball', 'Various', 'pinball', 60);

-- Platformer
INSERT INTO games (id, name, platform, category, sort_order) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Super Mario Bros.', 'NES', 'platformer', 70),
  ('ffffffff-ffff-ffff-ffff-fffffffffffe', 'Super Mario Bros. 3', 'NES', 'platformer', 71);

-- RPG
INSERT INTO games (id, name, platform, category, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Fallout 4', 'PC', 'rpg', 80),
  ('a1111111-1111-1111-1111-111111111112', 'Fallout: New Vegas', 'PC', 'rpg', 81),
  ('a1111111-1111-1111-1111-111111111113', 'Cyberpunk 2077', 'PC', 'rpg', 82);

-- ============================================================================
-- GAME MODES: Mario Kart 8 Deluxe
-- ============================================================================

INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, sort_order) VALUES
  -- Mushroom Cup
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mario Kart Stadium', 'Time Trial', 'lower_better', 'time_ms', NULL, 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Water Park', 'Time Trial', 'lower_better', 'time_ms', NULL, 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sweet Sweet Canyon', 'Time Trial', 'lower_better', 'time_ms', NULL, 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thwomp Ruins', 'Time Trial', 'lower_better', 'time_ms', NULL, 4),
  -- Add more tracks as needed...
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rainbow Road', 'Time Trial', 'lower_better', 'time_ms', NULL, 100);

-- ============================================================================
-- GAME MODES: Racing Sims (example structure)
-- ============================================================================

-- F1 24 - tracks by themselves (no class system)
INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, context, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Bahrain', 'Best Lap', 'lower_better', 'time_ms', NULL, '{"track": "Bahrain"}', 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Monaco', 'Best Lap', 'lower_better', 'time_ms', NULL, '{"track": "Monaco"}', 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Silverstone', 'Best Lap', 'lower_better', 'time_ms', NULL, '{"track": "Silverstone"}', 3);

-- Assetto Corsa Competizione - tracks BY class (GT3, GT4, etc.)
INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, context, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'Spa-Francorchamps', 'GT3', 'lower_better', 'time_ms', NULL, '{"track": "Spa", "class": "GT3"}', 10),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'Spa-Francorchamps', 'GT4', 'lower_better', 'time_ms', NULL, '{"track": "Spa", "class": "GT4"}', 11),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'Monza', 'GT3', 'lower_better', 'time_ms', NULL, '{"track": "Monza", "class": "GT3"}', 20),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'Monza', 'GT4', 'lower_better', 'time_ms', NULL, '{"track": "Monza", "class": "GT4"}', 21),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'Nürburgring', 'GT3', 'lower_better', 'time_ms', NULL, '{"track": "Nurburgring", "class": "GT3"}', 30);

-- iRacing - similar pattern, add your series/classes
INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, context, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', 'Daytona Road Course', 'GT3', 'lower_better', 'time_ms', NULL, '{"track": "Daytona Road", "class": "GT3"}', 1);

-- Forza Motorsport - tracks by class
INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, context, sort_order) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', 'Maple Valley', 'S Class', 'lower_better', 'time_ms', NULL, '{"track": "Maple Valley", "class": "S"}', 1),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', 'Maple Valley', 'A Class', 'lower_better', 'time_ms', NULL, '{"track": "Maple Valley", "class": "A"}', 2);

-- ============================================================================
-- GAME MODES: Mario Golf
-- ============================================================================

INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, sort_order) VALUES
  -- Standard Golf (strokes)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bonny Greens', 'Standard', 'lower_better', 'integer', 'strokes', 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ridgerock Lake', 'Standard', 'lower_better', 'integer', 'strokes', 2),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Balmy Dunes', 'Standard', 'lower_better', 'integer', 'strokes', 3),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Wildweather Woods', 'Standard', 'lower_better', 'integer', 'strokes', 4),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bowser Highlands', 'Standard', 'lower_better', 'integer', 'strokes', 5),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Rookie Course', 'Standard', 'lower_better', 'integer', 'strokes', 6),
  
  -- Speed Golf (time in seconds)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bonny Greens', 'Speed Golf', 'lower_better', 'time_seconds', NULL, 11),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ridgerock Lake', 'Speed Golf', 'lower_better', 'time_seconds', NULL, 12),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Balmy Dunes', 'Speed Golf', 'lower_better', 'time_seconds', NULL, 13),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Wildweather Woods', 'Speed Golf', 'lower_better', 'time_seconds', NULL, 14),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bowser Highlands', 'Speed Golf', 'lower_better', 'time_seconds', NULL, 15);

-- ============================================================================
-- GAME MODES: Mario Party Minigames
-- ============================================================================

INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, sort_order) VALUES
  -- Super Mario Party minigames (add the ones you actually play)
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bumper Ball', NULL, 'higher_better', 'integer', 'pts', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Trike Harder', NULL, 'lower_better', 'time_seconds', NULL, 2),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Slaparazzi', NULL, 'higher_better', 'integer', 'pts', 3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Feeding Friendsy', NULL, 'higher_better', 'integer', 'pts', 4),
  
  -- Mario Party Superstars minigames
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'Bumper Balls', NULL, 'higher_better', 'integer', 'wins', 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'Face Lift', NULL, 'higher_better', 'integer', 'pts', 2),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'Pushy Penguins', NULL, 'higher_better', 'time_seconds', NULL, 3);

-- ============================================================================
-- GAME MODES: Darts
-- ============================================================================

INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, sort_order) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '301', 'Fewest Darts', 'lower_better', 'integer', 'darts', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '501', 'Fewest Darts', 'lower_better', 'integer', 'darts', 2),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Cricket', 'Fewest Darts', 'lower_better', 'integer', 'darts', 3);

-- ============================================================================
-- GAME MODES: Pinball (add your specific machines)
-- ============================================================================

INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, sort_order) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'The Addams Family', 'High Score', 'higher_better', 'integer', 'pts', 1),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Medieval Madness', 'High Score', 'higher_better', 'integer', 'pts', 2),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Twilight Zone', 'High Score', 'higher_better', 'integer', 'pts', 3);

-- ============================================================================
-- GAME MODES: Super Mario Bros. (Classic)
-- ============================================================================

INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, sort_order) VALUES
  -- Progress tracking (level format)
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Furthest World', 'Progress', 'higher_better', 'level', NULL, 1),
  
  -- Speedrun times per world
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'World 1', 'Speedrun', 'lower_better', 'time_seconds', NULL, 10),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'World 2', 'Speedrun', 'lower_better', 'time_seconds', NULL, 11),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'World 3', 'Speedrun', 'lower_better', 'time_seconds', NULL, 12),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'World 4', 'Speedrun', 'lower_better', 'time_seconds', NULL, 13),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'World 5', 'Speedrun', 'lower_better', 'time_seconds', NULL, 14),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'World 6', 'Speedrun', 'lower_better', 'time_seconds', NULL, 15),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'World 7', 'Speedrun', 'lower_better', 'time_seconds', NULL, 16),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'World 8', 'Speedrun', 'lower_better', 'time_seconds', NULL, 17),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Full Game', 'Speedrun', 'lower_better', 'time_seconds', NULL, 20);

-- ============================================================================
-- GAME MODES: RPG Stats
-- ============================================================================

-- Fallout 4
INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Eliminations', 'Lifetime', 'higher_better', 'integer', 'eliminations', 1),
  ('a1111111-1111-1111-1111-111111111111', 'Quests Completed', 'Lifetime', 'higher_better', 'integer', 'quests', 2),
  ('a1111111-1111-1111-1111-111111111111', 'Completion', 'Percentage', 'higher_better', 'decimal_2', '%', 3);

-- Fallout: New Vegas
INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111112', 'Eliminations', 'Lifetime', 'higher_better', 'integer', 'eliminations', 1),
  ('a1111111-1111-1111-1111-111111111112', 'Quests Completed', 'Lifetime', 'higher_better', 'integer', 'quests', 2),
  ('a1111111-1111-1111-1111-111111111112', 'Completion', 'Percentage', 'higher_better', 'decimal_2', '%', 3);

-- Cyberpunk 2077
INSERT INTO game_modes (game_id, name, subtitle, score_direction, score_format, score_unit, sort_order) VALUES
  ('a1111111-1111-1111-1111-111111111113', 'Eliminations', 'Lifetime', 'higher_better', 'integer', 'eliminations', 1),
  ('a1111111-1111-1111-1111-111111111113', 'Quests Completed', 'Lifetime', 'higher_better', 'integer', 'quests', 2),
  ('a1111111-1111-1111-1111-111111111113', 'Completion', 'Percentage', 'higher_better', 'decimal_2', '%', 3);

-- ============================================================================
-- SAMPLE HIGH SCORES (optional - just to test the display)
-- ============================================================================

-- Get some mode IDs first (you'll need to look these up after running the inserts)
-- These are examples - replace with actual UUIDs from your game_modes table

-- Example: Mario Kart Rainbow Road time of 2:22.567 (stored as 142567 ms)
-- INSERT INTO high_scores (game_mode_id, player_id, score, achieved_at) VALUES
--   ('your-rainbow-road-mode-id', '11111111-1111-1111-1111-111111111111', 142567, '2024-01-15');

-- Example: Darts 501 in 15 darts
-- INSERT INTO high_scores (game_mode_id, player_id, score, metadata, achieved_at) VALUES
--   ('your-501-mode-id', '11111111-1111-1111-1111-111111111111', 15, '{"checkout": "D16"}', '2024-01-10');

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
-- 
-- Next steps:
-- 1. Customize player names in the players table
-- 2. Add/remove game modes for your specific tracks, minigames, etc.
-- 3. Upload avatars and game icons to Supabase Storage
-- 4. Start recording scores!
-- ============================================================================
