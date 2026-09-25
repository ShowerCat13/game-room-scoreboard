import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { getInitials, getPlayerColor } from '@/lib/utils'

interface NewPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<void>
  isCreating?: boolean
}

/**
 * NewPlayerModal - Create a new player during score entry
 */
export function NewPlayerModal({ isOpen, onClose, onCreate, isCreating = false }: NewPlayerModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter a name')
      return
    }
    if (trimmed.length > 30) {
      setError('Name must be 30 characters or less')
      return
    }

    setError(null)
    await onCreate(trimmed)
    setName('')
    onClose()
  }

  const handleClose = () => {
    setName('')
    setError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-[90%] max-w-[400px] bg-background-elevated rounded-xl overflow-hidden"
          >
            {/* Header */}
            <div className="h-[56px] px-md flex items-center justify-between border-b border-background-card">
              <h2 className="text-lg font-bold text-text-primary">New Player</h2>
              <button
                onClick={handleClose}
                className="w-[56px] h-[56px] flex items-center justify-center active:bg-background-card rounded-lg"
              >
                <X className="w-6 h-6 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-md space-y-4">
              {/* Avatar preview */}
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: name ? getPlayerColor(name) : '#6b7280' }}
                >
                  {name ? getInitials(name) : '?'}
                </div>
              </div>

              {/* Name input */}
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isCreating && name.trim()) handleSubmit()
                  }}
                  enterKeyHint="done"
                  placeholder="Enter player name"
                  maxLength={30}
                  autoFocus
                  className={`
                    w-full h-[56px] px-md
                    bg-background-card rounded-lg
                    text-base text-text-primary
                    placeholder:text-text-muted
                    focus:outline-none focus:ring-2 focus:ring-category-darts
                    ${error ? 'ring-2 ring-red-500' : ''}
                  `}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
              </div>

              {/* Create button */}
              <button
                onClick={handleSubmit}
                disabled={isCreating || !name.trim()}
                className={`
                  w-full h-[56px] rounded-lg
                  text-lg font-bold
                  transition-colors
                  ${isCreating || !name.trim()
                    ? 'bg-background-elevated text-text-muted cursor-not-allowed'
                    : 'bg-category-darts text-white active:brightness-110'
                  }
                `}
              >
                {isCreating ? 'Creating...' : 'Create Player'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
