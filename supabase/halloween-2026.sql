-- ============================================================================
-- HALLOWEEN 2026 - BOO CINEMA TIME TRIALS
-- ============================================================================
--
-- Adds the single leaderboard used by the halloween-2026 branch:
--   Mario Kart World -> 150cc Time Trial -> Boo Cinema
--
-- Data only: no tables, functions or policies are changed, and existing
-- game room scores are untouched. Safe to run more than once.
--
-- The IDs below must match src/lib/event.ts.
--
-- ============================================================================

INSERT INTO games (
  id, name, category, platform,
  mode_label, detail_label, has_modes, has_details,
  default_score_format, default_score_direction, default_score_unit,
  sort_order
) VALUES (
  '8a110000-2026-4000-8000-000000000001', 'Mario Kart World', 'racing', 'Switch 2',
  'Mode', 'Track', true, true,
  'time_ms', 'lower_better', NULL,
  9
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO game_modes (
  id, game_id, name, score_format, score_direction, sort_order
) VALUES (
  '8a110000-2026-4000-8000-000000000002', '8a110000-2026-4000-8000-000000000001',
  '150cc Time Trial', 'time_ms', 'lower_better', 1
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO game_details (
  id, game_id, mode_id, name, sort_order
) VALUES (
  '8a110000-2026-4000-8000-000000000003', '8a110000-2026-4000-8000-000000000001',
  '8a110000-2026-4000-8000-000000000002', 'Boo Cinema', 1
)
ON CONFLICT (id) DO NOTHING;
