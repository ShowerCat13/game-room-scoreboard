import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { LeaderboardEntry, LeaderboardRank } from '@/lib/types'

interface UseLeaderboardResult {
  data: LeaderboardEntry[]
  loading: boolean
  error: Error | null
}

/**
 * useLeaderboard - Fetches top N scores for a specific game mode
 * Uses the get_leaderboard RPC function which properly handles score_direction sorting
 *
 * @param gameModeId - The game mode UUID to fetch scores for
 * @param limit - Maximum number of scores to return (default: 4)
 */
export function useLeaderboard(
  gameModeId: string | null,
  limit = 4
): UseLeaderboardResult {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameModeId) {
      setData([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchLeaderboard() {
      if (!gameModeId) return

      try {
        setLoading(true)
        setError(null)

        // Use the RPC function which properly sorts based on score_direction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (supabase as any).rpc('get_leaderboard', {
          mode_id: gameModeId,
          max_results: limit,
        })

        const rankedScores = result.data as LeaderboardRank[] | null
        const rpcError = result.error

        if (rpcError) throw rpcError

        // Now fetch additional data from leaderboard view for the returned score IDs
        // The RPC only returns basic info, we need game/mode details
        if (rankedScores && rankedScores.length > 0) {
          const scoreIds = rankedScores.map((s) => s.score_id)

          const { data: fullScores, error: viewError } = await supabase
            .from('leaderboard')
            .select('*')
            .in('score_id', scoreIds)

          if (viewError) throw viewError

          if (fullScores) {
            // Sort the full scores based on the rank order from RPC
            const sortedScores: LeaderboardEntry[] = []
            for (const ranked of rankedScores) {
              const fullScore = (fullScores as LeaderboardEntry[]).find(
                (full) => full.score_id === ranked.score_id
              )
              if (fullScore) {
                sortedScores.push(fullScore)
              }
            }

            if (isMounted) {
              setData(sortedScores)
            }
          } else {
            if (isMounted) {
              setData([])
            }
          }
        } else {
          if (isMounted) {
            setData([])
          }
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
  }, [gameModeId, limit])

  return { data, loading, error }
}
