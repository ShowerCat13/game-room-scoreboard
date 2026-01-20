import { Medal } from 'lucide-react'

interface RankBadgeProps {
  rank: number
  className?: string
}

/**
 * RankBadge - Displays medal icon for ranks 1-3 or number for other ranks
 * Width: 40px, Font: lg (24px), bold
 * Features: Colored medals with glow effects
 */
export function RankBadge({ rank, className = '' }: RankBadgeProps) {
  const isMedalist = rank >= 1 && rank <= 3
  
  // Medal color and glow class based on rank
  const getMedalStyle = () => {
    switch (rank) {
      case 1:
        return {
          colorClass: 'text-medals-gold',
          glowClass: 'medal-gold',
        }
      case 2:
        return {
          colorClass: 'text-medals-silver',
          glowClass: 'medal-silver',
        }
      case 3:
        return {
          colorClass: 'text-medals-bronze',
          glowClass: 'medal-bronze',
        }
      default:
        return {
          colorClass: 'text-text-muted',
          glowClass: '',
        }
    }
  }

  const { colorClass, glowClass } = getMedalStyle()

  return (
    <div 
      className={`
        w-10 flex items-center justify-center 
        text-lg font-bold
        ${className}
      `}
    >
      {isMedalist ? (
        <Medal 
          className={`w-6 h-6 ${colorClass} ${glowClass}`} 
          strokeWidth={2}
          fill="currentColor"
          fillOpacity={0.2}
        />
      ) : (
        <span className="text-base text-text-muted">{rank}.</span>
      )}
    </div>
  )
}