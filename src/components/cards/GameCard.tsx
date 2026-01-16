import { getInitials, getPlayerColor } from '@/lib/utils'

interface GameCardProps {
  game: {
    id: string
    name: string
    platform: string | null
    icon_url: string | null
  }
  onClick: () => void
  className?: string
}

/**
 * GameCard - Card displaying a game with icon, name, and platform
 * Height: 72px, padding: 16px horizontal
 */
export function GameCard({ game, onClick, className = '' }: GameCardProps) {
  const initials = getInitials(game.name)
  const backgroundColor = getPlayerColor(game.name)

  return (
    <button
      onClick={onClick}
      className={`
        h-[72px] px-md
        bg-background-card rounded-lg
        flex items-center gap-4
        active:bg-background-elevated
        transition-colors
        w-full text-left
        ${className}
      `}
    >
      {/* Game icon */}
      {game.icon_url ? (
        <img
          src={game.icon_url}
          alt=""
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
          style={{ backgroundColor }}
        >
          {initials}
        </div>
      )}

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <div className="text-lg font-bold text-text-primary truncate">
          {game.name}
        </div>
        {game.platform && (
          <div className="text-sm text-text-secondary truncate">
            {game.platform}
          </div>
        )}
      </div>
    </button>
  )
}
