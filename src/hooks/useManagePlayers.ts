import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { dbError, NOT_SAVED } from '@/lib/dbErrors'
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
 * Saves and deletes throw an Error with a readable message when they fail.
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
      setError(dbError(err))
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
      throw dbError(err)
    }
  }, [])

  const updatePlayer = useCallback(async (
    id: string,
    name: string,
    avatarUrl?: string | null
  ): Promise<boolean> => {
    try {
      const { data: changed, error: updateError } = await (supabase as any)
        .from('players')
        .update({ name, avatar_url: avatarUrl })
        .eq('id', id)
        .select('id')

      if (updateError) throw updateError
      if (!changed?.length) throw new Error(NOT_SAVED)
      
      // Update local state
      setPlayers(prev => 
        prev.map(p => p.id === id ? { ...p, name, avatar_url: avatarUrl ?? p.avatar_url } : p)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      return true
    } catch (err) {
      console.error('Failed to update player:', err)
      throw dbError(err)
    }
  }, [])

  const deletePlayer = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { data: changed, error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', id)
        .select('id')

      if (deleteError) throw deleteError
      if (!changed?.length) throw new Error(NOT_SAVED)
      
      // Update local state
      setPlayers(prev => prev.filter(p => p.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete player:', err)
      throw dbError(err)
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