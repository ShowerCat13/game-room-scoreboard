import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameDetail, ScoreFormat, ScoreDirection } from '@/lib/types'

// Fields that can be updated on a game detail
interface UpdateDetailFields {
  name?: string
  mode_id?: string | null
  score_format?: ScoreFormat | null
  score_direction?: ScoreDirection | null
  score_unit?: string | null
  sort_order?: number
}

interface UseManageGameDetailsResult {
  details: GameDetail[]
  loading: boolean
  error: Error | null
  fetchDetails: (gameId: string, modeId?: string | null) => Promise<void>
  createDetail: (
    gameId: string,
    name: string,
    modeId?: string | null,
    scoreFormat?: ScoreFormat | null,
    scoreDirection?: ScoreDirection | null,
    scoreUnit?: string | null
  ) => Promise<GameDetail | null>
  updateDetail: (id: string, updates: UpdateDetailFields) => Promise<boolean>
  deleteDetail: (id: string) => Promise<boolean>
  clearDetails: () => void
}

/**
 * useManageGameDetails - Full CRUD operations for game details
 * 
 * Details are Level 2 of the hierarchy (Game → Mode → Detail)
 * Examples: tracks, courses, fish types, enemy types
 * 
 * Details can be:
 * - Shared across all modes (mode_id = null)
 * - Specific to one mode (mode_id = UUID)
 * 
 * Uses soft delete (is_active = false) to preserve score history
 */
export function useManageGameDetails(): UseManageGameDetailsResult {
  const [details, setDetails] = useState<GameDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDetails = useCallback(async (gameId: string, modeId?: string | null) => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('game_details')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      // If modeId provided, get shared details + mode-specific details
      // If no modeId, get only shared details
      if (modeId) {
        query = query.or(`mode_id.is.null,mode_id.eq.${modeId}`)
      } else {
        query = query.is('mode_id', null)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError
      setDetails((data as GameDetail[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch game details'))
    } finally {
      setLoading(false)
    }
  }, [])

  const createDetail = useCallback(async (
    gameId: string,
    name: string,
    modeId?: string | null,
    scoreFormat?: ScoreFormat | null,
    scoreDirection?: ScoreDirection | null,
    scoreUnit?: string | null
  ): Promise<GameDetail | null> => {
    try {
      const insertData = {
        game_id: gameId,
        name,
        mode_id: modeId || null,
        score_format: scoreFormat || null,
        score_direction: scoreDirection || null,
        score_unit: scoreUnit || null,
      }

      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('game_details')
        .insert(insertData)
        .select()
        .single()

      if (insertError) throw insertError
      
      const newDetail = data as GameDetail
      
      // Update local state
      setDetails(prev => [...prev, newDetail].sort((a, b) => {
        const orderDiff = a.sort_order - b.sort_order
        return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name)
      }))
      return newDetail
    } catch (err) {
      console.error('Failed to create game detail:', err)
      return null
    }
  }, [])

  const updateDetail = useCallback(async (
    id: string,
    updates: UpdateDetailFields
  ): Promise<boolean> => {
    try {
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('game_details')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state
      setDetails(prev => 
        prev.map(d => d.id === id ? { ...d, ...updates } : d)
      )
      return true
    } catch (err) {
      console.error('Failed to update game detail:', err)
      return false
    }
  }, [])

  const deleteDetail = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Soft delete - keeps score history intact
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('game_details')
        .update({ is_active: false })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Remove from local state
      setDetails(prev => prev.filter(d => d.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete game detail:', err)
      return false
    }
  }, [])

  const clearDetails = useCallback(() => {
    setDetails([])
    setError(null)
  }, [])

  return {
    details,
    loading,
    error,
    fetchDetails,
    createDetail,
    updateDetail,
    deleteDetail,
    clearDetails,
  }
}