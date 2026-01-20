## File: index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Game Room Scoreboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

## File: tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0f0f0f',
          card: '#1a1a1a',
          elevated: '#252525',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a1a1a1',
          muted: '#6b6b6b',
        },
        category: {
          racing: '#ef4444',
          golf: '#22c55e',
          party: '#f59e0b',
          darts: '#3b82f6',
          pinball: '#a855f7',
          platformer: '#ec4899',
          rpg: '#06b6d4',
          other: '#6b7280',
        },
        medals: {
          gold: '#ffd700',
          silver: '#c0c0c0',
          bronze: '#cd7f32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: '14px',
        sm: '16px',
        base: '18px',
        lg: '24px',
        xl: '28px',
        xxl: '32px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        custom: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      screens: {
        kiosk: '800px',
      },
    },
  },
  plugins: [],
}

```

## File: vite.config.ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
})

```

## File: package.json
```json
{
  "name": "game-room-scoreboard",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.47.13",
    "framer-motion": "^11.18.0",
    "lucide-react": "^0.562.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.2.1",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.18",
    "globals": "^15.14.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.18.2",
    "vite": "^6.0.7"
  }
}

```

## File: tsconfig.json
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```

## File: src/App.tsx
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  IdleDisplay,
  CategorySelection,
  GameSelection,
  ModeSelection,
  LeaderboardView,
  AddScore,
} from '@/pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Idle carousel - home screen */}
        <Route path="/" element={<IdleDisplay />} />

        {/* Browse hierarchy */}
        <Route path="/browse" element={<CategorySelection />} />
        <Route path="/browse/:category" element={<GameSelection />} />
        <Route path="/browse/:category/:gameId" element={<ModeSelection />} />
        <Route path="/browse/:category/:gameId/:modeId" element={<LeaderboardView />} />

        {/* Score entry */}
        <Route path="/add-score" element={<AddScore />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

```

## File: src/components/cards/CategoryButton.tsx
```tsx
import type { GameCategory } from '@/lib/types'

interface CategoryButtonProps {
  category: GameCategory
  onClick: () => void
  className?: string
}

// Map categories to Tailwind color classes
const categoryColors: Record<GameCategory, string> = {
  racing: 'text-red-500',
  golf: 'text-green-500',
  party: 'text-amber-500',
  darts: 'text-blue-500',
  pinball: 'text-purple-500',
  platformer: 'text-pink-500',
  rpg: 'text-cyan-500',
  other: 'text-gray-500',
}

/**
 * CategoryButton - Touch-friendly category selection button
 * Size: fills grid cell (approx 240×168 in 3-column grid)
 */
export function CategoryButton({ category, onClick, className = '' }: CategoryButtonProps) {
  const colorClass = categoryColors[category]
  const displayName = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <button
      onClick={onClick}
      className={`
        min-h-[56px] 
        bg-background-card 
        border border-background-elevated 
        rounded-lg 
        flex flex-col items-center justify-center
        active:scale-[0.98] active:bg-background-elevated
        transition-transform
        ${className}
      `}
    >
      <span className={`text-lg font-bold ${colorClass}`}>
        {displayName}
      </span>
    </button>
  )
}

```

## File: src/components/cards/GameCard.tsx
```tsx
import { getInitials, getPlayerColor } from '@/lib/utils'

interface GameCardProps {
  game: {
    id: string
    name: string
    platform: string | null
    icon_url: string | null
  }
  onClick: () => void
  className?: string
}

/**
 * GameCard - Card displaying a game with icon, name, and platform
 * Height: 72px, padding: 16px horizontal
 */
export function GameCard({ game, onClick, className = '' }: GameCardProps) {
  const initials = getInitials(game.name)
  const backgroundColor = getPlayerColor(game.name)

  return (
    <button
      onClick={onClick}
      className={`
        h-[72px] px-md
        bg-background-card rounded-lg
        flex items-center gap-4
        active:bg-background-elevated
        transition-colors
        w-full text-left
        ${className}
      `}
    >
      {/* Game icon */}
      {game.icon_url ? (
        <img
          src={game.icon_url}
          alt=""
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
          style={{ backgroundColor }}
        >
          {initials}
        </div>
      )}

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <div className="text-lg font-bold text-text-primary truncate">
          {game.name}
        </div>
        {game.platform && (
          <div className="text-sm text-text-secondary truncate">
            {game.platform}
          </div>
        )}
      </div>
    </button>
  )
}

```

## File: src/components/cards/index.ts
```ts
// Card components for browsing games and categories
// Export components from this directory for easy imports

export { CategoryButton } from './CategoryButton'
export { GameCard } from './GameCard'
export { ModeCard } from './ModeCard'

```

## File: src/components/cards/ModeCard.tsx
```tsx
interface ModeCardProps {
  mode: {
    id: string
    name: string
    subtitle: string | null
  }
  onClick: () => void
  className?: string
}

/**
 * ModeCard - Card displaying a game mode with name and optional subtitle
 * Height: 64px, padding: 12px vertical, 16px horizontal
 */
export function ModeCard({ mode, onClick, className = '' }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        h-[64px] py-3 px-md
        bg-background-card rounded-lg
        flex flex-col justify-center
        active:bg-background-elevated
        transition-colors
        w-full text-left
        ${className}
      `}
    >
      <div className="text-base font-bold text-text-primary">
        {mode.name}
      </div>
      {mode.subtitle && (
        <div className="text-sm text-text-secondary">
          {mode.subtitle}
        </div>
      )}
    </button>
  )
}

```

## File: src/components/display/index.ts
```ts
// Display components for showing scores and leaderboards
// Export components from this directory for easy imports

export { ScoreRow } from './ScoreRow'
export { ScoreValue } from './ScoreValue'
export { PlayerAvatar } from './PlayerAvatar'
export { RankBadge } from './RankBadge'
// export { Confetti } from './Confetti'

```

## File: src/components/display/PlayerAvatar.tsx
```tsx
import { getInitials, getPlayerColor } from '@/lib/utils'

interface PlayerAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: number
  className?: string
}

/**
 * PlayerAvatar - 48x48 circular player avatar with fallback
 * Fallback: colored circle with player initials
 */
export function PlayerAvatar({
  name,
  avatarUrl,
  size = 48,
  className = ''
}: PlayerAvatarProps) {
  const initials = getInitials(name)
  const backgroundColor = getPlayerColor(name)

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-lg font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor
      }}
    >
      {initials}
    </div>
  )
}

```

## File: src/components/display/RankBadge.tsx
```tsx
import { getMedalEmoji } from '@/lib/utils'

interface RankBadgeProps {
  rank: number
  className?: string
}

/**
 * RankBadge - Displays medal emoji for ranks 1-3 or number for other ranks
 * Width: 40px, Font: lg (24px), bold
 */
export function RankBadge({ rank, className = '' }: RankBadgeProps) {
  const medal = getMedalEmoji(rank)

  return (
    <div className={`w-10 flex items-center justify-center text-lg font-bold ${className}`}>
      {medal || `${rank}.`}
    </div>
  )
}

```

## File: src/components/display/ScoreRow.tsx
```tsx
import { RankBadge } from './RankBadge'
import { PlayerAvatar } from './PlayerAvatar'
import { ScoreValue } from './ScoreValue'
import type { ScoreFormat } from '@/lib/types'

interface ScoreRowProps {
  rank: number
  playerName: string
  playerAvatar?: string | null
  score: number
  scoreFormat: ScoreFormat
  scoreUnit?: string | null
  className?: string
}

/**
 * ScoreRow - Individual leaderboard entry
 * Height: 72px, padding: 0 16px
 * Layout: flex row, align center, justify space-between
 * Contains: RankBadge (40px) | PlayerInfo (avatar 48px + name) | ScoreValue
 */
export function ScoreRow({
  rank,
  playerName,
  playerAvatar,
  score,
  scoreFormat,
  scoreUnit,
  className = ''
}: ScoreRowProps) {
  return (
    <div
      className={`h-[72px] px-md flex flex-row items-center justify-between ${className}`}
    >
      {/* Rank badge */}
      <RankBadge rank={rank} />

      {/* Player info: avatar + name */}
      <div className="flex flex-row items-center gap-3 flex-1 ml-3">
        <PlayerAvatar name={playerName} avatarUrl={playerAvatar} size={48} />
        <div className="text-lg font-normal text-text-primary">
          {playerName}
        </div>
      </div>

      {/* Score value */}
      <ScoreValue value={score} format={scoreFormat} unit={scoreUnit} />
    </div>
  )
}

