// src/pages/DetailSelection.tsx
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { DetailCard } from '@/components/cards/DetailCard'
import { useGameDetails } from '@/hooks/useGameDetails'
import { useGame } from '@/hooks/useGame'
import { useGameMode } from '@/hooks/useGameMode'
import { useIdleTimer } from '@/hooks/useIdleTimer'

/**
 * DetailSelection - List of details (tracks, courses, etc.) for a specific game mode
 * Route: /browse/:category/:gameId/:modeId
 * 
 * If the game has no details (has_details=false), ModeSelection should skip this page
 * and navigate directly to LeaderboardView.
 */
export function DetailSelection() {
  const navigate = useNavigate()
  const { category, gameId, modeId } = useParams<{
    category: string
    gameId: string
    modeId: string
  }>()
  
  const { game: currentGame } = useGame(gameId || null)
  const { mode: currentMode } = useGameMode(modeId || null)
  const { details, loading, error } = useGameDetails(gameId || null, modeId || null)
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  // If game doesn't have details, redirect to leaderboard without detailId
  useEffect(() => {
    if (currentGame && !currentGame.has_details) {
      navigate(`/browse/${category}/${gameId}/${modeId}/all`, { replace: true })
    }
  }, [currentGame, category, gameId, modeId, navigate])

  const handleDetailClick = (detailId: string) => {
    resetTimer()
    navigate(`/browse/${category}/${gameId}/${modeId}/${detailId}`)
  }

  const handleViewAll = () => {
    resetTimer()
    // Navigate to leaderboard with "all" as detailId to show all scores for this mode
    navigate(`/browse/${category}/${gameId}/${modeId}/all`)
  }

  // FIX: Use browser history instead of relying on async data
  const handleBack = () => {
    resetTimer()
    navigate(-1)
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  // Get the label for details from game config
  const detailLabel = currentGame?.detail_label || 'Track'

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel={currentMode?.name || 'Back'}
          onBack={handleBack}
          onAddScore={handleAddScore}
        />

        {/* Mode title */}
        <div className="h-[48px] px-md flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {currentGame?.name} — {currentMode?.name}
            </h2>
            <p className="text-sm text-text-secondary">
              Select {detailLabel.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Details list */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">Loading {detailLabel.toLowerCase()}s...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-red-500 mb-2">Error loading {detailLabel.toLowerCase()}s</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : details.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-text-secondary">No {detailLabel.toLowerCase()}s configured</p>
              <button
                onClick={handleViewAll}
                className="h-[56px] px-6 bg-category-golf text-white font-semibold rounded-xl"
              >
                View All Scores
              </button>
            </div>
          ) : (
            <>
              {/* View all option at top */}
              <button
                onClick={handleViewAll}
                className="w-full h-[56px] flex items-center justify-center gap-2 bg-background-elevated text-text-secondary font-medium rounded-xl active:bg-background-card mb-2"
              >
                View All {detailLabel}s
              </button>
              
              {/* Individual details */}
              {details.map((detail, index) => (
                <DetailCard
                  key={detail.id}
                  detail={detail}
                  onClick={() => handleDetailClick(detail.id)}
                  index={index}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </KioskLayout>
  )
}