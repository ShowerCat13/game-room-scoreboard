import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface SubmitScoreParams {
  gameModeId: string
  playerId: string
  score: number
}

interface SubmitScoreResult {
  submitting: boolean
  error: Error | null
  submitScore: (params: SubmitScoreParams) => Promise<{ success: boolean; scoreId?: string }>
}

/**
 * useSubmitScore - Handles score submission to Supabase
 */
export function useSubmitScore(): SubmitScoreResult {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const submitScore = useCallback(async ({ gameModeId, playerId, score }: SubmitScoreParams) => {
    try {
      if (isMountedRef.current) {
        setSubmitting(true)
        setError(null)
      }

      
	  // Supabase client type inference fails for insert operations with manual Database types.
	  // This is a known limitation - the workaround is localized and type-safe on the result side.
	  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('high_scores')
        .insert({
          game_mode_id: gameModeId,
          player_id: playerId,
          team_id: null,
          score,
          metadata: {},
          achieved_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      const result = data as { id: string }
      return { success: true, scoreId: result.id }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit score')
      if (isMountedRef.current) {
        setError(error)
      }
      return { success: false }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false)
      }
    }
  }, [])

  return { submitting, error, submitScore }
}