```

## File: src/components/display/ScoreRowDemo.tsx
```tsx
import { ScoreRow } from './ScoreRow'

/**
 * ScoreRowDemo - Demonstrates the ScoreRow component with sample data
 * Used for testing and development
 */
export function ScoreRowDemo() {
  return (
    <div className="space-y-2 p-4 bg-background-card rounded-lg">
      <h2 className="text-lg font-bold text-text-primary mb-4">
        Score Row Component Demo
      </h2>

      {/* Time format (race times) */}
      <div className="space-y-2">
        <h3 className="text-sm text-text-secondary">Time Format (ms)</h3>
        <ScoreRow
          rank={1}
          playerName="Alice Johnson"
          score={142567}
          scoreFormat="time_ms"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={2}
          playerName="Bob Smith"
          score={144891}
          scoreFormat="time_ms"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={3}
          playerName="Charlie Brown"
          score={151044}
          scoreFormat="time_ms"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={4}
          playerName="Diana Prince"
          score={155220}
          scoreFormat="time_ms"
          className="bg-background-primary rounded"
        />
      </div>

      {/* Integer format (points, throws, etc.) */}
      <div className="space-y-2 mt-6">
        <h3 className="text-sm text-text-secondary">Integer Format</h3>
        <ScoreRow
          rank={1}
          playerName="Emma Wilson"
          score={15}
          scoreFormat="integer"
          scoreUnit="darts"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={2}
          playerName="Frank Miller"
          score={18}
          scoreFormat="integer"
          scoreUnit="darts"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={3}
          playerName="Grace Lee"
          score={21}
          scoreFormat="integer"
          scoreUnit="darts"
          className="bg-background-primary rounded"
        />
      </div>

      {/* Decimal format (percentages) */}
      <div className="space-y-2 mt-6">
        <h3 className="text-sm text-text-secondary">Decimal Format</h3>
        <ScoreRow
          rank={1}
          playerName="Henry Taylor"
          score={9845}
          scoreFormat="decimal_2"
          scoreUnit="%"
          className="bg-background-primary rounded"
        />
        <ScoreRow
          rank={2}
          playerName="Iris Chen"
          score={9567}
          scoreFormat="decimal_2"
          scoreUnit="%"
          className="bg-background-primary rounded"
        />
      </div>
    </div>
  )
}

```

## File: src/components/display/ScoreValue.tsx
```tsx
import { formatScore } from '@/lib/utils'
import type { ScoreFormat } from '@/lib/types'

interface ScoreValueProps {
  value: number
  format: ScoreFormat
  unit?: string | null
  className?: string
}

/**
 * ScoreValue - Formats and displays score based on score_format
 * Uses monospace font (font-mono) for tabular alignment
 * Font: xl (28px), mono, text-align: right
 */
export function ScoreValue({
  value,
  format,
  unit,
  className = ''
}: ScoreValueProps) {
  const formattedScore = formatScore(value, format, unit)

  return (
    <div className={`text-xl font-mono text-right text-text-primary tabular-nums ${className}`}>
      {formattedScore}
    </div>
  )
}

```

## File: src/components/input/index.ts
```ts
export { SelectField } from './SelectField'
export { PickerModal } from './PickerModal'
export { TimeInput } from './TimeInput'
export { NumericInput } from './NumericInput'
export { NewPlayerModal } from './NewPlayerModal'

```

## File: src/components/input/NewPlayerModal.tsx
```tsx
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

```

## File: src/components/input/NumericInput.tsx
```tsx
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

```

## File: src/components/input/PickerModal.tsx
```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface PickerOption {
  id: string
  label: string
  sublabel?: string | null
}

interface PickerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  options: PickerOption[]
  onSelect: (id: string) => void
  selectedId?: string | null
  emptyMessage?: string
  footerAction?: {
    label: string
    onPress: () => void
  }
}

/**
 * PickerModal - Full-screen selection modal
 * Touch targets: 56px minimum per option
 */
export function PickerModal({
  isOpen,
  onClose,
  title,
  options,
  onSelect,
  selectedId,
  emptyMessage = 'No options available',
  footerAction,
}: PickerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background-primary flex flex-col"
        >
          {/* Header */}
          <div className="h-[56px] px-md flex items-center justify-between border-b border-background-elevated">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="w-[56px] h-[56px] flex items-center justify-center active:bg-background-elevated rounded-lg"
            >
              <X className="w-6 h-6 text-text-secondary" />
            </button>
          </div>

          {/* Options list */}
          <div className="flex-1 overflow-y-auto">
            {options.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-text-secondary">{emptyMessage}</p>
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onSelect(option.id)
                    onClose()
                  }}
                  className={`
                    w-full min-h-[56px] px-md py-3
                    flex flex-col justify-center
                    border-b border-background-elevated
                    active:bg-background-elevated
                    transition-colors
                    ${selectedId === option.id ? 'bg-background-card' : ''}
                  `}
                >
                  <span className="text-base text-text-primary text-left">{option.label}</span>
                  {option.sublabel && (
                    <span className="text-sm text-text-secondary text-left">{option.sublabel}</span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer action (e.g., "+ New Player") */}
          {footerAction && (
            <div className="h-[72px] px-md py-2 border-t border-background-elevated">
              <button
                onClick={footerAction.onPress}
                className="w-full h-full bg-background-card rounded-lg flex items-center justify-center active:bg-background-elevated"
              >
                <span className="text-base text-text-primary">{footerAction.label}</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

```

## File: src/components/input/SelectField.tsx
```tsx
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

```

## File: src/components/input/TimeInput.tsx
```tsx
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

```

## File: src/components/layout/BrowseHeader.tsx
```tsx
interface BrowseHeaderProps {
  backLabel: string
  onBack: () => void
  onAddScore?: () => void
  title?: string
}

/**
 * BrowseHeader - Shared header for browse interface pages
 * Height: 56px, with back button, optional title, and optional add score button
 */
export function BrowseHeader({ backLabel, onBack, onAddScore, title }: BrowseHeaderProps) {
  return (
    <div className="h-[56px] px-md flex items-center justify-between border-b border-background-elevated">
      {/* Back button */}
      <button
        onClick={onBack}
        className="min-w-[56px] min-h-[56px] flex items-center text-text-secondary active:text-text-primary transition-colors"
      >
        <span className="text-base">← {backLabel}</span>
      </button>

      {/* Title (optional) */}
      {title && (
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-text-primary">{title}</h1>
        </div>
      )}

      {/* Add Score button (optional) */}
      {onAddScore ? (
        <button
          onClick={onAddScore}
          className="min-w-[56px] min-h-[56px] flex items-center justify-end text-text-secondary active:text-text-primary transition-colors"
        >
          <span className="text-base">+ Add Score</span>
        </button>
      ) : (
        // Spacer to keep back button left-aligned when no add score button
        title && <div className="min-w-[56px]" />
      )}
    </div>
  )
}

```

## File: src/components/layout/index.ts
```ts
// Layout components
// Export components from this directory for easy imports

export { KioskLayout } from './KioskLayout'
export { BrowseHeader } from './BrowseHeader'

```

## File: src/components/layout/KioskLayout.tsx
```tsx
import { ReactNode } from 'react'

interface KioskLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * KioskLayout - 800x480 fixed container for Raspberry Pi touchscreen
 * Centers content on screen with dark background
 */
export function KioskLayout({ children, className = '' }: KioskLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-primary">
      <div className={`kiosk-container bg-background-primary ${className}`}>
        {children}
      </div>
    </div>
  )
}

```

## File: src/components/overlays/CelebrationOverlay.tsx
```tsx
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatScore, getMedalEmoji } from '@/lib/utils'
import type { ScoreFormat } from '@/lib/types'

interface CelebrationOverlayProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  score: number
  scoreFormat: ScoreFormat
  scoreUnit?: string | null
  rank: number
  autoCloseMs?: number
}

