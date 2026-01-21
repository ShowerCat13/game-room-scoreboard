import { useState } from 'react'
import { ChevronLeft, Plus, PlusCircle, UserPlus, Settings } from 'lucide-react'
import { ActionSheet, type ActionSheetOption } from '@/components/overlays'

interface BrowseHeaderProps {
  backLabel: string
  onBack: () => void
  /** Called when "Add Score" is selected from the action sheet */
  onAddScore?: () => void
  /** Called when "Add Player" is selected from the action sheet */
  onAddPlayer?: () => void
  /** Called when "Manage..." is selected from the action sheet */
  onManage?: () => void
  title?: string
}

/**
 * BrowseHeader - Shared header for browse interface pages
 * 
 * Height: 56px (52px on mobile)
 * Touch targets: ≥48px
 * 
 * Features:
 * - Back button with label
 * - Optional centered title
 * - + button that opens action sheet with:
 *   - Add Score
 *   - Add Player
 *   - Manage...
 * - Responsive sizing for mobile
 */
export function BrowseHeader({ 
  backLabel, 
  onBack, 
  onAddScore,
  onAddPlayer,
  onManage,
  title 
}: BrowseHeaderProps) {
  const [showActionSheet, setShowActionSheet] = useState(false)

  // Only show + button if at least one action is provided
  const hasActions = onAddScore || onAddPlayer || onManage

  // Build action options based on provided callbacks
  const actionOptions: ActionSheetOption[] = []
  
  if (onAddScore) {
    actionOptions.push({
      id: 'add-score',
      label: 'Add Score',
      icon: <PlusCircle className="w-5 h-5" />,
      onClick: onAddScore,
      variant: 'primary',
    })
  }
  
  if (onAddPlayer) {
    actionOptions.push({
      id: 'add-player',
      label: 'Add Player',
      icon: <UserPlus className="w-5 h-5" />,
      onClick: onAddPlayer,
    })
  }
  
  if (onManage) {
    actionOptions.push({
      id: 'manage',
      label: 'Manage...',
      icon: <Settings className="w-5 h-5" />,
      onClick: onManage,
    })
  }

  return (
    <>
      <div className="header-height px-sm flex items-center justify-between border-b" style={{ borderColor: 'color-mix(in srgb, var(--color-bg-elevated) 50%, transparent)' }}>
        {/* Back button */}
        <button
          onClick={onBack}
          className="min-h-[48px] px-sm flex items-center gap-1 text-text-secondary active:text-text-primary transition-colors rounded-lg active:bg-background-elevated"
        >
          <ChevronLeft className="w-5 h-5 flex-shrink-0" />
          <span className="text-base truncate max-w-[120px] sm:max-w-[150px]">{backLabel}</span>
        </button>

        {/* Title (optional) */}
        {title && (
          <div className="flex-1 text-center px-2 min-w-0">
            <h1 className="text-lg font-bold text-text-primary truncate">{title}</h1>
          </div>
        )}

        {/* Add button - opens action sheet */}
        {hasActions ? (
          <button
            onClick={() => setShowActionSheet(true)}
            className="min-h-[48px] px-sm flex items-center gap-1 text-category-golf active:text-green-400 transition-colors rounded-lg active:bg-background-elevated"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="text-base font-medium hide-mobile">Add</span>
          </button>
        ) : (
          // Spacer to keep back button left-aligned when no actions
          title && <div className="min-w-[48px]" />
        )}
      </div>

      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        options={actionOptions}
      />
    </>
  )
}