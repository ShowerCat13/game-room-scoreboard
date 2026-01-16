import { formatScore } from '@/lib/utils'
import type { ScoreFormat } from '@/lib/types'

interface ScoreValueProps {
  value: number
  format: ScoreFormat
  unit?: string | null
  className?: string
  highlight?: boolean
}

/**
 * ScoreValue - Formats and displays score based on score_format
 * Uses monospace font (font-mono) for tabular alignment
 * Font: xl (28px), mono, text-align: right
 * Features: Optional gold highlight for first place
 */
export function ScoreValue({
  value,
  format,
  unit,
  className = '',
  highlight = false
}: ScoreValueProps) {
  const formattedScore = formatScore(value, format, unit)

  return (
    <div 
      className={`
        text-xl font-mono text-right tabular-nums flex-shrink-0
        ${highlight ? 'text-gradient-gold font-semibold' : 'text-text-primary'}
        ${className}
      `}
    >
      {formattedScore}
    </div>
  )
}