/**
 * CelebrationOverlay - Full-screen celebration after score submission
 */
export function CelebrationOverlay({
  isOpen,
  onClose,
  playerName,
  score,
  scoreFormat,
  scoreUnit,
  rank,
  autoCloseMs = 3000,
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(timer)
  }, [isOpen, onClose, autoCloseMs])

  const isFirstPlace = rank === 1
  const medalEmoji = getMedalEmoji(rank)
  const formattedScore = formatScore(score, scoreFormat, scoreUnit)

  const getOrdinal = (n: number) => {
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-center"
          >
            {isFirstPlace ? (
              <motion.p
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-xl font-bold text-yellow-400 mb-4"
              >
                🎉 NEW HIGH SCORE! 🎉
              </motion.p>
            ) : (
              <motion.p
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-xl font-bold text-text-primary mb-4"
              >
                Score Saved!
              </motion.p>
            )}

            <p className="text-lg text-text-primary mb-2">{playerName}</p>

            <motion.p
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="text-xxl font-mono font-bold text-text-primary mb-4"
            >
              {formattedScore}
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-primary"
            >
              {medalEmoji} {getOrdinal(rank)} Place!
            </motion.p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 text-sm text-text-muted"
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

```

## File: src/components/overlays/index.ts
```ts
export { CelebrationOverlay } from './CelebrationOverlay'

```

## File: src/components/ui/index.ts
```ts
// Reusable UI components
// Export components from this directory for easy imports

// export { Button } from './Button'
// export { Modal } from './Modal'
// export { TouchRipple } from './TouchRipple'
// export { LoadingSpinner } from './LoadingSpinner'

```

## File: src/hooks/index.ts
```ts
// Custom React hooks
// Export hooks from this directory for easy imports

export { useGame } from './useGame'
export { useGames } from './useGames'
export { useGameMode } from './useGameMode'
export { useGameModes } from './useGameModes'
export { useLeaderboard } from './useLeaderboard'
export { usePlayers } from './usePlayers'
export { useRealtimeScores } from './useRealtimeScores'
export { useSubmitScore } from './useSubmitScore'
export { useIdleTimer } from './useIdleTimer'
export { useActiveGameModes } from './useActiveGameModes'

```

## File: src/hooks/useActiveGameModes.ts
```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameMode } from '@/lib/types'

interface GameModeWithGame extends GameMode {
  game_name: string
  game_icon: string | null
  game_category: string
  game_sort_order?: number
}

interface UseActiveGameModesResult {
  modes: GameModeWithGame[]
  loading: boolean
  error: Error | null
}

// Type for the Supabase query response with nested relations
interface GameModeQueryResult extends GameMode {
  games: {
    name: string
    icon_url: string | null
    category: string
    sort_order: number
    is_active: boolean
  }
  high_scores: { id: string }[]
}

/**
 * useActiveGameModes - Fetches all game modes that have at least one score
 * Used by the carousel to know which modes to cycle through
 *
 * Returns modes with associated game data for display
 */
export function useActiveGameModes(): UseActiveGameModesResult {
  const [modes, setModes] = useState<GameModeWithGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchActiveGameModes() {
      try {
        setLoading(true)
        setError(null)

        // Query game_modes that have at least one high_score
        // Join with games to get game info, and use inner join to ensure scores exist
        // Note: PostgREST doesn't support filtering/ordering on joined tables with dot notation
        // so we fetch the data and filter/sort client-side
        const { data: modesData, error: queryError } = await supabase
          .from('game_modes')
          .select(`
            *,
            games!inner (
              name,
              icon_url,
              category,
              sort_order,
              is_active
            ),
            high_scores!inner (
              id
            )
          `)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (queryError) throw queryError

        if (isMounted && modesData) {
          // Filter out inactive games client-side
          const activeGameModes = modesData.filter(
            (mode: GameModeQueryResult) => mode.games.is_active
          )

          // Remove duplicates (since join with high_scores creates multiple rows)
          const uniqueModes = Array.from(
            new Map(
              activeGameModes.map((mode: GameModeQueryResult) => [
                mode.id,
                {
                  ...mode,
                  game_name: mode.games.name,
                  game_icon: mode.games.icon_url,
                  game_category: mode.games.category,
                  game_sort_order: mode.games.sort_order,
                  games: undefined, // Remove nested games object
                  high_scores: undefined, // Remove nested high_scores array
                },
              ])
            ).values()
          ) as GameModeWithGame[]

          // Sort by game order first, then mode order
          uniqueModes.sort((a, b) => {
            const gameOrder = (a.game_sort_order ?? 0) - (b.game_sort_order ?? 0)
            if (gameOrder !== 0) return gameOrder
            return (a.sort_order ?? 0) - (b.sort_order ?? 0)
          })

          setModes(uniqueModes)
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to fetch active game modes')
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchActiveGameModes()

    return () => {
      isMounted = false
    }
  }, [])

  return { modes, loading, error }
}

```

## File: src/hooks/useGame.ts
```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Game } from '@/lib/types'

interface UseGameResult {
  game: Game | null
  loading: boolean
  error: Error | null
}

/**
 * useGame - Fetches a single game by ID
 *
 * @param gameId - The game UUID to fetch
 */
export function useGame(gameId: string | null): UseGameResult {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameId) {
      setGame(null)
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchGame() {
      if (!gameId) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('games')
          .select('id, name, platform, category, icon_url, sort_order')
          .eq('id', gameId)
          .single()

        if (queryError) throw queryError

        if (isMounted) {
          setGame(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch game'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchGame()
    return () => {
      isMounted = false
    }
  }, [gameId])

  return { game, loading, error }
}

```

## File: src/hooks/useGameMode.ts
```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameMode } from '@/lib/types'

interface UseGameModeResult {
  mode: GameMode | null
  loading: boolean
  error: Error | null
}

/**
 * useGameMode - Fetches a single game mode by ID
 *
 * @param modeId - The game mode UUID to fetch
 */
export function useGameMode(modeId: string | null): UseGameModeResult {
  const [mode, setMode] = useState<GameMode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!modeId) {
      setMode(null)
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchMode() {
      if (!modeId) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('game_modes')
          .select('*')
          .eq('id', modeId)
          .single()

        if (queryError) throw queryError

        if (isMounted) {
          setMode(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch game mode'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMode()
    return () => {
      isMounted = false
    }
  }, [modeId])

  return { mode, loading, error }
}

```

## File: src/hooks/useGameModes.ts
```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameMode } from '@/lib/types'

interface UseGameModesResult {
  modes: GameMode[]
  loading: boolean
  error: Error | null
}

/**
 * useGameModes - Fetches all modes for a specific game
 *
 * @param gameId - The game UUID to fetch modes for
 */
export function useGameModes(gameId: string | null): UseGameModesResult {
  const [modes, setModes] = useState<GameMode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameId) {
      setModes([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchModes() {
      if (!gameId) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('game_modes')
          .select('*')
          .eq('game_id', gameId)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (queryError) throw queryError

        if (isMounted) {
          setModes(data || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch game modes'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchModes()
    return () => {
      isMounted = false
    }
  }, [gameId])

  return { modes, loading, error }
}

```

## File: src/hooks/useGames.ts
```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Game } from '@/lib/types'

interface UseGamesResult {
  games: Game[]
  loading: boolean
  error: Error | null
}

/**
 * useGames - Fetches games, optionally filtered by category
 *
 * @param category - Optional category to filter games
 */
export function useGames(category?: string): UseGamesResult {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchGames() {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('games')
          .select('id, name, platform, category, icon_url, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        // Filter by category if provided
        if (category) {
          query = query.eq('category', category)
        }

        const { data, error: queryError } = await query

        if (queryError) throw queryError

        if (isMounted) {
          setGames(data || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch games'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchGames()
    return () => {
      isMounted = false
    }
  }, [category])

  return { games, loading, error }
}

```

## File: src/hooks/useIdleTimer.ts
```ts
import { useEffect, useState, useCallback } from 'react'

const IDLE_TIMEOUT = 30000 // 30 seconds in milliseconds

interface UseIdleTimerResult {
  isIdle: boolean
  resetTimer: () => void
}

/**
 * useIdleTimer - Tracks user inactivity
 * Returns true after 30 seconds of no touch/mouse interaction
 *
 * @param timeout - Milliseconds until idle (default: 30000)
 */
export function useIdleTimer(timeout = IDLE_TIMEOUT): UseIdleTimerResult {
  const [isIdle, setIsIdle] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now())
    setIsIdle(false)
  }, [])

  useEffect(() => {
    // Events to listen for (touch and mouse for compatibility)
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'touchmove',
      'click',
    ]

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer()
    }

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    // Check for idle state every second
    const interval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity
      if (timeSinceActivity >= timeout) {
        setIsIdle(true)
      }
    }, 1000)

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      clearInterval(interval)
    }
  }, [lastActivity, timeout, resetTimer])

  return { isIdle, resetTimer }
}

