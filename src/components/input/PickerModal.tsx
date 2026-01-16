import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'

interface PickerOption {
  id: string
  label: string
  sublabel?: string | null
}

interface PickerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  options: PickerOption[]
  onSelect: (id: string) => void
  selectedId?: string | null
  emptyMessage?: string
  footerAction?: {
    label: string
    onPress: () => void
  }
}

/**
 * PickerModal - Full-screen selection modal
 * Touch targets: 56px minimum per option
 * Features: Selection checkmark, smooth animations, better visual hierarchy
 */
export function PickerModal({
  isOpen,
  onClose,
  title,
  options,
  onSelect,
  selectedId,
  emptyMessage = 'No options available',
  footerAction,
}: PickerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background-primary flex flex-col"
        >
          {/* Header */}
          <div className="h-[56px] px-sm flex items-center justify-between border-b border-background-elevated/50">
            <h2 className="text-lg font-bold text-text-primary px-sm">{title}</h2>
            <button
              onClick={onClose}
              className="w-[48px] h-[48px] flex items-center justify-center active:bg-background-elevated rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-text-secondary" />
            </button>
          </div>

          {/* Options list */}
          <div className="flex-1 overflow-y-auto px-md py-2">
            {options.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-text-secondary">{emptyMessage}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {options.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => {
                      onSelect(option.id)
                      onClose()
                    }}
                    className={`
                      w-full min-h-[56px] px-md py-3
                      flex items-center justify-between
                      rounded-lg
                      transition-all duration-fast
                      ${selectedId === option.id 
                        ? 'bg-background-elevated shadow-card-pressed' 
                        : 'bg-background-card shadow-card active:shadow-card-pressed active:scale-[0.99]'}
                    `}
                  >
                    <div className="flex flex-col justify-center min-w-0">
                      <span className={`text-base text-left truncate ${selectedId === option.id ? 'text-text-primary font-medium' : 'text-text-primary'}`}>
                        {option.label}
                      </span>
                      {option.sublabel && (
                        <span className="text-sm text-text-secondary text-left truncate">{option.sublabel}</span>
                      )}
                    </div>
                    {selectedId === option.id && (
                      <Check className="w-5 h-5 text-category-golf flex-shrink-0 ml-2" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer action (e.g., "+ New Player") */}
          {footerAction && (
            <div className="px-md py-3 border-t border-background-elevated/50">
              <button
                onClick={footerAction.onPress}
                className="w-full h-[56px] btn-primary flex items-center justify-center gap-2"
              >
                <span className="text-base text-category-golf font-medium">{footerAction.label}</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}