import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

export interface ActionSheetOption {
  id: string
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'primary' | 'danger'
}

interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  options: ActionSheetOption[]
  title?: string
}

/**
 * ActionSheet - Touch-friendly bottom sheet for action selection
 * 
 * Features:
 * - Slides up from bottom
 * - Tap outside or swipe down to dismiss
 * - 56px minimum touch targets
 * - Optional title
 * - Variant styling (default, primary, danger)
 */
export function ActionSheet({ isOpen, onClose, options, title }: ActionSheetProps) {
  const getVariantClasses = (variant: ActionSheetOption['variant'] = 'default') => {
    switch (variant) {
      case 'primary':
        return 'text-category-golf'
      case 'danger':
        return 'text-red-500'
      default:
        return 'text-text-primary'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
          >
            <div 
              className="mx-2 mb-2 rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            >
              {/* Title (optional) */}
              {title && (
                <div className="px-md py-3 border-b border-background-card">
                  <p className="text-sm text-text-secondary text-center">{title}</p>
                </div>
              )}

              {/* Options */}
              <div className="py-1">
                {options.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      option.onClick()
                      onClose()
                    }}
                    className={`
                      w-full min-h-[56px] px-md
                      flex items-center gap-4
                      active:bg-background-card
                      transition-colors
                      ${index > 0 ? 'border-t border-background-card' : ''}
                    `}
                  >
                    {option.icon && (
                      <span className={`flex-shrink-0 ${getVariantClasses(option.variant)}`}>
                        {option.icon}
                      </span>
                    )}
                    <span className={`text-base font-medium ${getVariantClasses(option.variant)}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cancel button */}
            <div className="mx-2 mb-2">
              <button
                onClick={onClose}
                className="w-full min-h-[56px] rounded-2xl text-base font-semibold text-text-primary active:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}