```

## File: src/hooks/useLeaderboard.ts
```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { LeaderboardEntry, LeaderboardRank } from '@/lib/types'

interface UseLeaderboardResult {
  data: LeaderboardEntry[]
  loading: boolean
  error: Error | null
}

/**
 * useLeaderboard - Fetches top N scores for a specific game mode
 * Uses the get_leaderboard RPC function which properly handles score_direction sorting
 *
 * @param gameModeId - The game mode UUID to fetch scores for
 * @param limit - Maximum number of scores to return (default: 4)
 */
export function useLeaderboard(
  gameModeId: string | null,
  limit = 4
): UseLeaderboardResult {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameModeId) {
      setData([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchLeaderboard() {
      if (!gameModeId) return

      try {
        setLoading(true)
        setError(null)

        // Use the RPC function which properly sorts based on score_direction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (supabase as any).rpc('get_leaderboard', {
          mode_id: gameModeId,
          max_results: limit,
        })

        const rankedScores = result.data as LeaderboardRank[] | null
        const rpcError = result.error

        if (rpcError) throw rpcError

        // Now fetch additional data from leaderboard view for the returned score IDs
        // The RPC only returns basic info, we need game/mode details
        if (rankedScores && rankedScores.length > 0) {
          const scoreIds = rankedScores.map((s) => s.score_id)

          const { data: fullScores, error: viewError } = await supabase
            .from('leaderboard')
            .select('*')
            .in('score_id', scoreIds)

          if (viewError) throw viewError

          if (fullScores) {
            // Sort the full scores based on the rank order from RPC
            const sortedScores: LeaderboardEntry[] = []
            for (const ranked of rankedScores) {
              const fullScore = (fullScores as LeaderboardEntry[]).find(
                (full) => full.score_id === ranked.score_id
              )
              if (fullScore) {
                sortedScores.push(fullScore)
              }
            }

            if (isMounted) {
              setData(sortedScores)
            }
          } else {
            if (isMounted) {
              setData([])
            }
          }
        } else {
          if (isMounted) {
            setData([])
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to fetch leaderboard')
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchLeaderboard()

    return () => {
      isMounted = false
    }
  }, [gameModeId, limit])

  return { data, loading, error }
}

```

## File: src/hooks/usePlayers.ts
```ts
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Player } from '@/lib/types'

interface UsePlayersResult {
  players: Player[]
  loading: boolean
  error: Error | null
  createPlayer: (name: string, avatarUrl?: string | null) => Promise<Player | null>
  refetch: () => void
}

/**
 * usePlayers - Fetches all players and provides player creation
 */
export function usePlayers(): UsePlayersResult {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initial fetch with isMounted pattern
  useEffect(() => {
    let isMounted = true

    async function fetchPlayers() {
      try {
        setLoading(true)
        setError(null)
		
		// Supabase client type inference fails for insert operations with manual Database types.
		// See: https://github.com/supabase/supabase-js/issues/...
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: queryError } = await supabase
          .from('players')
          .select('*')
          .order('name', { ascending: true })

        if (!isMounted) return
        if (queryError) throw queryError
        setPlayers(data || [])
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err : new Error('Failed to fetch players'))
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPlayers()
    return () => {
      isMounted = false
    }
  }, [])

  // Refetch function for manual refetching (user-initiated)
  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('players')
        .select('*')
        .order('name', { ascending: true })

      if (queryError) throw queryError
      setPlayers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch players'))
    } finally {
      setLoading(false)
    }
  }, [])

  const createPlayer = useCallback(async (name: string, avatarUrl?: string | null): Promise<Player | null> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('players')
        .insert({ name, avatar_url: avatarUrl || null })
        .select()
        .single()

      if (insertError) throw insertError

      const newPlayer = data as Player
      setPlayers((prev) => [...prev, newPlayer].sort((a, b) => a.name.localeCompare(b.name)))
      return newPlayer
    } catch (err) {
      console.error('Failed to create player:', err)
      return null
    }
  }, [])

  return { players, loading, error, createPlayer, refetch }
}

```

## File: src/hooks/useRealtimeScores.ts
```ts
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { HighScore } from '@/lib/types'

/**
 * useRealtimeScores - Subscribes to high_scores INSERT events via Supabase Realtime
 * Triggers callback when a new score is added to the database
 *
 * @param onNewScore - Callback function that receives the new score data
 */
