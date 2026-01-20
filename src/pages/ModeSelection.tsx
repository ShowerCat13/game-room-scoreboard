import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { ModeCard } from '@/components/cards/ModeCard'
import { useGameModes } from '@/hooks/useGameModes'
import { useGame } from '@/hooks/useGame'
import { useIdleTimer } from '@/hooks/useIdleTimer'

/**
 * ModeSelection - List of game modes for a specific game
 * Route: /browse/:category/:gameId
 * 
 * Navigates to:
 * - DetailSelection if game.has_details is true
 * - LeaderboardView (with /all) if game.has_details is false
 */
export function ModeSelection() {
  const navigate = useNavigate()
  const { category, gameId } = useParams<{ category: string; gameId: string }>()
  const { modes, loading, error } = useGameModes(gameId || null)
  const { game: currentGame } = useGame(gameId || null)
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleModeClick = (modeId: string) => {
    resetTimer()
    
    // If game has details, go to detail selection
    // Otherwise, skip to leaderboard with "all" as detailId
    if (currentGame?.has_details) {
      navigate(`/browse/${category}/${gameId}/${modeId}`)
    } else {
      navigate(`/browse/${category}/${gameId}/${modeId}/all`)
    }
  }

  const handleBack = () => {
    navigate(`/browse/${category}`)
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  // Get the label for modes from game config
  const modeLabel = currentGame?.mode_label || 'Mode'

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel={currentGame?.name || 'Back'}
          onBack={handleBack}
          onAddScore={handleAddScore}
        />

        {/* Game title */}
        <div className="h-[48px] px-md flex items-center gap-3">
          {currentGame?.icon_url && (
            <img
              src={currentGame.icon_url}
              alt=""
              className="w-6 h-6 rounded"
            />
          )}
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {currentGame?.name || 'Game'}
            </h2>
            <p className="text-sm text-text-secondary">
              Select {modeLabel.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Modes list */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">Loading {modeLabel.toLowerCase()}s...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-red-500 mb-2">Error loading {modeLabel.toLowerCase()}s</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : modes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">No {modeLabel.toLowerCase()}s for this game</p>
            </div>
          ) : (
            modes.map((mode, index) => (
              <ModeCard
                key={mode.id}
                mode={mode}
                onClick={() => handleModeClick(mode.id)}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </KioskLayout>
  )
}