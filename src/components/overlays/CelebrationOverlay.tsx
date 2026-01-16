import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatScore, getMedalEmoji } from '@/lib/utils'
import { sounds } from '@/lib/sounds'
import { useKioskStore } from '@/stores/kioskStore'
import type { ScoreFormat } from '@/lib/types'

interface CelebrationOverlayProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  score: number
  scoreFormat: ScoreFormat
  scoreUnit?: string | null
  rank: number
  autoCloseMs?: number
}

// Confetti particle component
function ConfettiParticle({ color }: { color: string }) {
  const randomX = useMemo(() => Math.random() * 100, [])
  const randomDelay = useMemo(() => Math.random() * 0.5, [])
  const randomDuration = useMemo(() => 2.5 + Math.random() * 1.5, [])
  const randomRotation = useMemo(() => Math.random() * 720 - 360, [])
  const randomSize = useMemo(() => 8 + Math.random() * 8, [])

  return (
    <motion.div
      initial={{ 
        y: -20, 
        x: `${randomX}vw`,
        rotate: 0,
        opacity: 1 
      }}
      animate={{ 
        y: '100vh',
        rotate: randomRotation,
        opacity: 0
      }}
      transition={{ 
        duration: randomDuration,
        delay: randomDelay,
        ease: 'easeIn'
      }}
      className="absolute top-0 pointer-events-none"
      style={{
        width: randomSize,
        height: randomSize * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
    />
  )
}

/**
 * CelebrationOverlay - Full-screen celebration after score submission
 * Features: Confetti particles, dramatic animations, auto-dismiss, sound effects
 */
export function CelebrationOverlay({
  isOpen,
  onClose,
  playerName,
  score,
  scoreFormat,
  scoreUnit,
  rank,
  autoCloseMs,
}: CelebrationOverlayProps) {
  const celebrationDurationMs = useKioskStore((state) => state.celebrationDurationMs)
  const duration = autoCloseMs ?? celebrationDurationMs

  // Auto-close timer
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [isOpen, onClose, duration])

  // Play sound when overlay opens
  useEffect(() => {
    if (isOpen) {
      sounds.playScoreSound(rank)
    }
  }, [isOpen, rank])

  const isFirstPlace = rank === 1
  const isPodium = rank <= 3
  const medalEmoji = getMedalEmoji(rank)
  const formattedScore = formatScore(score, scoreFormat, scoreUnit)

  // Confetti colors based on rank
  const confettiColors = isFirstPlace 
    ? ['#ffd700', '#ffed4a', '#fbbf24', '#f59e0b', '#ffffff']
    : isPodium
    ? ['#c0c0c0', '#e5e7eb', '#9ca3af', '#6b7280', '#ffffff']
    : ['#3b82f6', '#60a5fa', '#93c5fd', '#6366f1', '#ffffff']

  const getOrdinal = (n: number) => {
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
  }

  // Generate confetti particles
  const confettiCount = isFirstPlace ? 50 : isPodium ? 30 : 20
  const confettiParticles = useMemo(() => 
    Array.from({ length: confettiCount }, (_, i) => ({
      id: i,
      color: confettiColors[i % confettiColors.length]
    })), [confettiCount, isFirstPlace, isPodium]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiParticles.map(({ id, color }) => (
              <ConfettiParticle key={id} color={color} />
            ))}
          </div>

          {/* Glow effect behind content */}
          {isFirstPlace && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 0.5 }}
              className="absolute w-96 h-96 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
              }}
            />
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="text-center relative z-10"
          >
            {/* Title */}
            {isFirstPlace ? (
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 10 }}
              >
                <p className="text-xl font-bold text-gradient-gold mb-2">
                  🎉 NEW HIGH SCORE! 🎉
                </p>
              </motion.div>
            ) : (
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-text-primary mb-2"
              >
                Score Saved!
              </motion.p>
            )}

            {/* Player name */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-secondary mb-4"
            >
              {playerName}
            </motion.p>

            {/* Score */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', damping: 8, stiffness: 150 }}
              className={`text-xxl font-mono font-bold mb-4 ${isFirstPlace ? 'text-gradient-gold' : 'text-text-primary'}`}
              style={isFirstPlace ? {
                textShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
              } : undefined}
            >
              {formattedScore}
            </motion.div>

            {/* Rank badge */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 12 }}
              className={`
                text-lg font-semibold
                ${rank === 1 ? 'medal-gold' : rank === 2 ? 'medal-silver' : rank === 3 ? 'medal-bronze' : 'text-text-primary'}
              `}
            >
              {medalEmoji} {getOrdinal(rank)} Place!
            </motion.div>
          </motion.div>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-8 text-sm text-text-muted"
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}