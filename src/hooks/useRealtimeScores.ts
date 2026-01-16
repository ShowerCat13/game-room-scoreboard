import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { HighScore } from '@/lib/types'

/**
 * useRealtimeScores - Subscribes to high_scores INSERT events via Supabase Realtime
 * Triggers callback when a new score is added to the database
 *
 * @param onNewScore - Callback function that receives the new score data
 */
export function useRealtimeScores(onNewScore: (score: HighScore) => void) {
  useEffect(() => {
    // Create a channel for listening to high_scores changes
    const channel = supabase
      .channel('high_scores_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'high_scores',
        },
        (payload) => {
          // Payload.new contains the newly inserted row
          onNewScore(payload.new as HighScore)
        }
      )
      .subscribe()

    // Cleanup: remove channel on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [onNewScore])
}
