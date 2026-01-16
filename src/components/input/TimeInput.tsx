import { useState, useRef, useEffect } from 'react'

interface TimeInputProps {
  value: number | null
  onChange: (ms: number | null) => void
  showMilliseconds?: boolean
}

/**
 * TimeInput - Time entry with MM:SS.mmm format
 * Stores value as milliseconds internally
 */
export function TimeInput({ value, onChange, showMilliseconds = true }: TimeInputProps) {
  const parseMs = (ms: number | null) => {
    if (ms === null) return { min: '', sec: '', ms: '' }
    const totalMs = showMilliseconds ? ms : ms * 1000
    const minutes = Math.floor(totalMs / 60000)
    const seconds = Math.floor((totalMs % 60000) / 1000)
    const millis = totalMs % 1000
    return {
      min: minutes.toString(),
      sec: seconds.toString().padStart(2, '0'),
      ms: millis.toString().padStart(3, '0'),
    }
  }

  const [parts, setParts] = useState(parseMs(value))
  const secRef = useRef<HTMLInputElement>(null)
  const msRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setParts(parseMs(value))
  }, [value, showMilliseconds])

  const updateValue = (newParts: typeof parts) => {
    const min = parseInt(newParts.min) || 0
    const sec = parseInt(newParts.sec) || 0
    const ms = parseInt(newParts.ms) || 0

    if (newParts.min === '' && newParts.sec === '' && (!showMilliseconds || newParts.ms === '')) {
      onChange(null)
    } else {
      const totalMs = (min * 60000) + (sec * 1000) + (showMilliseconds ? ms : 0)
      onChange(showMilliseconds ? totalMs : Math.floor(totalMs / 1000))
    }
  }

  const handleMinChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 2)
    const newParts = { ...parts, min: cleaned }
    setParts(newParts)
    updateValue(newParts)
    if (cleaned.length === 2) secRef.current?.focus()
  }

  const handleSecChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 2)
    const num = parseInt(cleaned) || 0
    const clamped = Math.min(num, 59)
    const newParts = { ...parts, sec: cleaned ? clamped.toString().padStart(cleaned.length > 1 ? 2 : 1, '0') : '' }
    setParts(newParts)
    updateValue(newParts)
    if (cleaned.length === 2 && showMilliseconds) msRef.current?.focus()
  }

  const handleMsChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3)
    const newParts = { ...parts, ms: cleaned }
    setParts(newParts)
    updateValue(newParts)
  }

  const inputClass = `
    bg-background-card rounded-lg text-center
    text-xxl font-mono text-text-primary
    focus:outline-none focus:ring-2 focus:ring-blue-500
  `

  return (
    <div className="flex items-center justify-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        value={parts.min}
        onChange={(e) => handleMinChange(e.target.value)}
        placeholder="0"
        className={`${inputClass} w-[64px] h-[64px]`}
      />
      <span className="text-xxl font-mono text-text-secondary">:</span>

      <input
        ref={secRef}
        type="text"
        inputMode="numeric"
        value={parts.sec}
        onChange={(e) => handleSecChange(e.target.value)}
        placeholder="00"
        className={`${inputClass} w-[64px] h-[64px]`}
      />

      {showMilliseconds && (
        <>
          <span className="text-xxl font-mono text-text-secondary">.</span>
          <input
            ref={msRef}
            type="text"
            inputMode="numeric"
            value={parts.ms}
            onChange={(e) => handleMsChange(e.target.value)}
            placeholder="000"
            className={`${inputClass} w-[80px] h-[64px]`}
          />
        </>
      )}
    </div>
  )
}
