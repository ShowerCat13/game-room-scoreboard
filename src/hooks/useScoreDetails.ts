import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ScoreFormat, ScoreDirection } from '@/lib/types'

export interface RealtimeScoreData {
  scoreId: string
  playerName: string
  score: number
  scoreFormat: ScoreFormat
  scoreUnit: string | null
  gameName: string
  modeName: string | null
  detailName: string | null
  rank: number
}

// Internal type for the join query result
interface ScoreJoinResult {
  id: string
  score: number
  game_id: string
  mode_id: string | null
  detail_id: string | null
  players: { name: string } | null
  games: { name: string } | null
  game_modes: { name: string } | null
  game_details: { name: string } | null
}

// Internal type for score settings RPC result
interface ScoreSettingsRow {
  score_format: ScoreFormat
  score_direction: ScoreDirection
  score_unit: string | null
}

// Internal type for leaderboard RPC result
interface LeaderboardRow {
  rank: number
  score_id: string
}

/**
 * Hook to fetch full score details for realtime alerts
 * Fetches score with related data and calculates rank using RPC
 */
export function useScoreDetails() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RealtimeScoreData | null>(null)

  const fetchScoreDetails = useCallback(async (scoreId: string): Promise<RealtimeScoreData | null> => {
    setLoading(true)
    
    try {
      // Fetch the score with all related data
      // Type assertion needed because Supabase client types don't handle complex joins
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: scoreData, error: scoreError } = await (supabase as any)
        .from('high_scores')
        .select(`
          id,
          score,
          game_id,
          mode_id,
          detail_id,
          players ( name ),
          games ( name ),
          game_modes ( name ),
          game_details ( name )
        `)
        .eq('id', scoreId)
        .single()

      if (scoreError || !scoreData) {
        console.error('Error fetching score details:', scoreError)
        setLoading(false)
        return null
      }

      const scoreRow = scoreData as ScoreJoinResult

      // Get effective score settings using RPC
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: settings, error: settingsError } = await (supabase as any).rpc('get_score_settings', {
        p_game_id: scoreRow.game_id,
        p_mode_id: scoreRow.mode_id,
        p_detail_id: scoreRow.detail_id,
      })

      if (settingsError) {
        console.error('Error fetching score settings:', settingsError)
        setLoading(false)
        return null
      }

      const settingsArray = settings as ScoreSettingsRow[] | null
      const effectiveSettings: ScoreSettingsRow = settingsArray?.[0] || {
        score_format: 'integer',
        score_direction: 'higher_better',
        score_unit: null,
      }

      // Get leaderboard to calculate rank
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: leaderboard, error: leaderboardError } = await (supabase as any).rpc('get_leaderboard', {
        p_game_id: scoreRow.game_id,
        p_mode_id: scoreRow.mode_id,
        p_detail_id: scoreRow.detail_id,
        p_limit: 100,
      })

      let rank = 1
      if (!leaderboardError && leaderboard) {
        const entries = leaderboard as LeaderboardRow[]
        const foundEntry = entries.find((e) => e.score_id === scoreId)
        if (foundEntry) {
          rank = Number(foundEntry.rank)
        }
      }

      // Extract nested data
      const playerData = scoreRow.players
      const gameData = scoreRow.games
      const modeData = scoreRow.game_modes
      const detailData = scoreRow.game_details

      const result: RealtimeScoreData = {
        scoreId: scoreRow.id,
        playerName: playerData?.name || 'Unknown',
        score: scoreRow.score,
        scoreFormat: effectiveSettings.score_format,
        scoreUnit: effectiveSettings.score_unit,
        gameName: gameData?.name || 'Unknown Game',
        modeName: modeData?.name || null,
        detailName: detailData?.name || null,
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