// src/pages/PartyDisplay.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, Ghost, Plus, Timer, UserPen } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { KioskLayout } from '@/components/layout'
import { ScoreRow } from '@/components/display'
import { RealtimeScoreAlert } from '@/components/overlays'
import { useBestTimesLeaderboard, fetchBestTimes } from '@/hooks/useBestTimesLeaderboard'
import { useRealtimeScores } from '@/hooks/useRealtimeScores'
import { useScoreDetails } from '@/hooks/useScoreDetails'
import type { RealtimeScoreData } from '@/hooks/useScoreDetails'
import { PARTY_EVENT, PARTY_ADD_SCORE_PATH } from '@/lib/event'
import { HauntLayer } from '@/components/haunt/HauntLayer'
import { HAUNT_NET_EVENT, triggerJumpScare } from '@/lib/haunt/scare'
import type { HauntNetDetail } from '@/lib/haunt/scare'
import { useHauntNet } from '@/hooks/useHauntNet'
import { useKioskStore } from '@/stores/kioskStore'
import { usePlayers } from '@/hooks/usePlayers'
import { PickerModal, EditProfileFlow } from '@/components/input'
import type { Player } from '@/lib/types'
import type { HighScore } from '@/lib/types'

// Declare the global constant injected by Vite at build time
declare const __LOCAL_IP__: string

// Phones scanning the QR code land straight on the locked score form
const getQrUrl = () =>
  `http://${__LOCAL_IP__}:${window.location.port || '4173'}${PARTY_ADD_SCORE_PATH}`

// Rows that fit beside the QR panel on the 800×480 kiosk
const KIOSK_ROWS = 4
// How long each page of the kiosk leaderboard stays up
const PAGE_MS = 8000
// How long a haunt victim's name reads DECEASED
const DECEASED_MS = 8000

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
  const isSpooky = useKioskStore((state) => state.themeId === 'spooky')

  // Edit profile (PIN-protected, see EditProfileFlow)
  const { players, refetch: refetchPlayers } = usePlayers()
  const [pickingProfile, setPickingProfile] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

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

    // New track record from a phone: scare the room
    if (standing && Number(standing.rank) === 1 && standing.score_id === newScore.id) {
      triggerJumpScare()
    }
  }, [fetchScoreDetails, refetch, gameId, modeId, detailId])

  useRealtimeScores(handleNewScore)

  const handleCloseAlert = useCallback(() => {
    setShowAlert(false)
    setTimeout(() => setAlertData(null), 300)
  }, [])

  // Page through everyone on the kiosk so every racer gets screen time
  const pageCount = Math.max(1, Math.ceil(entries.length / KIOSK_ROWS))
  const [page, setPage] = useState(0)
  // haunt-net victim whose name reads DECEASED (paging holds while it does)
  const [deceasedId, setDeceasedId] = useState<string | null>(null)
  useEffect(() => {
    if (pageCount <= 1) {
      setPage(0)
      return
    }
    if (deceasedId) return
    const timer = setInterval(() => setPage((p) => (p + 1) % pageCount), PAGE_MS)
    return () => clearInterval(timer)
  }, [pageCount, deceasedId])
  const currentPage = page % pageCount
  const visibleEntries = entries.slice(currentPage * KIOSK_ROWS, (currentPage + 1) * KIOSK_ROWS)

  // haunt-net: join the hub while the haunt is showing (HauntLayer plays the
  // effects); on a dread or terror haunt, glitch the victim's name if on screen
  useHauntNet(isSpooky)
  const visibleRef = useRef(visibleEntries)
  visibleRef.current = visibleEntries
  useEffect(() => {
    if (!isSpooky) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const onNetHaunt = (e: Event) => {
      const { victim, intensity } = (e as CustomEvent<HauntNetDetail>).detail
      if (!victim || intensity < 2) return
      const name = victim.toLowerCase()
      const entry = visibleRef.current.find((v) => v.player_name?.trim().toLowerCase() === name)
      if (!entry) return
      clearTimeout(timer)
      setDeceasedId(entry.player_id)
      timer = setTimeout(() => setDeceasedId(null), DECEASED_MS)
    }
    window.addEventListener(HAUNT_NET_EVENT, onNetHaunt)
    return () => {
      window.removeEventListener(HAUNT_NET_EVENT, onNetHaunt)
      clearTimeout(timer)
    }
  }, [isSpooky])

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
            className="relative"
          >
            {isSpooky && entries.length >= 3 && entry.player_id === entries[entries.length - 1].player_id && (
              <span className="tombstone-tag absolute top-0.5 left-1/2 -translate-x-1/2 text-xs z-10">
                Dead last
              </span>
            )}
            <ScoreRow
              rank={Number(entry.rank)}
              playerName={entry.player_name || 'Unknown'}
              displayName={entry.player_id === deceasedId ? 'DECEASED' : undefined}
              playerAvatar={entry.player_avatar}
              score={entry.score}
              scoreFormat={entry.effective_format}
              scoreUnit={entry.effective_unit || undefined}
              className={`${isSpooky ? 'card tombstone' : 'card'}${entry.player_id === deceasedId ? ' haunt-deceased' : ''}`}
            />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <KioskLayout>
      {isSpooky && <HauntLayer />}
      <div className="h-full flex flex-col relative z-10 mobile:min-h-[100dvh]">
        {/* Header */}
        <div className="idle-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background-elevated">
              <Ghost className="w-6 h-6 text-accent-primary party-float" />
            </div>
            <div>
              <h1 className="spooky-title text-xl font-bold text-text-primary leading-tight">
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
            {/* Kiosk: one page of rows at a time */}
            <div className="flex-1 hide-mobile">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderBoard(visibleEntries)}
                </motion.div>
              </AnimatePresence>
            </div>
            {pageCount > 1 && (
              // .hide-mobile forces display:block, so the flex row lives inside it
              <div className="hide-mobile pt-2">
                <div className="flex items-center justify-center gap-1.5">
                  {Array.from({ length: pageCount }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentPage ? 'w-4 bg-accent-primary' : 'w-1.5 bg-text-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Phones: full list */}
            <div className="show-mobile">{renderBoard(entries)}</div>
          </div>

          {/* Entry panel */}
          <div className="w-[220px] flex-shrink-0 flex flex-col items-center justify-between gap-3 mobile:w-full mobile:order-first">
            {/* .hide-mobile forces display:block, so centering lives on an inner flex column */}
            <div className="card w-full p-3 hide-mobile">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white p-2 rounded-lg leading-none">
                  <QRCodeSVG value={getQrUrl()} size={148} level="M" includeMargin={false} className="block" />
                </div>
                <p className="text-sm text-text-primary font-semibold mt-2">Scan to add your time</p>
                <p className="text-xs text-text-muted">Phone must be on the party Wi-Fi</p>
              </div>
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
          <button
            onClick={() => setPickingProfile(true)}
            className="h-9 px-2 flex items-center gap-1 text-xs text-text-muted active:text-text-primary transition-colors"
          >
            <UserPen className="w-4 h-4" />
            Edit profile
          </button>
        </div>
      </div>

      <PickerModal
        isOpen={pickingProfile}
        onClose={() => setPickingProfile(false)}
        title="Whose profile?"
        options={players.map((p) => ({ id: p.id, label: p.name }))}
        selectedId={null}
        onSelect={(id) => {
          setPickingProfile(false)
          setEditingPlayer(players.find((p) => p.id === id) ?? null)
        }}
        emptyMessage="No players yet"
      />
      {editingPlayer && (
        <EditProfileFlow
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSaved={() => {
            refetchPlayers()
            refetch()
          }}
        />
      )}

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
