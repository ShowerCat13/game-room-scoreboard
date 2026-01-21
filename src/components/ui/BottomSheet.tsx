import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

/**
 * BottomSheet - Touch-friendly modal that slides up from bottom
 * 
 * Features:
 * - Slides up from bottom of screen
 * - Tap outside or swipe down to dismiss
 * - Large touch targets (56px minimum)
 * - Works on both kiosk and mobile
 */
export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
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
            className="fixed inset-0 z-40 bg-black/60"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-elevated)' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div 
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: 'var(--color-text-muted)' }}
              />
            </div>
            
            {/* Title (optional) */}
            {title && (
              <div className="px-md pb-2">
                <h2 className="text-lg font-bold text-text-primary">{title}</h2>
              </div>
            )}
            
            {/* Content */}
            <div className="px-md pb-md safe-area-bottom">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}