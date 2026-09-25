import { RankBadge } from './RankBadge'
import { PlayerAvatar } from './PlayerAvatar'
import { ScoreValue } from './ScoreValue'
import type { ScoreFormat } from '@/lib/types'

interface ScoreRowProps {
  rank: number
  playerName: string
  /** Text shown in place of the name (the avatar keeps the real name) */
  displayName?: string
  playerAvatar?: string | null
  score: number
  scoreFormat: ScoreFormat
  scoreUnit?: string | null
  className?: string
  animate?: boolean
}

/**
 * ScoreRow - Individual leaderboard entry
 * 
 * Desktop (≥640px):
 *   Height: 72px, horizontal layout
 *   Layout: RankBadge (40px) | Avatar + Name | Score
 * 
 * Mobile (<640px):
 *   Height: auto (min 80px), stacked layout
 *   Layout: [Rank + Avatar + Name] row, then [Score] row
 * 
 * Features:
 * - Podium highlighting for top 3
 * - Avatar rings for medals
 * - Responsive layout adapts to screen size
 */
export function ScoreRow({
  rank,
  playerName,
  displayName,
  playerAvatar,
  score,
  scoreFormat,
  scoreUnit,
  className = '',
  animate = false
}: ScoreRowProps) {
  // Determine podium class for top 3
  const podiumClass = rank === 1 
    ? 'podium-gold' 
    : rank === 2 
    ? 'podium-silver' 
    : rank === 3 
    ? 'podium-bronze' 
    : ''

  // Avatar ring class for top 3
  const avatarRingClass = rank === 1
    ? 'avatar-ring-gold'
    : rank === 2
    ? 'avatar-ring-silver'
    : rank === 3
    ? 'avatar-ring-bronze'
    : ''

  return (
    <div
      className={`
        score-row-layout
        rounded-lg
        ${podiumClass}
        ${className}
      `}
      style={animate ? { 
        animation: 'slide-up 0.3s ease-out forwards',
        animationDelay: `${(rank - 1) * 0.05}s`,
        opacity: 0
      } : undefined}
    >
      {/* Top row: Rank + Player info */}
      <div className="flex flex-row items-center flex-1 min-w-0 w-full">
        {/* Rank badge */}
        <RankBadge rank={rank} />

        {/* Player info: avatar + name */}
        <div className="score-row-player">
          <PlayerAvatar 
            name={playerName} 
            avatarUrl={playerAvatar} 
            size={48}
            ringClass={avatarRingClass}
          />
          <div className={`score-row-name text-lg truncate ${rank <= 3 ? 'font-semibold' : 'font-normal'} text-text-primary`}>
            {displayName ?? playerName}
          </div>
        </div>
      </div>

      {/* Score value - right side on desktop, below on mobile */}
      <div className="score-row-value">
        <ScoreValue 
          value={score} 
          format={scoreFormat} 
          unit={scoreUnit}
          highlight={rank === 1}
        />
      </div>
    </div>
  )
}