export function useRealtimeScores(onNewScore: (score: HighScore) => void) {
  useEffect(() => {
    // Create a channel for listening to high_scores changes
    const channel = supabase
      .channel('high_scores_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'high_scores',
        },
        (payload) => {
          // Payload.new contains the newly inserted row
          onNewScore(payload.new as HighScore)
        }
      )
      .subscribe()

    // Cleanup: remove channel on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [onNewScore])
}

```

## File: src/hooks/useSubmitScore.ts
```ts
import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface SubmitScoreParams {
  gameModeId: string
  playerId: string
  score: number
}

interface SubmitScoreResult {
  submitting: boolean
  error: Error | null
  submitScore: (params: SubmitScoreParams) => Promise<{ success: boolean; scoreId?: string }>
}

/**
 * useSubmitScore - Handles score submission to Supabase
 */
export function useSubmitScore(): SubmitScoreResult {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const submitScore = useCallback(async ({ gameModeId, playerId, score }: SubmitScoreParams) => {
    try {
      if (isMountedRef.current) {
        setSubmitting(true)
        setError(null)
      }

      
	  // Supabase client type inference fails for insert operations with manual Database types.
	  // This is a known limitation - the workaround is localized and type-safe on the result side.
	  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('high_scores')
        .insert({
          game_mode_id: gameModeId,
          player_id: playerId,
          team_id: null,
          score,
          metadata: {},
          achieved_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      const result = data as { id: string }
      return { success: true, scoreId: result.id }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit score')
      if (isMountedRef.current) {
        setError(error)
      }
      return { success: false }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false)
      }
    }
  }, [])

  return { submitting, error, submitScore }
}

```

## File: src/index.css
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply box-border;
  }

  html,
  body,
  #root {
    @apply h-full w-full m-0 p-0;
  }

  body {
    @apply bg-background-primary text-text-primary font-sans antialiased;
    font-size: 18px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    touch-action: manipulation;
    overscroll-behavior: none;
  }

  /* Kiosk-specific: no text selection, no tap highlight */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    user-select: none;
  }

  /* Allow selection in input fields */
  input,
  textarea {
    user-select: text;
  }

  /* Hide scrollbars but keep functionality */
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-background-card;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-background-elevated rounded;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-text-muted;
  }
}

@layer utilities {
  /* Tabular numbers for scores */
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }

  /* Touch-friendly minimum sizes */
  .touch-target {
    @apply min-h-[56px] min-w-[56px];
  }

  /* Kiosk container constraint */
  .kiosk-container {
    width: 800px;
    height: 480px;
    max-width: 100vw;
    max-height: 100vh;
    overflow: hidden;
    position: relative;
  }
  
  /* Smooth transitions */
  .transition-smooth {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
}

```

## File: src/lib/supabase.ts
```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Kiosk mode - no user sessions
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit realtime event frequency
    },
  },
})

```

## File: src/lib/types.ts
```ts
// ============================================================================
// DATABASE TYPES
// Generated from supabase/schema.sql
// ============================================================================

// Enums
export type ScoreDirection = 'lower_better' | 'higher_better'

export type ScoreFormat =
  | 'integer'       // 47 (points, throws, strokes, eliminations)
  | 'time_ms'       // stored as ms, displayed as 1:23.456 or 2:22.567
  | 'time_seconds'  // stored as seconds, displayed as 1:23 or 4:56
  | 'decimal_2'     // 98.45 (for percentages, etc.)
  | 'level'         // World 8-4 (stored as integer 84, formatted in UI)

export type GameCategory =
  | 'racing'
  | 'golf'
  | 'party'
  | 'darts'
  | 'pinball'
  | 'platformer'
  | 'rpg'
  | 'other'

// Table Types
export interface Player {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  team_id: string
  player_id: string
  joined_at: string
}

export interface Game {
  id: string
  name: string
  platform: string | null
  category: GameCategory
  icon_url: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameMode {
  id: string
  game_id: string
  name: string
  subtitle: string | null
  score_direction: ScoreDirection
  score_format: ScoreFormat
  score_unit: string | null
  context: Record<string, unknown>
  icon_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HighScore {
  id: string
  game_mode_id: string
  player_id: string | null
  team_id: string | null
  score: number
  metadata: Record<string, unknown>
  achieved_at: string
  created_at: string
}

// View Types
export interface LeaderboardEntry {
  score_id: string
  score: number
  achieved_at: string
  score_metadata: Record<string, unknown>

  // Game mode details
  game_mode_id: string
  mode_name: string
  mode_subtitle: string | null
  score_direction: ScoreDirection
  score_format: ScoreFormat
  score_unit: string | null
  mode_context: Record<string, unknown>

  // Game details
  game_id: string
  game_name: string
  platform: string | null
  category: GameCategory
  game_icon: string | null

  // Player details (null if team score)
  player_id: string | null
  player_name: string | null
  player_avatar: string | null

  // Team details (null if player score)
  team_id: string | null
  team_name: string | null
  team_avatar: string | null
}

export interface PersonalBest {
  score_id: string
  score: number
  achieved_at: string
  game_mode_id: string
  player_id: string
  score_direction: ScoreDirection
  score_format: ScoreFormat
  score_unit: string | null
  mode_name: string
  game_name: string
  player_name: string
  player_avatar: string | null
}

// Function Return Types
export interface LeaderboardRank {
  rank: number
  score_id: string
  score: number
  achieved_at: string
  player_id: string | null
  player_name: string | null
  player_avatar: string | null
  team_id: string | null
  team_name: string | null
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      players: {
        Row: Player
        Insert: {
          id?: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: Team
        Insert: {
          id?: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: TeamMember
        Insert: {
          team_id: string
          player_id: string
          joined_at?: string
        }
        Update: {
          team_id?: string
          player_id?: string
          joined_at?: string
        }
        Relationships: []
      }
      games: {
        Row: Game
        Insert: {
          id?: string
          name: string
          platform?: string | null
          category: GameCategory
          icon_url?: string | null
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          platform?: string | null
          category?: GameCategory
          icon_url?: string | null
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_modes: {
        Row: GameMode
        Insert: {
          id?: string
          game_id: string
          name: string
          subtitle?: string | null
          score_direction: ScoreDirection
          score_format: ScoreFormat
          score_unit?: string | null
          context?: Record<string, unknown>
          icon_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          name?: string
          subtitle?: string | null
          score_direction?: ScoreDirection
          score_format?: ScoreFormat
          score_unit?: string | null
          context?: Record<string, unknown>
          icon_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      high_scores: {
        Row: HighScore
        Insert: {
          id?: string
          game_mode_id: string
          player_id?: string | null
          team_id?: string | null
          score: number
          metadata?: Record<string, unknown>
          achieved_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          game_mode_id?: string
          player_id?: string | null
          team_id?: string | null
          score?: number
          metadata?: Record<string, unknown>
          achieved_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: LeaderboardEntry
      }
      personal_bests: {
        Row: PersonalBest
      }
    }
    Functions: {
      get_leaderboard: {
        Args: {
          mode_id: string
          max_results?: number
        }
        Returns: LeaderboardRank[]
      }
    }
    Enums: {
      score_direction: ScoreDirection
      score_format: ScoreFormat
      game_category: GameCategory
    }
  }
}

// Insert Types (for creating new records) - convenience exports
export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type GameInsert = Database['public']['Tables']['games']['Insert']
export type GameModeInsert = Database['public']['Tables']['game_modes']['Insert']
export type HighScoreInsert = Database['public']['Tables']['high_scores']['Insert']

export type PlayerUpdate = Database['public']['Tables']['players']['Update']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']
export type GameUpdate = Database['public']['Tables']['games']['Update']
export type GameModeUpdate = Database['public']['Tables']['game_modes']['Update']

```

## File: src/lib/utils.ts
```ts
import type { ScoreFormat } from './types'

/**
 * Format a score value based on its format type
 * @param value Raw score value from database
 * @param format How to display the score
 * @param unit Optional unit to append (e.g., "pts", "throws")
 * @returns Formatted string for display
 */
export function formatScore(
  value: number,
  format: ScoreFormat,
  unit?: string | null
): string {
  switch (format) {
    case 'time_ms': {
      // Convert milliseconds to M:SS.mmm format
      const minutes = Math.floor(value / 60000)
      const seconds = Math.floor((value % 60000) / 1000)
      const ms = value % 1000
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
    }

    case 'time_seconds': {
      // Convert seconds to M:SS format
      const minutes = Math.floor(value / 60)
      const seconds = value % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    case 'decimal_2': {
      // Display as decimal with 2 places
      const decimal = (value / 100).toFixed(2)
      return unit ? `${decimal} ${unit}` : decimal
    }

    case 'level': {
      // Display as World X-Y (e.g., 84 -> "World 8-4")
      const world = Math.floor(value / 10)
      const level = value % 10
      return `World ${world}-${level}`
    }

    case 'integer':
    default: {
      // Display as formatted number with commas
      const formatted = value.toLocaleString()
      return unit ? `${formatted} ${unit}` : formatted
    }
  }
}

/**
 * Parse time input from M:SS.mmm format to milliseconds
 */
export function parseTimeMs(minutes: number, seconds: number, milliseconds: number): number {
  return (minutes * 60000) + (seconds * 1000) + milliseconds
}

/**
 * Parse time input from M:SS format to seconds
 */
export function parseTimeSeconds(minutes: number, seconds: number): number {
  return (minutes * 60) + seconds
}

/**
 * Parse decimal input to integer storage format (multiply by 100)
 */
export function parseDecimal(value: number): number {
  return Math.round(value * 100)
}

/**
 * Parse level input (World X-Y) to integer storage format
 */
export function parseLevel(world: number, level: number): number {
  return (world * 10) + level
}

/**
 * Get medal emoji for rank position
 */
export function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return ''
  }
}

/**
 * Get rank display text
 */
export function getRankText(rank: number): string {
  const medal = getMedalEmoji(rank)
  if (medal) return medal
  return `${rank}.`
}

/**
 * Get player initials for avatar fallback
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate a consistent color for a player based on their name
 * Used for avatar fallback backgrounds
 */
export function getPlayerColor(name: string): string {
  const colors = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#22c55e', // green
    '#3b82f6', // blue
    '#a855f7', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
  ]

  // Simple hash function
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Format a timestamp for display
 */
export function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/**
 * Format a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return formatDate(timestamp)
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Generate a unique key for React lists
 */
export function generateKey(prefix: string, id: string | number): string {
  return `${prefix}-${id}`
}

```

## File: src/main.tsx
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

## File: src/pages/AddScore.tsx
```tsx
import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import {
  SelectField,
  PickerModal,
  TimeInput,
  NumericInput,
  NewPlayerModal
} from '@/components/input'
import { CelebrationOverlay } from '@/components/overlays'
import { useGames } from '@/hooks/useGames'
import { useGameModes } from '@/hooks/useGameModes'
import { usePlayers } from '@/hooks/usePlayers'
import { useSubmitScore } from '@/hooks/useSubmitScore'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import type { ScoreFormat } from '@/lib/types'

type PickerType = 'game' | 'mode' | 'player' | null

/**
 * AddScore - Multi-step score entry form
 * Route: /add-score
 *
 * Supports URL params for pre-population:
 * - ?gameId=xxx - Pre-select a game
 * - ?modeId=xxx - Pre-select a mode (requires gameId)
 */
export function AddScore() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Form state - pre-populate from URL params if present
  const [selectedGameId, setSelectedGameId] = useState<string | null>(
    searchParams.get('gameId')
  )
  const [selectedModeId, setSelectedModeId] = useState<string | null>(
    searchParams.get('modeId')
  )
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [scoreValue, setScoreValue] = useState<number | null>(null)

  // Modal visibility state
  const [activePicker, setActivePicker] = useState<PickerType>(null)
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [submittedRank, setSubmittedRank] = useState(1)

  // Data hooks
  const { games, loading: gamesLoading } = useGames()
  const { modes, loading: modesLoading } = useGameModes(selectedGameId)
  const { players, loading: playersLoading, createPlayer } = usePlayers()
  const { submitScore, submitting, error: submitError } = useSubmitScore()

  // Fetch current leaderboard to calculate rank (fetch more to get accurate rank)
  const { data: currentLeaderboard } = useLeaderboard(selectedModeId, 100)

  // Derived display values
  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) || null,
    [games, selectedGameId]
  )

  const selectedMode = useMemo(
    () => modes.find((m) => m.id === selectedModeId) || null,
    [modes, selectedModeId]
  )

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) || null,
    [players, selectedPlayerId]
  )

  // Clear dependent fields when game changes
  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId)
    setSelectedModeId(null) // Clear mode since it depends on game
    setScoreValue(null) // Clear score since input type may change
  }

  // Clear score when mode changes (input type may differ)
  const handleModeSelect = (modeId: string) => {
    setSelectedModeId(modeId)
    setScoreValue(null)
  }

  // Create new player and auto-select them
  const handleCreatePlayer = async (name: string) => {
    const player = await createPlayer(name)
    if (player) {
      setSelectedPlayerId(player.id)
    }
  }

  // Calculate what rank this score would achieve
  const calculateRank = (score: number): number => {
    if (!selectedMode || currentLeaderboard.length === 0) return 1

    const isLowerBetter = selectedMode.score_direction === 'lower_better'
    let rank = 1

    for (const entry of currentLeaderboard) {
      if (isLowerBetter) {
        // For lower_better: if new score is >= existing, it ranks below
        if (score >= entry.score) rank++
      } else {
        // For higher_better: if new score is <= existing, it ranks below
        if (score <= entry.score) rank++
      }
    }

    return rank
  }

  // Form validation
  const isFormComplete = Boolean(
    selectedGameId &&
    selectedModeId &&
    selectedPlayerId &&
    scoreValue !== null
  )
  const canSubmit = isFormComplete && !submitting

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedModeId || !selectedPlayerId || scoreValue === null) return

    const result = await submitScore({
      gameModeId: selectedModeId,
      playerId: selectedPlayerId,
      score: scoreValue,
    })

    if (result.success) {
      // Calculate rank before showing celebration
      const rank = calculateRank(scoreValue)
      setSubmittedRank(rank)
      setShowCelebration(true)
    }
  }

  // Handle celebration dismiss - return to home
  const handleCelebrationClose = () => {
    setShowCelebration(false)
    navigate('/')
  }

  // Handle back/cancel - go back or to home
  const handleBack = () => {
    // If there's history, go back; otherwise go home
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Render appropriate score input based on mode's score_format
  const renderScoreInput = () => {
    if (!selectedMode) {
      return (
        <div className="h-[64px] flex items-center justify-center">
          <p className="text-text-muted">Select a game mode first</p>
        </div>
      )
    }

    const format = selectedMode.score_format as ScoreFormat

    switch (format) {
      case 'time_ms':
        return (
          <TimeInput
            value={scoreValue}
            onChange={setScoreValue}
            showMilliseconds={true}
          />
        )

      case 'time_seconds':
        return (
          <TimeInput
            value={scoreValue}
            onChange={setScoreValue}
            showMilliseconds={false}
          />
        )

      case 'decimal_2':
        return (
          <NumericInput
            value={scoreValue}
            onChange={setScoreValue}
            unit={selectedMode.score_unit}
            isDecimal={true}
          />
        )

      case 'integer':
      default:
        return (
          <NumericInput
            value={scoreValue}
            onChange={setScoreValue}
            unit={selectedMode.score_unit}
            isDecimal={false}
          />
        )
    }
  }

  // Get input label based on score format
  const getScoreInputLabel = (): string => {
    if (!selectedMode) return 'Score'

    const format = selectedMode.score_format as ScoreFormat
    if (format === 'time_ms' || format === 'time_seconds') {
      return 'Enter time'
    }
    return 'Enter score'
  }

  // Transform data for picker modals
  const gameOptions = useMemo(() =>
    games.map((g) => ({
      id: g.id,
      label: g.name,
      sublabel: g.platform
    })),
    [games]
  )

  const modeOptions = useMemo(() =>
    modes.map((m) => ({
      id: m.id,
      label: m.name,
      sublabel: m.subtitle
    })),
    [modes]
  )

  const playerOptions = useMemo(() =>
    players.map((p) => ({
      id: p.id,
      label: p.name
    })),
    [players]
  )

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel="Cancel"
          onBack={handleBack}
          title="ADD SCORE"
        />

        {/* Form body */}
        <div className="flex-1 p-md space-y-4 overflow-y-auto">
          {/* Game selector */}
          <SelectField
            label="Game"
            value={selectedGame?.name || null}
            placeholder={gamesLoading ? 'Loading...' : 'Select a game'}
            onPress={() => setActivePicker('game')}
            disabled={gamesLoading}
          />

          {/* Mode selector - disabled until game is selected */}
          <SelectField
            label="Mode"
            value={selectedMode?.name || null}
            placeholder={
              !selectedGameId
                ? 'Select a game first'
                : modesLoading
                  ? 'Loading...'
                  : 'Select a mode'
            }
            onPress={() => setActivePicker('mode')}
            disabled={!selectedGameId || modesLoading}
          />

          {/* Player selector */}
          <SelectField
            label="Player"
            value={selectedPlayer?.name || null}
            placeholder={playersLoading ? 'Loading...' : 'Select a player'}
            onPress={() => setActivePicker('player')}
            disabled={playersLoading}
          />

          {/* Score input - type varies by mode */}
          <div className="pt-4">
            <p className="text-sm text-text-secondary mb-3 text-center">
              {getScoreInputLabel()}
            </p>
            {renderScoreInput()}
          </div>

          {/* Error display */}
          {submitError && (
            <div className="p-3 bg-red-500/10 rounded-lg">
              <p className="text-red-500 text-center text-sm">
                {submitError.message}
              </p>
            </div>
          )}
        </div>

        {/* Submit button - fixed at bottom */}
        <div className="p-md border-t border-background-elevated">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              w-full h-[56px] rounded-lg
              text-lg font-bold
              transition-colors
              ${canSubmit
                ? 'bg-category-darts text-white active:brightness-110'
                : 'bg-background-elevated text-text-muted cursor-not-allowed'
              }
            `}
          >
            {submitting ? 'Saving...' : 'Save Score'}
          </button>
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Game picker modal */}
      <PickerModal
        isOpen={activePicker === 'game'}
        onClose={() => setActivePicker(null)}
        title="Select Game"
        options={gameOptions}
        selectedId={selectedGameId}
        onSelect={handleGameSelect}
        emptyMessage="No games available"
      />

      {/* Mode picker modal */}
      <PickerModal
        isOpen={activePicker === 'mode'}
        onClose={() => setActivePicker(null)}
        title="Select Mode"
        options={modeOptions}
        selectedId={selectedModeId}
        onSelect={handleModeSelect}
        emptyMessage={selectedGameId ? 'No modes for this game' : 'Select a game first'}
      />

      {/* Player picker modal */}
      <PickerModal
        isOpen={activePicker === 'player'}
        onClose={() => setActivePicker(null)}
        title="Select Player"
        options={playerOptions}
        selectedId={selectedPlayerId}
        onSelect={setSelectedPlayerId}
        emptyMessage="No players yet — create one!"
        footerAction={{
          label: '+ New Player',
          onPress: () => {
            setActivePicker(null)
            setShowNewPlayerModal(true)
          },
        }}
      />

      {/* New player creation modal */}
      <NewPlayerModal
        isOpen={showNewPlayerModal}
        onClose={() => setShowNewPlayerModal(false)}
        onCreate={handleCreatePlayer}
      />

      {/* Celebration overlay - shown after successful submission */}
      {selectedPlayer && selectedMode && scoreValue !== null && (
        <CelebrationOverlay
          isOpen={showCelebration}
          onClose={handleCelebrationClose}
          playerName={selectedPlayer.name}
          score={scoreValue}
          scoreFormat={selectedMode.score_format as ScoreFormat}
          scoreUnit={selectedMode.score_unit}
          rank={submittedRank}
        />
      )}
    </KioskLayout>
  )
}

