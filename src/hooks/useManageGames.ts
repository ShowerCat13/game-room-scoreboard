import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Game, GameCategory } from '@/lib/types'

interface UseManageGamesResult {
  games: Game[]
  loading: boolean
  error: Error | null
  fetchGames: () => Promise<void>
  createGame: (
    name: string,
    category: GameCategory,
    platform?: string | null,
    iconUrl?: string | null
  ) => Promise<Game | null>
  updateGame: (
    id: string,
    updates: { name?: string; category?: GameCategory; platform?: string | null; icon_url?: string | null }
  ) => Promise<boolean>
  deleteGame: (id: string) => Promise<boolean>
}

/**
 * useManageGames - Full CRUD operations for games
 * Uses soft delete (is_active = false) to preserve score history
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
      setGames(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch games'))
    } finally {
      setLoading(false)
    }
  }, [])

  const createGame = useCallback(async (
    name: string,
    category: GameCategory,
    platform?: string | null,
    iconUrl?: string | null
  ): Promise<Game | null> => {
    try {
      const { data, error: insertError } = await (supabase as any)
        .from('games')
        .insert({
          name,
          category,
          platform: platform || null,
          icon_url: iconUrl || null,
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Update local state
      setGames(prev => [...prev, data].sort((a, b) => {
        const orderDiff = a.sort_order - b.sort_order
        return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name)
      }))
      return data
    } catch (err) {
      console.error('Failed to create game:', err)
      return null
    }
  }, [])

  const updateGame = useCallback(async (
    id: string,
    updates: { name?: string; category?: GameCategory; platform?: string | null; icon_url?: string | null }
  ): Promise<boolean> => {
    try {
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