import { useState, useEffect } from 'react'

interface NumericInputProps {
  value: number | null
  onChange: (value: number | null) => void
  unit?: string | null
  isDecimal?: boolean
  allowNegative?: boolean
  placeholder?: string
}

/**
 * NumericInput - Large numeric input for scores
 * For decimal_2 format, stores value × 100
 * For golf_relative format, allows negative values (under par)
 */
export function NumericInput({
  value,
  onChange,
  unit,
  isDecimal = false,
  allowNegative = false,
  placeholder = '0'
}: NumericInputProps) {
  // Track the raw input string to handle typing "-" 
  const [inputValue, setInputValue] = useState<string>(() => {
    if (value === null) return ''
    return isDecimal ? (value / 100).toFixed(2) : value.toString()
  })

  // Sync inputValue when value prop changes externally
  useEffect(() => {
    if (value === null) {
      setInputValue('')
    } else {
      const newDisplay = isDecimal ? (value / 100).toFixed(2) : value.toString()
      // Only update if different to avoid cursor jumping
      if (inputValue !== newDisplay && inputValue !== '-') {
        setInputValue(newDisplay)
      }
    }
  }, [value, isDecimal])

  const handleChange = (input: string) => {
    // Allow empty
    if (input === '') {
      setInputValue('')
      onChange(null)
      return
    }

    // Allow just a minus sign while typing (don't update value yet)
    if (input === '-' && allowNegative) {
      setInputValue('-')
      return
    }

    if (isDecimal) {
      // For decimal, allow negative if permitted
      const pattern = allowNegative ? /^-?\d*\.?\d{0,2}$/ : /^\d*\.?\d{0,2}$/
      if (pattern.test(input)) {
        setInputValue(input)
        const parsed = parseFloat(input)
        if (!isNaN(parsed)) {
          onChange(Math.round(parsed * 100))
        }
      }
    } else {
      // For integers
      if (allowNegative) {
        // Allow: optional minus at start, followed by digits
        const pattern = /^-?\d*$/
        if (pattern.test(input)) {
          setInputValue(input)
          const parsed = parseInt(input, 10)
          if (!isNaN(parsed)) {
            onChange(parsed)
          }
        }
      } else {
        // Only digits
        const cleaned = input.replace(/\D/g, '')
        setInputValue(cleaned)
        const parsed = parseInt(cleaned, 10)
        if (!isNaN(parsed)) {
          onChange(parsed)
        }
      }
    }
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <input
        type="text"
        inputMode={allowNegative ? 'text' : isDecimal ? 'decimal' : 'numeric'}
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-[200px] h-[64px]
          bg-background-card rounded-lg text-center
          text-xxl font-mono text-text-primary
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      />
      {unit && (
        <span className="text-xl text-text-secondary">{unit}</span>
      )}
    </div>
  )
}