/**
 * Halloween 2026 party event configuration
 *
 * The kiosk is locked to a single leaderboard: Mario Kart World,
 * 150cc Time Trial, Boo Cinema. These IDs must match
 * supabase/halloween-2026.sql.
 */
export const PARTY_EVENT = {
  title: 'Boo Cinema Time Trials',
  subtitle: 'Mario Kart World · 150cc',
  gameId: '8a110000-2026-4000-8000-000000000001',
  modeId: '8a110000-2026-4000-8000-000000000002',
  detailId: '8a110000-2026-4000-8000-000000000003',
} as const

/** Query string that pre-fills and locks the Add Score form to the event */
export const PARTY_ADD_SCORE_PATH =
  `/add-score?gameId=${PARTY_EVENT.gameId}` +
  `&modeId=${PARTY_EVENT.modeId}` +
  `&detailId=${PARTY_EVENT.detailId}` +
  `&locked=1`
