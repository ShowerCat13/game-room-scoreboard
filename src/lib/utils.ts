import type { ScoreFormat } from './types'

/**
 * Format a score value based on its format type
 * @param value Raw score value from database
 * @param format How to display the score
 * @param unit Optional unit to append (e.g., "pts", "throws")
 * @returns Formatted string for display
 */
export function formatScore(
  value: number,
  format: ScoreFormat,
  unit?: string | null
): string {
  switch (format) {
    case 'time_ms': {
      // Convert milliseconds to M:SS.mmm format
      const minutes = Math.floor(value / 60000)
      const seconds = Math.floor((value % 60000) / 1000)
      const ms = value % 1000
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
    }

    case 'time_seconds': {
      // Convert seconds to M:SS format
      const minutes = Math.floor(value / 60)
      const seconds = value % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    case 'decimal_2': {
      // Display as decimal with 2 places
      const decimal = (value / 100).toFixed(2)
      return unit ? `${decimal} ${unit}` : decimal
    }

        case 'level': {
      // Display as World X-Y (e.g., 84 -> "World 8-4")
      const world = Math.floor(value / 100)
      const level = value % 100
      return `World ${world}-${level}`
    }

    case 'golf_relative': {
      // Display relative to par: -4, E, +3
      if (value === 0) return 'E'
      if (value > 0) return `+${value}`
      return value.toString()
    }

    case 'integer':
    default: {
      // Display as formatted number with commas
      const formatted = value.toLocaleString()
      return unit ? `${formatted} ${unit}` : formatted
    }
  }
}

/**
 * Parse time input from M:SS.mmm format to milliseconds
 */
export function parseTimeMs(minutes: number, seconds: number, milliseconds: number): number {
  return (minutes * 60000) + (seconds * 1000) + milliseconds
}

/**
 * Parse time input from M:SS format to seconds
 */
export function parseTimeSeconds(minutes: number, seconds: number): number {
  return (minutes * 60) + seconds
}

/**
 * Parse decimal input to integer storage format (multiply by 100)
 */
export function parseDecimal(value: number): number {
  return Math.round(value * 100)
}

/**
 * Parse level input (World X-Y) to integer storage format
 */
export function parseLevel(world: number, level: number): number {
  return (world * 100) + level
}

/**
 * Get medal emoji for rank position
 */
export function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return ''
  }
}

/**
 * Get rank display text
 */
export function getRankText(rank: number): string {
  const medal = getMedalEmoji(rank)
  if (medal) return medal
  return `${rank}.`
}

/**
 * Get player initials for avatar fallback
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate a consistent color for a player based on their name
 * Used for avatar fallback backgrounds
 */
export function getPlayerColor(name: string): string {
  const colors = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#22c55e', // green
    '#3b82f6', // blue
    '#a855f7', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
  ]

  // Simple hash function
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Format a timestamp for display
 */
export function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/**
 * Format a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return formatDate(timestamp)
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Generate a unique key for React lists
 */
export function generateKey(prefix: string, id: string | number): string {
  return `${prefix}-${id}`
}
