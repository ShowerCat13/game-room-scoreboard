import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ScoreFormat } from '@/lib/types'

export interface ScoreWithDetails {
  id: string
  score: number
  achieved_at: string
  player_name: string | null
  player_id: string | null
  game_name: string
  game_id: string
  mode_name: string
  mode_id: string
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

/**
 * useManageScores - Fetch, update, and delete scores
 * Fetches from leaderboard view for full context
 */
export function useManageScores(): UseManageScoresResult {
  const [scores, setScores] = useState<ScoreWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchScores = useCallback(async (limit = 100) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: queryError } = await (supabase as any)
        .from('leaderboard')
        .select(`
          score_id,
          score,
          achieved_at,
          player_name,
          player_id,
          game_name,
          game_id,
          mode_name,
          game_mode_id,
          score_format,
          score_unit
        `)
        .order('achieved_at', { ascending: false })
        .limit(limit)

      if (queryError) throw queryError
      
      const formatted: ScoreWithDetails[] = (data || []).map((row: any) => ({
        id: row.score_id,
        score: row.score,
        achieved_at: row.achieved_at,
        player_name: row.player_name,
        player_id: row.player_id,
        game_name: row.game_name,
        game_id: row.game_id,
        mode_name: row.mode_name,
        mode_id: row.game_mode_id,
        score_format: row.score_format,
        score_unit: row.score_unit,
      }))
      
      setScores(formatted)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch scores'))
    } finally {
      setLoading(false)
    }
  }, [])

  const updateScore = useCallback(async (id: string, newScore: number): Promise<boolean> => {
    try {
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