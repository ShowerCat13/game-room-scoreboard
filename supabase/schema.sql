-- ============================================================================
-- GAME ROOM SCOREBOARD - DATABASE SCHEMA
-- Version: 0.9.9
-- ============================================================================
-- 
-- This schema implements a flexible 3-level hierarchy for game scoring:
--   GAME -> MODE (optional) -> DETAIL (optional) -> SCORE
--
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard -> SQL Editor
-- 
-- IMPORTANT: This is a FRESH START schema. If upgrading from alpha,
-- drop all existing tables first (alpha data will be lost).
--
-- ============================================================================


-- ============================================================================
-- CLEAN UP (Only for fresh installs or alpha -> beta migration)
-- ============================================================================

-- Uncomment these lines to drop existing alpha tables:
-- DROP TABLE IF EXISTS high_scores CASCADE;
-- DROP TABLE IF EXISTS team_members CASCADE;
-- DROP TABLE IF EXISTS teams CASCADE;
-- DROP TABLE IF EXISTS game_details CASCADE;
-- DROP TABLE IF EXISTS game_modes CASCADE;
-- DROP TABLE IF EXISTS games CASCADE;
-- DROP TABLE IF EXISTS players CASCADE;
-- DROP TYPE IF EXISTS score_direction CASCADE;
-- DROP TYPE IF EXISTS score_format CASCADE;
-- DROP TYPE IF EXISTS game_category CASCADE;


-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- How to interpret and sort scores on leaderboards
CREATE TYPE score_direction AS ENUM (
  'lower_better',   -- Golf strokes, race times, darts throws
  'higher_better'   -- Points, eliminations, completion %
);

-- How to display score values in the UI
CREATE TYPE score_format AS ENUM (
  'integer',        -- 47 (points, throws, kills) -> "47 pts"
  'time_ms',        -- Milliseconds -> "2:22.567"
  'time_seconds',   -- Seconds -> "4:56"  
  'decimal_2',      -- Value x 100 -> "12.20 in" or "98.45%"
  'golf_relative',  -- Relative to par -> "-4", "E", "+3"
  'level'           -- Encoded digits -> "World 8-4"
);

-- Category for browse filtering
CREATE TYPE game_category AS ENUM (
  'racing',
  'golf',
  'party',
  'darts',
  'pinball',
  'platformer',
  'rpg',
  'other'
);


-- ============================================================================
-- PLAYERS
-- ============================================================================

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,                        -- Supabase Storage URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE players IS 'Player profiles for the game room';


