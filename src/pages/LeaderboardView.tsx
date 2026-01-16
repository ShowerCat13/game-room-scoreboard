import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { ScoreRow } from '@/components/display/ScoreRow'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGame } from '@/hooks/useGame'
import { useGameMode } from '@/hooks/useGameMode'
import { useIdleTimer } from '@/hooks/useIdleTimer'

/**
 * LeaderboardView - Full leaderboard for a specific game mode
 * Route: /browse/:category/:gameId/:modeId
 */
export function LeaderboardView() {
  const navigate = useNavigate()
  const { category, gameId, modeId } = useParams<{
    category: string
    gameId: string
    modeId: string
  }>()
  const { data: scores, loading, error } = useLeaderboard(modeId || null, 10)
  const { game: currentGame } = useGame(gameId || null)
  const { mode: currentMode } = useGameMode(modeId || null)
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleBack = () => {
    resetTimer()
    navigate(`/browse/${category}/${gameId}`)
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel={currentGame?.name || 'Back'}
          onBack={handleBack}
          onAddScore={handleAddScore}
        />

        {/* Mode title */}
        <div className="h-[56px] px-md flex flex-col justify-center">
          <h2 className="text-lg font-bold text-text-primary">
            {currentMode?.name || 'Leaderboard'}
          </h2>
          {currentMode?.subtitle && (
            <p className="text-sm text-text-secondary">{currentMode.subtitle}</p>
          )}
        </div>

        {/* Leaderboard */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">Loading...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <p className="text-red-500 mb-2">Error loading leaderboard</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : scores.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-3"
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
                  rank={index + 1}
                  playerName={entry.player_name || entry.team_name || 'Unknown'}
                  playerAvatar={entry.player_avatar || entry.team_avatar || null}
                  score={entry.score}
                  scoreFormat={entry.score_format}
                  scoreUnit={entry.score_unit || undefined}
                  className="card"
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </KioskLayout>
  )
}