import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Game } from '@/lib/types'

interface UseGamesResult {
  games: Game[]
  loading: boolean
  error: Error | null
}

/**
 * useGames - Fetches games, optionally filtered by category
 *
 * @param category - Optional category to filter games
 */
export function useGames(category?: string): UseGamesResult {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchGames() {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('games')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        // Filter by category if provided
        if (category) {
          query = query.eq('category', category)
        }

        const { data, error: queryError } = await query

        if (queryError) throw queryError

        if (isMounted) {
          setGames((data as Game[]) || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch games'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchGames()
    return () => {
      isMounted = false
    }
  }, [category])

  return { games, loading, error }
}