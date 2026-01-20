import { motion } from 'framer-motion'
import { 
  Car, 
  Flag, 
  PartyPopper, 
  Target, 
  Disc3, 
  Gamepad2, 
  Swords, 
  Puzzle 
} from 'lucide-react'
import type { GameCategory } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

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
  Icon: LucideIcon
}> = {
  racing: {
    color: 'text-category-racing',
    bgGradient: 'from-red-500/10 to-transparent',
    glowClass: 'category-glow-racing',
    Icon: Car,
  },
  golf: {
    color: 'text-category-golf',
    bgGradient: 'from-green-500/10 to-transparent',
    glowClass: 'category-glow-golf',
    Icon: Flag,
  },
  party: {
    color: 'text-category-party',
    bgGradient: 'from-amber-500/10 to-transparent',
    glowClass: 'category-glow-party',
    Icon: PartyPopper,
  },
  darts: {
    color: 'text-category-darts',
    bgGradient: 'from-blue-500/10 to-transparent',
    glowClass: 'category-glow-darts',
    Icon: Target,
  },
  pinball: {
    color: 'text-category-pinball',
    bgGradient: 'from-purple-500/10 to-transparent',
    glowClass: 'category-glow-pinball',
    Icon: Disc3,
  },
  platformer: {
    color: 'text-category-platformer',
    bgGradient: 'from-pink-500/10 to-transparent',
    glowClass: 'category-glow-platformer',
    Icon: Gamepad2,
  },
  rpg: {
    color: 'text-category-rpg',
    bgGradient: 'from-cyan-500/10 to-transparent',
    glowClass: 'category-glow-rpg',
    Icon: Swords,
  },
  other: {
    color: 'text-category-other',
    bgGradient: 'from-gray-500/10 to-transparent',
    glowClass: 'category-glow-other',
    Icon: Puzzle,
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
  const { Icon } = config

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
        <Icon className={`w-8 h-8 ${config.color}`} strokeWidth={2} />
        <span className={`text-lg font-bold ${config.color}`}>
          {displayName}
        </span>
      </div>

      {/* Subtle bottom border accent */}
      <div 
        className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-60 ${config.color.replace('text-', 'bg-')}`}
      />
    </motion.button>
  )
}