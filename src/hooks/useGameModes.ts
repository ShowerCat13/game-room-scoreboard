import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameMode } from '@/lib/types'

interface UseGameModesResult {
  modes: GameMode[]
  loading: boolean
  error: Error | null
}

/**
 * useGameModes - Fetches all modes for a specific game
 *
 * @param gameId - The game UUID to fetch modes for
 */
export function useGameModes(gameId: string | null): UseGameModesResult {
  const [modes, setModes] = useState<GameMode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameId) {
      setModes([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchModes() {
      if (!gameId) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('game_modes')
          .select('*')
          .eq('game_id', gameId)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (queryError) throw queryError

        if (isMounted) {
          setModes(data || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch game modes'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchModes()
    return () => {
      isMounted = false
    }
  }, [gameId])

  return { modes, loading, error }
}
