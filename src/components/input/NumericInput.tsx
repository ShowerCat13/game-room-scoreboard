interface NumericInputProps {
  value: number | null
  onChange: (value: number | null) => void
  unit?: string | null
  isDecimal?: boolean
  placeholder?: string
}

/**
 * NumericInput - Large numeric input for scores
 * For decimal_2 format, stores value × 100
 */
export function NumericInput({
  value,
  onChange,
  unit,
  isDecimal = false,
  placeholder = '0'
}: NumericInputProps) {
  const displayValue = value === null
    ? ''
    : isDecimal
      ? (value / 100).toFixed(2)
      : value.toString()

  const handleChange = (input: string) => {
    if (input === '') {
      onChange(null)
      return
    }

    if (isDecimal) {
      const parsed = parseFloat(input)
      if (!isNaN(parsed)) {
        onChange(Math.round(parsed * 100))
      }
    } else {
      const parsed = parseInt(input.replace(/\D/g, ''))
      if (!isNaN(parsed)) {
        onChange(parsed)
      }
    }
  }

  return (
    <div className="flex items-center justify-center gap-3">
      <input
        type="text"
        inputMode={isDecimal ? 'decimal' : 'numeric'}
        value={displayValue}
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
