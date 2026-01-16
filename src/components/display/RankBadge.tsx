import { getMedalEmoji } from '@/lib/utils'

interface RankBadgeProps {
  rank: number
  className?: string
}

/**
 * RankBadge - Displays medal emoji for ranks 1-3 or number for other ranks
 * Width: 40px, Font: lg (24px), bold
 * Features: Glowing text shadow for medals
 */
export function RankBadge({ rank, className = '' }: RankBadgeProps) {
  const medal = getMedalEmoji(rank)
  
  // Medal glow class
  const medalClass = rank === 1 
    ? 'medal-gold' 
    : rank === 2 
    ? 'medal-silver' 
    : rank === 3 
    ? 'medal-bronze' 
    : 'text-text-muted'

  return (
    <div 
      className={`
        w-10 flex items-center justify-center 
        text-lg font-bold
        ${medal ? medalClass : 'text-text-muted'}
        ${className}
      `}
    >
      {medal || (
        <span className="text-base">{rank}.</span>
      )}
    </div>
  )
}