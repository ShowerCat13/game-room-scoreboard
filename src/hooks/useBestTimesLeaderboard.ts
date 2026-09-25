import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { LeaderboardEntry } from '@/lib/types'

// Upper bound on raw attempts fetched; a party won't come close
const MAX_ATTEMPTS = 1000

interface UseBestTimesLeaderboardResult {
  entries: LeaderboardEntry[]
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Collapse a ranked leaderboard to each player's best entry and re-rank.
 * Input must already be sorted best-first (as get_leaderboard returns it).
 */
export function bestPerPlayer(ranked: LeaderboardEntry[]): LeaderboardEntry[] {
  const seen = new Set<string>()
  const best: LeaderboardEntry[] = []

  for (const entry of ranked) {
    if (seen.has(entry.player_id)) continue
    seen.add(entry.player_id)
    best.push({ ...entry, rank: best.length + 1 })
  }

  return best
}

/**
 * Fetch one row per player (their best score), ranked.
 *
 * Uses the existing get_leaderboard RPC (which sorts by score_direction)
 * and de-duplicates client-side, so no database function changes are needed.
 */
export async function fetchBestTimes(
  gameId: string,
  modeId: string | null,
  detailId: string | null
): Promise<LeaderboardEntry[]> {
  // Type assertion needed because Supabase client types don't match our schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_leaderboard', {
    p_game_id: gameId,
    p_mode_id: modeId,
    p_detail_id: detailId,
    p_limit: MAX_ATTEMPTS,
  })

  if (error) throw error

  return bestPerPlayer((data as LeaderboardEntry[]) || [])
}

/**
 * useBestTimesLeaderboard - Leaderboard showing each player's best score once
 */
export function useBestTimesLeaderboard(
  gameId: string | null,
  modeId: string | null = null,
  detailId: string | null = null
): UseBestTimesLeaderboardResult {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    if (!gameId) {
      setEntries([])
      setLoading(false)
      return
    }

    let isMounted = true

    fetchBestTimes(gameId, modeId, detailId)
      .then((best) => {
        if (!isMounted) return
        setEntries(best)
        setError(null)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch leaderboard'))
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [gameId, modeId, detailId, reloadKey])

  return { entries, loading, error, refetch }
}
