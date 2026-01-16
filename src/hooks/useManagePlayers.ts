import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Player } from '@/lib/types'

interface UseManagePlayersResult {
  players: Player[]
  loading: boolean
  error: Error | null
  fetchPlayers: () => Promise<void>
  createPlayer: (name: string, avatarUrl?: string | null) => Promise<Player | null>
  updatePlayer: (id: string, name: string, avatarUrl?: string | null) => Promise<boolean>
  deletePlayer: (id: string) => Promise<boolean>
}

/**
 * useManagePlayers - Full CRUD operations for players
 */
export function useManagePlayers(): UseManagePlayersResult {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: queryError } = await supabase
        .from('players')
        .select('*')
        .order('name', { ascending: true })

      if (queryError) throw queryError
      setPlayers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch players'))
    } finally {
      setLoading(false)
    }
  }, [])

  const createPlayer = useCallback(async (
    name: string, 
    avatarUrl?: string | null
  ): Promise<Player | null> => {
    try {
      const { data, error: insertError } = await (supabase as any)
        .from('players')
        .insert({ name, avatar_url: avatarUrl || null })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Update local state
      setPlayers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return data
    } catch (err) {
      console.error('Failed to create player:', err)
      return null
    }
  }, [])

  const updatePlayer = useCallback(async (
    id: string,
    name: string,
    avatarUrl?: string | null
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('players')
        .update({ name, avatar_url: avatarUrl })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state
      setPlayers(prev => 
        prev.map(p => p.id === id ? { ...p, name, avatar_url: avatarUrl ?? p.avatar_url } : p)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      return true
    } catch (err) {
      console.error('Failed to update player:', err)
      return false
    }
  }, [])

  const deletePlayer = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      // Update local state
      setPlayers(prev => prev.filter(p => p.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete player:', err)
      return false
    }
  }, [])

  return {
    players,
    loading,
    error,
    fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
  }
}