```

## File: src/pages/CategorySelection.tsx
```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { CategoryButton } from '@/components/cards/CategoryButton'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import type { GameCategory } from '@/lib/types'

const CATEGORIES: GameCategory[] = [
  'racing',
  'golf',
  'party',
  'darts',
  'pinball',
  'platformer',
  'rpg',
  'other',
]

/**
 * CategorySelection - Grid of game categories
 * Route: /browse
 * Auto-returns to idle display after 30s inactivity
 */
export function CategorySelection() {
  const navigate = useNavigate()
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleCategoryClick = (category: GameCategory) => {
    resetTimer()
    navigate(`/browse/${category}`)
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel="Back"
          onBack={handleBack}
          onAddScore={handleAddScore}
          title="CATEGORIES"
        />

        {/* Category grid */}
        <div className="flex-1 p-md">
          <div className="grid grid-cols-4 grid-rows-2 gap-3 h-full">
            {CATEGORIES.map((category) => (
              <CategoryButton
                key={category}
                category={category}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="h-[56px] flex items-center justify-center border-t border-background-elevated">
          <p className="text-sm text-text-muted">
            30s idle → returns to auto mode
          </p>
        </div>
      </div>
    </KioskLayout>
  )
}

```

## File: src/pages/GameSelection.tsx
```tsx
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { GameCard } from '@/components/cards/GameCard'
import { useGames } from '@/hooks/useGames'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import type { GameCategory } from '@/lib/types'

/**
 * GameSelection - List of games in a category
 * Route: /browse/:category
 */
export function GameSelection() {
  const navigate = useNavigate()
  const { category } = useParams<{ category: GameCategory }>()
  const { games, loading, error } = useGames(category)
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleGameClick = (gameId: string) => {
    resetTimer()
    navigate(`/browse/${category}/${gameId}`)
  }

  const handleBack = () => {
    navigate('/browse')
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  // Category display name
  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : ''

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel="Categories"
          onBack={handleBack}
          onAddScore={handleAddScore}
        />

        {/* Category title */}
        <div className="h-[40px] px-md flex items-center">
          <h2 className="text-lg font-bold" style={{ color: getCategoryColor(category) }}>
            {categoryName.toUpperCase()}
          </h2>
        </div>

        {/* Games list */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">Loading games...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-red-500 mb-2">Error loading games</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : games.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">No games in this category</p>
            </div>
          ) : (
            games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => handleGameClick(game.id)}
              />
            ))
          )}
        </div>
      </div>
    </KioskLayout>
  )
}

