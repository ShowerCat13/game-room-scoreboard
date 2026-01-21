import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { ScoreRow } from '@/components/display/ScoreRow'
import { NewPlayerModal } from '@/components/input'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGame } from '@/hooks/useGame'
import { useGameMode } from '@/hooks/useGameMode'
import { usePlayers } from '@/hooks/usePlayers'
import { useIdleTimer } from '@/hooks/useIdleTimer'

/**
 * LeaderboardView - Full leaderboard for a specific game/mode/detail combination
 * Route: /browse/:category/:gameId/:modeId/:detailId
 * 
 * detailId can be:
 * - A valid UUID: show scores for that specific detail
 * - "all": show all scores for the mode (no detail filter)
 */
export function LeaderboardView() {
  const navigate = useNavigate()
  const { category, gameId, modeId, detailId } = useParams<{
    category: string
    gameId: string
    modeId: string
    detailId: string
  }>()
  
  // Determine if we're filtering by detail or showing all
  const effectiveDetailId = detailId === 'all' ? null : (detailId || null)
  
  // Updated useLeaderboard call with new signature: (gameId, modeId, detailId, limit)
  const { entries: scores, loading, error } = useLeaderboard(
    gameId || null,
    modeId || null,
    effectiveDetailId,
    10 // limit
  )
  
  const { game: currentGame } = useGame(gameId || null)
  const { mode: currentMode } = useGameMode(modeId || null)
  const { createPlayer } = usePlayers()
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // New Player modal state
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false)
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleBack = () => {
    resetTimer()
    // Go back to detail selection if game has details, otherwise mode selection
    if (currentGame?.has_details) {
      navigate(`/browse/${category}/${gameId}/${modeId}`)
    } else {
      navigate(`/browse/${category}/${gameId}`)
    }
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  const handleAddPlayer = () => {
    resetTimer()
    setShowNewPlayerModal(true)
  }

  const handleManage = () => {
    resetTimer()
    navigate('/manage')
  }

  const handleCreatePlayer = async (name: string) => {
    setIsCreatingPlayer(true)
    try {
      await createPlayer(name)
      setShowNewPlayerModal(false)
    } finally {
      setIsCreatingPlayer(false)
    }
  }

  // Build title based on what's selected
  const buildTitle = () => {
    if (!currentMode) return 'Leaderboard'
    return currentMode.name
  }

  return (
    <KioskLayout>
      <div className="h-full min-h-[480px] flex flex-col">
        {/* Header with action sheet */}
        <BrowseHeader
          backLabel={currentGame?.has_details ? (currentGame?.detail_label || 'Back') : (currentGame?.name || 'Back')}
          onBack={handleBack}
          onAddScore={handleAddScore}
          onAddPlayer={handleAddPlayer}
          onManage={handleManage}
        />

        {/* Mode/Detail title */}
        <div className="h-[56px] px-md flex flex-col justify-center flex-shrink-0">
          <h2 className="text-lg font-bold text-text-primary">
            {buildTitle()}
          </h2>
          {detailId && detailId !== 'all' && (
            <p className="text-sm text-text-secondary">
              {/* Detail name would need to be fetched - for now show generic */}
              Filtered view
            </p>
          )}
        </div>

        {/* Leaderboard */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-text-secondary">Loading...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] px-4">
              <p className="text-red-500 mb-2">Error loading leaderboard</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : scores.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3"
            >
              <Trophy className="w-12 h-12 text-text-muted" />
              <p className="text-text-secondary">No scores yet</p>
              <button
                onClick={handleAddScore}
                className="btn-primary h-[48px] text-category-golf"
              >
                Be the first!
              </button>
            </motion.div>
          ) : (
            scores.map((entry, index) => (
              <motion.div
                key={entry.score_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
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
        </div>
      </div>

      {/* New Player Modal */}
      <NewPlayerModal
        isOpen={showNewPlayerModal}
        onClose={() => setShowNewPlayerModal(false)}
        onCreate={handleCreatePlayer}
        isCreating={isCreatingPlayer}
      />
    </KioskLayout>
  )
}