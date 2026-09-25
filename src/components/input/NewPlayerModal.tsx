import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { getInitials, getPlayerColor } from '@/lib/utils'
import { SPOOKICONS, toSpookiconUrl } from '@/lib/spookicons'
import { PlayerAvatar } from '@/components/display/PlayerAvatar'
import { SpookiconPicker } from './SpookiconPicker'

const randomSpookiconId = () => SPOOKICONS[Math.floor(Math.random() * SPOOKICONS.length)].id

interface NewPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, avatarUrl?: string | null, pin?: string | null) => Promise<void>
  isCreating?: boolean
  /** Halloween party: let the player pick a spookicon (one is pre-picked at random) */
  showSpookicons?: boolean
}

/**
 * NewPlayerModal - Create a new player during score entry
 */
export function NewPlayerModal({ isOpen, onClose, onCreate, isCreating = false, showSpookicons = false }: NewPlayerModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [spookiconId, setSpookiconId] = useState(randomSpookiconId)
  const [pin, setPin] = useState('')
  const pinValid = pin === '' || /^\d{4}$/.test(pin)
  const avatarUrl = showSpookicons ? toSpookiconUrl(spookiconId) : null

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
    if (!pinValid) {
      setError('PIN must be 4 digits (or leave it blank)')
      return
    }

    setError(null)
    await onCreate(trimmed, avatarUrl, pin || null)
    setName('')
    setPin('')
    setSpookiconId(randomSpookiconId())
    onClose()
  }

  const handleClose = () => {
    setName('')
    setPin('')
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
            <div className={`p-md ${showSpookicons ? 'space-y-3' : 'space-y-4'}`}>
              {/* Avatar preview (spookicon mode shows it inline with the name instead) */}
              {!showSpookicons && (
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: name ? getPlayerColor(name) : '#6b7280' }}
                >
                  {name ? getInitials(name) : '?'}
                </div>
              </div>
              )}

              {/* Name input */}
              <div>
                <div className="flex items-center gap-3">
                {showSpookicons && (
                  <PlayerAvatar name={name || '?'} avatarUrl={avatarUrl} size={56} />
                )}
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
                    flex-1 min-w-0 h-[56px] px-md
                    bg-background-card rounded-lg
                    text-base text-text-primary
                    placeholder:text-text-muted
                    focus:outline-none focus:ring-2 focus:ring-category-darts
                    ${error ? 'ring-2 ring-red-500' : ''}
                  `}
                />
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isCreating && name.trim()) handleSubmit()
                  }}
                  placeholder="PIN"
                  aria-label="Optional 4-digit PIN"
                  className={`
                    w-[76px] h-[56px] px-2 text-center font-mono
                    bg-background-card rounded-lg
                    text-base text-text-primary tracking-[0.3em]
                    placeholder:text-text-muted placeholder:tracking-normal
                    focus:outline-none focus:ring-2 focus:ring-category-darts
                    ${pinValid ? '' : 'ring-2 ring-red-500'}
                  `}
                />
                </div>
                {error ? (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                ) : (
                  <p className="mt-1 text-xs text-text-muted">
                    Optional PIN: only you can edit this profile later
                  </p>
                )}
              </div>

              {/* Spookicon picker */}
              {showSpookicons && (
                <SpookiconPicker value={spookiconId} onChange={setSpookiconId} />
              )}

              {/* Create button */}
              <button
                onClick={handleSubmit}
                disabled={isCreating || !name.trim() || !pinValid}
                className={`
                  w-full h-[56px] rounded-lg
                  text-lg font-bold
                  transition-colors
                  ${isCreating || !name.trim() || !pinValid
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
