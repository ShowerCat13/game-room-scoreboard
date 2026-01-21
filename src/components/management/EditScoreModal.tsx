import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { TimeInput, NumericInput } from '@/components/input'
import { formatScore } from '@/lib/utils'
import type { ScoreFormat } from '@/lib/types'

interface EditScoreModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newScore: number) => Promise<boolean>
  currentScore: number
  scoreFormat: ScoreFormat
  scoreUnit: string | null
  playerName: string
  gameName: string
  modeName?: string | null
  detailName?: string | null
}

/**
 * EditScoreModal - Modal for editing an existing score
 * 
 * Features:
 * - Displays appropriate input based on score_format (time, numeric, etc.)
 * - Shows current score value
 * - Context info (player, game, mode, detail)
 * - Save/Cancel buttons with 56px touch targets
 */
export function EditScoreModal({
  isOpen,
  onClose,
  onSave,
  currentScore,
  scoreFormat,
  scoreUnit,
  playerName,
  gameName,
  modeName,
  detailName,
}: EditScoreModalProps) {
  const [newScore, setNewScore] = useState<number | null>(currentScore)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset score when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setNewScore(currentScore)
      setError(null)
    }
  }, [isOpen, currentScore])

  const handleSave = async () => {
    if (newScore === null) {
      setError('Please enter a score')
      return
    }

    setSaving(true)
    setError(null)

    const success = await onSave(newScore)
    
    if (success) {
      onClose()
    } else {
      setError('Failed to save score')
    }
    
    setSaving(false)
  }

  const handleClose = () => {
    if (!saving) {
      onClose()
    }
  }

  // Render the appropriate input based on score format
  const renderScoreInput = () => {
    switch (scoreFormat) {
      case 'time_ms':
        return (
          <TimeInput
            value={newScore}
            onChange={setNewScore}
            showMilliseconds={true}
          />
        )

      case 'time_seconds':
        return (
          <TimeInput
            value={newScore}
            onChange={setNewScore}
            showMilliseconds={false}
          />
        )

      case 'decimal_2':
        return (
          <NumericInput
            value={newScore}
            onChange={setNewScore}
            unit={scoreUnit}
            isDecimal={true}
          />
        )

      case 'golf_relative':
        return (
          <NumericInput
            value={newScore}
            onChange={setNewScore}
            unit={scoreUnit}
            isDecimal={false}
            allowNegative={true}
          />
        )

      case 'integer':
      case 'level':
      default:
        return (
          <NumericInput
            value={newScore}
            onChange={setNewScore}
            unit={scoreUnit}
            isDecimal={false}
          />
        )
    }
  }

  // Build context string
  const contextParts = [gameName]
  if (modeName) contextParts.push(modeName)
  if (detailName) contextParts.push(detailName)
  const contextString = contextParts.join(' • ')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] bg-background-card rounded-xl overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header */}
            <div className="h-[56px] px-md flex items-center justify-between border-b border-background-elevated">
              <h2 className="text-lg font-bold text-text-primary">Edit Score</h2>
              <button
                onClick={handleClose}
                disabled={saving}
                className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-md space-y-4">
              {/* Context info */}
              <div className="text-center">
                <p className="text-base font-semibold text-text-primary">{playerName}</p>
                <p className="text-sm text-text-muted">{contextString}</p>
              </div>

              {/* Current score display */}
              <div className="text-center py-2">
                <p className="text-xs text-text-muted mb-1">Current Score</p>
                <p className="text-lg font-mono text-text-secondary">
                  {formatScore(currentScore, scoreFormat, scoreUnit)}
                </p>
              </div>

              {/* Score input */}
              <div>
                <p className="text-sm text-text-secondary mb-3 text-center">
                  {scoreFormat.includes('time') ? 'Enter new time' : 'Enter new score'}
                </p>
                {renderScoreInput()}
              </div>

              {/* Error display */}
              {error && (
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-red-500 text-center text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="flex-1 h-[56px] bg-background-elevated text-text-primary font-semibold rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || newScore === null}
                  className="flex-1 h-[56px] bg-category-golf text-white font-semibold rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}