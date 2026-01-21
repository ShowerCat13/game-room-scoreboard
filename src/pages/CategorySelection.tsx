import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { CategoryButton } from '@/components/cards/CategoryButton'
import { NewPlayerModal } from '@/components/input'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import { usePlayers } from '@/hooks/usePlayers'
import type { GameCategory } from '@/lib/types'

const CATEGORIES: GameCategory[] = [
  'racing',
  'golf',
  'party',
  'darts',
  'pinball',
  'platformer',
  'rpg',
  'other',
]

/**
 * CategorySelection - Grid of game categories
 * Route: /browse
 * 
 * Responsive:
 * - Desktop/Kiosk: 4 columns × 2 rows
 * - Mobile: 2 columns × 4 rows (scrollable)
 * 
 * Auto-returns to idle display after 30s inactivity
 */
export function CategorySelection() {
  const navigate = useNavigate()
  const { isIdle, resetTimer } = useIdleTimer(30000)
  const { createPlayer } = usePlayers()
  
  // New Player modal state
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false)
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleCategoryClick = (category: GameCategory) => {
    resetTimer()
    navigate(`/browse/${category}`)
  }

  const handleBack = () => {
    navigate('/')
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

  return (
    <KioskLayout>
      <div className="h-full flex flex-col min-h-[480px]">
        {/* Header with action sheet */}
        <BrowseHeader
          backLabel="Back"
          onBack={handleBack}
          onAddScore={handleAddScore}
          onAddPlayer={handleAddPlayer}
          onManage={handleManage}
          title="CATEGORIES"
        />

        {/* Category grid - responsive: 4×2 on desktop, 2×4 on mobile */}
        <div className="flex-1 p-md overflow-y-auto">
          <div className="category-grid">
            {CATEGORIES.map((category, index) => (
              <CategoryButton
                key={category}
                category={category}
                onClick={() => handleCategoryClick(category)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Footer hint - hidden on mobile to save space */}
        <div className="footer-height flex items-center justify-center border-t border-background-elevated hide-mobile">
          <p className="text-sm text-text-muted">
            30s idle → returns to auto mode
          </p>
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