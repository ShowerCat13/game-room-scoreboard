import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Game } from '@/lib/types'

interface UseGameResult {
  game: Game | null
  loading: boolean
  error: Error | null
}

/**
 * useGame - Fetches a single game by ID
 *
 * @param gameId - The game UUID to fetch
 */
export function useGame(gameId: string | null): UseGameResult {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameId) {
      setGame(null)
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchGame() {
      if (!gameId) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('games')
          .select('id, name, platform, category, icon_url, sort_order')
          .eq('id', gameId)
          .single()

        if (queryError) throw queryError

        if (isMounted) {
          setGame(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch game'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchGame()
    return () => {
      isMounted = false
    }
  }, [gameId])

  return { game, loading, error }
}