// Helper to get category color
function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    racing: '#ef4444',
    golf: '#22c55e',
    party: '#f59e0b',
    darts: '#3b82f6',
    pinball: '#a855f7',
    platformer: '#ec4899',
    rpg: '#06b6d4',
    other: '#6b7280',
  }
  return colors[category || 'other'] || colors.other
}

```

## File: src/pages/IdleDisplay.tsx
```tsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { KioskLayout } from '@/components/layout'
import { ScoreRow } from '@/components/display'
import { useActiveGameModes } from '@/hooks/useActiveGameModes'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useRealtimeScores } from '@/hooks/useRealtimeScores'
import { useKioskStore } from '@/stores/kioskStore'
import type { HighScore } from '@/lib/types'

/**
 * IdleDisplay - Auto-cycling carousel of game mode leaderboards
 *
 * Features:
 * - Auto-cycles through game modes with scores every 10 seconds
 * - Shows top 4 scores per mode
 * - Tap anywhere to navigate to browse mode
 * - Real-time score updates with alerts (placeholder)
 * - Smooth slide transitions between modes
 */
export function IdleDisplay() {
  const navigate = useNavigate()
  const { modes, loading: modesLoading, error: modesError } = useActiveGameModes()
  const cycleSpeedMs = useKioskStore((state) => state.cycleSpeedMs)

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentMode = modes[currentIndex]

  const { data: scores, loading: scoresLoading, error: scoresError } = useLeaderboard(
    currentMode?.id || null
  )

  // Memoize the realtime callback to prevent re-subscription on every render
  const handleNewScore = useCallback((newScore: HighScore) => {
    // Placeholder for real-time alert
    console.log('New score received:', newScore)
    // TODO: Show celebration overlay/alert
  }, [])

  useRealtimeScores(handleNewScore)

  // Auto-cycle through modes
  useEffect(() => {
    if (modes.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % modes.length)
    }, cycleSpeedMs)

    return () => clearInterval(timer)
  }, [modes.length, cycleSpeedMs])

  // Handle tap to navigate
  const handleTap = () => {
    navigate('/browse')
  }

  // Error state for modes loading
  if (modesError) {
    return (
      <KioskLayout>
        <div className="h-full flex flex-col items-center justify-center">
          <p className="text-xl text-red-500 mb-2">Connection Error</p>
          <p className="text-text-secondary text-sm">{modesError.message}</p>
        </div>
      </KioskLayout>
    )
  }

  // Loading state
  if (modesLoading) {
    return (
      <KioskLayout>
        <div className="h-full flex items-center justify-center">
          <p className="text-text-secondary">Loading game modes...</p>
        </div>
      </KioskLayout>
    )
  }

  // Empty state - no modes with scores
  if (modes.length === 0) {
    return (
      <KioskLayout>
        <div
          className="h-full flex flex-col items-center justify-center cursor-pointer"
          onClick={handleTap}
        >
          <p className="text-xl text-text-primary mb-2">No scores yet!</p>
          <p className="text-text-secondary mb-6">Be the first to set a record</p>
          <p className="text-sm text-text-muted">Tap to browse games or add score</p>
        </div>
      </KioskLayout>
    )
  }

  return (
    <KioskLayout>
      <div
        className="h-full flex flex-col cursor-pointer"
        onClick={handleTap}
      >
        {/* Header: Game + Mode info */}
        <div className="h-[72px] px-md flex flex-col justify-center border-b border-background-elevated">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                {currentMode?.game_icon && (
                  <img
                    src={currentMode.game_icon}
                    alt=""
                    className="w-8 h-8 rounded"
                  />
                )}
                <div>
                  <h1 className="text-xl font-bold text-text-primary">
                    {currentMode?.game_name}
                  </h1>
                  <p className="text-base text-text-secondary">
                    {currentMode?.name}
                    {currentMode?.subtitle && ` — ${currentMode.subtitle}`}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Leaderboard: Score rows */}
        <div className="flex-1 flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode?.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {scoresLoading ? (
                <div className="flex items-center justify-center h-[288px]">
                  <p className="text-text-secondary">Loading scores...</p>
                </div>
              ) : scoresError ? (
                <div className="flex flex-col items-center justify-center h-[288px] px-4">
                  <p className="text-red-500 mb-2">Error loading scores</p>
                  <p className="text-text-muted text-sm text-center">
                    {scoresError.message}
                  </p>
                </div>
              ) : scores.length === 0 ? (
                <div className="flex items-center justify-center h-[288px]">
                  <p className="text-text-secondary">No scores yet for this mode</p>
                </div>
              ) : (
                scores.slice(0, 4).map((entry, index) => (
                  <ScoreRow
                    key={entry.score_id}
                    rank={index + 1}
                    playerName={entry.player_name || entry.team_name || 'Unknown'}
                    playerAvatar={entry.player_avatar || entry.team_avatar}
                    score={entry.score}
                    scoreFormat={entry.score_format}
                    scoreUnit={entry.score_unit}
                    className="bg-background-card rounded-lg"
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: Tap hint */}
        <div className="h-[56px] flex items-center justify-center border-t border-background-elevated">
          <p className="text-sm text-text-muted">
            Tap to browse or add score
          </p>
        </div>
      </div>
    </KioskLayout>
  )
}

