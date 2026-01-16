import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { GameCard } from '@/components/cards/GameCard'
import { useGames } from '@/hooks/useGames'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import type { GameCategory } from '@/lib/types'

/**
 * GameSelection - List of games in a category
 * Route: /browse/:category
 */
export function GameSelection() {
  const navigate = useNavigate()
  const { category } = useParams<{ category: GameCategory }>()
  const { games, loading, error } = useGames(category)
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleGameClick = (gameId: string) => {
    resetTimer()
    navigate(`/browse/${category}/${gameId}`)
  }

  const handleBack = () => {
    navigate('/browse')
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  // Category display name
  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : ''

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel="Categories"
          onBack={handleBack}
          onAddScore={handleAddScore}
        />

        {/* Category title */}
        <div className="h-[40px] px-md flex items-center">
          <h2 className="text-lg font-bold" style={{ color: getCategoryColor(category) }}>
            {categoryName.toUpperCase()}
          </h2>
        </div>

        {/* Games list */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">Loading games...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-red-500 mb-2">Error loading games</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : games.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">No games in this category</p>
            </div>
          ) : (
            games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => handleGameClick(game.id)}
              />
            ))
          )}
        </div>
      </div>
    </KioskLayout>
  )
}

// Helper to get category color
function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    racing: '#ef4444',
    golf: '#22c55e',
    party: '#f59e0b',
    darts: '#3b82f6',
    pinball: '#a855f7',
    platformer: '#ec4899',
    rpg: '#06b6d4',
    other: '#6b7280',
  }
  return colors[category || 'other'] || colors.other
}
