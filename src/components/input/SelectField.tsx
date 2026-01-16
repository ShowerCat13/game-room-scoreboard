import { ChevronDown } from 'lucide-react'

interface SelectFieldProps {
  label: string
  value: string | null
  placeholder?: string
  onPress: () => void
  disabled?: boolean
}

/**
 * SelectField - Touch-friendly dropdown trigger
 * Height: 56px per UI_SPEC
 */
export function SelectField({
  label,
  value,
  placeholder = 'Select...',
  onPress,
  disabled = false
}: SelectFieldProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={`
        h-[56px] px-md w-full
        bg-background-card rounded-lg
        flex items-center justify-between
        active:bg-background-elevated
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <div className="flex flex-col items-start">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className={`text-base ${value ? 'text-text-primary' : 'text-text-muted'}`}>
          {value || placeholder}
        </span>
      </div>
      <ChevronDown className="w-5 h-5 text-text-muted" />
    </button>
  )
}
