// src/pages/PartyDisplay.tsx
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Ghost, Plus, Timer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { KioskLayout } from '@/components/layout'
import { ScoreRow } from '@/components/display'
import { RealtimeScoreAlert } from '@/components/overlays'
import { useBestTimesLeaderboard, fetchBestTimes } from '@/hooks/useBestTimesLeaderboard'
import { useRealtimeScores } from '@/hooks/useRealtimeScores'
import { useScoreDetails } from '@/hooks/useScoreDetails'
import type { RealtimeScoreData } from '@/hooks/useScoreDetails'
import { PARTY_EVENT, PARTY_ADD_SCORE_PATH } from '@/lib/event'
import type { HighScore } from '@/lib/types'

// Declare the global constant injected by Vite at build time
declare const __LOCAL_IP__: string

// Phones scanning the QR code land straight on the locked score form
const getQrUrl = () =>
  `http://${__LOCAL_IP__}:${window.location.port || '4173'}${PARTY_ADD_SCORE_PATH}`

// Rows that fit beside the QR panel on the 800×480 kiosk
const KIOSK_ROWS = 4

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * PartyDisplay - Halloween 2026 home screen
 *
 * A single Boo Cinema time trial leaderboard (best time per person),
 * with the phone QR code always visible and a large button for kiosk entry.
 * Replaces the multi-game carousel for the party.
 */
export function PartyDisplay() {
  const navigate = useNavigate()
  const { gameId, modeId, detailId } = PARTY_EVENT
  const { entries, loading, error, refetch } = useBestTimesLeaderboard(gameId, modeId, detailId)

  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  // Realtime alert for times submitted from phones
  const [alertData, setAlertData] = useState<RealtimeScoreData | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const { fetchScoreDetails } = useScoreDetails()

  const handleNewScore = useCallback(async (newScore: HighScore) => {
    if (newScore.detail_id !== detailId) return

    refetch()

    const [details, best] = await Promise.all([
      fetchScoreDetails(newScore.id),
      fetchBestTimes(gameId, modeId, detailId).catch(() => null),
    ])
    if (!details) return

    // Show the player's standing on the best-time board, not the raw attempt rank
    const standing = best?.find((e) => e.player_id === newScore.player_id)
    setAlertData({ ...details, rank: standing ? Number(standing.rank) : details.rank })
    setShowAlert(true)
  }, [fetchScoreDetails, refetch, gameId, modeId, detailId])

  useRealtimeScores(handleNewScore)

  const handleCloseAlert = useCallback(() => {
    setShowAlert(false)
    setTimeout(() => setAlertData(null), 300)
  }, [])

  const visibleEntries = entries.slice(0, KIOSK_ROWS)
  const hiddenCount = entries.length - visibleEntries.length

  const renderBoard = (rows: typeof entries) => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-text-secondary">Summoning the leaderboard...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="h-full flex flex-col items-center justify-center px-4 text-center">
          <p className="text-red-500 mb-2">Can't reach the scoreboard</p>
          <p className="text-text-muted text-sm">{error.message}</p>
        </div>
      )
    }

    if (rows.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center py-8">
          <Ghost className="w-14 h-14 text-accent-primary mb-3 party-float" strokeWidth={1.5} />
          <p className="text-lg text-text-primary">No times yet...</p>
          <p className="text-text-secondary">Be the first to brave Boo Cinema</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {rows.map((entry, index) => (
          <motion.div
            key={entry.player_id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ScoreRow
              rank={Number(entry.rank)}
              playerName={entry.player_name || 'Unknown'}
              playerAvatar={entry.player_avatar}
              score={entry.score}
              scoreFormat={entry.effective_format}
              scoreUnit={entry.effective_unit || undefined}
              className="card"
            />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <KioskLayout>
      <div className="h-full flex flex-col relative mobile:min-h-[100dvh]">
        {/* Header */}
        <div className="idle-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background-elevated">
              <Ghost className="w-6 h-6 text-accent-primary party-float" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary leading-tight">
                {PARTY_EVENT.title}
              </h1>
              <p className="text-sm text-text-secondary">{PARTY_EVENT.subtitle}</p>
            </div>
          </div>
          <div className="font-mono font-bold text-text-secondary text-xxl hide-mobile">
            {formatClock(currentTime)}
          </div>
        </div>

        {/* Body: leaderboard + entry panel */}
        <div className="flex-1 flex gap-md px-md py-3 min-h-0 mobile:flex-col">
          {/* Leaderboard */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Kiosk: top rows only */}
            <div className="flex-1 hide-mobile">{renderBoard(visibleEntries)}</div>
            {hiddenCount > 0 && (
              <p className="text-xs text-text-muted text-center pt-1 hide-mobile">
                +{hiddenCount} more {hiddenCount === 1 ? 'racer' : 'racers'} in the shadows
              </p>
            )}
            {/* Phones: full list */}
            <div className="show-mobile">{renderBoard(entries)}</div>
          </div>

          {/* Entry panel */}
          <div className="w-[220px] flex-shrink-0 flex flex-col items-center justify-between gap-3 mobile:w-full mobile:order-first">
            <div className="card w-full p-3 flex flex-col items-center hide-mobile">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={getQrUrl()} size={148} level="M" includeMargin={false} />
              </div>
              <p className="text-sm text-text-primary font-semibold mt-2">Scan to add your time</p>
              <p className="text-xs text-text-muted">Phone must be on the party Wi-Fi</p>
            </div>

            <button
              onClick={() => navigate(PARTY_ADD_SCORE_PATH)}
              className="w-full h-[64px] rounded-lg text-lg font-bold flex items-center justify-center gap-2 party-cta active:scale-[0.98] transition-transform"
            >
              <Plus className="w-6 h-6" />
              Add your time
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="h-[36px] px-md flex items-center justify-between border-t border-background-elevated/50">
          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            className="w-9 h-9 flex items-center justify-center text-text-muted active:text-text-primary transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          <p className="text-xs text-text-muted flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" />
            {entries.length} {entries.length === 1 ? 'racer' : 'racers'} · best time counts
          </p>
          <div className="w-9" />
        </div>
      </div>

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
