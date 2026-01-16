import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { LeaderboardEntry, ScoreFormat } from '@/lib/types'

export interface RealtimeScoreData {
  scoreId: string
  playerName: string
  score: number
  scoreFormat: ScoreFormat
  scoreUnit: string | null
  gameName: string
  modeName: string
  rank: number
}

/**
 * Hook to fetch full score details for realtime alerts
 * Queries the leaderboard view and calculates rank
 */
export function useScoreDetails() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RealtimeScoreData | null>(null)

  const fetchScoreDetails = useCallback(async (scoreId: string): Promise<RealtimeScoreData | null> => {
    setLoading(true)
    
    try {
      // Fetch the score details from the leaderboard view
      const { data: scoreData, error: scoreError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('score_id', scoreId)
        .single()

      if (scoreError || !scoreData) {
        console.error('Error fetching score details:', scoreError)
        setLoading(false)
        return null
      }

      const entry = scoreData as LeaderboardEntry

      // Calculate rank by counting how many scores are better
      const { count, error: rankError } = await supabase
        .from('high_scores')
        .select('*', { count: 'exact', head: true })
        .eq('game_mode_id', entry.game_mode_id)
        .lt('score', entry.score_direction === 'lower_better' ? entry.score : -entry.score)

      let rank = 1
      if (!rankError && count !== null) {
        // For higher_better, we need different logic
        if (entry.score_direction === 'higher_better') {
          const { count: betterCount } = await supabase
            .from('high_scores')
            .select('*', { count: 'exact', head: true })
            .eq('game_mode_id', entry.game_mode_id)
            .gt('score', entry.score)
          
          rank = (betterCount ?? 0) + 1
        } else {
          rank = count + 1
        }
      }

      const result: RealtimeScoreData = {
        scoreId: entry.score_id,
        playerName: entry.player_name || entry.team_name || 'Unknown',
        score: entry.score,
        scoreFormat: entry.score_format,
        scoreUnit: entry.score_unit,
        gameName: entry.game_name,
        modeName: entry.mode_name,
        rank,
      }

      setData(result)
      setLoading(false)
      return result
    } catch (error) {
      console.error('Error in fetchScoreDetails:', error)
      setLoading(false)
      return null
    }
  }, [])

  const clearData = useCallback(() => {
    setData(null)
  }, [])

  return { fetchScoreDetails, clearData, data, loading }
}