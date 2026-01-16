-- ============================================================================
-- GAME ROOM SCOREBOARD - SUPABASE SCHEMA
-- ============================================================================
-- Run this in your Supabase SQL Editor (supabase.com/dashboard → SQL Editor)
-- This creates all tables, views, functions, policies, and storage buckets
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- How to rank scores (determines sort order for leaderboards)
CREATE TYPE score_direction AS ENUM ('lower_better', 'higher_better');

-- How to display the score value in the UI
CREATE TYPE score_format AS ENUM (
  'integer',        -- 47 (points, throws, strokes, eliminations)
  'time_ms',        -- stored as ms, displayed as 1:23.456 or 2:22.567
  'time_seconds',   -- stored as seconds, displayed as 1:23 or 4:56
  'decimal_2',      -- 98.45 (for percentages, etc.)
  'level'           -- World 8-4 (stored as integer 84, formatted in UI)
);

-- Category for filtering/grouping in the display UI
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
COMMENT ON COLUMN players.avatar_url IS 'URL to avatar image in Supabase Storage';

-- ============================================================================
-- TEAMS (future-proofing for team-based games)
-- ============================================================================

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,                        -- Optional team logo
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, player_id)
);

COMMENT ON TABLE teams IS 'Teams for multiplayer/co-op games (future use)';
COMMENT ON TABLE team_members IS 'Junction table linking players to teams';

-- ============================================================================
-- GAMES & GAME MODES
-- ============================================================================

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- "Assetto Corsa", "Mario Kart 8 Deluxe"
  platform TEXT,                          -- "Switch", "PC", "Physical", "NES"
  category game_category NOT NULL,
  icon_url TEXT,                          -- Supabase Storage URL for game icon
  description TEXT,                       -- Optional description for UI
  sort_order INTEGER DEFAULT 0,           -- Manual ordering in UI (lower = first)
  is_active BOOLEAN DEFAULT true,         -- Soft delete / hide from UI
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE game_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  
  -- Identity
  name TEXT NOT NULL,                     -- "Rainbow Road", "Spa - GT3", "501"
  subtitle TEXT,                          -- Optional clarifier: "Time Trial", "Speed Golf"
  
  -- Score interpretation rules
  score_direction score_direction NOT NULL,
  score_format score_format NOT NULL,
  score_unit TEXT,                        -- "throws", "strokes", "pts", "eliminations", null for times
  
  -- Structured context for UI grouping/filtering
  -- Examples: {"track": "Spa", "class": "GT3"}, {"variant": "speed"}
  context JSONB DEFAULT '{}',
  
  -- Display options
  icon_url TEXT,                          -- Override game icon if needed
  sort_order INTEGER DEFAULT 0,           -- Manual ordering within game
  is_active BOOLEAN DEFAULT true,         -- Soft delete / hide from UI
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE games IS 'Parent container for games (e.g., "Mario Kart 8 Deluxe")';
COMMENT ON TABLE game_modes IS 'Specific scoreable contexts (e.g., "Rainbow Road - Time Trial")';
COMMENT ON COLUMN game_modes.context IS 'Structured metadata for grouping: {"track": "Spa", "class": "GT3"}';
COMMENT ON COLUMN game_modes.score_format IS 'Determines how score BIGINT is displayed in UI';

-- ============================================================================
-- HIGH SCORES
-- ============================================================================

CREATE TABLE high_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_mode_id UUID NOT NULL REFERENCES game_modes(id) ON DELETE CASCADE,
  
  -- Participant (exactly one must be set)
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- The score value
  -- Always stored as integer/bigint; score_format determines display
  -- Times: stored as milliseconds (1:23.456 = 83456)
  -- Percentages: stored as value * 100 (98.45% = 9845)
  -- Levels: stored as concatenated digits (World 8-4 = 84)
  score BIGINT NOT NULL,
  
  -- Optional extended data
  -- Examples: {"checkout": "D16"}, {"character": "Luigi"}, {"car": "Ferrari 488"}
  metadata JSONB DEFAULT '{}',
  
  -- When the score was achieved (user-provided or defaults to now)
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Record keeping
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Data integrity: must have exactly one participant type
  CONSTRAINT score_has_one_participant CHECK (
    (player_id IS NOT NULL AND team_id IS NULL) OR
    (player_id IS NULL AND team_id IS NOT NULL)
  )
);

