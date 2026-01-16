import { RankBadge } from './RankBadge'
import { PlayerAvatar } from './PlayerAvatar'
import { ScoreValue } from './ScoreValue'
import type { ScoreFormat } from '@/lib/types'

interface ScoreRowProps {
  rank: number
  playerName: string
  playerAvatar?: string | null
  score: number
  scoreFormat: ScoreFormat
  scoreUnit?: string | null
  className?: string
  animate?: boolean
}

/**
 * ScoreRow - Individual leaderboard entry
 * Height: 72px, padding: 0 16px
 * Layout: flex row, align center, justify space-between
 * Contains: RankBadge (40px) | PlayerInfo (avatar 48px + name) | ScoreValue
 * Features: Podium highlighting for top 3, avatar rings for medals
 */
export function ScoreRow({
  rank,
  playerName,
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
        h-[72px] px-md flex flex-row items-center justify-between
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
      {/* Rank badge */}
      <RankBadge rank={rank} />

      {/* Player info: avatar + name */}
      <div className="flex flex-row items-center gap-3 flex-1 ml-3 min-w-0">
        <PlayerAvatar 
          name={playerName} 
          avatarUrl={playerAvatar} 
          size={48}
          ringClass={avatarRingClass}
        />
        <div className={`text-lg truncate ${rank <= 3 ? 'font-semibold' : 'font-normal'} text-text-primary`}>
          {playerName}
        </div>
      </div>

      {/* Score value */}
      <ScoreValue 
        value={score} 
        format={scoreFormat} 
        unit={scoreUnit}
        highlight={rank === 1}
      />
    </div>
  )
}