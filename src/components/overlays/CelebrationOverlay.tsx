import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Sparkles, Ghost } from 'lucide-react'
import { formatScore } from '@/lib/utils'
import { sounds } from '@/lib/sounds'
import { useKioskStore } from '@/stores/kioskStore'
import type { ScoreFormat } from '@/lib/types'
import { JumpScare } from '@/components/haunt/JumpScare'

interface CelebrationOverlayProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  score: number
  scoreFormat: ScoreFormat
  scoreUnit?: string | null
  rank: number
  autoCloseMs?: number
  /** Optional line under the rank, e.g. "Your best is still 2:04.731" */
  note?: string | null
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

// Ghost that drifts up the screen (spooky theme replacement for confetti)
function GhostParticle({ color }: { color: string }) {
  const randomX = useMemo(() => Math.random() * 100, [])
  const randomDelay = useMemo(() => Math.random() * 0.8, [])
  const randomDuration = useMemo(() => 3 + Math.random() * 2, [])
  const randomSize = useMemo(() => 20 + Math.random() * 24, [])
  const randomSway = useMemo(() => (Math.random() - 0.5) * 60, [])

  return (
    <motion.div
      initial={{ y: '105vh', x: `${randomX}vw`, opacity: 0 }}
      animate={{
        y: '-10vh',
        x: [`${randomX}vw`, `calc(${randomX}vw + ${randomSway}px)`, `${randomX}vw`],
        opacity: [0, 0.9, 0.9, 0],
      }}
      transition={{ duration: randomDuration, delay: randomDelay, ease: 'easeOut' }}
      className="absolute top-0 pointer-events-none"
    >
      <Ghost style={{ width: randomSize, height: randomSize, color }} strokeWidth={1.5} />
    </motion.div>
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
  note,
}: CelebrationOverlayProps) {
  const celebrationDurationMs = useKioskStore((state) => state.celebrationDurationMs)
  const duration = autoCloseMs ?? celebrationDurationMs
  const isSpooky = useKioskStore((state) => state.themeId === 'spooky')
  const hauntScares = useKioskStore((state) => state.hauntScares)
  // Spooky theme: a new track record opens with a jump scare
  const scareFirst = isSpooky && hauntScares && rank === 1
  const [scaring, setScaring] = useState(false)
  useEffect(() => {
    if (isOpen && scareFirst) setScaring(true)
  }, [isOpen, scareFirst])

  // Auto-close timer (starts after any jump scare finishes)
  useEffect(() => {
    if (!isOpen || scaring) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [isOpen, onClose, duration, scaring])

  // Play sound when overlay opens
  useEffect(() => {
    // The jump scare brings its own sounds
    if (isOpen && !scareFirst) {
      sounds.playScoreSound(rank)
    }
  }, [isOpen, rank, scareFirst])

  const isFirstPlace = rank === 1
  const isPodium = rank <= 3
  const formattedScore = formatScore(score, scoreFormat, scoreUnit)

  // Get medal color class
  const getMedalColorClass = () => {
    switch (rank) {
      case 1: return 'text-medals-gold'
      case 2: return 'text-medals-silver'
      case 3: return 'text-medals-bronze'
      default: return 'text-text-primary'
    }
  }

  // Confetti colors based on rank
  const confettiColors = isSpooky
    ? ['#f1ecff', '#7dff9b', '#c77dff', '#ff8a1f', '#d6dcff']
    : isFirstPlace
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
    })), [confettiCount, isFirstPlace, isPodium, isSpooky]
  )

  // Fewer, larger particles for ghosts
  const particles = isSpooky ? confettiParticles.slice(0, Math.ceil(confettiCount / 2)) : confettiParticles

  return (
    <>
    {isOpen && scaring && <JumpScare onDone={() => setScaring(false)} />}
    <AnimatePresence>
      {isOpen && !scaring && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
          style={{
            // No backdrop blur: it's expensive on the Raspberry Pi GPU
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.97) 100%)',
          }}
        >
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(({ id, color }) =>
              isSpooky
                ? <GhostParticle key={id} color={color} />
                : <ConfettiParticle key={id} color={color} />
            )}
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
                className="flex items-center justify-center gap-3 mb-2"
              >
                <Sparkles className="w-6 h-6 text-medals-gold" />
                <p className={`text-xl font-bold ${isSpooky ? 'spooky-title' : 'text-gradient-gold'}`}>
                  {isSpooky ? 'BOO! NEW TRACK RECORD!' : 'NEW HIGH SCORE!'}
                </p>
                <Sparkles className="w-6 h-6 text-medals-gold" />
              </motion.div>
            ) : (
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-text-primary mb-2"
              >
                {isSpooky ? 'Boo! Time Saved!' : 'Score Saved!'}
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

            {/* Rank badge with icon */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 12 }}
              className={`
                flex items-center justify-center gap-2
                text-lg font-semibold
                ${rank === 1 ? 'medal-gold' : rank === 2 ? 'medal-silver' : rank === 3 ? 'medal-bronze' : 'text-text-primary'}
              `}
            >
              {isPodium ? (
                <Medal className={`w-6 h-6 ${getMedalColorClass()}`} fill="currentColor" fillOpacity={0.2} />
              ) : (
                <Trophy className="w-6 h-6 text-text-primary" />
              )}
              <span>{getOrdinal(rank)} Place!</span>
            </motion.div>

            {note && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-sm text-text-secondary mt-3"
              >
                {note}
              </motion.p>
            )}
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
    </>
  )
}
