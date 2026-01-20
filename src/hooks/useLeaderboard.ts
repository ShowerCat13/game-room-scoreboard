import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { LeaderboardEntry } from '@/lib/types'

interface UseLeaderboardResult {
  entries: LeaderboardEntry[]
  loading: boolean
  error: Error | null
}

/**
 * useLeaderboard - Fetches top N scores for a game/mode/detail combination
 * Uses the get_leaderboard RPC function which handles score_direction sorting
 *
 * @param gameId - The game UUID (required)
 * @param modeId - Optional mode UUID
 * @param detailId - Optional detail UUID
 * @param limit - Maximum number of scores to return (default: 5)
 */
export function useLeaderboard(
  gameId: string | null,
  modeId: string | null = null,
  detailId: string | null = null,
  limit = 5
): UseLeaderboardResult {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameId) {
      setEntries([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchLeaderboard() {
      if (!gameId) return

      try {
        setLoading(true)
        setError(null)

        // Use the RPC function which properly sorts based on score_direction
        // Type assertion needed because Supabase client types don't match our schema
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: rpcError } = await (supabase as any).rpc('get_leaderboard', {
          p_game_id: gameId,
          p_mode_id: modeId,
          p_detail_id: detailId,
          p_limit: limit,
        })

        if (rpcError) throw rpcError

        if (isMounted) {
          setEntries((data as LeaderboardEntry[]) || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to fetch leaderboard')
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchLeaderboard()

    return () => {
      isMounted = false
    }
  }, [gameId, modeId, detailId, limit])

  return { entries, loading, error }
}