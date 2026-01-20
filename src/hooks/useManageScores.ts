import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ScoreFormat } from '@/lib/types'

export interface ScoreWithDetails {
  id: string
  score: number
  achieved_at: string
  player_id: string | null
  player_name: string | null
  game_id: string
  game_name: string
  mode_id: string | null
  mode_name: string | null
  detail_id: string | null
  detail_name: string | null
  score_format: ScoreFormat
  score_unit: string | null
}

interface UseManageScoresResult {
  scores: ScoreWithDetails[]
  loading: boolean
  error: Error | null
  fetchScores: (limit?: number) => Promise<void>
  updateScore: (id: string, newScore: number) => Promise<boolean>
  deleteScore: (id: string) => Promise<boolean>
}

// Internal type for the join query result
interface ScoreJoinRow {
  id: string
  score: number
  achieved_at: string
  player_id: string
  game_id: string
  mode_id: string | null
  detail_id: string | null
  players: { name: string } | null
  games: { name: string; default_score_format: ScoreFormat; default_score_unit: string | null } | null
  game_modes: { name: string; score_format: ScoreFormat | null; score_unit: string | null } | null
  game_details: { name: string; score_format: ScoreFormat | null; score_unit: string | null } | null
}

/**
 * useManageScores - Fetch, update, and delete scores
 * Fetches from high_scores with joins for full context
 */
export function useManageScores(): UseManageScoresResult {
  const [scores, setScores] = useState<ScoreWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchScores = useCallback(async (limit = 100) => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch scores with related data via joins
      // Type assertion needed because Supabase client types don't handle complex joins
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: queryError } = await (supabase as any)
        .from('high_scores')
        .select(`
          id,
          score,
          achieved_at,
          player_id,
          game_id,
          mode_id,
          detail_id,
          players ( name ),
          games ( name, default_score_format, default_score_unit ),
          game_modes ( name, score_format, score_unit ),
          game_details ( name, score_format, score_unit )
        `)
        .order('achieved_at', { ascending: false })
        .limit(limit)

      if (queryError) throw queryError
      
      const rows = (data || []) as ScoreJoinRow[]
      
      const formatted: ScoreWithDetails[] = rows.map((row) => {
        // Extract nested data
        const player = row.players
        const game = row.games
        const mode = row.game_modes
        const detail = row.game_details
        
        // Calculate effective format/unit using inheritance: detail → mode → game
        const effectiveFormat = detail?.score_format ?? mode?.score_format ?? game?.default_score_format ?? 'integer'
        const effectiveUnit = detail?.score_unit ?? mode?.score_unit ?? game?.default_score_unit ?? null

        return {
          id: row.id,
          score: row.score,
          achieved_at: row.achieved_at,
          player_name: player?.name || null,
          player_id: row.player_id,
          game_name: game?.name || 'Unknown Game',
          game_id: row.game_id,
          mode_name: mode?.name || null,
          mode_id: row.mode_id,
          detail_name: detail?.name || null,
          detail_id: row.detail_id,
          score_format: effectiveFormat,
          score_unit: effectiveUnit,
        }
      })
      
      setScores(formatted)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch scores'))
    } finally {
      setLoading(false)
    }
  }, [])

  const updateScore = useCallback(async (id: string, newScore: number): Promise<boolean> => {
    try {
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('high_scores')
        .update({ score: newScore })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state
      setScores(prev => 
        prev.map(s => s.id === id ? { ...s, score: newScore } : s)
      )
      return true
    } catch (err) {
      console.error('Failed to update score:', err)
      return false
    }
  }, [])

  const deleteScore = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('high_scores')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      // Remove from local state
      setScores(prev => prev.filter(s => s.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete score:', err)
      return false
    }
  }, [])

  return {
    scores,
    loading,
    error,
    fetchScores,
    updateScore,
    deleteScore,
  }
}