```

## File: src/pages/index.ts
```ts
// Page components (routes)
// Export pages from this directory for easy imports

export { IdleDisplay } from './IdleDisplay'
export { CategorySelection } from './CategorySelection'
export { GameSelection } from './GameSelection'
export { ModeSelection } from './ModeSelection'
export { LeaderboardView } from './LeaderboardView'
export { AddScore } from './AddScore'
// export { Settings } from './Settings'

```

## File: src/pages/LeaderboardView.tsx
```tsx
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { ScoreRow } from '@/components/display/ScoreRow'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGame } from '@/hooks/useGame'
import { useGameMode } from '@/hooks/useGameMode'
import { useIdleTimer } from '@/hooks/useIdleTimer'

/**
 * LeaderboardView - Full leaderboard for a specific game mode
 * Route: /browse/:category/:gameId/:modeId
 */
export function LeaderboardView() {
  const navigate = useNavigate()
  const { category, gameId, modeId } = useParams<{
    category: string
    gameId: string
    modeId: string
  }>()
  const { data: scores, loading, error } = useLeaderboard(modeId || null, 10)
  const { game: currentGame } = useGame(gameId || null)
  const { mode: currentMode } = useGameMode(modeId || null)
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleBack = () => {
    resetTimer()
    navigate(`/browse/${category}/${gameId}`)
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel={currentGame?.name || 'Back'}
          onBack={handleBack}
          onAddScore={handleAddScore}
        />

        {/* Mode title */}
        <div className="h-[56px] px-md flex flex-col justify-center">
          <h2 className="text-lg font-bold text-text-primary">
            {currentMode?.name || 'Leaderboard'}
          </h2>
          {currentMode?.subtitle && (
            <p className="text-sm text-text-secondary">{currentMode.subtitle}</p>
          )}
        </div>

        {/* Leaderboard */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">Loading...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <p className="text-red-500 mb-2">Error loading leaderboard</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : scores.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">No scores yet — be the first!</p>
            </div>
          ) : (
            scores.map((entry, index) => (
              <ScoreRow
                key={entry.score_id}
                rank={index + 1}
                playerName={entry.player_name || entry.team_name || 'Unknown'}
                playerAvatar={entry.player_avatar || entry.team_avatar || null}
                score={entry.score}
                scoreFormat={entry.score_format}
                scoreUnit={entry.score_unit || undefined}
                className="bg-background-card rounded-lg"
              />
            ))
          )}
        </div>
      </div>
    </KioskLayout>
  )
}

```

## File: src/pages/ModeSelection.tsx
```tsx
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { ModeCard } from '@/components/cards/ModeCard'
import { useGameModes } from '@/hooks/useGameModes'
import { useGame } from '@/hooks/useGame'
import { useIdleTimer } from '@/hooks/useIdleTimer'

/**
 * ModeSelection - List of game modes for a specific game
 * Route: /browse/:category/:gameId
 */
export function ModeSelection() {
  const navigate = useNavigate()
  const { category, gameId } = useParams<{ category: string; gameId: string }>()
  const { modes, loading, error } = useGameModes(gameId || null)
  const { game: currentGame } = useGame(gameId || null)
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleModeClick = (modeId: string) => {
    resetTimer()
    navigate(`/browse/${category}/${gameId}/${modeId}`)
  }

  const handleBack = () => {
    navigate(`/browse/${category}`)
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel={currentGame?.name || 'Back'}
          onBack={handleBack}
          onAddScore={handleAddScore}
        />

        {/* Game title */}
        <div className="h-[48px] px-md flex items-center gap-3">
          {currentGame?.icon_url && (
            <img
              src={currentGame.icon_url}
              alt=""
              className="w-6 h-6 rounded"
            />
          )}
          <h2 className="text-lg font-bold text-text-primary">
            {currentGame?.name || 'Game Modes'}
          </h2>
        </div>

        {/* Modes list */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">Loading modes...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-red-500 mb-2">Error loading modes</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : modes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">No modes for this game</p>
            </div>
          ) : (
            modes.map((mode) => (
              <ModeCard
                key={mode.id}
                mode={mode}
                onClick={() => handleModeClick(mode.id)}
              />
            ))
          )}
        </div>
      </div>
    </KioskLayout>
  )
}

```

## File: src/stores/kioskStore.ts
```ts
import { create } from 'zustand'
import type { Game, GameMode, Player, GameCategory } from '@/lib/types'

// UI state for the kiosk application
interface KioskState {
  // UI State
  isIdleMode: boolean
  idleTimer: number | null
  soundEnabled: boolean
  cycleSpeedMs: number

  // Carousel state
  activeModes: GameMode[]
  currentIndex: number
  isCarouselPaused: boolean

  // Browse state
  selectedCategory: GameCategory | null
  selectedGame: Game | null
  selectedMode: GameMode | null

  // Add score form state
  formGame: Game | null
  formMode: GameMode | null
  formPlayer: Player | null
  formScoreValue: number | null
  isSubmitting: boolean

  // Realtime alert
  pendingAlertScoreId: string | null

  // Actions
  setIdleMode: (idle: boolean) => void
  resetIdleTimer: () => void
  setSoundEnabled: (enabled: boolean) => void
  setCycleSpeed: (ms: number) => void

  setActiveModes: (modes: GameMode[]) => void
  setCurrentIndex: (index: number) => void
  pauseCarousel: () => void
  resumeCarousel: () => void

  setSelectedCategory: (category: GameCategory | null) => void
  setSelectedGame: (game: Game | null) => void
  setSelectedMode: (mode: GameMode | null) => void

  setFormGame: (game: Game | null) => void
  setFormMode: (mode: GameMode | null) => void
  setFormPlayer: (player: Player | null) => void
  setFormScoreValue: (value: number | null) => void
  setSubmitting: (submitting: boolean) => void
  resetForm: () => void

  showAlert: (scoreId: string) => void
  clearAlert: () => void
}

export const useKioskStore = create<KioskState>((set) => ({
  // Initial state
  isIdleMode: true,
  idleTimer: null,
  soundEnabled: true,
  cycleSpeedMs: 10000,

  activeModes: [],
  currentIndex: 0,
  isCarouselPaused: false,

  selectedCategory: null,
  selectedGame: null,
  selectedMode: null,

  formGame: null,
  formMode: null,
  formPlayer: null,
  formScoreValue: null,
  isSubmitting: false,

  pendingAlertScoreId: null,

  // Actions
  setIdleMode: (idle) => set({ isIdleMode: idle }),
  resetIdleTimer: () => set({ idleTimer: Date.now() }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setCycleSpeed: (ms) => set({ cycleSpeedMs: ms }),

  setActiveModes: (modes) => set({ activeModes: modes }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  pauseCarousel: () => set({ isCarouselPaused: true }),
  resumeCarousel: () => set({ isCarouselPaused: false }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedGame: (game) => set({ selectedGame: game }),
  setSelectedMode: (mode) => set({ selectedMode: mode }),

  setFormGame: (game) => set({ formGame: game }),
  setFormMode: (mode) => set({ formMode: mode }),
  setFormPlayer: (player) => set({ formPlayer: player }),
  setFormScoreValue: (value) => set({ formScoreValue: value }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  resetForm: () =>
    set({
      formGame: null,
      formMode: null,
      formPlayer: null,
      formScoreValue: null,
      isSubmitting: false,
    }),

  showAlert: (scoreId) => set({ pendingAlertScoreId: scoreId }),
  clearAlert: () => set({ pendingAlertScoreId: null }),
}))

```

## File: src/vite-env.d.ts
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

```

