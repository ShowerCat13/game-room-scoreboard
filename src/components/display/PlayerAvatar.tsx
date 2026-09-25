import { getInitials, getPlayerColor } from '@/lib/utils'
import { getSpookicon } from '@/lib/spookicons'

interface PlayerAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: number
  className?: string
  ringClass?: string
}

/**
 * PlayerAvatar - 48x48 circular player avatar with fallback
 * Fallback: colored circle with player initials
 * Features: Optional medal ring for podium positions
 */
export function PlayerAvatar({
  name,
  avatarUrl,
  size = 48,
  className = '',
  ringClass = ''
}: PlayerAvatarProps) {
  const initials = getInitials(name)
  const backgroundColor = getPlayerColor(name)
  const spookicon = getSpookicon(avatarUrl)

  if (spookicon) {
    const { Icon, color, label } = spookicon
    return (
      <div
        role="img"
        aria-label={`${name} (${label})`}
        className={`rounded-full flex items-center justify-center text-white flex-shrink-0 ${ringClass} ${className}`}
        style={{ width: size, height: size, backgroundColor: color }}
      >
        <Icon style={{ width: size * 0.58, height: size * 0.58 }} strokeWidth={1.75} />
      </div>
    )
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 ${ringClass} ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ${ringClass} ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor
      }}
    >
      {initials}
    </div>
  )
}