COMMENT ON TABLE high_scores IS 'Individual score records for leaderboards';
COMMENT ON COLUMN high_scores.score IS 'Raw score value; interpret using game_mode.score_format';
COMMENT ON COLUMN high_scores.metadata IS 'Optional game-specific details: {"checkout": "D16"}';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Player lookups
CREATE INDEX idx_players_name ON players(name);

-- Game mode navigation
CREATE INDEX idx_game_modes_game ON game_modes(game_id);
CREATE INDEX idx_game_modes_active ON game_modes(game_id) WHERE is_active = true;
CREATE INDEX idx_game_modes_context ON game_modes USING gin(context);

-- High score queries (these are critical for leaderboard performance)
CREATE INDEX idx_high_scores_game_mode ON high_scores(game_mode_id);
CREATE INDEX idx_high_scores_player ON high_scores(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX idx_high_scores_team ON high_scores(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_high_scores_achieved ON high_scores(achieved_at DESC);

-- Composite index for leaderboard queries (mode + score for sorting)
CREATE INDEX idx_high_scores_leaderboard ON high_scores(game_mode_id, score);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Denormalized leaderboard view for easy querying
CREATE VIEW leaderboard AS
SELECT 
  hs.id AS score_id,
  hs.score,
  hs.achieved_at,
  hs.metadata AS score_metadata,
  
  -- Game mode details
  gm.id AS game_mode_id,
  gm.name AS mode_name,
  gm.subtitle AS mode_subtitle,
  gm.score_direction,
  gm.score_format,
  gm.score_unit,
  gm.context AS mode_context,
  
  -- Game details
  g.id AS game_id,
  g.name AS game_name,
  g.platform,
  g.category,
  g.icon_url AS game_icon,
  
  -- Player details (null if team score)
  p.id AS player_id,
  p.name AS player_name,
  p.avatar_url AS player_avatar,
  
  -- Team details (null if player score)
  t.id AS team_id,
  t.name AS team_name,
  t.avatar_url AS team_avatar

FROM high_scores hs
JOIN game_modes gm ON hs.game_mode_id = gm.id
JOIN games g ON gm.game_id = g.id
LEFT JOIN players p ON hs.player_id = p.id
LEFT JOIN teams t ON hs.team_id = t.id
WHERE gm.is_active = true 
  AND g.is_active = true;

COMMENT ON VIEW leaderboard IS 'Denormalized view joining scores with all related data';

-- Best scores per player per mode (for "personal best" displays)
CREATE VIEW personal_bests AS
SELECT DISTINCT ON (hs.game_mode_id, hs.player_id)
  hs.id AS score_id,
  hs.score,
  hs.achieved_at,
  hs.game_mode_id,
  hs.player_id,
  gm.score_direction,
  gm.score_format,
  gm.score_unit,
  gm.name AS mode_name,
  g.name AS game_name,
  p.name AS player_name,
  p.avatar_url AS player_avatar
FROM high_scores hs
JOIN game_modes gm ON hs.game_mode_id = gm.id
JOIN games g ON gm.game_id = g.id
JOIN players p ON hs.player_id = p.id
WHERE hs.player_id IS NOT NULL
  AND gm.is_active = true
  AND g.is_active = true
ORDER BY 
  hs.game_mode_id, 
  hs.player_id,
  CASE WHEN gm.score_direction = 'lower_better' THEN hs.score ELSE -hs.score END,
  hs.achieved_at ASC;

COMMENT ON VIEW personal_bests IS 'Best score per player per game mode';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER game_modes_updated_at
  BEFORE UPDATE ON game_modes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- HELPER FUNCTION: Get leaderboard for a game mode
-- ============================================================================

CREATE OR REPLACE FUNCTION get_leaderboard(
  mode_id UUID,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  rank BIGINT,
  score_id UUID,
  score BIGINT,
  achieved_at TIMESTAMPTZ,
  player_id UUID,
  player_name TEXT,
  player_avatar TEXT,
  team_id UUID,
  team_name TEXT
) AS $$
DECLARE
  direction score_direction;
BEGIN
  -- Get the score direction for this mode
  SELECT gm.score_direction INTO direction
  FROM game_modes gm
  WHERE gm.id = mode_id;
  
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE WHEN direction = 'lower_better' THEN hs.score ELSE -hs.score END,
        hs.achieved_at ASC
    ) AS rank,
    hs.id AS score_id,
    hs.score,
    hs.achieved_at,
    p.id AS player_id,
    p.name AS player_name,
    p.avatar_url AS player_avatar,
    t.id AS team_id,
    t.name AS team_name
  FROM high_scores hs
  LEFT JOIN players p ON hs.player_id = p.id
  LEFT JOIN teams t ON hs.team_id = t.id
  WHERE hs.game_mode_id = mode_id
  ORDER BY 
    CASE WHEN direction = 'lower_better' THEN hs.score ELSE -hs.score END,
    hs.achieved_at ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_leaderboard IS 'Get ranked leaderboard for a game mode, respecting score_direction';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;

-- For a home kiosk, we use anon access with open read/write
-- This is appropriate for a trusted home network
-- For public deployment, you'd want authentication

-- Players
CREATE POLICY "Anyone can view players" 
  ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can create players" 
  ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" 
  ON players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete players" 
  ON players FOR DELETE USING (true);

-- Teams
CREATE POLICY "Anyone can view teams" 
  ON teams FOR SELECT USING (true);
CREATE POLICY "Anyone can create teams" 
  ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update teams" 
  ON teams FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete teams" 
  ON teams FOR DELETE USING (true);

-- Team members
CREATE POLICY "Anyone can view team members" 
  ON team_members FOR SELECT USING (true);
CREATE POLICY "Anyone can manage team members" 
  ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove team members" 
  ON team_members FOR DELETE USING (true);

-- Games
CREATE POLICY "Anyone can view games" 
  ON games FOR SELECT USING (true);
CREATE POLICY "Anyone can create games" 
  ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update games" 
  ON games FOR UPDATE USING (true);

-- Game modes
CREATE POLICY "Anyone can view game modes" 
  ON game_modes FOR SELECT USING (true);
CREATE POLICY "Anyone can create game modes" 
  ON game_modes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game modes" 
  ON game_modes FOR UPDATE USING (true);

-- High scores
CREATE POLICY "Anyone can view high scores" 
  ON high_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can submit high scores" 
  ON high_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete high scores" 
  ON high_scores FOR DELETE USING (true);

-- ============================================================================
-- STORAGE BUCKETS (run separately in Supabase Dashboard → Storage)
-- ============================================================================

-- NOTE: Storage buckets must be created via the Supabase Dashboard or API
-- Go to Storage → New Bucket and create these:

-- 1. Bucket: "avatars" (public)
--    - For player and team avatars
--    - Enable public access for easy URL sharing

-- 2. Bucket: "game-icons" (public)
--    - For game and game mode icons
--    - Enable public access for easy URL sharing

-- Storage policies (run in SQL editor after creating buckets):

-- Avatars bucket policies
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- CREATE POLICY "Anyone can view avatars"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Anyone can upload avatars"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars');

-- CREATE POLICY "Anyone can update avatars"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Anyone can delete avatars"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'avatars');

-- Game icons bucket policies (same pattern)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('game-icons', 'game-icons', true);

-- CREATE POLICY "Anyone can view game icons"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'game-icons');

-- CREATE POLICY "Anyone can upload game icons"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'game-icons');

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for tables the kiosk needs to watch
-- Run this in SQL editor:

ALTER PUBLICATION supabase_realtime ADD TABLE high_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_modes;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
