import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameDetail } from '@/lib/types'

interface UseGameDetailsResult {
  details: GameDetail[]
  loading: boolean
  error: Error | null
}

/**
 * useGameDetails - Fetches details for a game, optionally filtered by mode
 *
 * @param gameId - The game UUID to fetch details for
 * @param modeId - Optional mode UUID to filter details (null = shared details only)
 */
export function useGameDetails(
  gameId: string | null,
  modeId?: string | null
): UseGameDetailsResult {
  const [details, setDetails] = useState<GameDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameId) {
      setDetails([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchDetails() {
      if (!gameId) return

      try {
        setLoading(true)
        setError(null)

        // Build query for details that are either:
        // 1. Shared (mode_id is null) - available for all modes
        // 2. Specific to the selected mode (mode_id matches)
        let query = supabase
          .from('game_details')
          .select('*')
          .eq('game_id', gameId)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        // If a mode is selected, get shared details + mode-specific details
        if (modeId) {
          query = query.or(`mode_id.is.null,mode_id.eq.${modeId}`)
        } else {
          // No mode selected - only get shared details
          query = query.is('mode_id', null)
        }

        const { data, error: queryError } = await query

        if (queryError) throw queryError

        if (isMounted) {
          setDetails((data as GameDetail[]) || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch game details'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDetails()
    return () => {
      isMounted = false
    }
  }, [gameId, modeId])

  return { details, loading, error }
}