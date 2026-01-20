import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface DetailCardProps {
  detail: {
    id: string
    name: string
  }
  onClick: () => void
  className?: string
  index?: number
}

/**
 * DetailCard - Card displaying a game detail (track, course, enemy type, etc.)
 * Height: 64px, padding: 12px vertical, 16px horizontal
 * Features: Card shadow, press animation, chevron indicator
 */
export function DetailCard({ detail, onClick, className = '', index = 0 }: DetailCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileTap={{ scale: 0.98 }}
      className={`
        h-[64px] py-3 px-md
        card-interactive
        flex items-center justify-between
        w-full text-left
        ${className}
      `}
    >
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <div className="text-base font-semibold text-text-primary truncate">
          {detail.name}
        </div>
      </div>
      
      {/* Chevron indicator */}
      <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0 ml-2" />
    </motion.button>
  )
}