-- ============================================================================
-- GAMES (Top-level container)
-- ============================================================================

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- "Mario Kart 8 Deluxe", "Pinball"
  category game_category NOT NULL,
  platform TEXT,                          -- "Switch", "PC", "Physical"
  icon_url TEXT,                          -- Supabase Storage URL
  
  -- Hierarchy configuration
  -- These labels appear in the UI dropdowns
  mode_label TEXT DEFAULT 'Mode',         -- "Mode", "Class", "Machine", "Category"
  detail_label TEXT DEFAULT 'Track',      -- "Track", "Course", "Fish", "Enemy"
  has_modes BOOLEAN DEFAULT true,         -- Does this game use Level 1?
  has_details BOOLEAN DEFAULT true,       -- Does this game use Level 2?
  
  -- Default score settings (fallback when mode/detail don't specify)
  default_score_format score_format DEFAULT 'integer',
  default_score_direction score_direction DEFAULT 'higher_better',
  default_score_unit TEXT,                -- "pts", "darts", "in", "%", NULL for times
  
  sort_order INTEGER DEFAULT 0,           -- Manual ordering in UI
  is_active BOOLEAN DEFAULT true,         -- Soft delete
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE games IS 'Top-level game containers with hierarchy configuration';
COMMENT ON COLUMN games.mode_label IS 'UI label for the modes dropdown (e.g., "Class", "Machine")';
COMMENT ON COLUMN games.detail_label IS 'UI label for the details dropdown (e.g., "Track", "Fish")';
COMMENT ON COLUMN games.has_modes IS 'If false, skip mode selection in Add Score flow';
COMMENT ON COLUMN games.has_details IS 'If false, skip detail selection in Add Score flow';


-- ============================================================================
-- GAME MODES (Level 1)
-- ============================================================================

CREATE TABLE game_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                     -- "150cc Time Trial", "Fishing", "Attack From Mars"
  
  -- Override game defaults (NULL = use game default)
  score_format score_format,
  score_direction score_direction,
  score_unit TEXT,
  
  -- Override detail label for this specific mode
  -- Example: Stardew "Fishing" mode uses "Fish" instead of game's "Target"
  detail_label_override TEXT,
  
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE game_modes IS 'Level 1 of hierarchy: game variants/modes';
COMMENT ON COLUMN game_modes.detail_label_override IS 'Override game.detail_label for this mode only';


-- ============================================================================
-- GAME DETAILS (Level 2)
-- ============================================================================

CREATE TABLE game_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mode_id UUID REFERENCES game_modes(id) ON DELETE CASCADE,
  -- NULL mode_id = available for ALL modes in this game (shared)
  -- Non-NULL mode_id = only available for that specific mode
  
  name TEXT NOT NULL,                     -- "Rainbow Road", "Tiger Trout", "Radstag"
  
  -- Override mode/game defaults (rare, usually NULL)
  score_format score_format,
  score_direction score_direction,
  score_unit TEXT,
  
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE game_details IS 'Level 2 of hierarchy: tracks, courses, targets, etc.';
COMMENT ON COLUMN game_details.mode_id IS 'NULL = available for all modes; UUID = mode-specific';


-- ============================================================================
-- HIGH SCORES
-- ============================================================================

CREATE TABLE high_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mode_id UUID REFERENCES game_modes(id) ON DELETE SET NULL,
  detail_id UUID REFERENCES game_details(id) ON DELETE SET NULL,
  
  -- The actual score value
  -- Interpretation depends on effective score_format:
  --   integer: raw value (47)
  --   time_ms: milliseconds (142567 = 2:22.567)
  --   time_seconds: seconds (296 = 4:56)
  --   decimal_2: value x 100 (1220 = 12.20)
  --   golf_relative: strokes relative to par (-4, 0, +3)
  --   level: encoded digits (804 = World 8-4)
  score BIGINT NOT NULL,
  
  metadata JSONB DEFAULT '{}',            -- Optional extra data
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure valid hierarchy combinations
  CONSTRAINT valid_score_hierarchy CHECK (
    -- No mode, no detail (game-only scores)
    (mode_id IS NULL AND detail_id IS NULL) OR
    -- Mode but no detail
    (mode_id IS NOT NULL AND detail_id IS NULL) OR
    -- Mode and detail (full hierarchy)
    (mode_id IS NOT NULL AND detail_id IS NOT NULL)
    -- Note: detail without mode is NOT allowed
  )
);

COMMENT ON TABLE high_scores IS 'Score records linked to game hierarchy';
COMMENT ON COLUMN high_scores.score IS 'Raw value; interpret using effective score_format';


-- ============================================================================
-- INDEXES
-- ============================================================================

-- Games
CREATE INDEX idx_games_category ON games(category) WHERE is_active = true;
CREATE INDEX idx_games_active ON games(is_active, sort_order);

-- Modes
CREATE INDEX idx_game_modes_game ON game_modes(game_id) WHERE is_active = true;
CREATE INDEX idx_game_modes_active ON game_modes(game_id, is_active, sort_order);

-- Details
CREATE INDEX idx_game_details_game ON game_details(game_id) WHERE is_active = true;
CREATE INDEX idx_game_details_mode ON game_details(mode_id) WHERE is_active = true;
CREATE INDEX idx_game_details_shared ON game_details(game_id) 
  WHERE mode_id IS NULL AND is_active = true;

-- Scores (critical for leaderboard performance)
CREATE INDEX idx_high_scores_game ON high_scores(game_id);
CREATE INDEX idx_high_scores_mode ON high_scores(game_id, mode_id);
CREATE INDEX idx_high_scores_detail ON high_scores(game_id, mode_id, detail_id);
CREATE INDEX idx_high_scores_player ON high_scores(player_id);
CREATE INDEX idx_high_scores_leaderboard ON high_scores(game_id, mode_id, detail_id, score);
CREATE INDEX idx_high_scores_achieved ON high_scores(achieved_at DESC);


-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER game_modes_updated_at
  BEFORE UPDATE ON game_modes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER game_details_updated_at
  BEFORE UPDATE ON game_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================================
-- GET EFFECTIVE SCORE SETTINGS
-- Returns the score format/direction/unit for a game/mode/detail combination
-- Uses inheritance: detail -> mode -> game defaults
-- ============================================================================

