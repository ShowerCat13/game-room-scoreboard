import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { CategoryButton } from '@/components/cards/CategoryButton'
import { useIdleTimer } from '@/hooks/useIdleTimer'
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
 * Auto-returns to idle display after 30s inactivity
 */
export function CategorySelection() {
  const navigate = useNavigate()
  const { isIdle, resetTimer } = useIdleTimer(30000)

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

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel="Back"
          onBack={handleBack}
          onAddScore={handleAddScore}
          title="CATEGORIES"
        />

        {/* Category grid */}
        <div className="flex-1 p-md">
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-full">
            {CATEGORIES.map((category) => (
              <CategoryButton
                key={category}
                category={category}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="h-[56px] flex items-center justify-center border-t border-background-elevated">
          <p className="text-sm text-text-muted">
            30s idle → returns to auto mode
          </p>
        </div>
      </div>
    </KioskLayout>
  )
}
