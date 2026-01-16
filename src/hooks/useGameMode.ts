import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameMode } from '@/lib/types'

interface UseGameModeResult {
  mode: GameMode | null
  loading: boolean
  error: Error | null
}

/**
 * useGameMode - Fetches a single game mode by ID
 *
 * @param modeId - The game mode UUID to fetch
 */
export function useGameMode(modeId: string | null): UseGameModeResult {
  const [mode, setMode] = useState<GameMode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!modeId) {
      setMode(null)
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchMode() {
      if (!modeId) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('game_modes')
          .select('*')
          .eq('id', modeId)
          .single()

        if (queryError) throw queryError

        if (isMounted) {
          setMode(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch game mode'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMode()
    return () => {
      isMounted = false
    }
  }, [modeId])

  return { mode, loading, error }
}
