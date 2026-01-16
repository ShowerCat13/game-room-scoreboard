import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { formatScore, getMedalEmoji } from '@/lib/utils'
import { sounds } from '@/lib/sounds'
import type { ScoreFormat } from '@/lib/types'

interface RealtimeScoreAlertProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  score: number
  scoreFormat: ScoreFormat
  scoreUnit?: string | null
  gameName: string
  modeName: string
  rank: number
  autoCloseMs?: number
}

/**
 * RealtimeScoreAlert - Toast notification for scores arriving via realtime
 * Slides in from top, auto-dismisses after 5 seconds
 * Shows when someone submits a score from another device
 */
export function RealtimeScoreAlert({
  isOpen,
  onClose,
  playerName,
  score,
  scoreFormat,
  scoreUnit,
  gameName,
  modeName,
  rank,
  autoCloseMs = 5000,
}: RealtimeScoreAlertProps) {
  // Auto-close timer
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(timer)
  }, [isOpen, onClose, autoCloseMs])

  // Play sound when alert opens
  useEffect(() => {
    if (isOpen) {
      sounds.playScoreSound(rank)
    }
  }, [isOpen, rank])

  const isFirstPlace = rank === 1
  const medalEmoji = getMedalEmoji(rank)
  const formattedScore = formatScore(score, scoreFormat, scoreUnit)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={onClose}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 cursor-pointer"
        >
          <div 
            className="relative px-6 py-4 rounded-xl max-w-[700px]"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 37, 37, 0.98) 0%, rgba(26, 26, 26, 0.98) 100%)',
              boxShadow: isFirstPlace 
                ? '0 4px 24px rgba(255, 215, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 4px 24px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: isFirstPlace 
                ? '1px solid rgba(255, 215, 0, 0.3)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Glow effect for first place */}
            {isFirstPlace && (
              <div 
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at top, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                }}
              />
            )}

            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                ${isFirstPlace ? 'bg-yellow-500/20' : 'bg-blue-500/20'}
              `}>
                <Zap className={`w-6 h-6 ${isFirstPlace ? 'text-yellow-400' : 'text-blue-400'}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-base font-bold ${isFirstPlace ? 'text-gradient-gold' : 'text-text-primary'}`}>
                    {isFirstPlace ? 'NEW RECORD!' : 'New Score!'}
                  </span>
                  {medalEmoji && (
                    <span className="text-lg">{medalEmoji}</span>
                  )}
                </div>

                {/* Player and score */}
                <p className="text-sm text-text-primary truncate">
                  <span className="font-semibold">{playerName}</span>
                  <span className="text-text-secondary"> scored </span>
                  <span className="font-mono font-semibold">{formattedScore}</span>
                </p>

                {/* Game context */}
                <p className="text-xs text-text-muted truncate mt-0.5">
                  {gameName} — {modeName}
                </p>
              </div>

              {/* Rank badge */}
              <div className={`
                px-3 py-1 rounded-full text-sm font-bold flex-shrink-0
                ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : 
                  rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                  rank === 3 ? 'bg-orange-600/20 text-orange-400' :
                  'bg-background-elevated text-text-secondary'}
              `}>
                #{rank}
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: autoCloseMs / 1000, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl origin-left"
              style={{
                background: isFirstPlace 
                  ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.5), rgba(255, 215, 0, 0.2))'
                  : 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(59, 130, 246, 0.2))',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}