import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameMode } from '@/lib/types'

interface GameModeWithGame extends GameMode {
  game_name: string
  game_icon: string | null
  game_category: string
  game_sort_order?: number
}

interface UseActiveGameModesResult {
  modes: GameModeWithGame[]
  loading: boolean
  error: Error | null
}

// Type for the Supabase query response with nested relations
interface GameModeQueryResult extends GameMode {
  games: {
    name: string
    icon_url: string | null
    category: string
    sort_order: number
    is_active: boolean
  }
  high_scores: { id: string }[]
}

/**
 * useActiveGameModes - Fetches all game modes that have at least one score
 * Used by the carousel to know which modes to cycle through
 *
 * Returns modes with associated game data for display
 */
export function useActiveGameModes(): UseActiveGameModesResult {
  const [modes, setModes] = useState<GameModeWithGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchActiveGameModes() {
      try {
        setLoading(true)
        setError(null)

        // Query game_modes that have at least one high_score
        // Join with games to get game info, and use inner join to ensure scores exist
        // Note: PostgREST doesn't support filtering/ordering on joined tables with dot notation
        // so we fetch the data and filter/sort client-side
        const { data: modesData, error: queryError } = await supabase
          .from('game_modes')
          .select(`
            *,
            games!inner (
              name,
              icon_url,
              category,
              sort_order,
              is_active
            ),
            high_scores!inner (
              id
            )
          `)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (queryError) throw queryError

        if (isMounted && modesData) {
          // Filter out inactive games client-side
          const activeGameModes = modesData.filter(
            (mode: GameModeQueryResult) => mode.games.is_active
          )

          // Remove duplicates (since join with high_scores creates multiple rows)
          const uniqueModes = Array.from(
            new Map(
              activeGameModes.map((mode: GameModeQueryResult) => [
                mode.id,
                {
                  ...mode,
                  game_name: mode.games.name,
                  game_icon: mode.games.icon_url,
                  game_category: mode.games.category,
                  game_sort_order: mode.games.sort_order,
                  games: undefined, // Remove nested games object
                  high_scores: undefined, // Remove nested high_scores array
                },
              ])
            ).values()
          ) as GameModeWithGame[]

          // Sort by game order first, then mode order
          uniqueModes.sort((a, b) => {
            const gameOrder = (a.game_sort_order ?? 0) - (b.game_sort_order ?? 0)
            if (gameOrder !== 0) return gameOrder
            return (a.sort_order ?? 0) - (b.sort_order ?? 0)
          })

          setModes(uniqueModes)
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to fetch active game modes')
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchActiveGameModes()

    return () => {
      isMounted = false
    }
  }, [])

  return { modes, loading, error }
}
