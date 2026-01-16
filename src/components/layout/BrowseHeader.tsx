import { ChevronLeft, Plus } from 'lucide-react'

interface BrowseHeaderProps {
  backLabel: string
  onBack: () => void
  onAddScore?: () => void
  title?: string
}

/**
 * BrowseHeader - Shared header for browse interface pages
 * Height: 56px, with back button, optional title, and optional add score button
 * Features: Icon buttons, better touch feedback
 */
export function BrowseHeader({ backLabel, onBack, onAddScore, title }: BrowseHeaderProps) {
  return (
    <div className="h-[56px] px-sm flex items-center justify-between border-b border-background-elevated/50">
      {/* Back button */}
      <button
        onClick={onBack}
        className="min-h-[48px] px-sm flex items-center gap-1 text-text-secondary active:text-text-primary transition-colors rounded-lg active:bg-background-elevated"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-base truncate max-w-[150px]">{backLabel}</span>
      </button>

      {/* Title (optional) */}
      {title && (
        <div className="flex-1 text-center px-2">
          <h1 className="text-lg font-bold text-text-primary truncate">{title}</h1>
        </div>
      )}

      {/* Add Score button (optional) */}
      {onAddScore ? (
        <button
          onClick={onAddScore}
          className="min-h-[48px] px-sm flex items-center gap-1 text-category-golf active:text-green-400 transition-colors rounded-lg active:bg-background-elevated"
        >
          <Plus className="w-5 h-5" />
          <span className="text-base font-medium">Add</span>
        </button>
      ) : (
        // Spacer to keep back button left-aligned when no add score button
        title && <div className="min-w-[56px]" />
      )}
    </div>
  )
}