import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Player } from '@/lib/types'

interface UsePlayersResult {
  players: Player[]
  loading: boolean
  error: Error | null
  createPlayer: (name: string, avatarUrl?: string | null, pin?: string | null) => Promise<Player | null>
  refetch: () => void
}

/**
 * usePlayers - Fetches all players and provides player creation
 */
export function usePlayers(): UsePlayersResult {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initial fetch with isMounted pattern
  useEffect(() => {
    let isMounted = true

    async function fetchPlayers() {
      try {
        setLoading(true)
        setError(null)
		
		// Supabase client type inference fails for insert operations with manual Database types.
		// See: https://github.com/supabase/supabase-js/issues/...
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: queryError } = await supabase
          .from('players')
          .select('*')
          .order('name', { ascending: true })

        if (!isMounted) return
        if (queryError) throw queryError
        setPlayers(data || [])
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err : new Error('Failed to fetch players'))
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPlayers()
    return () => {
      isMounted = false
    }
  }, [])

  // Refetch function for manual refetching (user-initiated)
  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

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
    avatarUrl?: string | null,
    pin?: string | null
  ): Promise<Player | null> => {
    try {
      // Guests create players through the create_player RPC (see supabase/security.sql),
      // which validates input and stores the optional profile PIN server-side
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any).rpc('create_player', {
        p_name: name,
        p_avatar_url: avatarUrl || null,
        p_pin: pin || null,
      })

      if (insertError) throw insertError

      const newPlayer = data as Player
      setPlayers((prev) => [...prev, newPlayer].sort((a, b) => a.name.localeCompare(b.name)))
      return newPlayer
    } catch (err) {
      console.error('Failed to create player:', err)
      return null
    }
  }, [])

  return { players, loading, error, createPlayer, refetch }
}
