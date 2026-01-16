import { motion } from 'framer-motion'
import type { GameCategory } from '@/lib/types'

interface CategoryButtonProps {
  category: GameCategory
  onClick: () => void
  className?: string
  index?: number
}

// Map categories to their color values and display info
const categoryConfig: Record<GameCategory, { 
  color: string
  bgGradient: string
  glowClass: string
  icon: string
}> = {
  racing: {
    color: 'text-category-racing',
    bgGradient: 'from-red-500/10 to-transparent',
    glowClass: 'category-glow-racing',
    icon: '🏎️',
  },
  golf: {
    color: 'text-category-golf',
    bgGradient: 'from-green-500/10 to-transparent',
    glowClass: 'category-glow-golf',
    icon: '⛳',
  },
  party: {
    color: 'text-category-party',
    bgGradient: 'from-amber-500/10 to-transparent',
    glowClass: 'category-glow-party',
    icon: '🎉',
  },
  darts: {
    color: 'text-category-darts',
    bgGradient: 'from-blue-500/10 to-transparent',
    glowClass: 'category-glow-darts',
    icon: '🎯',
  },
  pinball: {
    color: 'text-category-pinball',
    bgGradient: 'from-purple-500/10 to-transparent',
    glowClass: 'category-glow-pinball',
    icon: '🕹️',
  },
  platformer: {
    color: 'text-category-platformer',
    bgGradient: 'from-pink-500/10 to-transparent',
    glowClass: 'category-glow-platformer',
    icon: '🍄',
  },
  rpg: {
    color: 'text-category-rpg',
    bgGradient: 'from-cyan-500/10 to-transparent',
    glowClass: 'category-glow-rpg',
    icon: '⚔️',
  },
  other: {
    color: 'text-category-other',
    bgGradient: 'from-gray-500/10 to-transparent',
    glowClass: 'category-glow-other',
    icon: '🎮',
  },
}

/**
 * CategoryButton - Touch-friendly category selection button
 * Size: fills grid cell (approx 240×168 in 3-column grid)
 * Features: Category-colored glow, gradient background, satisfying press animation
 */
export function CategoryButton({ category, onClick, className = '', index = 0 }: CategoryButtonProps) {
  const config = categoryConfig[category]
  const displayName = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileTap={{ scale: 0.96 }}
      className={`
        min-h-[56px] 
        bg-background-card 
        rounded-xl
        flex flex-col items-center justify-center gap-2
        transition-all duration-fast
        overflow-hidden
        relative
        ${config.glowClass}
        ${className}
      `}
    >
      {/* Gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50`}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span className="text-xxl">{config.icon}</span>
        <span className={`text-lg font-bold ${config.color}`}>
          {displayName}
        </span>
      </div>

      {/* Subtle bottom border accent */}
      <div 
        className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-60`}
        style={{ 
          background: `linear-gradient(90deg, transparent, var(--tw-${category === 'racing' ? 'red' : category === 'golf' ? 'green' : category === 'party' ? 'amber' : category === 'darts' ? 'blue' : category === 'pinball' ? 'purple' : category === 'platformer' ? 'pink' : category === 'rpg' ? 'cyan' : 'gray'}-500), transparent)` 
        }}
      />
    </motion.button>
  )
}