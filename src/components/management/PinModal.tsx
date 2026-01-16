// src/components/management/PinModal.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, Delete } from 'lucide-react'

interface PinModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (pin: string) => void
  mode: 'verify' | 'setup' | 'change'
  error?: string | null
}

/**
 * PinModal - Touch-friendly PIN entry with numpad
 * Modes:
 * - verify: Enter existing PIN to authorize action
 * - setup: Create new PIN (first time)
 * - change: Enter new PIN (in settings)
 */
export function PinModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  error,
}: PinModalProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter')
  const [localError, setLocalError] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin('')
      setConfirmPin('')
      setStage('enter')
      setLocalError(null)
    }
  }, [isOpen])

  // Clear local error when external error changes
  useEffect(() => {
    if (error) {
      setLocalError(error)
      setPin('')
    }
  }, [error])

  const handleDigit = (digit: string) => {
    setLocalError(null)
    
    if (stage === 'enter') {
      if (pin.length < 4) {
        const newPin = pin + digit
        setPin(newPin)
        
        // Auto-submit on 4 digits for verify mode
        if (newPin.length === 4 && mode === 'verify') {
          onSubmit(newPin)
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirm = confirmPin + digit
        setConfirmPin(newConfirm)
        
        // Check match on 4 digits
        if (newConfirm.length === 4) {
          if (newConfirm === pin) {
            onSubmit(pin)
          } else {
            setLocalError('PINs do not match')
            setConfirmPin('')
          }
        }
      }
    }
  }

  const handleDelete = () => {
    if (stage === 'enter') {
      setPin(pin.slice(0, -1))
    } else {
      setConfirmPin(confirmPin.slice(0, -1))
    }
    setLocalError(null)
  }

  const handleContinue = () => {
    if (pin.length === 4 && (mode === 'setup' || mode === 'change')) {
      setStage('confirm')
    }
  }

  const currentPin = stage === 'enter' ? pin : confirmPin
  const showContinue = mode !== 'verify' && stage === 'enter' && pin.length === 4

  const title = mode === 'verify' 
    ? 'Enter PIN' 
    : mode === 'setup' 
      ? (stage === 'enter' ? 'Create PIN' : 'Confirm PIN')
      : (stage === 'enter' ? 'New PIN' : 'Confirm PIN')

  const subtitle = mode === 'verify'
    ? 'Enter your 4-digit PIN to continue'
    : stage === 'enter'
      ? 'Choose a 4-digit PIN'
      : 'Enter the PIN again to confirm'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[320px] bg-background-card rounded-xl overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header */}
            <div className="px-md pt-md pb-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-category-darts/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-category-darts" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                  <p className="text-xs text-text-muted">{subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PIN Display */}
            <div className="px-md py-4">
              <div className="flex justify-center gap-3 mb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`
                      w-12 h-14 rounded-lg flex items-center justify-center text-2xl font-bold
                      ${currentPin.length > i 
                        ? 'bg-category-darts text-white' 
                        : 'bg-background-elevated text-text-muted'}
                      transition-all duration-150
                    `}
                  >
                    {currentPin.length > i ? '•' : ''}
                  </div>
                ))}
              </div>
              
              {/* Error message */}
              {localError && (
                <p className="text-center text-sm text-red-500 mt-2">{localError}</p>
              )}
            </div>

            {/* Numpad */}
            <div className="px-md pb-md">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDigit(digit)}
                    className="h-14 bg-background-elevated text-text-primary text-xl font-semibold rounded-lg active:bg-background-primary transition-colors"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={handleDelete}
                  className="h-14 bg-background-elevated text-text-muted rounded-lg active:bg-background-primary transition-colors flex items-center justify-center"
                >
                  <Delete className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleDigit('0')}
                  className="h-14 bg-background-elevated text-text-primary text-xl font-semibold rounded-lg active:bg-background-primary transition-colors"
                >
                  0
                </button>
                {showContinue ? (
                  <button
                    onClick={handleContinue}
                    className="h-14 bg-category-darts text-white text-sm font-semibold rounded-lg active:bg-category-darts/80 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <div className="h-14" /> // Empty space
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}