import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}

/**
 * ConfirmDialog - Modal for confirming destructive actions
 * Touch-friendly with 56px minimum button heights
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] bg-background-card rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Header */}
            <div className="px-lg pt-lg pb-md flex items-start gap-4">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                ${variant === 'danger' ? 'bg-red-500/20' : 'bg-yellow-500/20'}
              `}>
                <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-500' : 'text-yellow-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                <p className="text-sm text-text-secondary mt-1">{message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-lg pb-lg pt-md flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-[56px] bg-background-elevated text-text-primary font-semibold rounded-lg active:bg-background-primary transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`
                  flex-1 h-[56px] font-semibold rounded-lg transition-colors disabled:opacity-50
                  ${variant === 'danger' 
                    ? 'bg-red-500 text-white active:bg-red-600' 
                    : 'bg-yellow-500 text-black active:bg-yellow-600'}
                `}
              >
                {loading ? 'Deleting...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}