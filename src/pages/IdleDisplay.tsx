import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, Trophy, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { KioskLayout } from '@/components/layout'
import { ScoreRow } from '@/components/display'
import { RealtimeScoreAlert } from '@/components/overlays'
import { useActiveGameModes } from '@/hooks/useActiveGameModes'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useRealtimeScores } from '@/hooks/useRealtimeScores'
import { useScoreDetails } from '@/hooks/useScoreDetails'
import type { RealtimeScoreData } from '@/hooks/useScoreDetails'
import { useKioskStore } from '@/stores/kioskStore'
import { getInitials, getPlayerColor } from '@/lib/utils'
import type { HighScore } from '@/lib/types'

// Static URL for the scoreboard - uses mDNS hostname
const SCOREBOARD_URL = 'http://scoreboard.local:4173'

/**
 * Format time in 12-hour format with AM/PM
 */
function formatTime(date: Date): string {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  
  hours = hours % 12
  hours = hours ? hours : 12 // 0 should be 12
  
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes
  
  return `${hours}:${minutesStr} ${ampm}`
}

/**
 * IdleDisplay - Auto-cycling carousel of game mode leaderboards
 *
 * Features:
 * - Auto-cycles through game modes with scores every 10 seconds
 * - Shows top 4 scores per mode
 * - Tap anywhere to navigate to browse mode
 * - Real-time score updates with toast alerts
 * - Smooth slide transitions between modes
 * - Clock display readable from across the room
 * - QR code for easy mobile access (tap to show/hide)
 * 
 * Responsive:
 * - Desktop/Kiosk: Fixed 800×480 layout
 * - Mobile: Full screen with scrollable content
 */
