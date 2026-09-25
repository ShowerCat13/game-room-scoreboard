import { useCallback, useEffect, useState } from 'react'
import { Delete } from 'lucide-react'

// M:SS.mmm = 6 digits
const MAX_DIGITS = 6

interface LapTimePadProps {
  onChange: (ms: number | null) => void
  onValidityChange?: (message: string | null) => void
}

/**
 * Split entered digits (right-aligned, microwave style) into time parts
 */
function toParts(digits: string) {
  const padded = digits.padStart(MAX_DIGITS, '0')
  return {
    min: padded.slice(0, 1),
    sec: padded.slice(1, 3),
    ms: padded.slice(3, 6),
  }
}

/**
 * LapTimePad - Touch keypad for entering a race time (M:SS.mmm)
 *
 * Digits fill from the right, like a microwave: tapping 1 5 9 2 5 0
 * gives 1:59.250. No system keyboard needed, which matters on the
 * 800×480 kiosk where an on-screen keyboard would cover the form.
 * Physical keyboards also work (digits and Backspace).
 */
export function LapTimePad({ onChange, onValidityChange }: LapTimePadProps) {
  const [digits, setDigits] = useState('')

  const { min, sec, ms } = toParts(digits)
  const seconds = parseInt(sec, 10)
  const invalid = seconds > 59

  useEffect(() => {
    if (digits === '' || invalid) {
      onChange(null)
    } else {
      onChange(parseInt(min, 10) * 60000 + seconds * 1000 + parseInt(ms, 10))
    }
    onValidityChange?.(invalid ? 'Seconds must be 59 or less' : null)
  }, [digits, min, seconds, ms, invalid, onChange, onValidityChange])

  const press = useCallback((key: string) => {
    setDigits((d) => {
      if (key === 'back') return d.slice(0, -1)
      if (key === 'clear') return ''
      if (d.length >= MAX_DIGITS) return d
      if (d === '' && key === '0') return d // no leading zeros
      return d + key
    })
  }, [])

  // Physical keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (/^\d$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('back')
      else if (e.key === 'Escape') press('clear')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  // Dim the leading zeros that haven't been typed yet
  const typedFrom = MAX_DIGITS - digits.length
  const renderDigit = (char: string, index: number) => (
    <span key={index} className={index < typedFrom ? 'text-text-muted' : 'text-text-primary'}>
      {char}
    </span>
  )
  const all = `${min}${sec}${ms}`.split('')

  const keyClass = `
    h-[56px] rounded-lg bg-background-card text-xl font-mono font-semibold text-text-primary
    flex items-center justify-center select-none
    active:bg-background-elevated active:scale-[0.97] transition-transform
    border border-white/5
  `

  return (
    <div className="flex flex-col gap-3">
      {/* Display */}
      <div
        className={`card h-[64px] flex items-center justify-center font-mono font-bold tabular-nums ${invalid ? 'ring-2 ring-red-500' : ''}`}
        style={{ fontSize: 40 }}
        aria-live="polite"
        aria-label={`Time ${min} minutes ${sec} seconds ${ms} milliseconds`}
      >
        {renderDigit(all[0], 0)}
        <span className="text-text-secondary">:</span>
        {renderDigit(all[1], 1)}
        {renderDigit(all[2], 2)}
        <span className="text-text-secondary">.</span>
        {renderDigit(all[3], 3)}
        {renderDigit(all[4], 4)}
        {renderDigit(all[5], 5)}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <button key={k} type="button" className={keyClass} onClick={() => press(k)}>
            {k}
          </button>
        ))}
        <button type="button" className={`${keyClass} text-sm font-sans`} onClick={() => press('clear')}>
          Clear
        </button>
        <button type="button" className={keyClass} onClick={() => press('0')}>
          0
        </button>
        <button type="button" className={keyClass} onClick={() => press('back')} aria-label="Delete last digit">
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
