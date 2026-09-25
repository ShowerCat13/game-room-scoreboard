import { SPOOKICONS } from '@/lib/spookicons'

interface SpookiconPickerProps {
  value: string | null
  onChange: (id: string) => void
}

/**
 * SpookiconPicker - 8×2 grid of Halloween player icons
 */
export function SpookiconPicker({ value, onChange }: SpookiconPickerProps) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-2">Pick your spookicon</p>
      <div className="grid grid-cols-8 gap-1.5">
        {SPOOKICONS.map(({ id, label, Icon, color }) => {
          const selected = id === value
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={selected}
              onClick={() => onChange(id)}
              className={`aspect-square rounded-full flex items-center justify-center text-white transition-transform active:scale-90 ${
                selected ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-background-elevated scale-105' : 'opacity-75'
              }`}
              style={{ backgroundColor: color }}
            >
              <Icon className="w-5 h-5" strokeWidth={1.75} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