export function IdleDisplay() {
  const navigate = useNavigate()
  const { modes, loading: modesLoading, error: modesError } = useActiveGameModes()
  const cycleSpeedMs = useKioskStore((state) => state.cycleSpeedMs)

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentMode = modes[currentIndex]

  // Clock state - updates every minute
  const [currentTime, setCurrentTime] = useState(new Date())

  // QR code visibility state
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Updated useLeaderboard call with new signature: (gameId, modeId, detailId, limit)
  const { entries: scores, loading: scoresLoading, error: scoresError } = useLeaderboard(
    currentMode?.game_id || null,
    currentMode?.id || null,
    null, // detailId - not applicable in idle display
    4     // limit - show top 4
  )

  // Realtime alert state
  const [alertData, setAlertData] = useState<RealtimeScoreData | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const { fetchScoreDetails } = useScoreDetails()

  // Handle realtime score events
  const handleNewScore = useCallback(async (newScore: HighScore) => {
    console.log('New score received:', newScore)
    
    // Fetch full details for the alert
    const details = await fetchScoreDetails(newScore.id)
    
    if (details) {
      setAlertData(details)
      setShowAlert(true)
    }
  }, [fetchScoreDetails])

  useRealtimeScores(handleNewScore)

  // Close alert handler
  const handleCloseAlert = useCallback(() => {
    setShowAlert(false)
    // Clear data after animation completes
    setTimeout(() => setAlertData(null), 300)
  }, [])

  // Auto-cycle through modes
  useEffect(() => {
    if (modes.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % modes.length)
    }, cycleSpeedMs)

    return () => clearInterval(timer)
  }, [modes.length, cycleSpeedMs])

  // Handle tap to navigate
  const handleTap = () => {
    // Don't navigate if QR is showing - tap hides it instead
    if (showQR) {
      setShowQR(false)
      return
    }
    navigate('/browse')
  }

  // Toggle QR code visibility
  const handleQRToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowQR((prev) => !prev)
  }

  // Get game icon or generate fallback
  const gameInitials = currentMode?.game_name ? getInitials(currentMode.game_name) : ''
  const gameColor = currentMode?.game_name ? getPlayerColor(currentMode.game_name) : '#6b7280'

  // Error state for modes loading
  if (modesError) {
    return (
      <KioskLayout>
        <div className="h-full min-h-[480px] flex flex-col items-center justify-center p-md">
          <p className="text-xl text-red-500 mb-2">Connection Error</p>
          <p className="text-text-secondary text-sm text-center">{modesError.message}</p>
        </div>
      </KioskLayout>
    )
  }

  // Loading state
  if (modesLoading) {
    return (
      <KioskLayout>
        <div className="h-full min-h-[480px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-text-muted border-t-text-primary animate-spin" />
            <p className="text-text-secondary">Loading game modes...</p>
          </div>
        </div>
      </KioskLayout>
    )
  }

  // Empty state - no modes with scores
  if (modes.length === 0) {
    return (
      <KioskLayout>
        <div
          className="h-full min-h-[480px] flex flex-col items-center justify-center cursor-pointer p-md"
          onClick={handleTap}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Trophy className="w-16 h-16 text-medals-gold mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-xl text-text-primary mb-2">No scores yet!</p>
            <p className="text-text-secondary mb-6">Be the first to set a record</p>
            <p className="text-sm text-text-muted">Tap to browse games or add score</p>
          </motion.div>
        </div>
      </KioskLayout>
    )
  }

  return (
    <KioskLayout>
      <div
        className="h-full min-h-[480px] flex flex-col cursor-pointer relative"
        onClick={handleTap}
      >
        {/* Header: Game + Mode info + Clock */}
        <div className="idle-header">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3">
                {currentMode?.game_icon ? (
                  <img
                    src={currentMode.game_icon}
                    alt=""
                    className="w-10 h-10 rounded-lg shadow-card flex-shrink-0"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold text-white shadow-card flex-shrink-0"
                    style={{ backgroundColor: gameColor }}
                  >
                    {gameInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-text-primary truncate">
                    {currentMode?.game_name}
                  </h1>
                  <p className="text-sm text-text-secondary truncate">
                    {currentMode?.name}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Clock - readable from across the room */}
          <div className="text-xl font-mono font-bold text-text-secondary flex-shrink-0">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Leaderboard: Score rows */}
        <div className="flex-1 flex flex-col justify-center px-md py-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode?.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {scoresLoading ? (
                <div className="flex items-center justify-center h-[288px]">
                  <p className="text-text-secondary">Loading scores...</p>
                </div>
              ) : scoresError ? (
                <div className="flex flex-col items-center justify-center h-[288px] px-4">
                  <p className="text-red-500 mb-2">Error loading scores</p>
                  <p className="text-text-muted text-sm text-center">
                    {scoresError.message}
                  </p>
                </div>
              ) : scores.length === 0 ? (
                <div className="flex items-center justify-center h-[288px]">
                  <p className="text-text-secondary">No scores yet for this mode</p>
                </div>
              ) : (
                scores.slice(0, 4).map((entry, index) => (
                  <motion.div
                    key={entry.score_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ScoreRow
                      rank={entry.rank}
                      playerName={entry.player_name || 'Unknown'}
                      playerAvatar={entry.player_avatar}
                      score={entry.score}
                      scoreFormat={entry.effective_format}
                      scoreUnit={entry.effective_unit}
                      className="card"
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: Settings + hint/dots + QR toggle */}
        <div className="footer-height flex items-center justify-between px-md">
          {/* Settings button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate('/settings')
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-text-muted active:text-text-secondary active:bg-background-elevated transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          {/* Center content: hint + dots */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-text-muted hide-mobile">
              Tap to browse
            </p>
            {/* Progress dots */}
            {modes.length > 1 && (
              <div className="flex gap-1">
                {modes.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex 
                        ? 'bg-text-secondary w-4' 
                        : 'bg-background-elevated'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* QR code toggle button */}
          <button
            onClick={handleQRToggle}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              showQR 
                ? 'text-text-primary bg-background-elevated' 
                : 'text-text-muted active:text-text-secondary active:bg-background-elevated'
            }`}
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code overlay - shows in bottom right when toggled */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute bottom-16 right-4 p-4 rounded-xl card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white p-3 rounded-lg">
                <QRCodeSVG 
                  value={SCOREBOARD_URL}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-xs text-text-muted text-center mt-2">
                Scan to add scores
              </p>
              <p className="text-xs text-text-secondary text-center font-mono">
                scoreboard.local
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Realtime score alert */}
      {alertData && (
        <RealtimeScoreAlert
          isOpen={showAlert}
          onClose={handleCloseAlert}
          playerName={alertData.playerName}
          score={alertData.score}
          scoreFormat={alertData.scoreFormat}
          scoreUnit={alertData.scoreUnit}
          gameName={alertData.gameName}
          modeName={alertData.modeName ?? ''}
          rank={alertData.rank}
        />
      )}
    </KioskLayout>
  )
}