// src/pages/IdleDisplay.tsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, Trophy, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { KioskLayout } from '@/components/layout'
import { ScoreRow } from '@/components/display'
import { RealtimeScoreAlert } from '@/components/overlays'
import { useCarouselItems } from '@/hooks/useCarouselItems'
import type { CarouselItem } from '@/hooks/useCarouselItems'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useRealtimeScores } from '@/hooks/useRealtimeScores'
import { useScoreDetails } from '@/hooks/useScoreDetails'
import type { RealtimeScoreData } from '@/hooks/useScoreDetails'
import { useKioskStore } from '@/stores/kioskStore'
import { getInitials, getPlayerColor } from '@/lib/utils'
import type { HighScore } from '@/lib/types'

// Declare the global constant injected by Vite at build time
declare const __LOCAL_IP__: string

// Build QR URL using the IP address detected by Vite at startup
const getQrUrl = () => `http://${__LOCAL_IP__}:${window.location.port || '4173'}`

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
 * Build the subtitle for a carousel item
 * Shows mode name, and detail name if applicable
 */
function buildSubtitle(item: CarouselItem): string {
  const parts: string[] = []
  
  if (item.mode_name) {
    parts.push(item.mode_name)
  }
  
  if (item.detail_name) {
    parts.push(item.detail_name)
  }
  
  return parts.join(' - ')
}

/**
 * IdleDisplay - Auto-cycling carousel of game leaderboards
 *
 * Features:
 * - Auto-cycles through game/mode/detail combinations with scores every 10 seconds
 * - For games WITH details: shows separate entries per detail (e.g., each golf course)
 * - For games WITHOUT details: shows one entry per mode
 * - Shows top 4 scores per entry
 * - Tap anywhere to navigate to browse mode
 * - Real-time score updates with toast alerts
 * - Smooth slide transitions between entries
 * - Clock display readable from across the room
 * - QR code for easy mobile access (tap to show/hide)
 */
export function IdleDisplay() {
  const navigate = useNavigate()
  const { items, loading: itemsLoading, error: itemsError, refetch } = useCarouselItems()
  const cycleSpeedMs = useKioskStore((state) => state.cycleSpeedMs)

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentItem = items[currentIndex]

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

  // Fetch leaderboard for current carousel item
  // Now includes detail_id for proper filtering
  const { entries: scores, loading: scoresLoading, error: scoresError } = useLeaderboard(
    currentItem?.game_id || null,
    currentItem?.mode_id || null,
    currentItem?.detail_id || null,
    4 // limit - show top 4
  )

  // Realtime alert state
  const [alertData, setAlertData] = useState<RealtimeScoreData | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const { fetchScoreDetails } = useScoreDetails()

  // Handle realtime score events
  const handleNewScore = useCallback(async (newScore: HighScore) => {
    
    // Fetch full details for the alert
    const details = await fetchScoreDetails(newScore.id)
    
    if (details) {
      setAlertData(details)
      setShowAlert(true)
    }

    // Refetch carousel items to include any new game/mode/detail combinations
    // and to ensure the leaderboard reflects the new score
    refetch()
  }, [fetchScoreDetails, refetch])

  useRealtimeScores(handleNewScore)

  // Close alert handler
  const handleCloseAlert = useCallback(() => {
    setShowAlert(false)
    // Clear data after animation completes
    setTimeout(() => setAlertData(null), 300)
  }, [])

  // Auto-cycle through items
  useEffect(() => {
    if (items.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, cycleSpeedMs)

    return () => clearInterval(timer)
  }, [items.length, cycleSpeedMs])

  // Reset index if it's out of bounds after refetch
  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(0)
    }
  }, [items.length, currentIndex])

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

  // Navigate to settings
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate('/settings')
  }

  // Get game icon or generate fallback
  const gameInitials = currentItem?.game_name ? getInitials(currentItem.game_name) : ''
  const gameColor = currentItem?.game_name ? getPlayerColor(currentItem.game_name) : '#6b7280'

  // Error state for items loading
  if (itemsError) {
    return (
      <KioskLayout>
        <div className="h-full flex flex-col items-center justify-center">
          <p className="text-xl text-red-500 mb-2">Connection Error</p>
          <p className="text-text-secondary text-sm">{itemsError.message}</p>
        </div>
      </KioskLayout>
    )
  }

  // Loading state
  if (itemsLoading) {
    return (
      <KioskLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-text-muted border-t-text-primary animate-spin" />
            <p className="text-text-secondary">Loading leaderboards...</p>
          </div>
        </div>
      </KioskLayout>
    )
  }

  // Empty state - no items with scores
  if (items.length === 0) {
    return (
      <KioskLayout>
        <div
          className="h-full flex flex-col items-center justify-center cursor-pointer"
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
        className="h-full flex flex-col cursor-pointer relative"
        onClick={handleTap}
      >
        {/* Header: Game + Mode/Detail info + Clock */}
        <div className="idle-header">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem?.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3">
                {currentItem?.game_icon ? (
                  <img
                    src={currentItem.game_icon}
                    alt=""
                    className="w-10 h-10 rounded-lg shadow-card"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold text-white shadow-card"
                    style={{ backgroundColor: gameColor }}
                  >
                    {gameInitials}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-text-primary">
                    {currentItem?.game_name}
                  </h1>
                  <p className="text-sm text-text-secondary">
                    {buildSubtitle(currentItem)}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Clock - ENLARGED for readability from across the room */}
          <div className="font-mono font-bold text-text-secondary" style={{ fontSize: '48px' }}>
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Leaderboard: Score rows */}
        <div className="flex-1 flex flex-col justify-center px-md py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem?.key}
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
                <div className="flex flex-col items-center justify-center h-[288px]">
                  <Trophy className="w-12 h-12 text-text-muted mb-3" strokeWidth={1.5} />
                  <p className="text-text-secondary">No scores for this leaderboard</p>
                  <p className="text-sm text-text-muted mt-1">Tap to add the first score!</p>
                </div>
              ) : (
                scores.map((entry, index) => (
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
                      scoreUnit={entry.effective_unit || undefined}
                      className="card"
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: Settings + Tap hint + QR toggle */}
        <div className="h-[40px] px-md flex items-center justify-between border-t border-background-elevated/50">
          {/* Settings button */}
          <button
            onClick={handleSettingsClick}
            className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          {/* Tap hint */}
          <p className="text-sm text-text-muted">Tap to browse</p>

          {/* QR code toggle */}
          <button
            onClick={handleQRToggle}
            className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary transition-colors"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel indicator dots */}
        {items.length > 1 && (
          <div className="absolute bottom-[48px] left-0 right-0 flex justify-center gap-1.5">
            {items.map((item, index) => (
              <div
                key={item.key}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-text-primary w-3'
                    : 'bg-text-muted'
                }`}
              />
            ))}
          </div>
        )}

        {/* QR Code overlay */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center"
              onClick={() => setShowQR(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white p-6 rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <QRCodeSVG
                  value={getQrUrl()}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
                <p className="text-center text-black text-sm mt-4 font-medium">
                  Scan to access on your phone
                </p>
                <p className="text-center text-gray-500 text-xs mt-1">
                  {getQrUrl()}
                </p>
              </motion.div>
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
          scoreUnit={alertData.scoreUnit ?? ''}
          gameName={alertData.gameName}
          modeName={alertData.modeName ?? ''}
          detailName={alertData.detailName ?? ''}
          rank={alertData.rank}
        />
      )}
    </KioskLayout>
  )
}