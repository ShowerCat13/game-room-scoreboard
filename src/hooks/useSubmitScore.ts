import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface SubmitScoreParams {
  gameId: string
  modeId?: string | null
  detailId?: string | null
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

  const submitScore = useCallback(async ({ 
    gameId, 
    modeId, 
    detailId, 
    playerId, 
    score 
  }: SubmitScoreParams) => {
    try {
      if (isMountedRef.current) {
        setSubmitting(true)
        setError(null)
      }

      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('high_scores')
        .insert({
          game_id: gameId,
          mode_id: modeId || null,
          detail_id: detailId || null,
          player_id: playerId,
          score,
          metadata: {},
          achieved_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      return { success: true, scoreId: data?.id }
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