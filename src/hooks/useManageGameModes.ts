import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { dbError, NOT_SAVED } from '@/lib/dbErrors'
import type { GameMode, ScoreDirection, ScoreFormat } from '@/lib/types'

interface UseManageGameModesResult {
  modes: GameMode[]
  loading: boolean
  error: Error | null
  fetchModes: (gameId: string) => Promise<void>
  createMode: (
    gameId: string,
    name: string,
    scoreFormat?: ScoreFormat | null,
    scoreDirection?: ScoreDirection | null,
    scoreUnit?: string | null,
    detailLabelOverride?: string | null
  ) => Promise<GameMode | null>
  updateMode: (
    id: string,
    updates: {
      name?: string
      score_format?: ScoreFormat | null
      score_direction?: ScoreDirection | null
      score_unit?: string | null
      detail_label_override?: string | null
    }
  ) => Promise<boolean>
  deleteMode: (id: string) => Promise<boolean>
  clearModes: () => void
}

/**
 * useManageGameModes - Full CRUD operations for game modes
 * Saves and deletes throw an Error with a readable message when they fail.
 * Uses soft delete (is_active = false) to preserve score history
 */
export function useManageGameModes(): UseManageGameModesResult {
  const [modes, setModes] = useState<GameMode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchModes = useCallback(async (gameId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: queryError } = await supabase
        .from('game_modes')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (queryError) throw queryError
      setModes(data || [])
    } catch (err) {
      setError(dbError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const createMode = useCallback(async (
    gameId: string,
    name: string,
    scoreFormat?: ScoreFormat | null,
    scoreDirection?: ScoreDirection | null,
    scoreUnit?: string | null,
    detailLabelOverride?: string | null
  ): Promise<GameMode | null> => {
    try {
      const { data, error: insertError } = await (supabase as any)
        .from('game_modes')
        .insert({
          game_id: gameId,
          name,
          score_format: scoreFormat || null,
          score_direction: scoreDirection || null,
          score_unit: scoreUnit || null,
          detail_label_override: detailLabelOverride || null,
        })
        .select()
        .single()
  
      if (insertError) throw insertError
      
      // Update local state
      setModes(prev => [...prev, data].sort((a, b) => {
        const orderDiff = a.sort_order - b.sort_order
        return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name)
      }))
      return data
    } catch (err) {
      console.error('Failed to create game mode:', err)
      throw dbError(err)
    }
  }, [])

  const updateMode = useCallback(async (
    id: string,
    updates: {
      name?: string
      score_format?: ScoreFormat | null
      score_direction?: ScoreDirection | null
      score_unit?: string | null
      detail_label_override?: string | null
    }
  ): Promise<boolean> => {
  
    try {
      const { data: changed, error: updateError } = await (supabase as any)
        .from('game_modes')
        .update(updates)
        .eq('id', id)
        .select('id')

      if (updateError) throw updateError
      if (!changed?.length) throw new Error(NOT_SAVED)
      
      // Update local state
      setModes(prev => 
        prev.map(m => m.id === id ? { ...m, ...updates } : m)
      )
      return true
    } catch (err) {
      console.error('Failed to update game mode:', err)
      throw dbError(err)
    }
  }, [])

  const deleteMode = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Soft delete - keeps score history intact
      const { data: changed, error: updateError } = await (supabase as any)
        .from('game_modes')
        .update({ is_active: false })
        .eq('id', id)
        .select('id')

      if (updateError) throw updateError
      if (!changed?.length) throw new Error(NOT_SAVED)
      
      // Remove from local state
      setModes(prev => prev.filter(m => m.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete game mode:', err)
      throw dbError(err)
    }
  }, [])

  const clearModes = useCallback(() => {
    setModes([])
    setError(null)
  }, [])

  return {
    modes,
    loading,
    error,
    fetchModes,
    createMode,
    updateMode,
    deleteMode,
    clearModes,
  }
}