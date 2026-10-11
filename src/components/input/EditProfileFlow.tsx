import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { describeDbError } from '@/lib/dbErrors'
import { getSpookicon, toSpookiconUrl } from '@/lib/spookicons'
import { getRememberedPin, rememberPin, forgetPin } from '@/lib/myProfiles'
import { PlayerAvatar } from '@/components/display/PlayerAvatar'
import { PinModal } from '@/components/management/PinModal'
import { SpookiconPicker } from './SpookiconPicker'
import type { Player } from '@/lib/types'

interface ProfileResult {
  ok: boolean
  error?: 'no_pin' | 'not_found' | 'wrong_pin' | 'locked'
  attempts_left?: number
  locked_until?: string
  player?: Player
}

/**
 * Calls update_player_profile (supabase/security.sql). Name/avatar omitted = PIN check only.
 * A profile with no PIN takes any pin value; newPin locks (or re-locks) the profile.
 */
async function updateProfile(
  playerId: string,
  pin: string,
  changes: { name?: string; avatarUrl?: string; newPin?: string } = {}
): Promise<ProfileResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('update_player_profile', {
    p_player_id: playerId,
    p_pin: pin || null,
    p_name: changes.name ?? null,
    p_avatar_url: changes.avatarUrl ?? null,
    p_new_pin: changes.newPin ?? null,
  })
  if (error) throw error
  return data as ProfileResult
}

function describeError(result: ProfileResult): string {
  switch (result.error) {
    case 'no_pin':
      // Only the 2026-09-30 version of the database function says this
      return 'The scoreboard database needs its latest setup (security.sql). Ask the host.'
    case 'not_found':
      return 'This profile no longer exists.'
    case 'locked': {
      const minutes = result.locked_until
        ? Math.max(1, Math.ceil((new Date(result.locked_until).getTime() - Date.now()) / 60000))
        : 15
      return `Too many wrong PINs. Try again in ${minutes} min.`
    }
    case 'wrong_pin':
      return `Wrong PIN${result.attempts_left !== undefined ? ` (${result.attempts_left} ${result.attempts_left === 1 ? 'try' : 'tries'} left)` : ''}`
    default:
      return 'Something went wrong'
  }
}

interface EditProfileFlowProps {
  player: Player | null
  onClose: () => void
  onSaved: (player: Player) => void
}

/**
 * EditProfileFlow - edit name + spookicon, with a PIN check only when the profile has one
 *
 * A profile without a PIN opens straight into editing (anyone at the kiosk can
 * fix a typo or swap a spookicon) and offers to add a PIN. Once a profile has a
 * PIN, the database verifies it, so only its owner can edit it. On a guest's
 * own phone the PIN is remembered.
 */
