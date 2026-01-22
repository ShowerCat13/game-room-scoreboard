// src/hooks/useCarouselItems.ts
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Represents a single item in the idle carousel.
 * For games WITH details: one item per (mode, detail) combination
 * For games WITHOUT details: one item per mode
 */
export interface CarouselItem {
  // Unique key for React and deduplication
  key: string
  
  // Game info
  game_id: string
  game_name: string
  game_icon: string | null
  game_category: string
  game_has_details: boolean
  game_sort_order: number
  
  // Mode info (may be null for games without modes)
  mode_id: string | null
  mode_name: string | null
  mode_sort_order: number
  
  // Detail info (only populated for games with has_details=true)
  detail_id: string | null
  detail_name: string | null
  detail_sort_order: number
}

interface UseCarouselItemsResult {
  items: CarouselItem[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Type for the raw Supabase query response
interface ScoreQueryResult {
  game_id: string
  mode_id: string | null
  detail_id: string | null
  games: {
    name: string
    icon_url: string | null
    category: string
    has_details: boolean
    sort_order: number
    is_active: boolean
  }
  game_modes: {
    name: string
    sort_order: number
    is_active: boolean
  } | null
  game_details: {
    name: string
    sort_order: number
    is_active: boolean
  } | null
}

/**
 * useCarouselItems - Fetches unique carousel entries based on scores
 * 
 * Groups scores appropriately:
 * - Games WITH has_details=true: one entry per (game, mode, detail)
 * - Games WITHOUT details: one entry per (game, mode)
 * 
 * Used by IdleDisplay for the auto-cycling carousel.
 */
export function useCarouselItems(): UseCarouselItemsResult {
  const [items, setItems] = useState<CarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Query all high scores with their related game/mode/detail data
      // We'll deduplicate and group client-side for flexibility
      const { data, error: queryError } = await supabase
        .from('high_scores')
        .select(`
          game_id,
          mode_id,
          detail_id,
          games!inner (
            name,
            icon_url,
            category,
            has_details,
            sort_order,
            is_active
          ),
          game_modes (
            name,
            sort_order,
            is_active
          ),
          game_details (
            name,
            sort_order,
            is_active
          )
        `)

      if (queryError) throw queryError

      // Build unique carousel items using a Map for deduplication
      const itemMap = new Map<string, CarouselItem>()

      for (const score of (data as ScoreQueryResult[]) || []) {
        const game = score.games
        const mode = score.game_modes
        const detail = score.game_details

        // Skip if game is inactive
        if (!game?.is_active) continue
        
        // Skip if mode exists but is inactive
        if (mode && !mode.is_active) continue
        
        // Skip if detail exists but is inactive
        if (detail && !detail.is_active) continue

        // Determine the grouping key based on game configuration
        // For games WITH details: include detail_id in key
        // For games WITHOUT details: only use game_id and mode_id
        let key: string
        let effectiveDetailId: string | null = null
        let effectiveDetailName: string | null = null
        let effectiveDetailSortOrder = 0

        if (game.has_details && score.detail_id) {
          // Game has details - create separate entry for each detail
          key = `${score.game_id}::${score.mode_id || 'null'}::${score.detail_id}`
          effectiveDetailId = score.detail_id
          effectiveDetailName = detail?.name || null
          effectiveDetailSortOrder = detail?.sort_order ?? 0
        } else {
          // Game doesn't have details - group all scores under mode
          key = `${score.game_id}::${score.mode_id || 'null'}::null`
        }

        // Only add if we haven't seen this combination yet
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            key,
            game_id: score.game_id,
            game_name: game.name,
            game_icon: game.icon_url,
            game_category: game.category,
            game_has_details: game.has_details,
            game_sort_order: game.sort_order ?? 0,
            mode_id: score.mode_id,
            mode_name: mode?.name || null,
            mode_sort_order: mode?.sort_order ?? 0,
            detail_id: effectiveDetailId,
            detail_name: effectiveDetailName,
            detail_sort_order: effectiveDetailSortOrder,
          })
        }
      }

      // Sort by game order → mode order → detail order
      const sortedItems = Array.from(itemMap.values()).sort((a, b) => {
        // First by game sort order
        const gameOrder = a.game_sort_order - b.game_sort_order
        if (gameOrder !== 0) return gameOrder
        
        // Then by mode sort order
        const modeOrder = a.mode_sort_order - b.mode_sort_order
        if (modeOrder !== 0) return modeOrder
        
        // Finally by detail sort order
        return a.detail_sort_order - b.detail_sort_order
      })

      setItems(sortedItems)
    } catch (err) {
      console.error('Failed to fetch carousel items:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch carousel items'))
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return { 
    items, 
    loading, 
    error, 
    refetch: fetchItems 
  }
}