import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Game, GameCategory, ScoreFormat, ScoreDirection } from '@/lib/types'

// Options for creating a new game
interface CreateGameOptions {
  platform?: string | null
  iconUrl?: string | null
  modeLabel?: string
  detailLabel?: string
  hasModes?: boolean
  hasDetails?: boolean
  defaultScoreFormat?: ScoreFormat
  defaultScoreDirection?: ScoreDirection
  defaultScoreUnit?: string | null
}

// Fields that can be updated on a game
interface UpdateGameFields {
  name?: string
  category?: GameCategory
  platform?: string | null
  icon_url?: string | null
  mode_label?: string
  detail_label?: string
  has_modes?: boolean
  has_details?: boolean
  default_score_format?: ScoreFormat
  default_score_direction?: ScoreDirection
  default_score_unit?: string | null
}

interface UseManageGamesResult {
  games: Game[]
  loading: boolean
  error: Error | null
  fetchGames: () => Promise<void>
  createGame: (
    name: string,
    category: GameCategory,
    options?: CreateGameOptions
  ) => Promise<Game | null>
  updateGame: (id: string, updates: UpdateGameFields) => Promise<boolean>
  deleteGame: (id: string) => Promise<boolean>
}

/**
 * useManageGames - Full CRUD operations for games
 * Uses soft delete (is_active = false) to preserve score history
 * 
 * Supports the 3-level hierarchy configuration:
 * - mode_label / detail_label: UI labels for dropdowns
 * - has_modes / has_details: whether to show those selection steps
 * - default_score_*: fallback score settings when mode/detail don't override
 */
export function useManageGames(): UseManageGamesResult {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: queryError } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (queryError) throw queryError
      setGames((data as Game[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch games'))
    } finally {
      setLoading(false)
    }
  }, [])

  const createGame = useCallback(async (
    name: string,
    category: GameCategory,
    options?: CreateGameOptions
  ): Promise<Game | null> => {
    try {
      const insertData = {
        name,
        category,
        platform: options?.platform || null,
        icon_url: options?.iconUrl || null,
        mode_label: options?.modeLabel ?? 'Mode',
        detail_label: options?.detailLabel ?? 'Track',
        has_modes: options?.hasModes ?? true,
        has_details: options?.hasDetails ?? true,
        default_score_format: options?.defaultScoreFormat ?? 'integer',
        default_score_direction: options?.defaultScoreDirection ?? 'higher_better',
        default_score_unit: options?.defaultScoreUnit || null,
      }

      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('games')
        .insert(insertData)
        .select()
        .single()

      if (insertError) throw insertError
      
      const newGame = data as Game
      
      // Update local state
      setGames(prev => [...prev, newGame].sort((a, b) => {
        const orderDiff = a.sort_order - b.sort_order
        return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name)
      }))
      return newGame
    } catch (err) {
      console.error('Failed to create game:', err)
      return null
    }
  }, [])

  const updateGame = useCallback(async (
    id: string,
    updates: UpdateGameFields
  ): Promise<boolean> => {
    try {
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('games')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state
      setGames(prev => 
        prev.map(g => g.id === id ? { ...g, ...updates } : g)
      )
      return true
    } catch (err) {
      console.error('Failed to update game:', err)
      return false
    }
  }, [])

  const deleteGame = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Soft delete - keeps score history intact
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('games')
        .update({ is_active: false })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Remove from local state
      setGames(prev => prev.filter(g => g.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete game:', err)
      return false
    }
  }, [])

  return {
    games,
    loading,
    error,
    fetchGames,
    createGame,
    updateGame,
    deleteGame,
  }
}