CREATE OR REPLACE FUNCTION get_score_settings(
  p_game_id UUID,
  p_mode_id UUID DEFAULT NULL,
  p_detail_id UUID DEFAULT NULL
)
RETURNS TABLE (
  score_format score_format,
  score_direction score_direction,
  score_unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(d.score_format, m.score_format, g.default_score_format) AS score_format,
    COALESCE(d.score_direction, m.score_direction, g.default_score_direction) AS score_direction,
    COALESCE(d.score_unit, m.score_unit, g.default_score_unit) AS score_unit
  FROM games g
  LEFT JOIN game_modes m ON m.id = p_mode_id
  LEFT JOIN game_details d ON d.id = p_detail_id
  WHERE g.id = p_game_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_score_settings IS 'Get effective score settings with inheritance';


-- ============================================================================
-- GET LEADERBOARD
-- Returns ranked scores for any hierarchy level
-- ============================================================================

CREATE OR REPLACE FUNCTION get_leaderboard(
  p_game_id UUID,
  p_mode_id UUID DEFAULT NULL,
  p_detail_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  rank BIGINT,
  score_id UUID,
  score BIGINT,
  achieved_at TIMESTAMPTZ,
  player_id UUID,
  player_name TEXT,
  player_avatar TEXT,
  effective_format score_format,
  effective_direction score_direction,
  effective_unit TEXT
) AS $$
DECLARE
  v_direction score_direction;
  v_format score_format;
  v_unit TEXT;
BEGIN
  -- Get effective score settings
  SELECT ss.score_format, ss.score_direction, ss.score_unit
  INTO v_format, v_direction, v_unit
  FROM get_score_settings(p_game_id, p_mode_id, p_detail_id) ss;
  
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE WHEN v_direction = 'lower_better' THEN hs.score ELSE -hs.score END,
        hs.achieved_at ASC
    ) AS rank,
    hs.id AS score_id,
    hs.score,
    hs.achieved_at,
    p.id AS player_id,
    p.name AS player_name,
    p.avatar_url AS player_avatar,
    v_format AS effective_format,
    v_direction AS effective_direction,
    v_unit AS effective_unit
  FROM high_scores hs
  JOIN players p ON p.id = hs.player_id
  WHERE hs.game_id = p_game_id
    AND (p_mode_id IS NULL OR hs.mode_id = p_mode_id)
    AND (p_detail_id IS NULL OR hs.detail_id = p_detail_id)
  ORDER BY 
    CASE WHEN v_direction = 'lower_better' THEN hs.score ELSE -hs.score END,
    hs.achieved_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_leaderboard IS 'Get ranked leaderboard with effective score settings';


-- ============================================================================
-- GET DETAIL LABEL
-- Returns the appropriate detail label for a game/mode
-- ============================================================================

CREATE OR REPLACE FUNCTION get_detail_label(
  p_game_id UUID,
  p_mode_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(m.detail_label_override, g.detail_label)
    FROM games g
    LEFT JOIN game_modes m ON m.id = p_mode_id
    WHERE g.id = p_game_id
  );
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

-- Open policies for home network use (anon access)
-- For production, replace with authenticated policies

-- Players
CREATE POLICY "Anyone can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can create players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete players" ON players FOR DELETE USING (true);

-- Games
CREATE POLICY "Anyone can view games" ON games FOR SELECT USING (true);
CREATE POLICY "Anyone can create games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update games" ON games FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete games" ON games FOR DELETE USING (true);

-- Game Modes
CREATE POLICY "Anyone can view modes" ON game_modes FOR SELECT USING (true);
CREATE POLICY "Anyone can create modes" ON game_modes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update modes" ON game_modes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete modes" ON game_modes FOR DELETE USING (true);

-- Game Details
CREATE POLICY "Anyone can view details" ON game_details FOR SELECT USING (true);
CREATE POLICY "Anyone can create details" ON game_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update details" ON game_details FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete details" ON game_details FOR DELETE USING (true);

-- High Scores
CREATE POLICY "Anyone can view scores" ON high_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can submit scores" ON high_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update scores" ON high_scores FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete scores" ON high_scores FOR DELETE USING (true);


-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE high_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_modes;
ALTER PUBLICATION supabase_realtime ADD TABLE game_details;


-- ============================================================================
-- STORAGE BUCKETS (Manual Setup Required)
-- ============================================================================
-- 
-- Create these buckets in Supabase Dashboard -> Storage:
--
-- 1. Bucket: "avatars" (public)
--    - For player avatar images
--    - Enable public access
--
-- 2. Bucket: "game-icons" (public)  
--    - For game/category icons
--    - Enable public access
--
-- Storage policies (run after creating buckets):
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('game-icons', 'game-icons', true);
--
-- CREATE POLICY "Public avatar access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Public avatar upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
-- CREATE POLICY "Public icon access" ON storage.objects FOR SELECT USING (bucket_id = 'game-icons');
-- CREATE POLICY "Public icon upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'game-icons');


-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- 
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Create storage buckets manually
-- 3. Add seed data (see seed.sql)
-- 4. Update TypeScript types to match
-- 
-- ============================================================================