export function EditProfileFlow({ player, onClose, onSaved }: EditProfileFlowProps) {
  const [stage, setStage] = useState<'checking' | 'pin' | 'edit' | 'blocked'>('checking')
  const [hasPin, setHasPin] = useState(true)
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [spookiconId, setSpookiconId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const newPinValid = newPin === '' || /^\d{4}$/.test(newPin)

  // Start: no PIN -> straight in; remembered PIN (phones only) -> straight in; else ask
  useEffect(() => {
    if (!player) return
    setName(player.name)
    setSpookiconId(getSpookicon(player.avatar_url)?.id ?? null)
    setHasPin(true)
    setPin('')
    setNewPin('')
    setPinError(null)
    setMessage(null)
    setStage('checking')

    // A failed check shows its cause rather than asking for a PIN that can't be verified
    const fail = (err: unknown) => {
      setMessage(describeDbError(err))
      setStage('blocked')
    }

    const start = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: hasPin, error } = await (supabase as any).rpc('player_has_pin', { p_player_id: player.id })
      if (error) {
        fail(error)
        return
      }
      if (hasPin === false) {
        setHasPin(false)
        setStage('edit')
        return
      }
      const remembered = getRememberedPin(player.id)
      if (!remembered) {
        setStage('pin')
        return
      }
      await tryRemembered(remembered)
    }

    const tryRemembered = (remembered: string) => updateProfile(player.id, remembered)
      .then((result) => {
        if (result.ok) {
          setPin(remembered)
          setStage('edit')
        } else {
          forgetPin(player.id)
          setStage(result.error === 'wrong_pin' ? 'pin' : 'blocked')
          if (result.error !== 'wrong_pin') setMessage(describeError(result))
        }
      })
      .catch(fail)

    void start().catch(fail)
  }, [player])

  if (!player) return null

  const handlePin = async (entered: string) => {
    try {
      const result = await updateProfile(player.id, entered)
      if (result.ok) {
        setPin(entered)
        rememberPin(player.id, entered)
        setStage('edit')
      } else if (result.error === 'wrong_pin') {
        setPinError(describeError(result))
      } else {
        setMessage(describeError(result))
        setStage('blocked')
      }
    } catch (err) {
      setPinError(describeDbError(err))
    }
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setMessage('Please enter a name')
      return
    }
    if (!newPinValid) {
      setMessage('PIN must be 4 digits (or leave it blank)')
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const currentIcon = getSpookicon(player.avatar_url)?.id ?? null
      const result = await updateProfile(player.id, pin, {
        name: trimmed !== player.name ? trimmed : undefined,
        avatarUrl: spookiconId && spookiconId !== currentIcon ? toSpookiconUrl(spookiconId) : undefined,
        newPin: newPin || undefined,
      })
      if (result.ok && result.player) {
        if (newPin) rememberPin(player.id, newPin)
        onSaved(result.player)
        onClose()
      } else {
        setMessage(describeError(result))
      }
    } catch (err) {
      setMessage(describeDbError(err))
    } finally {
      setSaving(false)
    }
  }

  if (stage === 'pin') {
    return (
      <PinModal
        isOpen
        mode="verify"
        onClose={onClose}
        onSubmit={handlePin}
        error={pinError}
        title={`Edit ${player.name}`}
        subtitle="Enter this profile's 4-digit PIN"
      />
    )
  }

  const previewUrl = spookiconId ? toSpookiconUrl(spookiconId) : player.avatar_url

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-[90%] max-w-[400px] bg-background-elevated rounded-xl overflow-hidden"
        >
          <div className="h-[56px] px-md flex items-center justify-between border-b border-background-card">
            <h2 className="text-lg font-bold text-text-primary">Edit profile</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-[56px] h-[56px] flex items-center justify-center active:bg-background-card rounded-lg"
            >
              <X className="w-6 h-6 text-text-secondary" />
            </button>
          </div>

          <div className="p-md space-y-3">
            {stage === 'checking' && (
              <p className="text-text-secondary text-center py-6">Checking...</p>
            )}

            {stage === 'blocked' && (
              <p className="text-text-secondary text-center py-6">{message}</p>
            )}

            {stage === 'edit' && (
              <>
                <div className="flex items-center gap-3">
                  <PlayerAvatar name={name || '?'} avatarUrl={previewUrl} size={56} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !saving) handleSave() }}
                    enterKeyHint="done"
                    maxLength={30}
                    aria-label="Player name"
                    className="flex-1 min-w-0 h-[56px] px-md bg-background-card rounded-lg text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-category-darts"
                  />
                </div>

                <SpookiconPicker value={spookiconId} onChange={setSpookiconId} />

                {/* An open profile can be locked here; a locked one is reset by the host in Manage */}
                {!hasPin && (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !saving) handleSave() }}
                      placeholder="PIN"
                      aria-label="Optional 4-digit PIN"
                      className={`
                        w-[76px] h-[56px] px-2 text-center font-mono shrink-0
                        bg-background-card rounded-lg
                        text-base text-text-primary tracking-[0.3em]
                        placeholder:text-text-muted placeholder:tracking-normal
                        focus:outline-none focus:ring-2 focus:ring-category-darts
                        ${newPinValid ? '' : 'ring-2 ring-red-500'}
                      `}
                    />
                    <p className="text-xs text-text-muted">
                      Optional PIN: after this, only you can edit this profile
                    </p>
                  </div>
                )}

                {message && <p className="text-sm text-red-400 text-center">{message}</p>}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-[56px] rounded-lg text-lg font-bold party-cta active:brightness-110 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save profile'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
