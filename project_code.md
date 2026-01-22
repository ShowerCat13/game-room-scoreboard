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
          primary: 'var(--color-bg-primary)',
          card: 'var(--color-bg-card)',
          elevated: 'var(--color-bg-elevated)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
        },
        category: {
          racing: 'var(--color-category-racing)',
          golf: 'var(--color-category-golf)',
          party: 'var(--color-category-party)',
          darts: 'var(--color-category-darts)',
          pinball: 'var(--color-category-pinball)',
          platformer: 'var(--color-category-platformer)',
          rpg: 'var(--color-category-rpg)',
          other: 'var(--color-category-other)',
        },
        medals: {
          gold: 'var(--color-medal-gold)',
          silver: 'var(--color-medal-silver)',
          bronze: 'var(--color-medal-bronze)',
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
        // Mobile-first breakpoints
        'mobile': { 'max': '639px' },      // Phones (portrait)
        'tablet': { 'min': '640px', 'max': '1023px' }, // Tablets
        'desktop': { 'min': '1024px' },    // Desktop
        'kiosk': '800px',                  // Pi kiosk minimum
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
import os from 'os'

// Detect local network IP address for QR code feature
function getLocalIP(): string {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

const localIP = getLocalIP()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Inject the local IP address at build time for QR code
    __LOCAL_IP__: JSON.stringify(localIP),
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
  "version": "0.9.9",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.47.13",
    "framer-motion": "^11.18.0",
    "lucide-react": "^0.562.0",
    "qrcode.react": "^4.0.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.2.1",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.0",
    "@playwright/test": "^1.40.0",
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
  Settings,
  Manage,
} from '@/pages'
import { useSoundInit, useTheme } from '@/hooks'

function App() {
  // Initialize audio context on first user interaction
  useSoundInit()
  
  // Apply theme CSS variables to document root
  useTheme()

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

        {/* Settings & Management */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/manage" element={<Manage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

## File: src/components/cards/CategoryButton.tsx
```tsx
import { motion } from 'framer-motion'
import { 
  Car, 
  Flag, 
  PartyPopper, 
  Target, 
  Disc3, 
  Gamepad2, 
  Swords, 
  Puzzle 
} from 'lucide-react'
import type { GameCategory } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

interface CategoryButtonProps {
  category: GameCategory
  onClick: () => void
  className?: string
  index?: number
}

// Map categories to their color values and display info
const categoryConfig: Record<GameCategory, { 
  color: string
  bgGradient: string
  glowClass: string
  Icon: LucideIcon
}> = {
  racing: {
    color: 'text-category-racing',
    bgGradient: 'from-red-500/10 to-transparent',
    glowClass: 'category-glow-racing',
    Icon: Car,
  },
  golf: {
    color: 'text-category-golf',
    bgGradient: 'from-green-500/10 to-transparent',
    glowClass: 'category-glow-golf',
    Icon: Flag,
  },
  party: {
    color: 'text-category-party',
    bgGradient: 'from-amber-500/10 to-transparent',
    glowClass: 'category-glow-party',
    Icon: PartyPopper,
  },
  darts: {
    color: 'text-category-darts',
    bgGradient: 'from-blue-500/10 to-transparent',
    glowClass: 'category-glow-darts',
    Icon: Target,
  },
  pinball: {
    color: 'text-category-pinball',
    bgGradient: 'from-purple-500/10 to-transparent',
    glowClass: 'category-glow-pinball',
    Icon: Disc3,
  },
  platformer: {
    color: 'text-category-platformer',
    bgGradient: 'from-pink-500/10 to-transparent',
    glowClass: 'category-glow-platformer',
    Icon: Gamepad2,
  },
  rpg: {
    color: 'text-category-rpg',
    bgGradient: 'from-cyan-500/10 to-transparent',
    glowClass: 'category-glow-rpg',
    Icon: Swords,
  },
  other: {
    color: 'text-category-other',
    bgGradient: 'from-gray-500/10 to-transparent',
    glowClass: 'category-glow-other',
    Icon: Puzzle,
  },
}

/**
 * CategoryButton - Touch-friendly category selection button
 * Size: fills grid cell (approx 240×168 in 3-column grid)
 * Features: Category-colored glow, gradient background, satisfying press animation
 */
export function CategoryButton({ category, onClick, className = '', index = 0 }: CategoryButtonProps) {
  const config = categoryConfig[category]
  const displayName = category.charAt(0).toUpperCase() + category.slice(1)
  const { Icon } = config

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileTap={{ scale: 0.96 }}
      className={`
        min-h-[56px] 
        bg-background-card 
        rounded-xl
        flex flex-col items-center justify-center gap-2
        transition-all duration-fast
        overflow-hidden
        relative
        ${config.glowClass}
        ${className}
      `}
    >
      {/* Gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50`}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <Icon className={`w-8 h-8 ${config.color}`} strokeWidth={2} />
        <span className={`text-lg font-bold ${config.color}`}>
          {displayName}
        </span>
      </div>

      {/* Subtle bottom border accent */}
      <div 
        className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-60 ${config.color.replace('text-', 'bg-')}`}
      />
    </motion.button>
  )
}
```

## File: src/components/cards/DetailCard.tsx
```tsx
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface DetailCardProps {
  detail: {
    id: string
    name: string
  }
  onClick: () => void
  className?: string
  index?: number
}

/**
 * DetailCard - Card displaying a game detail (track, course, enemy type, etc.)
 * Height: 64px, padding: 12px vertical, 16px horizontal
 * Features: Card shadow, press animation, chevron indicator
 */
export function DetailCard({ detail, onClick, className = '', index = 0 }: DetailCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileTap={{ scale: 0.98 }}
      className={`
        h-[64px] py-3 px-md
        card-interactive
        flex items-center justify-between
        w-full text-left
        ${className}
      `}
    >
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <div className="text-base font-semibold text-text-primary truncate">
          {detail.name}
        </div>
      </div>
      
      {/* Chevron indicator */}
      <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0 ml-2" />
    </motion.button>
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
export { DetailCard } from './DetailCard'
```

## File: src/components/cards/ModeCard.tsx
```tsx
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface ModeCardProps {
  mode: {
    id: string
    name: string
  }
  onClick: () => void
  className?: string
  index?: number
}

/**
 * ModeCard - Card displaying a game mode with name
 * Height: 64px, padding: 12px vertical, 16px horizontal
 * Features: Card shadow, press animation, chevron indicator
 */
export function ModeCard({ mode, onClick, className = '', index = 0 }: ModeCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileTap={{ scale: 0.98 }}
      className={`
        h-[64px] py-3 px-md
        card-interactive
        flex items-center justify-between
        w-full text-left
        ${className}
      `}
    >
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <div className="text-base font-semibold text-text-primary truncate">
          {mode.name}
        </div>
      </div>
      
      {/* Chevron indicator */}
      <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0 ml-2" />
    </motion.button>
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
  ringClass?: string
}

/**
 * PlayerAvatar - 48x48 circular player avatar with fallback
 * Fallback: colored circle with player initials
 * Features: Optional medal ring for podium positions
 */
export function PlayerAvatar({
  name,
  avatarUrl,
  size = 48,
  className = '',
  ringClass = ''
}: PlayerAvatarProps) {
  const initials = getInitials(name)
  const backgroundColor = getPlayerColor(name)

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 ${ringClass} ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ${ringClass} ${className}`}
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
import { Medal } from 'lucide-react'

interface RankBadgeProps {
  rank: number
  className?: string
}

/**
 * RankBadge - Displays medal icon for ranks 1-3 or number for other ranks
 * Width: 40px, Font: lg (24px), bold
 * Features: Colored medals with glow effects
 */
export function RankBadge({ rank, className = '' }: RankBadgeProps) {
  const isMedalist = rank >= 1 && rank <= 3
  
  // Medal color and glow class based on rank
  const getMedalStyle = () => {
    switch (rank) {
      case 1:
        return {
          colorClass: 'text-medals-gold',
          glowClass: 'medal-gold',
        }
      case 2:
        return {
          colorClass: 'text-medals-silver',
          glowClass: 'medal-silver',
        }
      case 3:
        return {
          colorClass: 'text-medals-bronze',
          glowClass: 'medal-bronze',
        }
      default:
        return {
          colorClass: 'text-text-muted',
          glowClass: '',
        }
    }
  }

  const { colorClass, glowClass } = getMedalStyle()

  return (
    <div 
      className={`
        w-10 flex items-center justify-center 
        text-lg font-bold
        ${className}
      `}
    >
      {isMedalist ? (
        <Medal 
          className={`w-6 h-6 ${colorClass} ${glowClass}`} 
          strokeWidth={2}
          fill="currentColor"
          fillOpacity={0.2}
        />
      ) : (
        <span className="text-base text-text-muted">{rank}.</span>
      )}
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
  animate?: boolean
}

/**
 * ScoreRow - Individual leaderboard entry
 * 
 * Desktop (≥640px):
 *   Height: 72px, horizontal layout
 *   Layout: RankBadge (40px) | Avatar + Name | Score
 * 
 * Mobile (<640px):
 *   Height: auto (min 80px), stacked layout
 *   Layout: [Rank + Avatar + Name] row, then [Score] row
 * 
 * Features:
 * - Podium highlighting for top 3
 * - Avatar rings for medals
 * - Responsive layout adapts to screen size
 */
export function ScoreRow({
  rank,
  playerName,
  playerAvatar,
  score,
  scoreFormat,
  scoreUnit,
  className = '',
  animate = false
}: ScoreRowProps) {
  // Determine podium class for top 3
  const podiumClass = rank === 1 
    ? 'podium-gold' 
    : rank === 2 
    ? 'podium-silver' 
    : rank === 3 
    ? 'podium-bronze' 
    : ''

  // Avatar ring class for top 3
  const avatarRingClass = rank === 1
    ? 'avatar-ring-gold'
    : rank === 2
    ? 'avatar-ring-silver'
    : rank === 3
    ? 'avatar-ring-bronze'
    : ''

  return (
    <div
      className={`
        score-row-layout
        rounded-lg
        ${podiumClass}
        ${className}
      `}
      style={animate ? { 
        animation: 'slide-up 0.3s ease-out forwards',
        animationDelay: `${(rank - 1) * 0.05}s`,
        opacity: 0
      } : undefined}
    >
      {/* Top row: Rank + Player info */}
      <div className="flex flex-row items-center flex-1 min-w-0 w-full">
        {/* Rank badge */}
        <RankBadge rank={rank} />

        {/* Player info: avatar + name */}
        <div className="score-row-player">
          <PlayerAvatar 
            name={playerName} 
            avatarUrl={playerAvatar} 
            size={48}
            ringClass={avatarRingClass}
          />
          <div className={`text-lg truncate ${rank <= 3 ? 'font-semibold' : 'font-normal'} text-text-primary`}>
            {playerName}
          </div>
        </div>
      </div>

      {/* Score value - right side on desktop, below on mobile */}
      <div className="score-row-value">
        <ScoreValue 
          value={score} 
          format={scoreFormat} 
          unit={scoreUnit}
          highlight={rank === 1}
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
  highlight?: boolean
}

/**
 * ScoreValue - Formats and displays score based on score_format
 * Uses monospace font (font-mono) for tabular alignment
 * Font: xl (28px), mono, text-align: right
 * Features: Optional gold highlight for first place
 */
export function ScoreValue({
  value,
  format,
  unit,
  className = '',
  highlight = false
}: ScoreValueProps) {
  const formattedScore = formatScore(value, format, unit)

  return (
    <div 
      className={`
        text-xl font-mono text-right tabular-nums flex-shrink-0
        ${highlight ? 'text-gradient-gold font-semibold' : 'text-text-primary'}
        ${className}
      `}
    >
      {formattedScore}
    </div>
  )
}
```

## File: src/components/input/AvatarUpload.tsx
```tsx
import { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { useAvatarUpload } from '@/hooks/useAvatarUpload'
import { getInitials, getPlayerColor } from '@/lib/utils'

interface AvatarUploadProps {
  /** Current avatar URL (if any) */
  currentUrl: string | null
  /** Player name (for initials fallback) */
  playerName: string
  /** Called when avatar URL changes (upload or remove) */
  onChange: (url: string | null) => void
  /** Size in pixels (default 80) */
  size?: number
  /** Player ID (optional, for naming uploaded files) */
  playerId?: string
}

/**
 * AvatarUpload - Tappable avatar with camera overlay
 * 
 * Features:
 * - Shows current avatar or initials fallback
 * - Camera icon overlay indicates it's tappable
 * - Hidden file input triggers on tap
 * - Handles upload to Supabase Storage
 * - Loading state during upload
 * - X button to remove avatar
 * 
 * Touch targets: 80px default (≥56px minimum)
 */
export function AvatarUpload({
  currentUrl,
  playerName,
  onChange,
  size = 80,
  playerId,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploading, error, uploadAvatar } = useAvatarUpload()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    // Upload to storage
    const url = await uploadAvatar(file, playerId)
    
    // Clean up preview
    URL.revokeObjectURL(preview)
    setPreviewUrl(null)
    
    if (url) {
      onChange(url)
    }

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  // Determine what to show
  const displayUrl = previewUrl || currentUrl
  const initials = getInitials(playerName)
  const bgColor = getPlayerColor(playerName)

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar container */}
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="relative rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-category-golf focus:ring-offset-2 focus:ring-offset-background-card disabled:cursor-wait"
          style={{ width: size, height: size }}
        >
          {/* Avatar image or fallback */}
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={playerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold"
              style={{ 
                backgroundColor: bgColor,
                fontSize: size * 0.35,
              }}
            >
              {initials}
            </div>
          )}

          {/* Camera overlay (always visible, stronger when no image) */}
          <div 
            className={`
              absolute inset-0 flex items-center justify-center
              transition-opacity
              ${displayUrl 
                ? 'bg-black/40 opacity-0 hover:opacity-100' 
                : 'bg-black/30'
              }
            `}
          >
            {uploading ? (
              <Loader2 
                className="text-white animate-spin" 
                style={{ width: size * 0.35, height: size * 0.35 }}
              />
            ) : (
              <Camera 
                className="text-white" 
                style={{ width: size * 0.35, height: size * 0.35 }}
              />
            )}
          </div>
        </button>

        {/* Remove button (only when there's an image and not uploading) */}
        {currentUrl && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Helper text */}
      <p className="text-xs text-text-muted">
        {uploading ? 'Uploading...' : 'Tap to change photo'}
      </p>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
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
export { AvatarUpload } from './AvatarUpload'
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
```

## File: src/components/input/PickerModal.tsx
```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'

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
 * Features: Selection checkmark, smooth animations, better visual hierarchy
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
          <div className="h-[56px] px-sm flex items-center justify-between border-b border-background-elevated/50">
            <h2 className="text-lg font-bold text-text-primary px-sm">{title}</h2>
            <button
              onClick={onClose}
              className="w-[48px] h-[48px] flex items-center justify-center active:bg-background-elevated rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-text-secondary" />
            </button>
          </div>

          {/* Options list */}
          <div className="flex-1 overflow-y-auto px-md py-2">
            {options.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-text-secondary">{emptyMessage}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {options.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => {
                      onSelect(option.id)
                      onClose()
                    }}
                    className={`
                      w-full min-h-[56px] px-md py-3
                      flex items-center justify-between
                      rounded-lg
                      transition-all duration-fast
                      ${selectedId === option.id 
                        ? 'bg-background-elevated shadow-card-pressed' 
                        : 'bg-background-card shadow-card active:shadow-card-pressed active:scale-[0.99]'}
                    `}
                  >
                    <div className="flex flex-col justify-center min-w-0">
                      <span className={`text-base text-left truncate ${selectedId === option.id ? 'text-text-primary font-medium' : 'text-text-primary'}`}>
                        {option.label}
                      </span>
                      {option.sublabel && (
                        <span className="text-sm text-text-secondary text-left truncate">{option.sublabel}</span>
                      )}
                    </div>
                    {selectedId === option.id && (
                      <Check className="w-5 h-5 text-category-golf flex-shrink-0 ml-2" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer action (e.g., "+ New Player") */}
          {footerAction && (
            <div className="px-md py-3 border-t border-background-elevated/50">
              <button
                onClick={footerAction.onPress}
                className="w-full h-[56px] btn-primary flex items-center justify-center gap-2"
              >
                <span className="text-base text-category-golf font-medium">{footerAction.label}</span>
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
import { useState } from 'react'
import { ChevronLeft, Plus, PlusCircle, UserPlus, Settings } from 'lucide-react'
import { ActionSheet, type ActionSheetOption } from '@/components/overlays'

interface BrowseHeaderProps {
  backLabel: string
  onBack: () => void
  /** Called when "Add Score" is selected from the action sheet */
  onAddScore?: () => void
  /** Called when "Add Player" is selected from the action sheet */
  onAddPlayer?: () => void
  /** Called when "Manage..." is selected from the action sheet */
  onManage?: () => void
  title?: string
}

/**
 * BrowseHeader - Shared header for browse interface pages
 * 
 * Height: 56px (52px on mobile)
 * Touch targets: ≥48px
 * 
 * Features:
 * - Back button with label
 * - Optional centered title
 * - + button that opens action sheet with:
 *   - Add Score
 *   - Add Player
 *   - Manage...
 * - Responsive sizing for mobile
 */
export function BrowseHeader({ 
  backLabel, 
  onBack, 
  onAddScore,
  onAddPlayer,
  onManage,
  title 
}: BrowseHeaderProps) {
  const [showActionSheet, setShowActionSheet] = useState(false)

  // Only show + button if at least one action is provided
  const hasActions = onAddScore || onAddPlayer || onManage

  // Build action options based on provided callbacks
  const actionOptions: ActionSheetOption[] = []
  
  if (onAddScore) {
    actionOptions.push({
      id: 'add-score',
      label: 'Add Score',
      icon: <PlusCircle className="w-5 h-5" />,
      onClick: onAddScore,
      variant: 'primary',
    })
  }
  
  if (onAddPlayer) {
    actionOptions.push({
      id: 'add-player',
      label: 'Add Player',
      icon: <UserPlus className="w-5 h-5" />,
      onClick: onAddPlayer,
    })
  }
  
  if (onManage) {
    actionOptions.push({
      id: 'manage',
      label: 'Manage...',
      icon: <Settings className="w-5 h-5" />,
      onClick: onManage,
    })
  }

  return (
    <>
      <div className="header-height px-sm flex items-center justify-between border-b" style={{ borderColor: 'color-mix(in srgb, var(--color-bg-elevated) 50%, transparent)' }}>
        {/* Back button */}
        <button
          onClick={onBack}
          className="min-h-[48px] px-sm flex items-center gap-1 text-text-secondary active:text-text-primary transition-colors rounded-lg active:bg-background-elevated"
        >
          <ChevronLeft className="w-5 h-5 flex-shrink-0" />
          <span className="text-base truncate max-w-[120px] sm:max-w-[150px]">{backLabel}</span>
        </button>

        {/* Title (optional) */}
        {title && (
          <div className="flex-1 text-center px-2 min-w-0">
            <h1 className="text-lg font-bold text-text-primary truncate">{title}</h1>
          </div>
        )}

        {/* Add button - opens action sheet */}
        {hasActions ? (
          <button
            onClick={() => setShowActionSheet(true)}
            className="min-h-[48px] px-sm flex items-center gap-1 text-category-golf active:text-green-400 transition-colors rounded-lg active:bg-background-elevated"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            <span className="text-base font-medium hide-mobile">Add</span>
          </button>
        ) : (
          // Spacer to keep back button left-aligned when no actions
          title && <div className="min-w-[48px]" />
        )}
      </div>

      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        options={actionOptions}
      />
    </>
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
 * KioskLayout - Responsive container for all app content
 * 
 * Behavior:
 * - Pi Kiosk (800×480): Fixed dimensions, centered on screen
 * - Mobile (<640px): Full viewport with vertical scrolling
 * - Tablet/Desktop: Adapts to available space
 * 
 * Features:
 * - Safe area insets for notched phones
 * - Themed background
 * - Overflow handling per device type
 */
export function KioskLayout({ children, className = '' }: KioskLayoutProps) {
  return (
    <div 
      className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center safe-area-top safe-area-bottom safe-area-x"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div 
        className={`kiosk-container ${className}`}
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        {children}
      </div>
    </div>
  )
}
```

## File: src/components/management/BulkImportModal.tsx
```tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, AlertCircle, CheckCircle, AlertTriangle, FileText, HelpCircle } from 'lucide-react'
import { useBulkImport } from '@/hooks/useBulkImport'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (count: number) => void
}

/**
 * BulkImportModal - Smart paste box for CSV/JSON score import
 * 
 * Features:
 * - Accepts CSV or JSON format
 * - Auto-detects format
 * - Fuzzy matches player/game/mode names
 * - Shows validation preview
 * - Batch imports valid rows
 */
export function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [input, setInput] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null)
  
  const {
    rows,
    summary,
    parsing,
    importing,
    error,
    parseInput,
    importRows,
    clearRows,
  } = useBulkImport()

  const handleParse = async () => {
    setImportResult(null)
    await parseInput(input)
  }

  const handleImport = async () => {
    const result = await importRows()
    setImportResult(result)
    if (result.success > 0) {
      onSuccess?.(result.success)
    }
  }

  const handleClose = () => {
    setInput('')
    setImportResult(null)
    clearRows()
    setShowHelp(false)
    onClose()
  }

  const handleClear = () => {
    setInput('')
    setImportResult(null)
    clearRows()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-md overflow-y-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[700px] bg-background-card rounded-xl my-4 overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header */}
            <div className="h-[56px] px-md flex items-center justify-between border-b border-background-elevated">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-category-golf" />
                <h2 className="text-lg font-bold text-text-primary">Bulk Import Scores</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Help Panel */}
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-background-elevated"
                >
                  <div className="p-md bg-background-elevated/50 text-sm space-y-3">
                    <p className="font-medium text-text-primary">Required CSV columns: player, game, mode, score</p>
                    <p className="text-text-secondary">Optional: detail (or track/course)</p>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-text-primary">Score formats by game type:</p>
                      <div className="grid grid-cols-2 gap-2 text-text-secondary">
                        <div>
                          <span className="text-text-muted">Race times (ms):</span> 1:23.456 or 83.456
                        </div>
                        <div>
                          <span className="text-text-muted">Race times (s):</span> 4:56 or 296
                        </div>
                        <div>
                          <span className="text-text-muted">Golf:</span> -6, +2, 0, E
                        </div>
                        <div>
                          <span className="text-text-muted">Points:</span> 1000, 47
                        </div>
                        <div>
                          <span className="text-text-muted">Percentage:</span> 98.45
                        </div>
                        <div>
                          <span className="text-text-muted">Level:</span> 8-4
                        </div>
                      </div>
                    </div>

                    <div className="p-2 bg-background-card rounded-lg font-mono text-xs">
                      player,game,mode,score<br/>
                      Mike,Mario Kart 8,Rainbow Road,1:23.456<br/>
                      Sarah,Mario Golf,Standard,-3<br/>
                      Emma,Darts,501,12
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="p-md space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Import result message */}
              {importResult && (
                <div className={`p-3 rounded-lg flex items-center gap-3 ${
                  importResult.failed === 0 ? 'bg-green-500/20' : 'bg-yellow-500/20'
                }`}>
                  {importResult.failed === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  <p className="text-text-primary">
                    Imported {importResult.success} score{importResult.success !== 1 ? 's' : ''}
                    {importResult.failed > 0 && ` (${importResult.failed} failed)`}
                  </p>
                </div>
              )}

              {/* Input area */}
              {rows.length === 0 && (
                <>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">
                      Paste CSV or JSON data
                    </label>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`player,game,mode,score\nMike,Mario Kart 8,Rainbow Road,1:23.456\nSarah,Mario Golf,Standard,-3`}
                      className="w-full h-[200px] p-md bg-background-elevated text-text-primary rounded-lg font-mono text-sm resize-none outline-none focus:ring-2 focus:ring-category-golf"
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="p-3 bg-red-500/20 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Parse button */}
                  <button
                    onClick={handleParse}
                    disabled={!input.trim() || parsing}
                    className="w-full h-[56px] bg-category-golf text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {parsing ? 'Parsing...' : 'Preview Import'}
                  </button>
                </>
              )}

              {/* Preview table */}
              {rows.length > 0 && (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-text-secondary">
                      {summary.total} row{summary.total !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="w-4 h-4" />
                      {summary.valid} valid
                    </span>
                    {summary.invalid > 0 && (
                      <span className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        {summary.invalid} invalid
                      </span>
                    )}
                    {summary.warnings > 0 && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <AlertTriangle className="w-4 h-4" />
                        {summary.warnings} warnings
                      </span>
                    )}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto border border-background-elevated rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-background-elevated">
                          <th className="px-3 py-2 text-left text-text-muted font-medium w-8">#</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium">Player</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium">Game</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium">Mode</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium">Score</th>
                          <th className="px-3 py-2 text-left text-text-muted font-medium w-8">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 50).map((row) => (
                          <tr 
                            key={row.rowNumber} 
                            className={`border-t border-background-elevated ${
                              !row.isValid ? 'bg-red-500/10' : row.warnings.length > 0 ? 'bg-yellow-500/10' : ''
                            }`}
                          >
                            <td className="px-3 py-2 text-text-muted">{row.rowNumber}</td>
                            <td className="px-3 py-2 text-text-primary">{row.player}</td>
                            <td className="px-3 py-2 text-text-primary">{row.game}</td>
                            <td className="px-3 py-2 text-text-primary">{row.mode}</td>
                            <td className="px-3 py-2 text-text-primary font-mono">{row.scoreRaw}</td>
                            <td className="px-3 py-2">
                              {row.isValid ? (
                                row.warnings.length > 0 ? (
                                  <div className="group relative">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-background-card rounded shadow-lg text-xs z-10">
                                      {row.warnings.map((w, i) => (
                                        <p key={i} className="text-yellow-400">{w}</p>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )
                              ) : (
                                <div className="group relative">
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                  <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-background-card rounded shadow-lg text-xs z-10">
                                    {row.errors.map((e, i) => (
                                      <p key={i} className="text-red-400">{e}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length > 50 && (
                      <div className="px-3 py-2 bg-background-elevated text-text-muted text-sm">
                        Showing first 50 of {rows.length} rows
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleClear}
                      disabled={importing}
                      className="flex-1 h-[56px] bg-background-elevated text-text-primary font-semibold rounded-lg disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={importing || summary.valid === 0}
                      className="flex-1 h-[56px] bg-category-golf text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      {importing ? 'Importing...' : `Import ${summary.valid} Score${summary.valid !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## File: src/components/management/ConfirmDialog.tsx
```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}

/**
 * ConfirmDialog - Modal for confirming destructive actions
 * Touch-friendly with 56px minimum button heights
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] bg-background-card rounded-xl overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Header */}
            <div className="px-lg pt-lg pb-md flex items-start gap-4">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                ${variant === 'danger' ? 'bg-red-500/20' : 'bg-yellow-500/20'}
              `}>
                <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-500' : 'text-yellow-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                <p className="text-sm text-text-secondary mt-1">{message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-lg pb-lg pt-md flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 h-[56px] bg-background-elevated text-text-primary font-semibold rounded-lg active:bg-background-primary transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`
                  flex-1 h-[56px] font-semibold rounded-lg transition-colors disabled:opacity-50
                  ${variant === 'danger' 
                    ? 'bg-red-500 text-white active:bg-red-600' 
                    : 'bg-yellow-500 text-black active:bg-yellow-600'}
                `}
              >
                {loading ? 'Deleting...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## File: src/components/management/EditScoreModal.tsx
```tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { TimeInput, NumericInput } from '@/components/input'
import { formatScore } from '@/lib/utils'
import type { ScoreFormat } from '@/lib/types'

interface EditScoreModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newScore: number) => Promise<boolean>
  currentScore: number
  scoreFormat: ScoreFormat
  scoreUnit: string | null
  playerName: string
  gameName: string
  modeName?: string | null
  detailName?: string | null
}

/**
 * EditScoreModal - Modal for editing an existing score
 * 
 * Features:
 * - Displays appropriate input based on score_format (time, numeric, etc.)
 * - Shows current score value
 * - Context info (player, game, mode, detail)
 * - Save/Cancel buttons with 56px touch targets
 */
export function EditScoreModal({
  isOpen,
  onClose,
  onSave,
  currentScore,
  scoreFormat,
  scoreUnit,
  playerName,
  gameName,
  modeName,
  detailName,
}: EditScoreModalProps) {
  const [newScore, setNewScore] = useState<number | null>(currentScore)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset score when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setNewScore(currentScore)
      setError(null)
    }
  }, [isOpen, currentScore])

  const handleSave = async () => {
    if (newScore === null) {
      setError('Please enter a score')
      return
    }

    setSaving(true)
    setError(null)

    const success = await onSave(newScore)
    
    if (success) {
      onClose()
    } else {
      setError('Failed to save score')
    }
    
    setSaving(false)
  }

  const handleClose = () => {
    if (!saving) {
      onClose()
    }
  }

  // Render the appropriate input based on score format
  const renderScoreInput = () => {
    switch (scoreFormat) {
      case 'time_ms':
        return (
          <TimeInput
            value={newScore}
            onChange={setNewScore}
            showMilliseconds={true}
          />
        )

      case 'time_seconds':
        return (
          <TimeInput
            value={newScore}
            onChange={setNewScore}
            showMilliseconds={false}
          />
        )

      case 'decimal_2':
        return (
          <NumericInput
            value={newScore}
            onChange={setNewScore}
            unit={scoreUnit}
            isDecimal={true}
          />
        )

      case 'golf_relative':
        return (
          <NumericInput
            value={newScore}
            onChange={setNewScore}
            unit={scoreUnit}
            isDecimal={false}
            allowNegative={true}
          />
        )

      case 'integer':
      case 'level':
      default:
        return (
          <NumericInput
            value={newScore}
            onChange={setNewScore}
            unit={scoreUnit}
            isDecimal={false}
          />
        )
    }
  }

  // Build context string
  const contextParts = [gameName]
  if (modeName) contextParts.push(modeName)
  if (detailName) contextParts.push(detailName)
  const contextString = contextParts.join(' • ')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] bg-background-card rounded-xl overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header */}
            <div className="h-[56px] px-md flex items-center justify-between border-b border-background-elevated">
              <h2 className="text-lg font-bold text-text-primary">Edit Score</h2>
              <button
                onClick={handleClose}
                disabled={saving}
                className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-md space-y-4">
              {/* Context info */}
              <div className="text-center">
                <p className="text-base font-semibold text-text-primary">{playerName}</p>
                <p className="text-sm text-text-muted">{contextString}</p>
              </div>

              {/* Current score display */}
              <div className="text-center py-2">
                <p className="text-xs text-text-muted mb-1">Current Score</p>
                <p className="text-lg font-mono text-text-secondary">
                  {formatScore(currentScore, scoreFormat, scoreUnit)}
                </p>
              </div>

              {/* Score input */}
              <div>
                <p className="text-sm text-text-secondary mb-3 text-center">
                  {scoreFormat.includes('time') ? 'Enter new time' : 'Enter new score'}
                </p>
                {renderScoreInput()}
              </div>

              {/* Error display */}
              {error && (
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <p className="text-red-500 text-center text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="flex-1 h-[56px] bg-background-elevated text-text-primary font-semibold rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || newScore === null}
                  className="flex-1 h-[56px] bg-category-golf text-white font-semibold rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## File: src/components/management/index.ts
```ts
// src/components/management/index.ts
export { ConfirmDialog } from './ConfirmDialog'
export { PinModal } from './PinModal'
export { EditScoreModal } from './EditScoreModal'

// Management UI components
export { BulkImportModal } from './BulkImportModal'
```

## File: src/components/management/PinModal.tsx
```tsx
// src/components/management/PinModal.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, Delete } from 'lucide-react'

interface PinModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (pin: string) => void
  mode: 'verify' | 'setup' | 'change'
  error?: string | null
}

/**
 * PinModal - Touch-friendly PIN entry with numpad
 * Modes:
 * - verify: Enter existing PIN to authorize action
 * - setup: Create new PIN (first time)
 * - change: Enter new PIN (in settings)
 */
export function PinModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  error,
}: PinModalProps) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter')
  const [localError, setLocalError] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin('')
      setConfirmPin('')
      setStage('enter')
      setLocalError(null)
    }
  }, [isOpen])

  // Clear local error when external error changes
  useEffect(() => {
    if (error) {
      setLocalError(error)
      setPin('')
    }
  }, [error])

  const handleDigit = (digit: string) => {
    setLocalError(null)
    
    if (stage === 'enter') {
      if (pin.length < 4) {
        const newPin = pin + digit
        setPin(newPin)
        
        // Auto-submit on 4 digits for verify mode
        if (newPin.length === 4 && mode === 'verify') {
          onSubmit(newPin)
        }
      }
    } else {
      if (confirmPin.length < 4) {
        const newConfirm = confirmPin + digit
        setConfirmPin(newConfirm)
        
        // Check match on 4 digits
        if (newConfirm.length === 4) {
          if (newConfirm === pin) {
            onSubmit(pin)
          } else {
            setLocalError('PINs do not match')
            setConfirmPin('')
          }
        }
      }
    }
  }

  const handleDelete = () => {
    if (stage === 'enter') {
      setPin(pin.slice(0, -1))
    } else {
      setConfirmPin(confirmPin.slice(0, -1))
    }
    setLocalError(null)
  }

  const handleContinue = () => {
    if (pin.length === 4 && (mode === 'setup' || mode === 'change')) {
      setStage('confirm')
    }
  }

  const currentPin = stage === 'enter' ? pin : confirmPin
  const showContinue = mode !== 'verify' && stage === 'enter' && pin.length === 4

  const title = mode === 'verify' 
    ? 'Enter PIN' 
    : mode === 'setup' 
      ? (stage === 'enter' ? 'Create PIN' : 'Confirm PIN')
      : (stage === 'enter' ? 'New PIN' : 'Confirm PIN')

  const subtitle = mode === 'verify'
    ? 'Enter your 4-digit PIN to continue'
    : stage === 'enter'
      ? 'Choose a 4-digit PIN'
      : 'Enter the PIN again to confirm'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[320px] bg-background-card rounded-xl overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header */}
            <div className="px-md pt-md pb-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-category-darts/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-category-darts" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                  <p className="text-xs text-text-muted">{subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PIN Display */}
            <div className="px-md py-4">
              <div className="flex justify-center gap-3 mb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`
                      w-12 h-14 rounded-lg flex items-center justify-center text-2xl font-bold
                      ${currentPin.length > i 
                        ? 'bg-category-darts text-white' 
                        : 'bg-background-elevated text-text-muted'}
                      transition-all duration-150
                    `}
                  >
                    {currentPin.length > i ? '•' : ''}
                  </div>
                ))}
              </div>
              
              {/* Error message */}
              {localError && (
                <p className="text-center text-sm text-red-500 mt-2">{localError}</p>
              )}
            </div>

            {/* Numpad */}
            <div className="px-md pb-md">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDigit(digit)}
                    className="h-14 bg-background-elevated text-text-primary text-xl font-semibold rounded-lg active:bg-background-primary transition-colors"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={handleDelete}
                  className="h-14 bg-background-elevated text-text-muted rounded-lg active:bg-background-primary transition-colors flex items-center justify-center"
                >
                  <Delete className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleDigit('0')}
                  className="h-14 bg-background-elevated text-text-primary text-xl font-semibold rounded-lg active:bg-background-primary transition-colors"
                >
                  0
                </button>
                {showContinue ? (
                  <button
                    onClick={handleContinue}
                    className="h-14 bg-category-darts text-white text-sm font-semibold rounded-lg active:bg-category-darts/80 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <div className="h-14" /> // Empty space
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## File: src/components/overlays/ActionSheet.tsx
```tsx
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

export interface ActionSheetOption {
  id: string
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'primary' | 'danger'
}

interface ActionSheetProps {
  isOpen: boolean
  onClose: () => void
  options: ActionSheetOption[]
  title?: string
}

/**
 * ActionSheet - Touch-friendly bottom sheet for action selection
 * 
 * Features:
 * - Slides up from bottom
 * - Tap outside or swipe down to dismiss
 * - 56px minimum touch targets
 * - Optional title
 * - Variant styling (default, primary, danger)
 */
export function ActionSheet({ isOpen, onClose, options, title }: ActionSheetProps) {
  const getVariantClasses = (variant: ActionSheetOption['variant'] = 'default') => {
    switch (variant) {
      case 'primary':
        return 'text-category-golf'
      case 'danger':
        return 'text-red-500'
      default:
        return 'text-text-primary'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
          >
            <div 
              className="mx-2 mb-2 rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            >
              {/* Title (optional) */}
              {title && (
                <div className="px-md py-3 border-b border-background-card">
                  <p className="text-sm text-text-secondary text-center">{title}</p>
                </div>
              )}

              {/* Options */}
              <div className="py-1">
                {options.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      option.onClick()
                      onClose()
                    }}
                    className={`
                      w-full min-h-[56px] px-md
                      flex items-center gap-4
                      active:bg-background-card
                      transition-colors
                      ${index > 0 ? 'border-t border-background-card' : ''}
                    `}
                  >
                    {option.icon && (
                      <span className={`flex-shrink-0 ${getVariantClasses(option.variant)}`}>
                        {option.icon}
                      </span>
                    )}
                    <span className={`text-base font-medium ${getVariantClasses(option.variant)}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cancel button */}
            <div className="mx-2 mb-2">
              <button
                onClick={onClose}
                className="w-full min-h-[56px] rounded-2xl text-base font-semibold text-text-primary active:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--color-bg-card)' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

## File: src/components/overlays/CelebrationOverlay.tsx
```tsx
import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Sparkles } from 'lucide-react'
import { formatScore } from '@/lib/utils'
import { sounds } from '@/lib/sounds'
import { useKioskStore } from '@/stores/kioskStore'
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

// Confetti particle component
function ConfettiParticle({ color }: { color: string }) {
  const randomX = useMemo(() => Math.random() * 100, [])
  const randomDelay = useMemo(() => Math.random() * 0.5, [])
  const randomDuration = useMemo(() => 2.5 + Math.random() * 1.5, [])
  const randomRotation = useMemo(() => Math.random() * 720 - 360, [])
  const randomSize = useMemo(() => 8 + Math.random() * 8, [])

  return (
    <motion.div
      initial={{ 
        y: -20, 
        x: `${randomX}vw`,
        rotate: 0,
        opacity: 1 
      }}
      animate={{ 
        y: '100vh',
        rotate: randomRotation,
        opacity: 0
      }}
      transition={{ 
        duration: randomDuration,
        delay: randomDelay,
        ease: 'easeIn'
      }}
      className="absolute top-0 pointer-events-none"
      style={{
        width: randomSize,
        height: randomSize * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
    />
  )
}

/**
 * CelebrationOverlay - Full-screen celebration after score submission
 * Features: Confetti particles, dramatic animations, auto-dismiss, sound effects
 */
export function CelebrationOverlay({
  isOpen,
  onClose,
  playerName,
  score,
  scoreFormat,
  scoreUnit,
  rank,
  autoCloseMs,
}: CelebrationOverlayProps) {
  const celebrationDurationMs = useKioskStore((state) => state.celebrationDurationMs)
  const duration = autoCloseMs ?? celebrationDurationMs

  // Auto-close timer
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [isOpen, onClose, duration])

  // Play sound when overlay opens
  useEffect(() => {
    if (isOpen) {
      sounds.playScoreSound(rank)
    }
  }, [isOpen, rank])

  const isFirstPlace = rank === 1
  const isPodium = rank <= 3
  const formattedScore = formatScore(score, scoreFormat, scoreUnit)

  // Get medal color class
  const getMedalColorClass = () => {
    switch (rank) {
      case 1: return 'text-medals-gold'
      case 2: return 'text-medals-silver'
      case 3: return 'text-medals-bronze'
      default: return 'text-text-primary'
    }
  }

  // Confetti colors based on rank
  const confettiColors = isFirstPlace 
    ? ['#ffd700', '#ffed4a', '#fbbf24', '#f59e0b', '#ffffff']
    : isPodium
    ? ['#c0c0c0', '#e5e7eb', '#9ca3af', '#6b7280', '#ffffff']
    : ['#3b82f6', '#60a5fa', '#93c5fd', '#6366f1', '#ffffff']

  const getOrdinal = (n: number) => {
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
  }

  // Generate confetti particles
  const confettiCount = isFirstPlace ? 50 : isPodium ? 30 : 20
  const confettiParticles = useMemo(() => 
    Array.from({ length: confettiCount }, (_, i) => ({
      id: i,
      color: confettiColors[i % confettiColors.length]
    })), [confettiCount, isFirstPlace, isPodium]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiParticles.map(({ id, color }) => (
              <ConfettiParticle key={id} color={color} />
            ))}
          </div>

          {/* Glow effect behind content */}
          {isFirstPlace && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 0.5 }}
              className="absolute w-96 h-96 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
              }}
            />
          )}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="text-center relative z-10"
          >
            {/* Title */}
            {isFirstPlace ? (
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 10 }}
                className="flex items-center justify-center gap-3 mb-2"
              >
                <Sparkles className="w-6 h-6 text-medals-gold" />
                <p className="text-xl font-bold text-gradient-gold">
                  NEW HIGH SCORE!
                </p>
                <Sparkles className="w-6 h-6 text-medals-gold" />
              </motion.div>
            ) : (
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-text-primary mb-2"
              >
                Score Saved!
              </motion.p>
            )}

            {/* Player name */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-secondary mb-4"
            >
              {playerName}
            </motion.p>

            {/* Score */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', damping: 8, stiffness: 150 }}
              className={`text-xxl font-mono font-bold mb-4 ${isFirstPlace ? 'text-gradient-gold' : 'text-text-primary'}`}
              style={isFirstPlace ? {
                textShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
              } : undefined}
            >
              {formattedScore}
            </motion.div>

            {/* Rank badge with icon */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 12 }}
              className={`
                flex items-center justify-center gap-2
                text-lg font-semibold
                ${rank === 1 ? 'medal-gold' : rank === 2 ? 'medal-silver' : rank === 3 ? 'medal-bronze' : 'text-text-primary'}
              `}
            >
              {isPodium ? (
                <Medal className={`w-6 h-6 ${getMedalColorClass()}`} fill="currentColor" fillOpacity={0.2} />
              ) : (
                <Trophy className="w-6 h-6 text-text-primary" />
              )}
              <span>{getOrdinal(rank)} Place!</span>
            </motion.div>
          </motion.div>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
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
export { RealtimeScoreAlert } from './RealtimeScoreAlert'
export { ActionSheet } from './ActionSheet'
export type { ActionSheetOption } from './ActionSheet'
```

## File: src/components/overlays/RealtimeScoreAlert.tsx
```tsx
// src/components/overlays/RealtimeScoreAlert.tsx
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Medal } from 'lucide-react'
import { formatScore } from '@/lib/utils'
import { sounds } from '@/lib/sounds'
import type { ScoreFormat } from '@/lib/types'

interface RealtimeScoreAlertProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  score: number
  scoreFormat: ScoreFormat
  scoreUnit?: string | null
  gameName: string
  modeName: string
  detailName?: string | null  // NEW: Optional detail name
  rank: number
  autoCloseMs?: number
}

/**
 * Build the context string for the alert (Game — Mode — Detail)
 */
function buildContextString(gameName: string, modeName: string, detailName?: string | null): string {
  const parts = [gameName]
  
  if (modeName) {
    parts.push(modeName)
  }
  
  if (detailName) {
    parts.push(detailName)
  }
  
  return parts.join(' — ')
}

/**
 * RealtimeScoreAlert - Toast notification for scores arriving via realtime
 * Slides in from top, auto-dismisses after 5 seconds
 * Shows when someone submits a score from another device
 */
export function RealtimeScoreAlert({
  isOpen,
  onClose,
  playerName,
  score,
  scoreFormat,
  scoreUnit,
  gameName,
  modeName,
  detailName,
  rank,
  autoCloseMs = 5000,
}: RealtimeScoreAlertProps) {
  // Auto-close timer
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(timer)
  }, [isOpen, onClose, autoCloseMs])

  // Play sound when alert opens
  useEffect(() => {
    if (isOpen) {
      sounds.playScoreSound(rank)
    }
  }, [isOpen, rank])

  const isFirstPlace = rank === 1
  const isPodium = rank <= 3
  const formattedScore = formatScore(score, scoreFormat, scoreUnit)
  const contextString = buildContextString(gameName, modeName, detailName)

  // Get medal color class
  const getMedalColorClass = () => {
    switch (rank) {
      case 1: return 'text-medals-gold'
      case 2: return 'text-medals-silver'
      case 3: return 'text-medals-bronze'
      default: return 'text-text-muted'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={onClose}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 cursor-pointer"
        >
          <div 
            className="relative px-6 py-4 rounded-xl max-w-[700px]"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 37, 37, 0.98) 0%, rgba(26, 26, 26, 0.98) 100%)',
              boxShadow: isFirstPlace 
                ? '0 4px 24px rgba(255, 215, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 4px 24px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: isFirstPlace 
                ? '1px solid rgba(255, 215, 0, 0.3)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Glow effect for first place */}
            {isFirstPlace && (
              <div 
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at top, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
                }}
              />
            )}

            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                ${isFirstPlace 
                  ? 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/20' 
                  : isPodium 
                    ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10'
                    : 'bg-background-elevated'
                }
              `}>
                {isPodium ? (
                  <Medal className={`w-6 h-6 ${getMedalColorClass()}`} />
                ) : (
                  <Zap className="w-6 h-6 text-category-party" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Player and score */}
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-text-primary truncate">
                    {playerName}
                  </span>
                  <span className="text-text-muted">scored</span>
                  <span className="font-mono font-bold text-lg text-text-primary">
                    {formattedScore}
                  </span>
                </div>
                
                {/* Game/Mode/Detail context */}
                <p className="text-sm text-text-secondary truncate mt-0.5">
                  {contextString}
                </p>
              </div>

              {/* Rank badge */}
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg
                ${isFirstPlace ? 'bg-yellow-500/20 text-yellow-400' :
                  rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                  rank === 3 ? 'bg-orange-600/20 text-orange-400' :
                  'bg-background-elevated text-text-secondary'}
              `}>
                #{rank}
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: autoCloseMs / 1000, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl origin-left"
              style={{
                background: isFirstPlace 
                  ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.5), rgba(255, 215, 0, 0.2))'
                  : 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(59, 130, 246, 0.2))',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

## File: src/hooks/index.ts
```ts
// src/hooks/index.ts
// Custom React hooks
// Export hooks from this directory for easy imports

export { useGame } from './useGame'
export { useGames } from './useGames'
export { useGameMode } from './useGameMode'
export { useGameModes } from './useGameModes'
export { useGameDetails } from './useGameDetails'
export { useLeaderboard } from './useLeaderboard'
export { usePlayers } from './usePlayers'
export { useRealtimeScores } from './useRealtimeScores'
export { useSubmitScore } from './useSubmitScore'
export { useIdleTimer } from './useIdleTimer'
export { useCarouselItems } from './useCarouselItems'
export type { CarouselItem } from './useCarouselItems'
export { useSoundInit } from './useSoundInit'
export { useScoreDetails } from './useScoreDetails'
export { useTheme } from './useTheme'
export type { RealtimeScoreData } from './useScoreDetails'

// Management hooks
export { useManagePlayers } from './useManagePlayers'
export { useManageGames } from './useManageGames'
export { useManageGameModes } from './useManageGameModes'
export { useManageGameDetails } from './useManageGameDetails'
export { useManageScores } from './useManageScores'
export type { ScoreWithDetails } from './useManageScores'
```

## File: src/hooks/useAvatarUpload.ts
```ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface UseAvatarUploadResult {
  uploading: boolean
  error: string | null
  uploadAvatar: (file: File, playerId?: string) => Promise<string | null>
  deleteAvatar: (url: string) => Promise<boolean>
}

/**
 * useAvatarUpload - Handle avatar uploads to Supabase Storage
 * 
 * Uploads to the 'avatars' bucket with unique filenames.
 * Returns the public URL on success.
 */
export function useAvatarUpload(): UseAvatarUploadResult {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadAvatar = useCallback(async (file: File, playerId?: string): Promise<string | null> => {
    setUploading(true)
    setError(null)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('Image must be less than 2MB')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const fileName = playerId 
        ? `${playerId}-${timestamp}.${fileExt}`
        : `new-${timestamp}-${randomId}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite if exists
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload avatar'
      setError(message)
      console.error('Avatar upload error:', err)
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  const deleteAvatar = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const urlParts = url.split('/avatars/')
      if (urlParts.length < 2) return false
      
      const fileName = urlParts[1]
      
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName])

      if (deleteError) {
        throw deleteError
      }

      return true
    } catch (err) {
      console.error('Avatar delete error:', err)
      return false
    }
  }, [])

  return {
    uploading,
    error,
    uploadAvatar,
    deleteAvatar,
  }
}
```

## File: src/hooks/useBulkImport.ts
```ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { parseScore } from '@/lib/scoreParser'
import type { ScoreFormat } from '@/lib/types'

// Types for the import process
export interface ImportRow {
  rowNumber: number
  player: string
  game: string
  mode: string
  detail?: string
  scoreRaw: string
  playerId?: string
  gameId?: string
  modeId?: string
  detailId?: string
  scoreParsed?: number
  scoreFormat?: ScoreFormat
  errors: string[]
  warnings: string[]
  isValid: boolean
}

export interface ImportSummary {
  total: number
  valid: number
  invalid: number
  warnings: number
}

// Lookup types for matching
interface PlayerLookup {
  id: string
  name: string
  nameLower: string
}

interface GameLookup {
  id: string
  name: string
  nameLower: string
  default_score_format: ScoreFormat
}

interface ModeLookup {
  id: string
  name: string
  nameLower: string
  game_id: string
  score_format: ScoreFormat | null
}

interface DetailLookup {
  id: string
  name: string
  nameLower: string
  game_id: string
  mode_id: string | null
  score_format: ScoreFormat | null
}

interface UseBulkImportResult {
  rows: ImportRow[]
  summary: ImportSummary
  parsing: boolean
  importing: boolean
  error: string | null
  parseInput: (input: string) => Promise<void>
  importRows: () => Promise<{ success: number; failed: number }>
  clearRows: () => void
}

/**
 * Fuzzy match a name against a list of options
 */
function fuzzyMatch<T extends { nameLower: string }>(
  input: string,
  options: T[]
): T | null {
  const inputLower = input.toLowerCase().trim()
  
  const exact = options.find(o => o.nameLower === inputLower)
  if (exact) return exact
  
  const contains = options.find(o => 
    o.nameLower.includes(inputLower) || inputLower.includes(o.nameLower)
  )
  if (contains) return contains
  
  const inputWords = inputLower.split(/\s+/)
  for (const option of options) {
    const optionWords = option.nameLower.split(/\s+/)
    if (inputWords.some(w => optionWords.some(ow => ow.includes(w) || w.includes(ow)))) {
      return option
    }
  }
  
  return null
}

/**
 * Parse CSV string into rows
 */
function parseCSV(input: string): Record<string, string>[] {
  const lines = input.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  
  const headerLine = lines[0]
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase())
  
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = line.split(',').map(v => v.trim())
    
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }
  
  return rows
}

/**
 * Parse JSON string into rows
 */
function parseJSON(input: string): Record<string, string>[] {
  const data = JSON.parse(input)
  
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of objects')
  }
  
  return data.map(item => {
    const row: Record<string, string> = {}
    for (const [key, value] of Object.entries(item)) {
      row[key.toLowerCase()] = String(value)
    }
    return row
  })
}

/**
 * Detect if input is JSON or CSV
 */
function detectFormat(input: string): 'json' | 'csv' {
  const trimmed = input.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return 'json'
  }
  return 'csv'
}

/**
 * useBulkImport - Parse, validate, and import scores in bulk
 */
export function useBulkImport(): UseBulkImportResult {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [summary, setSummary] = useState<ImportSummary>({ total: 0, valid: 0, invalid: 0, warnings: 0 })
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseInput = useCallback(async (input: string) => {
    setParsing(true)
    setError(null)
    setRows([])
    
    try {
      const format = detectFormat(input)
      let rawRows: Record<string, string>[]
      
      try {
        rawRows = format === 'json' ? parseJSON(input) : parseCSV(input)
      } catch (e) {
        throw new Error(`Failed to parse ${format.toUpperCase()}: ${e instanceof Error ? e.message : 'Invalid format'}`)
      }
      
      if (rawRows.length === 0) {
        throw new Error('No data rows found')
      }
      
      const firstRow = rawRows[0]
      const hasPlayer = 'player' in firstRow
      const hasGame = 'game' in firstRow
      const hasMode = 'mode' in firstRow
      const hasScore = 'score' in firstRow
      
      if (!hasPlayer || !hasGame || !hasMode || !hasScore) {
        const missing = []
        if (!hasPlayer) missing.push('player')
        if (!hasGame) missing.push('game')
        if (!hasMode) missing.push('mode')
        if (!hasScore) missing.push('score')
        throw new Error(`Missing required columns: ${missing.join(', ')}`)
      }
      
      // Fetch lookup data using (supabase as any) pattern from existing codebase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any
      
      const playersRes = await sb.from('players').select('id, name').eq('is_active', true)
      const gamesRes = await sb.from('games').select('id, name, default_score_format').eq('is_active', true)
      const modesRes = await sb.from('game_modes').select('id, name, game_id, score_format').eq('is_active', true)
      const detailsRes = await sb.from('game_details').select('id, name, game_id, mode_id, score_format').eq('is_active', true)
      
      // Build lookup arrays
      const players: PlayerLookup[] = []
      const playersData = playersRes.data || []
      for (let i = 0; i < playersData.length; i++) {
        const p = playersData[i]
        players.push({
          id: p.id,
          name: p.name,
          nameLower: p.name.toLowerCase(),
        })
      }
      
      const games: GameLookup[] = []
      const gameFormats: Record<string, ScoreFormat> = {}
      const gamesData = gamesRes.data || []
      for (let i = 0; i < gamesData.length; i++) {
        const g = gamesData[i]
        games.push({
          id: g.id,
          name: g.name,
          nameLower: g.name.toLowerCase(),
          default_score_format: g.default_score_format,
        })
        gameFormats[g.id] = g.default_score_format
      }
      
      const modes: ModeLookup[] = []
      const modesData = modesRes.data || []
      for (let i = 0; i < modesData.length; i++) {
        const m = modesData[i]
        modes.push({
          id: m.id,
          name: m.name,
          nameLower: m.name.toLowerCase(),
          game_id: m.game_id,
          score_format: m.score_format,
        })
      }
      
      const details: DetailLookup[] = []
      const detailsData = detailsRes.data || []
      for (let i = 0; i < detailsData.length; i++) {
        const d = detailsData[i]
        details.push({
          id: d.id,
          name: d.name,
          nameLower: d.name.toLowerCase(),
          game_id: d.game_id,
          mode_id: d.mode_id,
          score_format: d.score_format,
        })
      }
      
      // Process each row
      const processedRows: ImportRow[] = []
      for (let index = 0; index < rawRows.length; index++) {
        const raw = rawRows[index]
        const row: ImportRow = {
          rowNumber: index + 2,
          player: raw.player || '',
          game: raw.game || '',
          mode: raw.mode || '',
          detail: raw.detail || raw.track || raw.course || '',
          scoreRaw: raw.score || '',
          errors: [],
          warnings: [],
          isValid: true,
        }
        
        // Match player
        const playerMatch = fuzzyMatch(row.player, players)
        if (playerMatch) {
          row.playerId = playerMatch.id
          if (playerMatch.nameLower !== row.player.toLowerCase()) {
            row.warnings.push(`Player matched to "${playerMatch.name}"`)
          }
        } else {
          row.errors.push(`Player "${row.player}" not found`)
          row.isValid = false
        }
        
        // Match game
        const gameMatch = fuzzyMatch(row.game, games)
        if (gameMatch) {
          row.gameId = gameMatch.id
          if (gameMatch.nameLower !== row.game.toLowerCase()) {
            row.warnings.push(`Game matched to "${gameMatch.name}"`)
          }
        } else {
          row.errors.push(`Game "${row.game}" not found`)
          row.isValid = false
        }
        
        // Match mode (filtered by game)
        if (row.gameId) {
          const gameModes = modes.filter(m => m.game_id === row.gameId)
          const modeMatch = fuzzyMatch(row.mode, gameModes)
          if (modeMatch) {
            row.modeId = modeMatch.id
            row.scoreFormat = modeMatch.score_format || gameFormats[row.gameId] || 'integer'
            if (modeMatch.nameLower !== row.mode.toLowerCase()) {
              row.warnings.push(`Mode matched to "${modeMatch.name}"`)
            }
          } else {
            row.errors.push(`Mode "${row.mode}" not found for this game`)
            row.isValid = false
          }
        }
        
        // Match detail (optional)
        if (row.detail && row.gameId) {
          const gameDetails = details.filter(d => 
            d.game_id === row.gameId && 
            (d.mode_id === null || d.mode_id === row.modeId)
          )
          const detailMatch = fuzzyMatch(row.detail, gameDetails)
          if (detailMatch) {
            row.detailId = detailMatch.id
            if (detailMatch.score_format) {
              row.scoreFormat = detailMatch.score_format
            }
            if (detailMatch.nameLower !== row.detail.toLowerCase()) {
              row.warnings.push(`Detail matched to "${detailMatch.name}"`)
            }
          } else {
            row.warnings.push(`Detail "${row.detail}" not found (will be ignored)`)
          }
        }
        
        // Parse score
        if (row.scoreFormat) {
          const parseResult = parseScore(row.scoreRaw, row.scoreFormat)
          if (parseResult.success && parseResult.value !== null) {
            row.scoreParsed = parseResult.value
          } else {
            row.errors.push(parseResult.error || 'Invalid score')
            row.isValid = false
          }
        } else if (row.isValid) {
          const parseResult = parseScore(row.scoreRaw, 'integer')
          if (parseResult.success && parseResult.value !== null) {
            row.scoreParsed = parseResult.value
            row.scoreFormat = 'integer'
          } else {
            row.errors.push('Could not parse score')
            row.isValid = false
          }
        }
        
        processedRows.push(row)
      }
      
      const validCount = processedRows.filter(r => r.isValid).length
      const warningCount = processedRows.filter(r => r.warnings.length > 0).length
      
      setRows(processedRows)
      setSummary({
        total: processedRows.length,
        valid: validCount,
        invalid: processedRows.length - validCount,
        warnings: warningCount,
      })
      
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse input')
      setRows([])
      setSummary({ total: 0, valid: 0, invalid: 0, warnings: 0 })
    } finally {
      setParsing(false)
    }
  }, [])

  const importRows = useCallback(async (): Promise<{ success: number; failed: number }> => {
    setImporting(true)
    
    const validRows = rows.filter(r => r.isValid)
    let success = 0
    let failed = 0
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any
      
      const chunkSize = 50
      for (let i = 0; i < validRows.length; i += chunkSize) {
        const chunk = validRows.slice(i, i + chunkSize)
        
        const inserts = []
        for (let j = 0; j < chunk.length; j++) {
          const row = chunk[j]
          inserts.push({
            player_id: row.playerId,
            game_id: row.gameId,
            mode_id: row.modeId,
            detail_id: row.detailId || null,
            score: row.scoreParsed,
            achieved_at: new Date().toISOString(),
          })
        }
        
        const { error: insertError } = await sb
          .from('high_scores')
          .insert(inserts)
        
        if (insertError) {
          console.error('Batch insert error:', insertError)
          failed += chunk.length
        } else {
          success += chunk.length
        }
      }
    } catch (e) {
      console.error('Import error:', e)
    } finally {
      setImporting(false)
    }
    
    return { success, failed }
  }, [rows])

  const clearRows = useCallback(() => {
    setRows([])
    setSummary({ total: 0, valid: 0, invalid: 0, warnings: 0 })
    setError(null)
  }, [])

  return {
    rows,
    summary,
    parsing,
    importing,
    error,
    parseInput,
    importRows,
    clearRows,
  }
}
```

## File: src/hooks/useCarouselItems.ts
```ts
// src/hooks/useCarouselItems.ts
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Represents a single item in the idle carousel.
 * For games WITH details: one item per (mode, detail) combination
 * For games WITHOUT details: one item per mode
 */
export interface CarouselItem {
  // Unique key for React and deduplication
  key: string
  
  // Game info
  game_id: string
  game_name: string
  game_icon: string | null
  game_category: string
  game_has_details: boolean
  game_sort_order: number
  
  // Mode info (may be null for games without modes)
  mode_id: string | null
  mode_name: string | null
  mode_sort_order: number
  
  // Detail info (only populated for games with has_details=true)
  detail_id: string | null
  detail_name: string | null
  detail_sort_order: number
}

interface UseCarouselItemsResult {
  items: CarouselItem[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Type for the raw Supabase query response
interface ScoreQueryResult {
  game_id: string
  mode_id: string | null
  detail_id: string | null
  games: {
    name: string
    icon_url: string | null
    category: string
    has_details: boolean
    sort_order: number
    is_active: boolean
  }
  game_modes: {
    name: string
    sort_order: number
    is_active: boolean
  } | null
  game_details: {
    name: string
    sort_order: number
    is_active: boolean
  } | null
}

/**
 * useCarouselItems - Fetches unique carousel entries based on scores
 * 
 * Groups scores appropriately:
 * - Games WITH has_details=true: one entry per (game, mode, detail)
 * - Games WITHOUT details: one entry per (game, mode)
 * 
 * Used by IdleDisplay for the auto-cycling carousel.
 */
export function useCarouselItems(): UseCarouselItemsResult {
  const [items, setItems] = useState<CarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Query all high scores with their related game/mode/detail data
      // We'll deduplicate and group client-side for flexibility
      const { data, error: queryError } = await supabase
        .from('high_scores')
        .select(`
          game_id,
          mode_id,
          detail_id,
          games!inner (
            name,
            icon_url,
            category,
            has_details,
            sort_order,
            is_active
          ),
          game_modes (
            name,
            sort_order,
            is_active
          ),
          game_details (
            name,
            sort_order,
            is_active
          )
        `)

      if (queryError) throw queryError

      // Build unique carousel items using a Map for deduplication
      const itemMap = new Map<string, CarouselItem>()

      for (const score of (data as ScoreQueryResult[]) || []) {
        const game = score.games
        const mode = score.game_modes
        const detail = score.game_details

        // Skip if game is inactive
        if (!game?.is_active) continue
        
        // Skip if mode exists but is inactive
        if (mode && !mode.is_active) continue
        
        // Skip if detail exists but is inactive
        if (detail && !detail.is_active) continue

        // Determine the grouping key based on game configuration
        // For games WITH details: include detail_id in key
        // For games WITHOUT details: only use game_id and mode_id
        let key: string
        let effectiveDetailId: string | null = null
        let effectiveDetailName: string | null = null
        let effectiveDetailSortOrder = 0

        if (game.has_details && score.detail_id) {
          // Game has details - create separate entry for each detail
          key = `${score.game_id}::${score.mode_id || 'null'}::${score.detail_id}`
          effectiveDetailId = score.detail_id
          effectiveDetailName = detail?.name || null
          effectiveDetailSortOrder = detail?.sort_order ?? 0
        } else {
          // Game doesn't have details - group all scores under mode
          key = `${score.game_id}::${score.mode_id || 'null'}::null`
        }

        // Only add if we haven't seen this combination yet
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            key,
            game_id: score.game_id,
            game_name: game.name,
            game_icon: game.icon_url,
            game_category: game.category,
            game_has_details: game.has_details,
            game_sort_order: game.sort_order ?? 0,
            mode_id: score.mode_id,
            mode_name: mode?.name || null,
            mode_sort_order: mode?.sort_order ?? 0,
            detail_id: effectiveDetailId,
            detail_name: effectiveDetailName,
            detail_sort_order: effectiveDetailSortOrder,
          })
        }
      }

      // Sort by game order → mode order → detail order
      const sortedItems = Array.from(itemMap.values()).sort((a, b) => {
        // First by game sort order
        const gameOrder = a.game_sort_order - b.game_sort_order
        if (gameOrder !== 0) return gameOrder
        
        // Then by mode sort order
        const modeOrder = a.mode_sort_order - b.mode_sort_order
        if (modeOrder !== 0) return modeOrder
        
        // Finally by detail sort order
        return a.detail_sort_order - b.detail_sort_order
      })

      setItems(sortedItems)
    } catch (err) {
      console.error('Failed to fetch carousel items:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch carousel items'))
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return { 
    items, 
    loading, 
    error, 
    refetch: fetchItems 
  }
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
          .select('*')
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

## File: src/hooks/useGameDetails.ts
```ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameDetail } from '@/lib/types'

interface UseGameDetailsResult {
  details: GameDetail[]
  loading: boolean
  error: Error | null
}

/**
 * useGameDetails - Fetches details for a game, optionally filtered by mode
 *
 * @param gameId - The game UUID to fetch details for
 * @param modeId - Optional mode UUID to filter details (null = shared details only)
 */
export function useGameDetails(
  gameId: string | null,
  modeId?: string | null
): UseGameDetailsResult {
  const [details, setDetails] = useState<GameDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameId) {
      setDetails([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchDetails() {
      if (!gameId) return

      try {
        setLoading(true)
        setError(null)

        // Build query for details that are either:
        // 1. Shared (mode_id is null) - available for all modes
        // 2. Specific to the selected mode (mode_id matches)
        let query = supabase
          .from('game_details')
          .select('*')
          .eq('game_id', gameId)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        // If a mode is selected, get shared details + mode-specific details
        if (modeId) {
          query = query.or(`mode_id.is.null,mode_id.eq.${modeId}`)
        } else {
          // No mode selected - only get shared details
          query = query.is('mode_id', null)
        }

        const { data, error: queryError } = await query

        if (queryError) throw queryError

        if (isMounted) {
          setDetails((data as GameDetail[]) || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch game details'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDetails()
    return () => {
      isMounted = false
    }
  }, [gameId, modeId])

  return { details, loading, error }
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
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        // Filter by category if provided
        if (category) {
          query = query.eq('category', category)
        }

        const { data, error: queryError } = await query

        if (queryError) throw queryError

        if (isMounted) {
          setGames((data as Game[]) || [])
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
import type { LeaderboardEntry } from '@/lib/types'

interface UseLeaderboardResult {
  entries: LeaderboardEntry[]
  loading: boolean
  error: Error | null
}

/**
 * useLeaderboard - Fetches top N scores for a game/mode/detail combination
 * Uses the get_leaderboard RPC function which handles score_direction sorting
 *
 * @param gameId - The game UUID (required)
 * @param modeId - Optional mode UUID
 * @param detailId - Optional detail UUID
 * @param limit - Maximum number of scores to return (default: 5)
 */
export function useLeaderboard(
  gameId: string | null,
  modeId: string | null = null,
  detailId: string | null = null,
  limit = 5
): UseLeaderboardResult {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!gameId) {
      setEntries([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchLeaderboard() {
      if (!gameId) return

      try {
        setLoading(true)
        setError(null)

        // Use the RPC function which properly sorts based on score_direction
        // Type assertion needed because Supabase client types don't match our schema
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: rpcError } = await (supabase as any).rpc('get_leaderboard', {
          p_game_id: gameId,
          p_mode_id: modeId,
          p_detail_id: detailId,
          p_limit: limit,
        })

        if (rpcError) throw rpcError

        if (isMounted) {
          setEntries((data as LeaderboardEntry[]) || [])
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
  }, [gameId, modeId, detailId, limit])

  return { entries, loading, error }
}
```

## File: src/hooks/useManageGameDetails.ts
```ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameDetail, ScoreFormat, ScoreDirection } from '@/lib/types'

// Fields that can be updated on a game detail
interface UpdateDetailFields {
  name?: string
  mode_id?: string | null
  score_format?: ScoreFormat | null
  score_direction?: ScoreDirection | null
  score_unit?: string | null
  sort_order?: number
}

interface UseManageGameDetailsResult {
  details: GameDetail[]
  loading: boolean
  error: Error | null
  fetchDetails: (gameId: string, modeId?: string | null) => Promise<void>
  createDetail: (
    gameId: string,
    name: string,
    modeId?: string | null,
    scoreFormat?: ScoreFormat | null,
    scoreDirection?: ScoreDirection | null,
    scoreUnit?: string | null
  ) => Promise<GameDetail | null>
  updateDetail: (id: string, updates: UpdateDetailFields) => Promise<boolean>
  deleteDetail: (id: string) => Promise<boolean>
  clearDetails: () => void
}

/**
 * useManageGameDetails - Full CRUD operations for game details
 * 
 * Details are Level 2 of the hierarchy (Game → Mode → Detail)
 * Examples: tracks, courses, fish types, enemy types
 * 
 * Details can be:
 * - Shared across all modes (mode_id = null)
 * - Specific to one mode (mode_id = UUID)
 * 
 * Uses soft delete (is_active = false) to preserve score history
 */
export function useManageGameDetails(): UseManageGameDetailsResult {
  const [details, setDetails] = useState<GameDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDetails = useCallback(async (gameId: string, modeId?: string | null) => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('game_details')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      // If modeId provided, get shared details + mode-specific details
      // If no modeId, get only shared details
      if (modeId) {
        query = query.or(`mode_id.is.null,mode_id.eq.${modeId}`)
      } else {
        query = query.is('mode_id', null)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError
      setDetails((data as GameDetail[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch game details'))
    } finally {
      setLoading(false)
    }
  }, [])

  const createDetail = useCallback(async (
    gameId: string,
    name: string,
    modeId?: string | null,
    scoreFormat?: ScoreFormat | null,
    scoreDirection?: ScoreDirection | null,
    scoreUnit?: string | null
  ): Promise<GameDetail | null> => {
    try {
      const insertData = {
        game_id: gameId,
        name,
        mode_id: modeId || null,
        score_format: scoreFormat || null,
        score_direction: scoreDirection || null,
        score_unit: scoreUnit || null,
      }

      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('game_details')
        .insert(insertData)
        .select()
        .single()

      if (insertError) throw insertError
      
      const newDetail = data as GameDetail
      
      // Update local state
      setDetails(prev => [...prev, newDetail].sort((a, b) => {
        const orderDiff = a.sort_order - b.sort_order
        return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name)
      }))
      return newDetail
    } catch (err) {
      console.error('Failed to create game detail:', err)
      return null
    }
  }, [])

  const updateDetail = useCallback(async (
    id: string,
    updates: UpdateDetailFields
  ): Promise<boolean> => {
    try {
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('game_details')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state
      setDetails(prev => 
        prev.map(d => d.id === id ? { ...d, ...updates } : d)
      )
      return true
    } catch (err) {
      console.error('Failed to update game detail:', err)
      return false
    }
  }, [])

  const deleteDetail = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Soft delete - keeps score history intact
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('game_details')
        .update({ is_active: false })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Remove from local state
      setDetails(prev => prev.filter(d => d.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete game detail:', err)
      return false
    }
  }, [])

  const clearDetails = useCallback(() => {
    setDetails([])
    setError(null)
  }, [])

  return {
    details,
    loading,
    error,
    fetchDetails,
    createDetail,
    updateDetail,
    deleteDetail,
    clearDetails,
  }
}
```

## File: src/hooks/useManageGameModes.ts
```ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { GameMode, ScoreDirection, ScoreFormat } from '@/lib/types'

interface UseManageGameModesResult {
  modes: GameMode[]
  loading: boolean
  error: Error | null
  fetchModes: (gameId: string) => Promise<void>
  createMode: (
    gameId: string,
    name: string,
    scoreFormat?: ScoreFormat | null,
    scoreDirection?: ScoreDirection | null,
    scoreUnit?: string | null,
    detailLabelOverride?: string | null
  ) => Promise<GameMode | null>
  updateMode: (
    id: string,
    updates: {
      name?: string
      score_format?: ScoreFormat | null
      score_direction?: ScoreDirection | null
      score_unit?: string | null
      detail_label_override?: string | null
    }
  ) => Promise<boolean>
  deleteMode: (id: string) => Promise<boolean>
  clearModes: () => void
}

/**
 * useManageGameModes - Full CRUD operations for game modes
 * Uses soft delete (is_active = false) to preserve score history
 */
export function useManageGameModes(): UseManageGameModesResult {
  const [modes, setModes] = useState<GameMode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchModes = useCallback(async (gameId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: queryError } = await supabase
        .from('game_modes')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (queryError) throw queryError
      setModes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch game modes'))
    } finally {
      setLoading(false)
    }
  }, [])

  const createMode = useCallback(async (
    gameId: string,
    name: string,
    scoreFormat?: ScoreFormat | null,
    scoreDirection?: ScoreDirection | null,
    scoreUnit?: string | null,
    detailLabelOverride?: string | null
  ): Promise<GameMode | null> => {
    try {
      const { data, error: insertError } = await (supabase as any)
        .from('game_modes')
        .insert({
          game_id: gameId,
          name,
          score_format: scoreFormat || null,
          score_direction: scoreDirection || null,
          score_unit: scoreUnit || null,
          detail_label_override: detailLabelOverride || null,
        })
        .select()
        .single()
  
      if (insertError) throw insertError
      
      // Update local state
      setModes(prev => [...prev, data].sort((a, b) => {
        const orderDiff = a.sort_order - b.sort_order
        return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name)
      }))
      return data
    } catch (err) {
      console.error('Failed to create game mode:', err)
      return null
    }
  }, [])

  const updateMode = useCallback(async (
    id: string,
    updates: {
      name?: string
      score_format?: ScoreFormat | null
      score_direction?: ScoreDirection | null
      score_unit?: string | null
      detail_label_override?: string | null
    }
  ): Promise<boolean> => {
  
    try {
      const { error: updateError } = await (supabase as any)
        .from('game_modes')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state
      setModes(prev => 
        prev.map(m => m.id === id ? { ...m, ...updates } : m)
      )
      return true
    } catch (err) {
      console.error('Failed to update game mode:', err)
      return false
    }
  }, [])

  const deleteMode = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Soft delete - keeps score history intact
      const { error: updateError } = await (supabase as any)
        .from('game_modes')
        .update({ is_active: false })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Remove from local state
      setModes(prev => prev.filter(m => m.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete game mode:', err)
      return false
    }
  }, [])

  const clearModes = useCallback(() => {
    setModes([])
    setError(null)
  }, [])

  return {
    modes,
    loading,
    error,
    fetchModes,
    createMode,
    updateMode,
    deleteMode,
    clearModes,
  }
}
```

## File: src/hooks/useManageGames.ts
```ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Game, GameCategory, ScoreFormat, ScoreDirection } from '@/lib/types'

// Options for creating a new game
interface CreateGameOptions {
  platform?: string | null
  iconUrl?: string | null
  modeLabel?: string
  detailLabel?: string
  hasModes?: boolean
  hasDetails?: boolean
  defaultScoreFormat?: ScoreFormat
  defaultScoreDirection?: ScoreDirection
  defaultScoreUnit?: string | null
}

// Fields that can be updated on a game
interface UpdateGameFields {
  name?: string
  category?: GameCategory
  platform?: string | null
  icon_url?: string | null
  mode_label?: string
  detail_label?: string
  has_modes?: boolean
  has_details?: boolean
  default_score_format?: ScoreFormat
  default_score_direction?: ScoreDirection
  default_score_unit?: string | null
}

interface UseManageGamesResult {
  games: Game[]
  loading: boolean
  error: Error | null
  fetchGames: () => Promise<void>
  createGame: (
    name: string,
    category: GameCategory,
    options?: CreateGameOptions
  ) => Promise<Game | null>
  updateGame: (id: string, updates: UpdateGameFields) => Promise<boolean>
  deleteGame: (id: string) => Promise<boolean>
}

/**
 * useManageGames - Full CRUD operations for games
 * Uses soft delete (is_active = false) to preserve score history
 * 
 * Supports the 3-level hierarchy configuration:
 * - mode_label / detail_label: UI labels for dropdowns
 * - has_modes / has_details: whether to show those selection steps
 * - default_score_*: fallback score settings when mode/detail don't override
 */
export function useManageGames(): UseManageGamesResult {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchGames = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: queryError } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (queryError) throw queryError
      setGames((data as Game[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch games'))
    } finally {
      setLoading(false)
    }
  }, [])

  const createGame = useCallback(async (
    name: string,
    category: GameCategory,
    options?: CreateGameOptions
  ): Promise<Game | null> => {
    try {
      const insertData = {
        name,
        category,
        platform: options?.platform || null,
        icon_url: options?.iconUrl || null,
        mode_label: options?.modeLabel ?? 'Mode',
        detail_label: options?.detailLabel ?? 'Track',
        has_modes: options?.hasModes ?? true,
        has_details: options?.hasDetails ?? true,
        default_score_format: options?.defaultScoreFormat ?? 'integer',
        default_score_direction: options?.defaultScoreDirection ?? 'higher_better',
        default_score_unit: options?.defaultScoreUnit || null,
      }

      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('games')
        .insert(insertData)
        .select()
        .single()

      if (insertError) throw insertError
      
      const newGame = data as Game
      
      // Update local state
      setGames(prev => [...prev, newGame].sort((a, b) => {
        const orderDiff = a.sort_order - b.sort_order
        return orderDiff !== 0 ? orderDiff : a.name.localeCompare(b.name)
      }))
      return newGame
    } catch (err) {
      console.error('Failed to create game:', err)
      return null
    }
  }, [])

  const updateGame = useCallback(async (
    id: string,
    updates: UpdateGameFields
  ): Promise<boolean> => {
    try {
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('games')
        .update(updates)
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state
      setGames(prev => 
        prev.map(g => g.id === id ? { ...g, ...updates } : g)
      )
      return true
    } catch (err) {
      console.error('Failed to update game:', err)
      return false
    }
  }, [])

  const deleteGame = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Soft delete - keeps score history intact
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('games')
        .update({ is_active: false })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Remove from local state
      setGames(prev => prev.filter(g => g.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete game:', err)
      return false
    }
  }, [])

  return {
    games,
    loading,
    error,
    fetchGames,
    createGame,
    updateGame,
    deleteGame,
  }
}
```

## File: src/hooks/useManagePlayers.ts
```ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Player } from '@/lib/types'

interface UseManagePlayersResult {
  players: Player[]
  loading: boolean
  error: Error | null
  fetchPlayers: () => Promise<void>
  createPlayer: (name: string, avatarUrl?: string | null) => Promise<Player | null>
  updatePlayer: (id: string, name: string, avatarUrl?: string | null) => Promise<boolean>
  deletePlayer: (id: string) => Promise<boolean>
}

/**
 * useManagePlayers - Full CRUD operations for players
 */
export function useManagePlayers(): UseManagePlayersResult {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
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

  const createPlayer = useCallback(async (
    name: string, 
    avatarUrl?: string | null
  ): Promise<Player | null> => {
    try {
      const { data, error: insertError } = await (supabase as any)
        .from('players')
        .insert({ name, avatar_url: avatarUrl || null })
        .select()
        .single()

      if (insertError) throw insertError
      
      // Update local state
      setPlayers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return data
    } catch (err) {
      console.error('Failed to create player:', err)
      return null
    }
  }, [])

  const updatePlayer = useCallback(async (
    id: string,
    name: string,
    avatarUrl?: string | null
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('players')
        .update({ name, avatar_url: avatarUrl })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state
      setPlayers(prev => 
        prev.map(p => p.id === id ? { ...p, name, avatar_url: avatarUrl ?? p.avatar_url } : p)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      return true
    } catch (err) {
      console.error('Failed to update player:', err)
      return false
    }
  }, [])

  const deletePlayer = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      // Update local state
      setPlayers(prev => prev.filter(p => p.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete player:', err)
      return false
    }
  }, [])

  return {
    players,
    loading,
    error,
    fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
  }
}
```

## File: src/hooks/useManageScores.ts
```ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ScoreFormat } from '@/lib/types'

export interface ScoreWithDetails {
  id: string
  score: number
  achieved_at: string
  player_id: string | null
  player_name: string | null
  game_id: string
  game_name: string
  mode_id: string | null
  mode_name: string | null
  detail_id: string | null
  detail_name: string | null
  score_format: ScoreFormat
  score_unit: string | null
}

interface UseManageScoresResult {
  scores: ScoreWithDetails[]
  loading: boolean
  error: Error | null
  fetchScores: (limit?: number) => Promise<void>
  updateScore: (id: string, newScore: number) => Promise<boolean>
  deleteScore: (id: string) => Promise<boolean>
}

// Internal type for the join query result
interface ScoreJoinRow {
  id: string
  score: number
  achieved_at: string
  player_id: string
  game_id: string
  mode_id: string | null
  detail_id: string | null
  players: { name: string } | null
  games: { name: string; default_score_format: ScoreFormat; default_score_unit: string | null } | null
  game_modes: { name: string; score_format: ScoreFormat | null; score_unit: string | null } | null
  game_details: { name: string; score_format: ScoreFormat | null; score_unit: string | null } | null
}

/**
 * useManageScores - Fetch, update, and delete scores
 * Fetches from high_scores with joins for full context
 */
export function useManageScores(): UseManageScoresResult {
  const [scores, setScores] = useState<ScoreWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchScores = useCallback(async (limit = 100) => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch scores with related data via joins
      // Type assertion needed because Supabase client types don't handle complex joins
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: queryError } = await (supabase as any)
        .from('high_scores')
        .select(`
          id,
          score,
          achieved_at,
          player_id,
          game_id,
          mode_id,
          detail_id,
          players ( name ),
          games ( name, default_score_format, default_score_unit ),
          game_modes ( name, score_format, score_unit ),
          game_details ( name, score_format, score_unit )
        `)
        .order('achieved_at', { ascending: false })
        .limit(limit)

      if (queryError) throw queryError
      
      const rows = (data || []) as ScoreJoinRow[]
      
      const formatted: ScoreWithDetails[] = rows.map((row) => {
        // Extract nested data
        const player = row.players
        const game = row.games
        const mode = row.game_modes
        const detail = row.game_details
        
        // Calculate effective format/unit using inheritance: detail → mode → game
        const effectiveFormat = detail?.score_format ?? mode?.score_format ?? game?.default_score_format ?? 'integer'
        const effectiveUnit = detail?.score_unit ?? mode?.score_unit ?? game?.default_score_unit ?? null

        return {
          id: row.id,
          score: row.score,
          achieved_at: row.achieved_at,
          player_name: player?.name || null,
          player_id: row.player_id,
          game_name: game?.name || 'Unknown Game',
          game_id: row.game_id,
          mode_name: mode?.name || null,
          mode_id: row.mode_id,
          detail_name: detail?.name || null,
          detail_id: row.detail_id,
          score_format: effectiveFormat,
          score_unit: effectiveUnit,
        }
      })
      
      setScores(formatted)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch scores'))
    } finally {
      setLoading(false)
    }
  }, [])

  const updateScore = useCallback(async (id: string, newScore: number): Promise<boolean> => {
    try {
      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('high_scores')
        .update({ score: newScore })
        .eq('id', id)

      if (updateError) throw updateError
      
      // Update local state
      setScores(prev => 
        prev.map(s => s.id === id ? { ...s, score: newScore } : s)
      )
      return true
    } catch (err) {
      console.error('Failed to update score:', err)
      return false
    }
  }, [])

  const deleteScore = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('high_scores')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      // Remove from local state
      setScores(prev => prev.filter(s => s.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete score:', err)
      return false
    }
  }, [])

  return {
    scores,
    loading,
    error,
    fetchScores,
    updateScore,
    deleteScore,
  }
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

## File: src/hooks/useScoreDetails.ts
```ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ScoreFormat, ScoreDirection } from '@/lib/types'

export interface RealtimeScoreData {
  scoreId: string
  playerName: string
  score: number
  scoreFormat: ScoreFormat
  scoreUnit: string | null
  gameName: string
  modeName: string | null
  detailName: string | null
  rank: number
}

// Internal type for the join query result
interface ScoreJoinResult {
  id: string
  score: number
  game_id: string
  mode_id: string | null
  detail_id: string | null
  players: { name: string } | null
  games: { name: string } | null
  game_modes: { name: string } | null
  game_details: { name: string } | null
}

// Internal type for score settings RPC result
interface ScoreSettingsRow {
  score_format: ScoreFormat
  score_direction: ScoreDirection
  score_unit: string | null
}

// Internal type for leaderboard RPC result
interface LeaderboardRow {
  rank: number
  score_id: string
}

/**
 * Hook to fetch full score details for realtime alerts
 * Fetches score with related data and calculates rank using RPC
 */
export function useScoreDetails() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RealtimeScoreData | null>(null)

  const fetchScoreDetails = useCallback(async (scoreId: string): Promise<RealtimeScoreData | null> => {
    setLoading(true)
    
    try {
      // Fetch the score with all related data
      // Type assertion needed because Supabase client types don't handle complex joins
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: scoreData, error: scoreError } = await (supabase as any)
        .from('high_scores')
        .select(`
          id,
          score,
          game_id,
          mode_id,
          detail_id,
          players ( name ),
          games ( name ),
          game_modes ( name ),
          game_details ( name )
        `)
        .eq('id', scoreId)
        .single()

      if (scoreError || !scoreData) {
        console.error('Error fetching score details:', scoreError)
        setLoading(false)
        return null
      }

      const scoreRow = scoreData as ScoreJoinResult

      // Get effective score settings using RPC
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: settings, error: settingsError } = await (supabase as any).rpc('get_score_settings', {
        p_game_id: scoreRow.game_id,
        p_mode_id: scoreRow.mode_id,
        p_detail_id: scoreRow.detail_id,
      })

      if (settingsError) {
        console.error('Error fetching score settings:', settingsError)
        setLoading(false)
        return null
      }

      const settingsArray = settings as ScoreSettingsRow[] | null
      const effectiveSettings: ScoreSettingsRow = settingsArray?.[0] || {
        score_format: 'integer',
        score_direction: 'higher_better',
        score_unit: null,
      }

      // Get leaderboard to calculate rank
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: leaderboard, error: leaderboardError } = await (supabase as any).rpc('get_leaderboard', {
        p_game_id: scoreRow.game_id,
        p_mode_id: scoreRow.mode_id,
        p_detail_id: scoreRow.detail_id,
        p_limit: 100,
      })

      let rank = 1
      if (!leaderboardError && leaderboard) {
        const entries = leaderboard as LeaderboardRow[]
        const foundEntry = entries.find((e) => e.score_id === scoreId)
        if (foundEntry) {
          rank = Number(foundEntry.rank)
        }
      }

      // Extract nested data
      const playerData = scoreRow.players
      const gameData = scoreRow.games
      const modeData = scoreRow.game_modes
      const detailData = scoreRow.game_details

      const result: RealtimeScoreData = {
        scoreId: scoreRow.id,
        playerName: playerData?.name || 'Unknown',
        score: scoreRow.score,
        scoreFormat: effectiveSettings.score_format,
        scoreUnit: effectiveSettings.score_unit,
        gameName: gameData?.name || 'Unknown Game',
        modeName: modeData?.name || null,
        detailName: detailData?.name || null,
        rank,
      }

      setData(result)
      setLoading(false)
      return result
    } catch (error) {
      console.error('Error in fetchScoreDetails:', error)
      setLoading(false)
      return null
    }
  }, [])

  const clearData = useCallback(() => {
    setData(null)
  }, [])

  return { fetchScoreDetails, clearData, data, loading }
}
```

## File: src/hooks/useSoundInit.ts
```ts
import { useEffect, useRef } from 'react'
import { sounds } from '@/lib/sounds'

/**
 * Hook to initialize audio context on first user interaction
 * Browsers require user gesture to enable audio
 */
export function useSoundInit() {
  const initialized = useRef(false)

  useEffect(() => {
    const handleInteraction = () => {
      if (!initialized.current) {
        sounds.init()
        initialized.current = true
      }
    }

    // Listen for first interaction
    document.addEventListener('touchstart', handleInteraction, { once: true })
    document.addEventListener('mousedown', handleInteraction, { once: true })
    document.addEventListener('keydown', handleInteraction, { once: true })

    return () => {
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('mousedown', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }
  }, [])
}
```

## File: src/hooks/useSubmitScore.ts
```ts
import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface SubmitScoreParams {
  gameId: string
  modeId?: string | null
  detailId?: string | null
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

  const submitScore = useCallback(async ({ 
    gameId, 
    modeId, 
    detailId, 
    playerId, 
    score 
  }: SubmitScoreParams) => {
    try {
      if (isMountedRef.current) {
        setSubmitting(true)
        setError(null)
      }

      // Type assertion needed because Supabase client types don't match our schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase as any)
        .from('high_scores')
        .insert({
          game_id: gameId,
          mode_id: modeId || null,
          detail_id: detailId || null,
          player_id: playerId,
          score,
          metadata: {},
          achieved_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      return { success: true, scoreId: data?.id }
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

## File: src/hooks/useTheme.ts
```ts
import { useEffect } from 'react'
import { useKioskStore } from '@/stores/kioskStore'
import { getTheme, applyTheme } from '@/lib/themes'

/**
 * useTheme - Applies the current theme to the document
 * 
 * Should be called once at the app root (App.tsx)
 * Watches for theme changes in store and updates CSS variables
 */
export function useTheme(): void {
  const themeId = useKioskStore((state) => state.themeId)
  const textPrimaryOverride = useKioskStore((state) => state.textPrimaryOverride)
  const accentPrimaryOverride = useKioskStore((state) => state.accentPrimaryOverride)

  useEffect(() => {
    const theme = getTheme(themeId, {
      textPrimaryOverride,
      accentPrimaryOverride,
    })
    applyTheme(theme)
  }, [themeId, textPrimaryOverride, accentPrimaryOverride])
}
```

## File: src/index.css
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================================================
   CSS VARIABLES - Default Theme (Dark)
   These are overwritten by the theme system via JavaScript
   ============================================================================ */
:root {
  /* Backgrounds */
  --color-bg-primary: #0f0f0f;
  --color-bg-card: #1a1a1a;
  --color-bg-elevated: #252525;
  
  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a1a1a1;
  --color-text-muted: #6b6b6b;
  
  /* Accents */
  --color-accent-primary: #3b82f6;
  --color-accent-secondary: #60a5fa;
  
  /* Category Colors */
  --color-category-racing: #ef4444;
  --color-category-golf: #22c55e;
  --color-category-party: #f59e0b;
  --color-category-darts: #3b82f6;
  --color-category-pinball: #a855f7;
  --color-category-platformer: #ec4899;
  --color-category-rpg: #06b6d4;
  --color-category-other: #6b7280;
  
  /* Medal Colors */
  --color-medal-gold: #ffd700;
  --color-medal-silver: #c0c0c0;
  --color-medal-bronze: #cd7f32;
}

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
    @apply font-sans antialiased;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-size: 18px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    touch-action: manipulation;
    overscroll-behavior: none;
  }

  /* Ensure html also has the background for full coverage */
  html {
    background-color: var(--color-bg-primary);
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
    background-color: var(--color-bg-card);
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--color-bg-elevated);
    @apply rounded;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-text-muted);
  }
}

@layer components {
  /* Card base style with depth */
  .card {
    background-color: var(--color-bg-card);
    @apply rounded-lg;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .card-interactive {
    background-color: var(--color-bg-card);
    @apply rounded-lg transition-all duration-fast;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .card-interactive:active {
    background-color: var(--color-bg-elevated);
    @apply scale-[0.98];
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  /* Category-specific glow borders - using CSS variables */
  .category-glow-racing {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-category-racing) 30%, transparent), 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  .category-glow-golf {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-category-golf) 30%, transparent), 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  .category-glow-party {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-category-party) 30%, transparent), 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  .category-glow-darts {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-category-darts) 30%, transparent), 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  .category-glow-pinball {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-category-pinball) 30%, transparent), 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  .category-glow-platformer {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-category-platformer) 30%, transparent), 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  .category-glow-rpg {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-category-rpg) 30%, transparent), 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  .category-glow-other {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-category-other) 30%, transparent), 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  /* Podium row highlights - using CSS variables */
  .podium-gold {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-medal-gold) 8%, transparent) 0%, transparent 100%);
    border-left: 3px solid var(--color-medal-gold);
  }
  .podium-silver {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-medal-silver) 6%, transparent) 0%, transparent 100%);
    border-left: 3px solid var(--color-medal-silver);
  }
  .podium-bronze {
    background: linear-gradient(90deg, color-mix(in srgb, var(--color-medal-bronze) 6%, transparent) 0%, transparent 100%);
    border-left: 3px solid var(--color-medal-bronze);
  }

  /* Medal badge enhancements - using CSS variables */
  .medal-gold {
    color: var(--color-medal-gold);
    text-shadow: 0 0 10px color-mix(in srgb, var(--color-medal-gold) 50%, transparent);
  }
  .medal-silver {
    color: var(--color-medal-silver);
    text-shadow: 0 0 8px color-mix(in srgb, var(--color-medal-silver) 40%, transparent);
  }
  .medal-bronze {
    color: var(--color-medal-bronze);
    text-shadow: 0 0 8px color-mix(in srgb, var(--color-medal-bronze) 40%, transparent);
  }

  /* Avatar ring for top players - using CSS variables */
  .avatar-ring-gold {
    box-shadow: 0 0 0 2px var(--color-medal-gold), 0 0 12px color-mix(in srgb, var(--color-medal-gold) 40%, transparent);
  }
  .avatar-ring-silver {
    box-shadow: 0 0 0 2px var(--color-medal-silver), 0 0 10px color-mix(in srgb, var(--color-medal-silver) 30%, transparent);
  }
  .avatar-ring-bronze {
    box-shadow: 0 0 0 2px var(--color-medal-bronze), 0 0 10px color-mix(in srgb, var(--color-medal-bronze) 30%, transparent);
  }

  /* Button styles */
  .btn-primary {
    background-color: var(--color-bg-elevated);
    color: var(--color-text-primary);
    @apply font-semibold rounded-lg px-md;
    @apply transition-all duration-fast;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .btn-primary:active {
    @apply scale-[0.98];
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  /* Icon badge */
  .icon-badge {
    @apply w-12 h-12 rounded-lg flex items-center justify-center;
    @apply text-lg font-bold text-white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
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

  /* ============================================================================
     KIOSK CONTAINER - RESPONSIVE
     Desktop/Kiosk: Fixed 800×480 centered
     Mobile: Full viewport with scrolling
     ============================================================================ */
  .kiosk-container {
    width: 800px;
    height: 480px;
    max-width: 100vw;
    max-height: 100vh;
    overflow: hidden;
    position: relative;
    background-color: var(--color-bg-primary);
  }
  
  /* Mobile: Full screen with scrolling */
  @media (max-width: 639px) {
    .kiosk-container {
      width: 100%;
      height: auto;
      min-height: 100vh;
      min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
      max-height: none;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
  
  /* Small tablets in portrait */
  @media (min-width: 640px) and (max-width: 799px) {
    .kiosk-container {
      width: 100%;
      height: 100vh;
      max-width: none;
    }
  }

  /* ============================================================================
     MOBILE-SPECIFIC UTILITIES
     ============================================================================ */
  
  /* Hide on mobile */
  .hide-mobile {
    display: block;
  }
  @media (max-width: 639px) {
    .hide-mobile {
      display: none !important;
    }
  }
  
  /* Show only on mobile */
  .show-mobile {
    display: none;
  }
  @media (max-width: 639px) {
    .show-mobile {
      display: block;
    }
  }
  
  /* Flex variant */
  .show-mobile-flex {
    display: none;
  }
  @media (max-width: 639px) {
    .show-mobile-flex {
      display: flex;
    }
  }
  
  /* Score row - horizontal on desktop, stacked on mobile */
  .score-row-layout {
    @apply flex flex-row items-center justify-between;
    @apply h-[72px] px-md;
  }
  @media (max-width: 639px) {
    .score-row-layout {
      @apply flex-col items-stretch justify-start;
      @apply h-auto py-3 px-md gap-2;
      min-height: 80px;
    }
  }
  
  /* Score row player info - adapts on mobile */
  .score-row-player {
    @apply flex flex-row items-center gap-3 flex-1 ml-3 min-w-0;
  }
  @media (max-width: 639px) {
    .score-row-player {
      @apply ml-0 flex-initial w-full;
    }
  }
  
  /* Score row value - right aligned on desktop, full width on mobile */
  .score-row-value {
    @apply flex-shrink-0;
  }
  @media (max-width: 639px) {
    .score-row-value {
      @apply w-full text-center pl-[52px]; /* Align with player name (40px badge + 12px gap) */
    }
  }
  
  /* Category grid - 4 cols on desktop, 2 cols on mobile */
  .category-grid {
    @apply grid grid-cols-4 grid-rows-2 gap-3 h-full;
  }
  @media (max-width: 639px) {
    .category-grid {
      @apply grid-cols-2 grid-rows-4 gap-3;
      height: auto;
      min-height: 400px;
    }
  }
  
  /* Header height - slightly smaller on mobile */
  .header-height {
    @apply h-[56px];
  }
  @media (max-width: 639px) {
    .header-height {
      @apply h-[52px];
    }
  }
  
  /* Footer height */
  .footer-height {
    @apply h-[48px];
  }
  @media (max-width: 639px) {
    .footer-height {
      @apply h-[56px]; /* Larger touch targets on mobile */
    }
  }
  
  /* Idle display header - responsive */
  .idle-header {
    @apply h-[72px] px-md flex items-center justify-between border-b;
    border-color: color-mix(in srgb, var(--color-bg-elevated) 50%, transparent);
  }
  @media (max-width: 639px) {
    .idle-header {
      @apply h-auto py-3 px-md flex-col items-start gap-2;
    }
  }
  
  /* Mobile-safe area padding (for notch phones) */
  .safe-area-top {
    padding-top: env(safe-area-inset-top, 0);
  }
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  .safe-area-x {
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
  }

  /* Smooth transitions */
  .transition-smooth {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Gradient text for special emphasis - uses medal gold */
  .text-gradient-gold {
    background: linear-gradient(135deg, var(--color-medal-gold) 0%, #ffed4a 50%, var(--color-medal-gold) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Light theme: solid dark gold instead of gradient for readability */
  [data-theme="light"] .text-gradient-gold {
    background: none;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: #92400e;
    background-clip: unset;
    color: #92400e;
  }

  /* Subtle inner glow for inputs */
  .input-glow {
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  /* Stagger animation delays */
  .stagger-1 { animation-delay: 0.05s; }
  .stagger-2 { animation-delay: 0.1s; }
  .stagger-3 { animation-delay: 0.15s; }
  .stagger-4 { animation-delay: 0.2s; }
  .stagger-5 { animation-delay: 0.25s; }
}

/* ============================================================================
   THEME EFFECTS
   Applied via class on html element
   ============================================================================ */

/* Scanlines Effect (Retro, Fallout themes) */
.theme-scanlines::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  z-index: 9999;
}

/* Glow Effect (Vibrant, Retro, Fallout, Cyberpunk themes) */
.theme-glow .card {
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4), 
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 0 20px color-mix(in srgb, var(--color-accent-primary) 10%, transparent);
}

.theme-glow .text-text-primary {
  text-shadow: 0 0 8px color-mix(in srgb, var(--color-text-primary) 30%, transparent);
}

/* Noise/CRT Effect (Fallout theme) */
.theme-noise::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  z-index: 9998;
}

/* Animations */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

## File: src/lib/scoreParser.ts
```ts
import type { ScoreFormat } from '@/lib/types'

interface ParseResult {
  success: boolean
  value: number | null
  error?: string
}

/**
 * Parse a time string into milliseconds
 * Accepts: "1:23.456", "83.456", "83456" (raw ms), "1:23" (no ms)
 */
function parseTimeMs(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Try M:SS.mmm or M:SS format
  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})(?:\.(\d{1,3}))?$/)
  if (colonMatch) {
    const minutes = parseInt(colonMatch[1], 10)
    const seconds = parseInt(colonMatch[2], 10)
    const ms = colonMatch[3] ? parseInt(colonMatch[3].padEnd(3, '0'), 10) : 0
    
    if (seconds >= 60) {
      return { success: false, value: null, error: 'Seconds must be < 60' }
    }
    
    const totalMs = (minutes * 60 * 1000) + (seconds * 1000) + ms
    return { success: true, value: totalMs }
  }
  
  // Try SS.mmm format (seconds with decimal)
  const decimalMatch = trimmed.match(/^(\d+)\.(\d{1,3})$/)
  if (decimalMatch) {
    const seconds = parseInt(decimalMatch[1], 10)
    const ms = parseInt(decimalMatch[2].padEnd(3, '0'), 10)
    const totalMs = (seconds * 1000) + ms
    return { success: true, value: totalMs }
  }
  
  // Try raw milliseconds (integer)
  const rawMs = parseInt(trimmed, 10)
  if (!isNaN(rawMs) && trimmed === rawMs.toString()) {
    return { success: true, value: rawMs }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected format: M:SS.mmm, SS.mmm, or milliseconds' 
  }
}

/**
 * Parse a time string into seconds
 * Accepts: "4:56", "296", "4:56.5" (rounds to seconds)
 */
function parseTimeSeconds(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Try M:SS format
  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})(?:\.\d+)?$/)
  if (colonMatch) {
    const minutes = parseInt(colonMatch[1], 10)
    const seconds = parseInt(colonMatch[2], 10)
    
    if (seconds >= 60) {
      return { success: false, value: null, error: 'Seconds must be < 60' }
    }
    
    const totalSeconds = (minutes * 60) + seconds
    return { success: true, value: totalSeconds }
  }
  
  // Try raw seconds (integer)
  const rawSeconds = parseInt(trimmed, 10)
  if (!isNaN(rawSeconds)) {
    return { success: true, value: rawSeconds }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected format: M:SS or seconds' 
  }
}

/**
 * Parse a golf score (relative to par)
 * Accepts: "-6", "+2", "0", "E" (even = 0)
 */
function parseGolfRelative(input: string): ParseResult {
  const trimmed = input.trim().toUpperCase()
  
  // E or EVEN = 0
  if (trimmed === 'E' || trimmed === 'EVEN' || trimmed === 'PAR') {
    return { success: true, value: 0 }
  }
  
  // Parse signed integer
  const value = parseInt(trimmed, 10)
  if (!isNaN(value)) {
    return { success: true, value }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected: -6, +2, 0, or E' 
  }
}

/**
 * Parse a decimal score (stored as integer × 100)
 * Accepts: "98.45", "100", "78.5"
 */
function parseDecimal2(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Remove % sign if present
  const cleaned = trimmed.replace(/%$/, '')
  
  const value = parseFloat(cleaned)
  if (!isNaN(value)) {
    // Multiply by 100 and round to avoid floating point issues
    const stored = Math.round(value * 100)
    return { success: true, value: stored }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected decimal number (e.g., 98.45)' 
  }
}

/**
 * Parse an integer score
 * Accepts: "1000", "47", "-5"
 */
function parseInteger(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Remove common suffixes
  const cleaned = trimmed.replace(/\s*(pts?|points?|kills?|elims?)\.?$/i, '')
  
  const value = parseInt(cleaned, 10)
  if (!isNaN(value) && cleaned === value.toString()) {
    return { success: true, value }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected integer' 
  }
}

/**
 * Parse a level score (World X-Y format)
 * Accepts: "8-4", "World 8-4", "8-4"
 * Stored as: world * 100 + level (e.g., 8-4 = 804)
 */
function parseLevel(input: string): ParseResult {
  const trimmed = input.trim()
  
  // Try X-Y format
  const match = trimmed.match(/(?:world\s*)?(\d+)-(\d+)/i)
  if (match) {
    const world = parseInt(match[1], 10)
    const level = parseInt(match[2], 10)
    
    if (world > 99 || level > 99) {
      return { success: false, value: null, error: 'World/level must be < 100' }
    }
    
    const stored = (world * 100) + level
    return { success: true, value: stored }
  }
  
  // Try raw encoded value
  const raw = parseInt(trimmed, 10)
  if (!isNaN(raw) && raw > 0) {
    return { success: true, value: raw }
  }
  
  return { 
    success: false, 
    value: null, 
    error: 'Expected format: X-Y or World X-Y' 
  }
}

/**
 * Parse a score string based on the score format
 */
export function parseScore(input: string, format: ScoreFormat): ParseResult {
  if (!input || input.trim() === '') {
    return { success: false, value: null, error: 'Score is required' }
  }
  
  switch (format) {
    case 'time_ms':
      return parseTimeMs(input)
    case 'time_seconds':
      return parseTimeSeconds(input)
    case 'golf_relative':
      return parseGolfRelative(input)
    case 'decimal_2':
      return parseDecimal2(input)
    case 'level':
      return parseLevel(input)
    case 'integer':
    default:
      return parseInteger(input)
  }
}

/**
 * Get help text for a score format
 */
export function getFormatHelpText(format: ScoreFormat): string {
  switch (format) {
    case 'time_ms':
      return 'Enter as M:SS.mmm (e.g., 1:23.456) or total milliseconds'
    case 'time_seconds':
      return 'Enter as M:SS (e.g., 4:56) or total seconds'
    case 'golf_relative':
      return 'Enter relative to par (e.g., -6, +2, 0, or E for even)'
    case 'decimal_2':
      return 'Enter as decimal (e.g., 98.45)'
    case 'level':
      return 'Enter as X-Y (e.g., 8-4 or World 8-4)'
    case 'integer':
    default:
      return 'Enter as whole number'
  }
}

/**
 * Format examples for documentation
 */
export const SCORE_FORMAT_EXAMPLES: Record<ScoreFormat, string[]> = {
  integer: ['1000', '47', '250'],
  time_ms: ['1:23.456', '83.456', '83456'],
  time_seconds: ['4:56', '296'],
  decimal_2: ['98.45', '100', '78.5'],
  golf_relative: ['-6', '+2', '0', 'E'],
  level: ['8-4', 'World 8-4'],
}
```

## File: src/lib/sounds.ts
```ts
/**
 * Sound System for Game Room Scoreboard
 * 
 * Uses Web Audio API to generate arcade-style sounds programmatically.
 * No external files needed — sounds are synthesized on demand.
 */

type SoundType = 'fanfare' | 'chime' | 'click' | 'error'

// Audio context singleton (created on first user interaction)
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  // Resume if suspended (browsers require user interaction)
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

/**
 * Play a triumphant fanfare for 1st place victories
 * Ascending arpeggio with harmonics — arcade victory vibes
 */
function playFanfare(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Victory arpeggio notes (C major with octave jump)
  const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
  const noteDuration = 0.12
  
  notes.forEach((freq, i) => {
    const startTime = now + i * noteDuration
    
    // Main tone
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, startTime)
    
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration + 0.2)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(startTime)
    osc.stop(startTime + noteDuration + 0.3)
    
    // Add shimmer harmonic on last note
    if (i === notes.length - 1) {
      const shimmer = ctx.createOscillator()
      const shimmerGain = ctx.createGain()
      
      shimmer.type = 'sine'
      shimmer.frequency.setValueAtTime(freq * 2, startTime)
      
      shimmerGain.gain.setValueAtTime(0, startTime)
      shimmerGain.gain.linearRampToValueAtTime(volume * 0.15, startTime + 0.05)
      shimmerGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8)
      
      shimmer.connect(shimmerGain)
      shimmerGain.connect(ctx.destination)
      
      shimmer.start(startTime)
      shimmer.stop(startTime + 1)
    }
  })
  
  // Add a subtle bass thump for impact
  const bass = ctx.createOscillator()
  const bassGain = ctx.createGain()
  
  bass.type = 'sine'
  bass.frequency.setValueAtTime(130.81, now) // C3
  bass.frequency.exponentialRampToValueAtTime(65.41, now + 0.1) // Drop to C2
  
  bassGain.gain.setValueAtTime(volume * 0.3, now)
  bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  
  bass.connect(bassGain)
  bassGain.connect(ctx.destination)
  
  bass.start(now)
  bass.stop(now + 0.4)
}

/**
 * Play a pleasant chime for score saves (non-1st place)
 * Soft bell-like tone with gentle decay
 */
function playChime(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Bell-like tone (two frequencies for richness)
  const frequencies = [880, 1318.5] // A5 and E6 (perfect fifth)
  
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    
    const noteVolume = i === 0 ? volume * 0.3 : volume * 0.15
    
    gain.gain.setValueAtTime(noteVolume, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.7)
  })
  
  // Add subtle high harmonic
  const harmonic = ctx.createOscillator()
  const harmonicGain = ctx.createGain()
  
  harmonic.type = 'sine'
  harmonic.frequency.setValueAtTime(2637, now) // E7
  
  harmonicGain.gain.setValueAtTime(volume * 0.05, now)
  harmonicGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  
  harmonic.connect(harmonicGain)
  harmonicGain.connect(ctx.destination)
  
  harmonic.start(now)
  harmonic.stop(now + 0.4)
}

/**
 * Play a subtle click for button feedback
 * Very short, non-intrusive
 */
function playClick(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Short click using noise-like synthesis
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.type = 'square'
  osc.frequency.setValueAtTime(1800, now)
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.03)
  
  gain.gain.setValueAtTime(volume * 0.1, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  osc.start(now)
  osc.stop(now + 0.06)
}

/**
 * Play an error/invalid sound
 * Low buzz to indicate something went wrong
 */
function playError(volume: number): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Two low tones slightly detuned for "buzz" effect
  const frequencies = [150, 155]
  
  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, now)
    
    gain.gain.setValueAtTime(volume * 0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(now)
    osc.stop(now + 0.3)
  })
}

/**
 * Sound Manager
 * Central interface for playing sounds with volume control
 */
class SoundManager {
  private enabled: boolean = true
  private volume: number = 0.7 // 0.0 to 1.0
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
  
  isEnabled(): boolean {
    return this.enabled
  }
  
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }
  
  getVolume(): number {
    return this.volume
  }
  
  play(type: SoundType): void {
    if (!this.enabled) return
    
    try {
      switch (type) {
        case 'fanfare':
          playFanfare(this.volume)
          break
        case 'chime':
          playChime(this.volume)
          break
        case 'click':
          playClick(this.volume)
          break
        case 'error':
          playError(this.volume)
          break
      }
    } catch (error) {
      // Silently fail if audio isn't available
      console.warn('Sound playback failed:', error)
    }
  }
  
  /**
   * Play appropriate sound based on score rank
   */
  playScoreSound(rank: number): void {
    if (rank === 1) {
      this.play('fanfare')
    } else {
      this.play('chime')
    }
  }
  
  /**
   * Initialize audio context on first user interaction
   * Call this from a click/touch handler to enable audio
   */
  init(): void {
    try {
      getAudioContext()
    } catch (error) {
      console.warn('Audio initialization failed:', error)
    }
  }
}

// Export singleton instance
export const sounds = new SoundManager()

// Export types
export type { SoundType }
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

## File: src/lib/themes.ts
```ts
/**
 * Theme System for Game Room Scoreboard
 * 
 * 6 preset themes + customization options
 */

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string
  bgCard: string
  bgElevated: string
  
  // Text
  textPrimary: string
  textSecondary: string
  textMuted: string
  
  // Accents
  accentPrimary: string
  accentSecondary: string
  
  // Category colors
  categoryRacing: string
  categoryGolf: string
  categoryParty: string
  categoryDarts: string
  categoryPinball: string
  categoryPlatformer: string
  categoryRpg: string
  categoryOther: string
  
  // Medals
  medalGold: string
  medalSilver: string
  medalBronze: string
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: ThemeColors
  // Optional special effects
  effects?: {
    scanlines?: boolean
    glow?: boolean
    noise?: boolean
  }
}

// ============================================================================
// THEME DEFINITIONS
// ============================================================================

export const themes: Record<string, Theme> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Default dark theme',
    colors: {
      bgPrimary: '#0f0f0f',
      bgCard: '#1a1a1a',
      bgElevated: '#252525',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1a1',
      textMuted: '#6b6b6b',
      accentPrimary: '#3b82f6',
      accentSecondary: '#60a5fa',
      categoryRacing: '#ef4444',
      categoryGolf: '#22c55e',
      categoryParty: '#f59e0b',
      categoryDarts: '#3b82f6',
      categoryPinball: '#a855f7',
      categoryPlatformer: '#ec4899',
      categoryRpg: '#06b6d4',
      categoryOther: '#6b7280',
      medalGold: '#ffd700',
      medalSilver: '#c0c0c0',
      medalBronze: '#cd7f32',
    },
  },

  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean light theme for bright rooms',
    colors: {
      bgPrimary: '#f0f0f0',
      bgCard: '#ffffff',
      bgElevated: '#e0e0e0',
      textPrimary: '#111111',
      textSecondary: '#333333',
      textMuted: '#666666',
      accentPrimary: '#1d4ed8',
      accentSecondary: '#2563eb',
      categoryRacing: '#b91c1c',
      categoryGolf: '#15803d',
      categoryParty: '#b45309',
      categoryDarts: '#1d4ed8',
      categoryPinball: '#7e22ce',
      categoryPlatformer: '#be185d',
      categoryRpg: '#0e7490',
      categoryOther: '#374151',
      medalGold: '#a16207',
      medalSilver: '#4b5563',
      medalBronze: '#92400e',
    },
  },

  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold and colorful',
    colors: {
      bgPrimary: '#0a0a0a',
      bgCard: '#18181b',
      bgElevated: '#27272a',
      textPrimary: '#fafafa',
      textSecondary: '#d4d4d8',
      textMuted: '#a1a1aa',
      accentPrimary: '#f43f5e',
      accentSecondary: '#fb7185',
      categoryRacing: '#ff3b30',
      categoryGolf: '#30d158',
      categoryParty: '#ff9f0a',
      categoryDarts: '#007aff',
      categoryPinball: '#bf5af2',
      categoryPlatformer: '#ff375f',
      categoryRpg: '#5ac8fa',
      categoryOther: '#8e8e93',
      medalGold: '#ffd60a',
      medalSilver: '#d1d1d6',
      medalBronze: '#ff9500',
    },
    effects: {
      glow: true,
    },
  },

  retro: {
    id: 'retro',
    name: 'Retro',
    description: 'Classic arcade CRT vibes',
    colors: {
      bgPrimary: '#0d0208',
      bgCard: '#1a0a10',
      bgElevated: '#2d1520',
      textPrimary: '#ff6b35',
      textSecondary: '#f7931e',
      textMuted: '#c75000',
      accentPrimary: '#ff6b35',
      accentSecondary: '#f7931e',
      categoryRacing: '#ff0000',
      categoryGolf: '#00ff00',
      categoryParty: '#ffff00',
      categoryDarts: '#00ffff',
      categoryPinball: '#ff00ff',
      categoryPlatformer: '#ff6b35',
      categoryRpg: '#00ffff',
      categoryOther: '#f7931e',
      medalGold: '#ffd700',
      medalSilver: '#c0c0c0',
      medalBronze: '#ff6b35',
    },
    effects: {
      scanlines: true,
      glow: true,
    },
  },

  fallout: {
    id: 'fallout',
    name: 'Fallout',
    description: 'Pip-Boy terminal green',
    colors: {
      bgPrimary: '#0a0f0a',
      bgCard: '#0f1a0f',
      bgElevated: '#1a2a1a',
      textPrimary: '#14fe17',
      textSecondary: '#0fbc10',
      textMuted: '#0a7d0b',
      accentPrimary: '#14fe17',
      accentSecondary: '#0fbc10',
      categoryRacing: '#14fe17',
      categoryGolf: '#14fe17',
      categoryParty: '#14fe17',
      categoryDarts: '#14fe17',
      categoryPinball: '#14fe17',
      categoryPlatformer: '#14fe17',
      categoryRpg: '#14fe17',
      categoryOther: '#0fbc10',
      medalGold: '#14fe17',
      medalSilver: '#0fbc10',
      medalBronze: '#0a7d0b',
    },
    effects: {
      scanlines: true,
      glow: true,
      noise: true,
    },
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon nights in Night City',
    colors: {
      bgPrimary: '#0a0a12',
      bgCard: '#12121f',
      bgElevated: '#1a1a2e',
      textPrimary: '#00f0ff',
      textSecondary: '#ff00a0',
      textMuted: '#6b6b8a',
      accentPrimary: '#ff00a0',
      accentSecondary: '#00f0ff',
      categoryRacing: '#ff003c',
      categoryGolf: '#00ff9f',
      categoryParty: '#fcee0a',
      categoryDarts: '#00f0ff',
      categoryPinball: '#ff00a0',
      categoryPlatformer: '#ff003c',
      categoryRpg: '#00f0ff',
      categoryOther: '#6b6b8a',
      medalGold: '#fcee0a',
      medalSilver: '#00f0ff',
      medalBronze: '#ff00a0',
    },
    effects: {
      glow: true,
    },
  },
}

// ============================================================================
// CUSTOMIZATION OPTIONS
// ============================================================================

export interface ThemeCustomization {
  textPrimaryOverride?: string | null
  accentPrimaryOverride?: string | null
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a theme by ID, with optional customizations applied
 */
export function getTheme(themeId: string, customization?: ThemeCustomization): Theme {
  const base = themes[themeId] || themes.dark
  
  if (!customization) return base
  
  return {
    ...base,
    colors: {
      ...base.colors,
      ...(customization.textPrimaryOverride && { textPrimary: customization.textPrimaryOverride }),
      ...(customization.accentPrimaryOverride && { accentPrimary: customization.accentPrimaryOverride }),
    },
  }
}

/**
 * Apply a theme to the document root
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  const { colors, effects } = theme
  
  // Set color variables
  root.style.setProperty('--color-bg-primary', colors.bgPrimary)
  root.style.setProperty('--color-bg-card', colors.bgCard)
  root.style.setProperty('--color-bg-elevated', colors.bgElevated)
  root.style.setProperty('--color-text-primary', colors.textPrimary)
  root.style.setProperty('--color-text-secondary', colors.textSecondary)
  root.style.setProperty('--color-text-muted', colors.textMuted)
  root.style.setProperty('--color-accent-primary', colors.accentPrimary)
  root.style.setProperty('--color-accent-secondary', colors.accentSecondary)
  root.style.setProperty('--color-category-racing', colors.categoryRacing)
  root.style.setProperty('--color-category-golf', colors.categoryGolf)
  root.style.setProperty('--color-category-party', colors.categoryParty)
  root.style.setProperty('--color-category-darts', colors.categoryDarts)
  root.style.setProperty('--color-category-pinball', colors.categoryPinball)
  root.style.setProperty('--color-category-platformer', colors.categoryPlatformer)
  root.style.setProperty('--color-category-rpg', colors.categoryRpg)
  root.style.setProperty('--color-category-other', colors.categoryOther)
  root.style.setProperty('--color-medal-gold', colors.medalGold)
  root.style.setProperty('--color-medal-silver', colors.medalSilver)
  root.style.setProperty('--color-medal-bronze', colors.medalBronze)
  
  // Set effect classes
  root.classList.remove('theme-scanlines', 'theme-glow', 'theme-noise')
  if (effects?.scanlines) root.classList.add('theme-scanlines')
  if (effects?.glow) root.classList.add('theme-glow')
  if (effects?.noise) root.classList.add('theme-noise')
  
  // Set theme ID for CSS targeting
  root.setAttribute('data-theme', theme.id)
}

/**
 * Get list of all available themes for UI
 */
export function getThemeList(): { id: string; name: string; description: string }[] {
  return Object.values(themes).map(({ id, name, description }) => ({ id, name, description }))
}
```

## File: src/lib/types.ts
```ts
// ============================================================================
// DATABASE TYPES
// Generated from supabase/schema.sql - Beta Schema
// ============================================================================

// Enums
export type ScoreDirection = 'lower_better' | 'higher_better'

export type ScoreFormat =
  | 'integer'       // 47 (points, throws, eliminations)
  | 'time_ms'       // stored as ms, displayed as 1:23.456
  | 'time_seconds'  // stored as seconds, displayed as 1:23
  | 'decimal_2'     // stored as value * 100, displayed as 98.45
  | 'golf_relative' // stored as integer relative to par (-4, 0, +3), displayed as -4, E, +3
  | 'level'         // stored as encoded digits (84), displayed as World 8-4

export type GameCategory =
  | 'racing'
  | 'golf'
  | 'party'
  | 'darts'
  | 'pinball'
  | 'platformer'
  | 'rpg'
  | 'other'

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Player {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  name: string
  category: GameCategory
  platform: string | null
  icon_url: string | null
  
  // Hierarchy configuration
  mode_label: string        // "Mode", "Class", "Machine", "Category"
  detail_label: string      // "Track", "Course", "Fish", "Enemy"
  has_modes: boolean        // If false, skip mode selection
  has_details: boolean      // If false, skip detail selection
  
  // Default score settings (used when mode/detail don't override)
  default_score_format: ScoreFormat
  default_score_direction: ScoreDirection
  default_score_unit: string | null
  
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameMode {
  id: string
  game_id: string
  name: string
  
  // Override game defaults (null = use game default)
  score_format: ScoreFormat | null
  score_direction: ScoreDirection | null
  score_unit: string | null
  
  // Override detail label for this mode
  detail_label_override: string | null
  
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameDetail {
  id: string
  game_id: string
  mode_id: string | null  // null = available for all modes, UUID = mode-specific
  name: string
  
  // Override mode/game defaults (null = inherit)
  score_format: ScoreFormat | null
  score_direction: ScoreDirection | null
  score_unit: string | null
  
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HighScore {
  id: string
  player_id: string
  game_id: string
  mode_id: string | null
  detail_id: string | null
  score: number
  metadata: Record<string, unknown>
  achieved_at: string
  created_at: string
}

// ============================================================================
// FUNCTION RETURN TYPES
// ============================================================================

// Return type from get_score_settings function
export interface ScoreSettings {
  score_format: ScoreFormat
  score_direction: ScoreDirection
  score_unit: string | null
}

// Return type from get_leaderboard function
export interface LeaderboardEntry {
  rank: number
  score_id: string
  score: number
  achieved_at: string
  player_id: string
  player_name: string
  player_avatar: string | null
  effective_format: ScoreFormat
  effective_direction: ScoreDirection
  effective_unit: string | null
}

// ============================================================================
// COMPOSITE TYPES (for UI convenience)
// ============================================================================

// Game with related data for display
export interface GameWithModes extends Game {
  modes?: GameMode[]
}

// Mode with related data for display
export interface ModeWithDetails extends GameMode {
  details?: GameDetail[]
  game?: Game
}

// Full context for score entry/display
export interface ScoreContext {
  game: Game
  mode: GameMode | null
  detail: GameDetail | null
  effectiveFormat: ScoreFormat
  effectiveDirection: ScoreDirection
  effectiveUnit: string | null
}

// ============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// ============================================================================

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
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: Game
        Insert: {
          id?: string
          name: string
          category: GameCategory
          platform?: string | null
          icon_url?: string | null
          mode_label?: string
          detail_label?: string
          has_modes?: boolean
          has_details?: boolean
          default_score_format?: ScoreFormat
          default_score_direction?: ScoreDirection
          default_score_unit?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: GameCategory
          platform?: string | null
          icon_url?: string | null
          mode_label?: string
          detail_label?: string
          has_modes?: boolean
          has_details?: boolean
          default_score_format?: ScoreFormat
          default_score_direction?: ScoreDirection
          default_score_unit?: string | null
          sort_order?: number
          is_active?: boolean
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
          score_format?: ScoreFormat | null
          score_direction?: ScoreDirection | null
          score_unit?: string | null
          detail_label_override?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          name?: string
          score_format?: ScoreFormat | null
          score_direction?: ScoreDirection | null
          score_unit?: string | null
          detail_label_override?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      game_details: {
        Row: GameDetail
        Insert: {
          id?: string
          game_id: string
          mode_id?: string | null
          name: string
          score_format?: ScoreFormat | null
          score_direction?: ScoreDirection | null
          score_unit?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          mode_id?: string | null
          name?: string
          score_format?: ScoreFormat | null
          score_direction?: ScoreDirection | null
          score_unit?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      high_scores: {
        Row: HighScore
        Insert: {
          id?: string
          player_id: string
          game_id: string
          mode_id?: string | null
          detail_id?: string | null
          score: number
          metadata?: Record<string, unknown>
          achieved_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          game_id?: string
          mode_id?: string | null
          detail_id?: string | null
          score?: number
          metadata?: Record<string, unknown>
          achieved_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_score_settings: {
        Args: {
          p_game_id: string
          p_mode_id?: string | null
          p_detail_id?: string | null
        }
        Returns: ScoreSettings[]
      }
      get_leaderboard: {
        Args: {
          p_game_id: string
          p_mode_id?: string | null
          p_detail_id?: string | null
          p_limit?: number
        }
        Returns: LeaderboardEntry[]
      }
      get_detail_label: {
        Args: {
          p_game_id: string
          p_mode_id?: string | null
        }
        Returns: string
      }
    }
    Enums: {
      score_direction: ScoreDirection
      score_format: ScoreFormat
      game_category: GameCategory
    }
  }
}

// ============================================================================
// CONVENIENCE TYPE EXPORTS
// ============================================================================

export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type PlayerUpdate = Database['public']['Tables']['players']['Update']

export type GameInsert = Database['public']['Tables']['games']['Insert']
export type GameUpdate = Database['public']['Tables']['games']['Update']

export type GameModeInsert = Database['public']['Tables']['game_modes']['Insert']
export type GameModeUpdate = Database['public']['Tables']['game_modes']['Update']

export type GameDetailInsert = Database['public']['Tables']['game_details']['Insert']
export type GameDetailUpdate = Database['public']['Tables']['game_details']['Update']

export type HighScoreInsert = Database['public']['Tables']['high_scores']['Insert']
export type HighScoreUpdate = Database['public']['Tables']['high_scores']['Update']
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

    case 'golf_relative': {
      // Display relative to par: -4, E, +3
      if (value === 0) return 'E'
      if (value > 0) return `+${value}`
      return value.toString()
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
import { useGameDetails } from '@/hooks/useGameDetails'
import { usePlayers } from '@/hooks/usePlayers'
import { useSubmitScore } from '@/hooks/useSubmitScore'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import type { ScoreFormat, ScoreDirection } from '@/lib/types'

type PickerType = 'game' | 'mode' | 'detail' | 'player' | null

/**
 * AddScore - Multi-step score entry form
 * Route: /add-score
 *
 * Supports URL params for pre-population:
 * - ?gameId=xxx - Pre-select a game
 * - ?modeId=xxx - Pre-select a mode (requires gameId)
 * - ?detailId=xxx - Pre-select a detail (requires gameId + modeId)
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
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(
    searchParams.get('detailId')
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
  const { details, loading: detailsLoading } = useGameDetails(selectedGameId, selectedModeId)
  const { players, loading: playersLoading, createPlayer } = usePlayers()
  const { submitScore, submitting, error: submitError } = useSubmitScore()

  // Fetch current leaderboard to calculate rank
  const { entries: currentLeaderboard } = useLeaderboard(
    selectedGameId,
    selectedModeId,
    selectedDetailId,
    100
  )

  // Derived display values
  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) || null,
    [games, selectedGameId]
  )

  const selectedMode = useMemo(
    () => modes.find((m) => m.id === selectedModeId) || null,
    [modes, selectedModeId]
  )

  const selectedDetail = useMemo(
    () => details.find((d) => d.id === selectedDetailId) || null,
    [details, selectedDetailId]
  )

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) || null,
    [players, selectedPlayerId]
  )

  // Does this game use details?
  const gameHasDetails = selectedGame?.has_details ?? false
  
  // Does this game use modes?
  const gameHasModes = selectedGame?.has_modes ?? true

  // Get effective score format/direction (detail → mode → game defaults)
  const effectiveScoreFormat: ScoreFormat = useMemo(() => {
    if (selectedDetail?.score_format) return selectedDetail.score_format
    if (selectedMode?.score_format) return selectedMode.score_format
    if (selectedGame?.default_score_format) return selectedGame.default_score_format
    return 'integer'
  }, [selectedDetail, selectedMode, selectedGame])

  const effectiveScoreDirection: ScoreDirection = useMemo(() => {
    if (selectedDetail?.score_direction) return selectedDetail.score_direction
    if (selectedMode?.score_direction) return selectedMode.score_direction
    if (selectedGame?.default_score_direction) return selectedGame.default_score_direction
    return 'higher_better'
  }, [selectedDetail, selectedMode, selectedGame])

  const effectiveScoreUnit: string | null = useMemo(() => {
    if (selectedDetail?.score_unit) return selectedDetail.score_unit
    if (selectedMode?.score_unit) return selectedMode.score_unit
    if (selectedGame?.default_score_unit) return selectedGame.default_score_unit
    return null
  }, [selectedDetail, selectedMode, selectedGame])

  // Clear dependent fields when game changes
  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId)
    setSelectedModeId(null)
    setSelectedDetailId(null)
    setScoreValue(null)
  }

  // Clear detail and score when mode changes
  const handleModeSelect = (modeId: string) => {
    setSelectedModeId(modeId)
    setSelectedDetailId(null)
    setScoreValue(null)
  }

  // Clear score when detail changes (format may differ)
  const handleDetailSelect = (detailId: string) => {
    setSelectedDetailId(detailId)
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
    if (currentLeaderboard.length === 0) return 1

    const isLowerBetter = effectiveScoreDirection === 'lower_better'
    let rank = 1

    for (const entry of currentLeaderboard) {
      if (isLowerBetter) {
        if (score >= entry.score) rank++
      } else {
        if (score <= entry.score) rank++
      }
    }

    return rank
  }

  // Form validation - detail is optional based on game config
  const isFormComplete = Boolean(
    selectedGameId &&
    (!gameHasModes || selectedModeId) &&
    (!gameHasDetails || selectedDetailId) &&
    selectedPlayerId &&
    scoreValue !== null
  )
  const canSubmit = isFormComplete && !submitting

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedGameId || !selectedPlayerId || scoreValue === null) return

    const result = await submitScore({
      gameId: selectedGameId,
      modeId: selectedModeId,
      detailId: selectedDetailId,
      playerId: selectedPlayerId,
      score: scoreValue,
    })

    if (result.success) {
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

  // Handle back/cancel
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Render appropriate score input based on effective score format
  const renderScoreInput = () => {
    // Need mode selected (or game without modes) before showing score input
    const readyForScore = gameHasModes ? selectedModeId : selectedGameId
    
    if (!readyForScore) {
      return (
        <div className="h-[64px] flex items-center justify-center">
          <p className="text-text-muted">
            Select a {gameHasModes ? selectedGame?.mode_label?.toLowerCase() || 'mode' : 'game'} first
          </p>
        </div>
      )
    }

    switch (effectiveScoreFormat) {
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
            unit={effectiveScoreUnit}
            isDecimal={true}
          />
        )

      case 'golf_relative':
        return (
          <NumericInput
            value={scoreValue}
            onChange={setScoreValue}
            unit={effectiveScoreUnit}
            isDecimal={false}
            allowNegative={true}
          />
        )

      case 'integer':
      case 'level':
      default:
        return (
          <NumericInput
            value={scoreValue}
            onChange={setScoreValue}
            unit={effectiveScoreUnit}
            isDecimal={false}
          />
        )
    }
  }

  // Get input label based on score format
  const getScoreInputLabel = (): string => {
    if (effectiveScoreFormat === 'time_ms' || effectiveScoreFormat === 'time_seconds') {
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
    })),
    [modes]
  )

  const detailOptions = useMemo(() =>
    details.map((d) => ({
      id: d.id,
      label: d.name,
    })),
    [details]
  )

  const playerOptions = useMemo(() =>
    players.map((p) => ({
      id: p.id,
      label: p.name
    })),
    [players]
  )

  // Get labels from game config
  const modeLabel = selectedGame?.mode_label || 'Mode'
  const detailLabel = selectedGame?.detail_label || 'Track'

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

          {/* Mode selector - shown if game has modes */}
          {gameHasModes && (
            <SelectField
              label={modeLabel}
              value={selectedMode?.name || null}
              placeholder={
                !selectedGameId
                  ? 'Select a game first'
                  : modesLoading
                    ? 'Loading...'
                    : `Select ${modeLabel.toLowerCase()}`
              }
              onPress={() => setActivePicker('mode')}
              disabled={!selectedGameId || modesLoading}
            />
          )}

          {/* Detail selector - shown if game has details */}
          {gameHasDetails && (
            <SelectField
              label={detailLabel}
              value={selectedDetail?.name || null}
              placeholder={
                !selectedModeId && gameHasModes
                  ? `Select ${modeLabel.toLowerCase()} first`
                  : !selectedGameId
                    ? 'Select a game first'
                    : detailsLoading
                      ? 'Loading...'
                      : `Select ${detailLabel.toLowerCase()}`
              }
              onPress={() => setActivePicker('detail')}
              disabled={(!selectedModeId && gameHasModes) || !selectedGameId || detailsLoading}
            />
          )}

          {/* Player selector */}
          <SelectField
            label="Player"
            value={selectedPlayer?.name || null}
            placeholder={playersLoading ? 'Loading...' : 'Select a player'}
            onPress={() => setActivePicker('player')}
            disabled={playersLoading}
          />

          {/* Score input */}
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

        {/* Submit button */}
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
        title={`Select ${modeLabel}`}
        options={modeOptions}
        selectedId={selectedModeId}
        onSelect={handleModeSelect}
        emptyMessage={selectedGameId ? `No ${modeLabel.toLowerCase()}s for this game` : 'Select a game first'}
      />

      {/* Detail picker modal */}
      <PickerModal
        isOpen={activePicker === 'detail'}
        onClose={() => setActivePicker(null)}
        title={`Select ${detailLabel}`}
        options={detailOptions}
        selectedId={selectedDetailId}
        onSelect={handleDetailSelect}
        emptyMessage={
          selectedModeId || !gameHasModes
            ? `No ${detailLabel.toLowerCase()}s available`
            : `Select ${modeLabel.toLowerCase()} first`
        }
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

      {/* Celebration overlay */}
      {selectedPlayer && scoreValue !== null && (
        <CelebrationOverlay
          isOpen={showCelebration}
          onClose={handleCelebrationClose}
          playerName={selectedPlayer.name}
          score={scoreValue}
          scoreFormat={effectiveScoreFormat}
          scoreUnit={effectiveScoreUnit}
          rank={submittedRank}
        />
      )}
    </KioskLayout>
  )
}
```

## File: src/pages/CategorySelection.tsx
```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { CategoryButton } from '@/components/cards/CategoryButton'
import { NewPlayerModal } from '@/components/input'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import { usePlayers } from '@/hooks/usePlayers'
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
 * 
 * Responsive:
 * - Desktop/Kiosk: 4 columns × 2 rows
 * - Mobile: 2 columns × 4 rows (scrollable)
 * 
 * Auto-returns to idle display after 30s inactivity
 */
export function CategorySelection() {
  const navigate = useNavigate()
  const { isIdle, resetTimer } = useIdleTimer(30000)
  const { createPlayer } = usePlayers()
  
  // New Player modal state
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false)
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false)

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

  const handleAddPlayer = () => {
    resetTimer()
    setShowNewPlayerModal(true)
  }

  const handleManage = () => {
    resetTimer()
    navigate('/manage')
  }

  const handleCreatePlayer = async (name: string) => {
    setIsCreatingPlayer(true)
    try {
      await createPlayer(name)
      setShowNewPlayerModal(false)
    } finally {
      setIsCreatingPlayer(false)
    }
  }

  return (
    <KioskLayout>
      <div className="h-full flex flex-col min-h-[480px]">
        {/* Header with action sheet */}
        <BrowseHeader
          backLabel="Back"
          onBack={handleBack}
          onAddScore={handleAddScore}
          onAddPlayer={handleAddPlayer}
          onManage={handleManage}
          title="CATEGORIES"
        />

        {/* Category grid - responsive: 4×2 on desktop, 2×4 on mobile */}
        <div className="flex-1 p-md overflow-y-auto">
          <div className="category-grid">
            {CATEGORIES.map((category, index) => (
              <CategoryButton
                key={category}
                category={category}
                onClick={() => handleCategoryClick(category)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Footer hint - hidden on mobile to save space */}
        <div className="footer-height flex items-center justify-center border-t border-background-elevated hide-mobile">
          <p className="text-sm text-text-muted">
            30s idle → returns to auto mode
          </p>
        </div>
      </div>

      {/* New Player Modal */}
      <NewPlayerModal
        isOpen={showNewPlayerModal}
        onClose={() => setShowNewPlayerModal(false)}
        onCreate={handleCreatePlayer}
        isCreating={isCreatingPlayer}
      />
    </KioskLayout>
  )
}
```

## File: src/pages/DetailSelection.tsx
```tsx
// src/pages/DetailSelection.tsx
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { DetailCard } from '@/components/cards/DetailCard'
import { useGameDetails } from '@/hooks/useGameDetails'
import { useGame } from '@/hooks/useGame'
import { useGameMode } from '@/hooks/useGameMode'
import { useIdleTimer } from '@/hooks/useIdleTimer'

/**
 * DetailSelection - List of details (tracks, courses, etc.) for a specific game mode
 * Route: /browse/:category/:gameId/:modeId
 * 
 * If the game has no details (has_details=false), ModeSelection should skip this page
 * and navigate directly to LeaderboardView.
 */
export function DetailSelection() {
  const navigate = useNavigate()
  const { category, gameId, modeId } = useParams<{
    category: string
    gameId: string
    modeId: string
  }>()
  
  const { game: currentGame } = useGame(gameId || null)
  const { mode: currentMode } = useGameMode(modeId || null)
  const { details, loading, error } = useGameDetails(gameId || null, modeId || null)
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  // If game doesn't have details, redirect to leaderboard without detailId
  useEffect(() => {
    if (currentGame && !currentGame.has_details) {
      navigate(`/browse/${category}/${gameId}/${modeId}/all`, { replace: true })
    }
  }, [currentGame, category, gameId, modeId, navigate])

  const handleDetailClick = (detailId: string) => {
    resetTimer()
    navigate(`/browse/${category}/${gameId}/${modeId}/${detailId}`)
  }

  const handleViewAll = () => {
    resetTimer()
    // Navigate to leaderboard with "all" as detailId to show all scores for this mode
    navigate(`/browse/${category}/${gameId}/${modeId}/all`)
  }

  // FIX: Use browser history instead of relying on async data
  const handleBack = () => {
    resetTimer()
    navigate(-1)
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  // Get the label for details from game config
  const detailLabel = currentGame?.detail_label || 'Track'

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel={currentMode?.name || 'Back'}
          onBack={handleBack}
          onAddScore={handleAddScore}
        />

        {/* Mode title */}
        <div className="h-[48px] px-md flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {currentGame?.name} — {currentMode?.name}
            </h2>
            <p className="text-sm text-text-secondary">
              Select {detailLabel.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Details list */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary">Loading {detailLabel.toLowerCase()}s...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-red-500 mb-2">Error loading {detailLabel.toLowerCase()}s</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : details.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-text-secondary">No {detailLabel.toLowerCase()}s configured</p>
              <button
                onClick={handleViewAll}
                className="h-[56px] px-6 bg-category-golf text-white font-semibold rounded-xl"
              >
                View All Scores
              </button>
            </div>
          ) : (
            <>
              {/* View all option at top */}
              <button
                onClick={handleViewAll}
                className="w-full h-[56px] flex items-center justify-center gap-2 bg-background-elevated text-text-secondary font-medium rounded-xl active:bg-background-card mb-2"
              >
                View All {detailLabel}s
              </button>
              
              {/* Individual details */}
              {details.map((detail, index) => (
                <DetailCard
                  key={detail.id}
                  detail={detail}
                  onClick={() => handleDetailClick(detail.id)}
                  index={index}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </KioskLayout>
  )
}
```

## File: src/pages/GameSelection.tsx
```tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { GameCard } from '@/components/cards/GameCard'
import { NewPlayerModal } from '@/components/input'
import { useGames } from '@/hooks/useGames'
import { usePlayers } from '@/hooks/usePlayers'
import { useIdleTimer } from '@/hooks/useIdleTimer'
import type { GameCategory } from '@/lib/types'

/**
 * GameSelection - List of games in a category
 * Route: /browse/:category
 * 
 * Responsive:
 * - Desktop/Kiosk: Fixed height, scrollable list
 * - Mobile: Full height with scrolling
 */
export function GameSelection() {
  const navigate = useNavigate()
  const { category } = useParams<{ category: GameCategory }>()
  const { games, loading, error } = useGames(category)
  const { createPlayer } = usePlayers()
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // New Player modal state
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false)
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false)

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

  const handleAddPlayer = () => {
    resetTimer()
    setShowNewPlayerModal(true)
  }

  const handleManage = () => {
    resetTimer()
    navigate('/manage')
  }

  const handleCreatePlayer = async (name: string) => {
    setIsCreatingPlayer(true)
    try {
      await createPlayer(name)
      setShowNewPlayerModal(false)
    } finally {
      setIsCreatingPlayer(false)
    }
  }

  // Category display name
  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : ''

  return (
    <KioskLayout>
      <div className="h-full min-h-[480px] flex flex-col">
        {/* Header with action sheet */}
        <BrowseHeader
          backLabel="Categories"
          onBack={handleBack}
          onAddScore={handleAddScore}
          onAddPlayer={handleAddPlayer}
          onManage={handleManage}
        />

        {/* Category title */}
        <div className="h-[40px] px-md flex items-center flex-shrink-0">
          <h2 className="text-lg font-bold" style={{ color: getCategoryColor(category) }}>
            {categoryName.toUpperCase()}
          </h2>
        </div>

        {/* Games list */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-text-secondary">Loading games...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
              <p className="text-red-500 mb-2">Error loading games</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : games.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
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

      {/* New Player Modal */}
      <NewPlayerModal
        isOpen={showNewPlayerModal}
        onClose={() => setShowNewPlayerModal(false)}
        onCreate={handleCreatePlayer}
        isCreating={isCreatingPlayer}
      />
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
// src/pages/IdleDisplay.tsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, Trophy, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { KioskLayout } from '@/components/layout'
import { ScoreRow } from '@/components/display'
import { RealtimeScoreAlert } from '@/components/overlays'
import { useCarouselItems } from '@/hooks/useCarouselItems'
import type { CarouselItem } from '@/hooks/useCarouselItems'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useRealtimeScores } from '@/hooks/useRealtimeScores'
import { useScoreDetails } from '@/hooks/useScoreDetails'
import type { RealtimeScoreData } from '@/hooks/useScoreDetails'
import { useKioskStore } from '@/stores/kioskStore'
import { getInitials, getPlayerColor } from '@/lib/utils'
import type { HighScore } from '@/lib/types'

// Declare the global constant injected by Vite at build time
declare const __LOCAL_IP__: string

// Build QR URL using the IP address detected by Vite at startup
const getQrUrl = () => `http://${__LOCAL_IP__}:${window.location.port || '4173'}`

/**
 * Format time in 12-hour format with AM/PM
 */
function formatTime(date: Date): string {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  
  hours = hours % 12
  hours = hours ? hours : 12 // 0 should be 12
  
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes
  
  return `${hours}:${minutesStr} ${ampm}`
}

/**
 * Build the subtitle for a carousel item
 * Shows mode name, and detail name if applicable
 */
function buildSubtitle(item: CarouselItem): string {
  const parts: string[] = []
  
  if (item.mode_name) {
    parts.push(item.mode_name)
  }
  
  if (item.detail_name) {
    parts.push(item.detail_name)
  }
  
  return parts.join(' - ')
}

/**
 * IdleDisplay - Auto-cycling carousel of game leaderboards
 *
 * Features:
 * - Auto-cycles through game/mode/detail combinations with scores every 10 seconds
 * - For games WITH details: shows separate entries per detail (e.g., each golf course)
 * - For games WITHOUT details: shows one entry per mode
 * - Shows top 4 scores per entry
 * - Tap anywhere to navigate to browse mode
 * - Real-time score updates with toast alerts
 * - Smooth slide transitions between entries
 * - Clock display readable from across the room
 * - QR code for easy mobile access (tap to show/hide)
 */
export function IdleDisplay() {
  const navigate = useNavigate()
  const { items, loading: itemsLoading, error: itemsError, refetch } = useCarouselItems()
  const cycleSpeedMs = useKioskStore((state) => state.cycleSpeedMs)

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentItem = items[currentIndex]

  // Clock state - updates every minute
  const [currentTime, setCurrentTime] = useState(new Date())

  // QR code visibility state
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Fetch leaderboard for current carousel item
  // Now includes detail_id for proper filtering
  const { entries: scores, loading: scoresLoading, error: scoresError } = useLeaderboard(
    currentItem?.game_id || null,
    currentItem?.mode_id || null,
    currentItem?.detail_id || null,
    4 // limit - show top 4
  )

  // Realtime alert state
  const [alertData, setAlertData] = useState<RealtimeScoreData | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const { fetchScoreDetails } = useScoreDetails()

  // Handle realtime score events
  const handleNewScore = useCallback(async (newScore: HighScore) => {
    
    // Fetch full details for the alert
    const details = await fetchScoreDetails(newScore.id)
    
    if (details) {
      setAlertData(details)
      setShowAlert(true)
    }

    // Refetch carousel items to include any new game/mode/detail combinations
    // and to ensure the leaderboard reflects the new score
    refetch()
  }, [fetchScoreDetails, refetch])

  useRealtimeScores(handleNewScore)

  // Close alert handler
  const handleCloseAlert = useCallback(() => {
    setShowAlert(false)
    // Clear data after animation completes
    setTimeout(() => setAlertData(null), 300)
  }, [])

  // Auto-cycle through items
  useEffect(() => {
    if (items.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, cycleSpeedMs)

    return () => clearInterval(timer)
  }, [items.length, cycleSpeedMs])

  // Reset index if it's out of bounds after refetch
  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(0)
    }
  }, [items.length, currentIndex])

  // Handle tap to navigate
  const handleTap = () => {
    // Don't navigate if QR is showing - tap hides it instead
    if (showQR) {
      setShowQR(false)
      return
    }
    navigate('/browse')
  }

  // Toggle QR code visibility
  const handleQRToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowQR((prev) => !prev)
  }

  // Navigate to settings
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate('/settings')
  }

  // Get game icon or generate fallback
  const gameInitials = currentItem?.game_name ? getInitials(currentItem.game_name) : ''
  const gameColor = currentItem?.game_name ? getPlayerColor(currentItem.game_name) : '#6b7280'

  // Error state for items loading
  if (itemsError) {
    return (
      <KioskLayout>
        <div className="h-full flex flex-col items-center justify-center">
          <p className="text-xl text-red-500 mb-2">Connection Error</p>
          <p className="text-text-secondary text-sm">{itemsError.message}</p>
        </div>
      </KioskLayout>
    )
  }

  // Loading state
  if (itemsLoading) {
    return (
      <KioskLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-text-muted border-t-text-primary animate-spin" />
            <p className="text-text-secondary">Loading leaderboards...</p>
          </div>
        </div>
      </KioskLayout>
    )
  }

  // Empty state - no items with scores
  if (items.length === 0) {
    return (
      <KioskLayout>
        <div
          className="h-full flex flex-col items-center justify-center cursor-pointer"
          onClick={handleTap}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Trophy className="w-16 h-16 text-medals-gold mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-xl text-text-primary mb-2">No scores yet!</p>
            <p className="text-text-secondary mb-6">Be the first to set a record</p>
            <p className="text-sm text-text-muted">Tap to browse games or add score</p>
          </motion.div>
        </div>
      </KioskLayout>
    )
  }

  return (
    <KioskLayout>
      <div
        className="h-full flex flex-col cursor-pointer relative"
        onClick={handleTap}
      >
        {/* Header: Game + Mode/Detail info + Clock */}
        <div className="idle-header">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem?.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3">
                {currentItem?.game_icon ? (
                  <img
                    src={currentItem.game_icon}
                    alt=""
                    className="w-10 h-10 rounded-lg shadow-card"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold text-white shadow-card"
                    style={{ backgroundColor: gameColor }}
                  >
                    {gameInitials}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-text-primary">
                    {currentItem?.game_name}
                  </h1>
                  <p className="text-sm text-text-secondary">
                    {buildSubtitle(currentItem)}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Clock - ENLARGED for readability from across the room */}
          <div className="font-mono font-bold text-text-secondary" style={{ fontSize: '48px' }}>
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Leaderboard: Score rows */}
        <div className="flex-1 flex flex-col justify-center px-md py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem?.key}
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
                <div className="flex flex-col items-center justify-center h-[288px]">
                  <Trophy className="w-12 h-12 text-text-muted mb-3" strokeWidth={1.5} />
                  <p className="text-text-secondary">No scores for this leaderboard</p>
                  <p className="text-sm text-text-muted mt-1">Tap to add the first score!</p>
                </div>
              ) : (
                scores.map((entry, index) => (
                  <motion.div
                    key={entry.score_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ScoreRow
                      rank={entry.rank}
                      playerName={entry.player_name || 'Unknown'}
                      playerAvatar={entry.player_avatar}
                      score={entry.score}
                      scoreFormat={entry.effective_format}
                      scoreUnit={entry.effective_unit || undefined}
                      className="card"
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: Settings + Tap hint + QR toggle */}
        <div className="h-[40px] px-md flex items-center justify-between border-t border-background-elevated/50">
          {/* Settings button */}
          <button
            onClick={handleSettingsClick}
            className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          {/* Tap hint */}
          <p className="text-sm text-text-muted">Tap to browse</p>

          {/* QR code toggle */}
          <button
            onClick={handleQRToggle}
            className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary transition-colors"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel indicator dots */}
        {items.length > 1 && (
          <div className="absolute bottom-[48px] left-0 right-0 flex justify-center gap-1.5">
            {items.map((item, index) => (
              <div
                key={item.key}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-text-primary w-3'
                    : 'bg-text-muted'
                }`}
              />
            ))}
          </div>
        )}

        {/* QR Code overlay */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center"
              onClick={() => setShowQR(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white p-6 rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <QRCodeSVG
                  value={getQrUrl()}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
                <p className="text-center text-black text-sm mt-4 font-medium">
                  Scan to access on your phone
                </p>
                <p className="text-center text-gray-500 text-xs mt-1">
                  {getQrUrl()}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Realtime score alert */}
      {alertData && (
        <RealtimeScoreAlert
          isOpen={showAlert}
          onClose={handleCloseAlert}
          playerName={alertData.playerName}
          score={alertData.score}
          scoreFormat={alertData.scoreFormat}
          scoreUnit={alertData.scoreUnit ?? ''}
          gameName={alertData.gameName}
          modeName={alertData.modeName ?? ''}
          detailName={alertData.detailName ?? ''}
          rank={alertData.rank}
        />
      )}
    </KioskLayout>
  )
}
```

## File: src/pages/index.ts
```ts
// src/pages/index.ts
// Page components (routes)
// Export pages from this directory for easy imports

export { IdleDisplay } from './IdleDisplay'
export { CategorySelection } from './CategorySelection'
export { GameSelection } from './GameSelection'
export { ModeSelection } from './ModeSelection'
export { DetailSelection } from './DetailSelection'
export { LeaderboardView } from './LeaderboardView'
export { AddScore } from './AddScore'
export { Settings } from './Settings'
export { Manage } from './Manage'
```

## File: src/pages/LeaderboardView.tsx
```tsx
// src/pages/LeaderboardView.tsx
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { ScoreRow } from '@/components/display/ScoreRow'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGame } from '@/hooks/useGame'
import { useGameMode } from '@/hooks/useGameMode'
import { useIdleTimer } from '@/hooks/useIdleTimer'

/**
 * LeaderboardView - Full leaderboard for a specific game/mode/detail combination
 * Route: /browse/:category/:gameId/:modeId/:detailId
 * 
 * detailId can be:
 * - A valid UUID: show scores for that specific detail
 * - "all": show all scores for the mode (no detail filter)
 */
export function LeaderboardView() {
  const navigate = useNavigate()
  const { gameId, modeId, detailId } = useParams<{
    category: string
    gameId: string
    modeId: string
    detailId: string
  }>()
  
  // Determine if we're filtering by detail or showing all
  const effectiveDetailId = detailId === 'all' ? null : (detailId || null)
  
  // Updated useLeaderboard call with new signature: (gameId, modeId, detailId, limit)
  const { entries: scores, loading, error } = useLeaderboard(
    gameId || null,
    modeId || null,
    effectiveDetailId,
    10 // limit
  )
  
  const { game: currentGame } = useGame(gameId || null)
  const { mode: currentMode } = useGameMode(modeId || null)
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  // FIX: Use browser history instead of relying on async data that may not be loaded
  const handleBack = () => {
    resetTimer()
    navigate(-1)
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  // Build title based on what's selected
  const buildTitle = () => {
    if (!currentMode) return 'Leaderboard'
    return currentMode.name
  }

  // Build back label - use mode name or game name, fallback to "Back"
  const buildBackLabel = () => {
    if (currentMode?.name) return currentMode.name
    if (currentGame?.name) return currentGame.name
    return 'Back'
  }

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <BrowseHeader
          backLabel={buildBackLabel()}
          onBack={handleBack}
          onAddScore={handleAddScore}
        />

        {/* Mode/Detail title */}
        <div className="h-[56px] px-md flex flex-col justify-center">
          <h2 className="text-lg font-bold text-text-primary">
            {buildTitle()}
          </h2>
          {detailId && detailId !== 'all' && (
            <p className="text-sm text-text-secondary">
              {/* Detail name would need to be fetched - for now show generic */}
              Filtered view
            </p>
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
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-3"
            >
              <Trophy className="w-12 h-12 text-text-muted" />
              <p className="text-text-secondary">No scores yet</p>
              <button
                onClick={handleAddScore}
                className="btn-primary h-[48px] text-category-golf"
              >
                Be the first!
              </button>
            </motion.div>
          ) : (
            scores.map((entry, index) => (
              <motion.div
                key={entry.score_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <ScoreRow
                  rank={entry.rank}
                  playerName={entry.player_name || 'Unknown'}
                  playerAvatar={entry.player_avatar}
                  score={entry.score}
                  scoreFormat={entry.effective_format}
                  scoreUnit={entry.effective_unit || undefined}
                  className="card"
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </KioskLayout>
  )
}
```

## File: src/pages/Manage.tsx
```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Users, 
  Gamepad2, 
  Trophy,
  Layers,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  X
} from 'lucide-react'
import { KioskLayout } from '@/components/layout'
import { ConfirmDialog, PinModal } from '@/components/management'
import { PlayerAvatar } from '@/components/display'
import { useManagePlayers } from '@/hooks/useManagePlayers'
import { useManageGames } from '@/hooks/useManageGames'
import { useManageGameModes } from '@/hooks/useManageGameModes'
import { useManageGameDetails } from '@/hooks/useManageGameDetails'
import { useManageScores, type ScoreWithDetails } from '@/hooks/useManageScores'
import { useKioskStore } from '@/stores/kioskStore'
import { formatScore } from '@/lib/utils'
import { AvatarUpload } from '@/components/input'
import type { Player, Game, GameMode, GameDetail, GameCategory, ScoreDirection, ScoreFormat } from '@/lib/types'
import { BulkImportModal } from '@/components/management'

type Tab = 'players' | 'games' | 'details' | 'scores'

// Category options for game form
const CATEGORIES: { value: GameCategory; label: string }[] = [
  { value: 'racing', label: 'Racing' },
  { value: 'golf', label: 'Golf' },
  { value: 'party', label: 'Party' },
  { value: 'darts', label: 'Darts' },
  { value: 'pinball', label: 'Pinball' },
  { value: 'platformer', label: 'Platformer' },
  { value: 'rpg', label: 'RPG' },
  { value: 'other', label: 'Other' },
]

const SCORE_FORMATS: { value: ScoreFormat; label: string }[] = [
  { value: 'integer', label: 'Number (47 pts)' },
  { value: 'time_ms', label: 'Time (2:22.567)' },
  { value: 'time_seconds', label: 'Time (2:22)' },
  { value: 'decimal_2', label: 'Decimal (98.45%)' },
  { value: 'golf_relative', label: 'Golf (+3, E, -2)' },
  { value: 'level', label: 'Level (8-4)' },
]

const SCORE_DIRECTIONS: { value: ScoreDirection; label: string }[] = [
  { value: 'lower_better', label: 'Lower is better' },
  { value: 'higher_better', label: 'Higher is better' },
]

/**
 * Manage - Hub for managing players, games, modes, details, and scores
 * Uses tabs to navigate between sections
 */
export function Manage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('players')
  
  // Players state
  const { players, loading: playersLoading, fetchPlayers, createPlayer, updatePlayer, deletePlayer } = useManagePlayers()
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [playerAvatarUrl, setPlayerAvatarUrl] = useState<string | null>(null)
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null)

  // Games state
  const { games, loading: gamesLoading, fetchGames, createGame, updateGame, deleteGame } = useManageGames()
  const { modes, loading: modesLoading, fetchModes, createMode, updateMode, deleteMode, clearModes } = useManageGameModes()
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [showGameForm, setShowGameForm] = useState(false)
  const [gameName, setGameName] = useState('')
  const [gamePlatform, setGamePlatform] = useState('')
  const [gameCategory, setGameCategory] = useState<GameCategory>('other')
  const [deletingGame, setDeletingGame] = useState<Game | null>(null)

  // Modes state
  const [editingMode, setEditingMode] = useState<GameMode | null>(null)
  const [showModeForm, setShowModeForm] = useState(false)
  const [modeName, setModeName] = useState('')
  const [modeFormat, setModeFormat] = useState<ScoreFormat>('integer')
  const [modeDirection, setModeDirection] = useState<ScoreDirection>('higher_better')
  const [modeUnit, setModeUnit] = useState('')
  const [deletingMode, setDeletingMode] = useState<GameMode | null>(null)

  // Details state
  const { details, loading: detailsLoading, fetchDetails, createDetail, updateDetail, deleteDetail, clearDetails } = useManageGameDetails()
  const [detailsGameId, setDetailsGameId] = useState<string | null>(null)
  const [detailsModeId, setDetailsModeId] = useState<string | null>(null)
  const [editingDetail, setEditingDetail] = useState<GameDetail | null>(null)
  const [showDetailForm, setShowDetailForm] = useState(false)
  const [detailName, setDetailName] = useState('')
  const [detailModeScope, setDetailModeScope] = useState<string | null>(null) // null = all modes, UUID = specific mode
  const [detailOverrideScore, setDetailOverrideScore] = useState(false)
  const [detailFormat, setDetailFormat] = useState<ScoreFormat>('integer')
  const [detailDirection, setDetailDirection] = useState<ScoreDirection>('higher_better')
  const [detailUnit, setDetailUnit] = useState('')
  const [deletingDetail, setDeletingDetail] = useState<GameDetail | null>(null)

// Scores state
  const { scores, loading: scoresLoading, fetchScores, deleteScore } = useManageScores()
  const [deletingScore, setDeletingScore] = useState<ScoreWithDetails | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)

  // PIN state
  const { adminPin, setAdminPin, verifyPin } = useKioskStore()
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinMode, setPinMode] = useState<'verify' | 'setup'>('verify')
  const [pinError, setPinError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  // Fetch data on tab change
  useEffect(() => {
    if (activeTab === 'players') {
      fetchPlayers()
    } else if (activeTab === 'games') {
      fetchGames()
    } else if (activeTab === 'details') {
      fetchGames() // Need games list for selector
    } else if (activeTab === 'scores') {
      fetchScores()
    }
  }, [activeTab, fetchPlayers, fetchGames, fetchScores])

  // Fetch modes when game is selected (for games tab)
  useEffect(() => {
    if (selectedGame) {
      fetchModes(selectedGame.id)
    } else {
      clearModes()
    }
  }, [selectedGame, fetchModes, clearModes])

  // Fetch details when game/mode selected (for details tab)
  useEffect(() => {
    if (detailsGameId) {
      fetchDetails(detailsGameId, detailsModeId)
      // Also fetch modes for the mode filter dropdown
      fetchModes(detailsGameId)
    } else {
      clearDetails()
    }
  }, [detailsGameId, detailsModeId, fetchDetails, fetchModes, clearDetails])

  // ============================================================================
  // PIN HELPERS
  // ============================================================================

  const requirePin = (action: () => void) => {
    if (adminPin === null) {
      setPendingAction(() => action)
      setPinMode('setup')
      setShowPinModal(true)
    } else {
      setPendingAction(() => action)
      setPinMode('verify')
      setShowPinModal(true)
    }
  }

  const handlePinSubmit = (pin: string) => {
    if (pinMode === 'setup') {
      setAdminPin(pin)
      setShowPinModal(false)
      setPinError(null)
      if (pendingAction) {
        pendingAction()
        setPendingAction(null)
      }
    } else {
      if (verifyPin(pin)) {
        setShowPinModal(false)
        setPinError(null)
        if (pendingAction) {
          pendingAction()
          setPendingAction(null)
        }
      } else {
        setPinError('Incorrect PIN')
      }
    }
  }

  const handlePinClose = () => {
    setShowPinModal(false)
    setPinError(null)
    setPendingAction(null)
  }

  // ============================================================================
  // PLAYER HANDLERS
  // ============================================================================

  const handleAddPlayer = () => {
    setEditingPlayer(null)
    setPlayerName('')
    setShowPlayerForm(true)
  }

  const handleEditPlayer = (player: Player) => {
  setEditingPlayer(player)
  setPlayerName(player.name)
  setPlayerAvatarUrl(player.avatar_url)
  setShowPlayerForm(true)
}
  
  const handleSavePlayer = async () => {
    if (!playerName.trim()) return
    
    if (editingPlayer) {
      await updatePlayer(editingPlayer.id, playerName.trim(), playerAvatarUrl)
    } else {
      await createPlayer(playerName.trim(), playerAvatarUrl)
    }
    setShowPlayerForm(false)
    setPlayerName('')
    setPlayerAvatarUrl(null)
    setEditingPlayer(null)
}
   
  const handleConfirmDeletePlayer = () => {
    if (!deletingPlayer) return
    requirePin(async () => {
      await deletePlayer(deletingPlayer.id)
      setDeletingPlayer(null)
    })
  }

  // ============================================================================
  // GAME HANDLERS
  // ============================================================================

  const handleAddGame = () => {
    setEditingGame(null)
    setGameName('')
    setGamePlatform('')
    setGameCategory('other')
    setShowGameForm(true)
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setGameName(game.name)
    setGamePlatform(game.platform || '')
    setGameCategory(game.category)
    setShowGameForm(true)
  }

  const handleSaveGame = async () => {
    if (!gameName.trim()) return
    
    if (editingGame) {
      await updateGame(editingGame.id, {
        name: gameName.trim(),
        platform: gamePlatform.trim() || null,
        category: gameCategory,
      })
    } else {
      await createGame(gameName.trim(), gameCategory, {
        platform: gamePlatform.trim() || null,
      })
    }
    setShowGameForm(false)
    setGameName('')
    setGamePlatform('')
    setEditingGame(null)
  }

  const handleConfirmDeleteGame = () => {
    if (!deletingGame) return
    const gameToDelete = deletingGame
    requirePin(async () => {
      await deleteGame(gameToDelete.id)
      setDeletingGame(null)
      if (selectedGame?.id === gameToDelete.id) {
        setSelectedGame(null)
      }
    })
  }

  // ============================================================================
  // MODE HANDLERS
  // ============================================================================

  const handleAddMode = () => {
    setEditingMode(null)
    setModeName('')
    setModeFormat('integer')
    setModeDirection('higher_better')
    setModeUnit('')
    setShowModeForm(true)
  }

  const handleEditMode = (mode: GameMode) => {
    setEditingMode(mode)
    setModeName(mode.name)
    setModeFormat(mode.score_format ?? 'integer')
    setModeDirection(mode.score_direction ?? 'higher_better')
    setModeUnit(mode.score_unit || '')
    setShowModeForm(true)
  }

  const handleSaveMode = async () => {
    if (!modeName.trim() || !selectedGame) return
    
    if (editingMode) {
      await updateMode(editingMode.id, {
        name: modeName.trim(),
        score_format: modeFormat,
        score_direction: modeDirection,
        score_unit: modeUnit.trim() || null,
      })
    } else {
      await createMode(
        selectedGame.id,
        modeName.trim(),
        modeFormat,
        modeDirection,
        modeUnit.trim() || null,
        null
      )
    }
    setShowModeForm(false)
    setModeName('')
    setEditingMode(null)
  }

  const handleConfirmDeleteMode = () => {
    if (!deletingMode) return
    const modeToDelete = deletingMode
    requirePin(async () => {
      await deleteMode(modeToDelete.id)
      setDeletingMode(null)
    })
  }

  // ============================================================================
  // DETAIL HANDLERS
  // ============================================================================

  const handleAddDetail = () => {
    setEditingDetail(null)
    setDetailName('')
    setDetailModeScope(null)
    setDetailOverrideScore(false)
    setDetailFormat('integer')
    setDetailDirection('higher_better')
    setDetailUnit('')
    setShowDetailForm(true)
  }

  const handleEditDetail = (detail: GameDetail) => {
    setEditingDetail(detail)
    setDetailName(detail.name)
    setDetailModeScope(detail.mode_id)
    setDetailOverrideScore(!!(detail.score_format || detail.score_direction || detail.score_unit))
    setDetailFormat(detail.score_format ?? 'integer')
    setDetailDirection(detail.score_direction ?? 'higher_better')
    setDetailUnit(detail.score_unit || '')
    setShowDetailForm(true)
  }

  const handleSaveDetail = async () => {
    if (!detailName.trim() || !detailsGameId) return
    
    if (editingDetail) {
      await updateDetail(editingDetail.id, {
        name: detailName.trim(),
        mode_id: detailModeScope,
        score_format: detailOverrideScore ? detailFormat : null,
        score_direction: detailOverrideScore ? detailDirection : null,
        score_unit: detailOverrideScore ? (detailUnit.trim() || null) : null,
      })
    } else {
      await createDetail(
        detailsGameId,
        detailName.trim(),
        detailModeScope,
        detailOverrideScore ? detailFormat : null,
        detailOverrideScore ? detailDirection : null,
        detailOverrideScore ? (detailUnit.trim() || null) : null
      )
    }
    setShowDetailForm(false)
    setDetailName('')
    setEditingDetail(null)
  }

  const handleConfirmDeleteDetail = () => {
    if (!deletingDetail) return
    const detailToDelete = deletingDetail
    requirePin(async () => {
      await deleteDetail(detailToDelete.id)
      setDeletingDetail(null)
    })
  }

  // ============================================================================
  // SCORE HANDLERS
  // ============================================================================

  const handleConfirmDeleteScore = () => {
    if (!deletingScore) return
    const scoreToDelete = deletingScore
    requirePin(async () => {
      await deleteScore(scoreToDelete.id)
      setDeletingScore(null)
    })
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getSelectedDetailsGame = () => games.find(g => g.id === detailsGameId) || null

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="shrink-0 h-[64px] flex items-center px-md border-b border-white/10">
          <button
            onClick={() => navigate('/')}
            className="w-12 h-12 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-text-primary ml-2">Manage</h1>
        </div>

        {/* Tabs */}
        <div className="shrink-0 flex border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 min-w-[80px] h-[56px] flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'players' 
                ? 'text-category-golf border-b-2 border-category-golf' 
                : 'text-text-muted'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="hidden sm:inline">Players</span>
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex-1 min-w-[80px] h-[56px] flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'games' 
                ? 'text-category-darts border-b-2 border-category-darts' 
                : 'text-text-muted'
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="hidden sm:inline">Games</span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 min-w-[80px] h-[56px] flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'details' 
                ? 'text-category-racing border-b-2 border-category-racing' 
                : 'text-text-muted'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="hidden sm:inline">Details</span>
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex-1 min-w-[80px] h-[56px] flex items-center justify-center gap-2 font-medium transition-colors ${
              activeTab === 'scores' 
                ? 'text-category-party border-b-2 border-category-party' 
                : 'text-text-muted'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="hidden sm:inline">Scores</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Players Tab */}
            {activeTab === 'players' && (
              <motion.div
                key="players"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                <div className="px-md py-3">
                  <button
                    onClick={handleAddPlayer}
                    className="w-full h-[56px] flex items-center justify-center gap-2 bg-category-golf/20 text-category-golf font-medium rounded-xl active:bg-category-golf/30"
                  >
                    <Plus className="w-5 h-5" />
                    Add Player
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                  {playersLoading ? (
                    <p className="text-center text-text-muted py-8">Loading...</p>
                  ) : players.length === 0 ? (
                    <p className="text-center text-text-muted py-8">No players yet</p>
                  ) : (
                    players.map((player) => (
                      <div
                        key={player.id}
                        className="card px-md py-3 flex items-center gap-3"
                      >
                        <PlayerAvatar 
                          name={player.name} 
                          avatarUrl={player.avatar_url} 
                          size={32} 
                        />
                        <span className="flex-1 font-medium text-text-primary truncate">
                          {player.name}
                        </span>
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg active:bg-background-elevated"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingPlayer(player)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <motion.div
                key="games"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex"
              >
                {/* Game list */}
                <div className="w-1/2 h-full flex flex-col border-r border-white/10">
                  <div className="px-md py-3">
                    <button
                      onClick={handleAddGame}
                      className="w-full h-[56px] flex items-center justify-center gap-2 bg-category-darts/20 text-category-darts font-medium rounded-xl active:bg-category-darts/30"
                    >
                      <Plus className="w-5 h-5" />
                      Add Game
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                    {gamesLoading ? (
                      <p className="text-center text-text-muted py-8">Loading...</p>
                    ) : games.length === 0 ? (
                      <p className="text-center text-text-muted py-8">No games yet</p>
                    ) : (
                      games.map((game) => (
                        <div
                          key={game.id}
                          onClick={() => setSelectedGame(game)}
                          className={`card px-md py-3 flex items-center gap-3 cursor-pointer ${
                            selectedGame?.id === game.id ? 'ring-2 ring-category-darts' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">{game.name}</p>
                            <p className="text-xs text-text-muted">{game.platform || 'No platform'}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditGame(game) }}
                            className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg active:bg-background-elevated"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingGame(game) }}
                            className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-text-muted" />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mode list */}
                {selectedGame ? (
                  <div className="w-1/2 h-full flex flex-col">
                    <div className="px-md py-3 flex items-center justify-between">
                      <p className="text-sm text-text-muted">{selectedGame.name} — Modes</p>
                      <button
                        onClick={handleAddMode}
                        className="h-10 px-4 flex items-center justify-center gap-1 bg-category-party/20 text-category-party text-sm font-medium rounded-lg active:bg-category-party/30"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                      {modesLoading ? (
                        <p className="text-center text-text-muted py-8">Loading...</p>
                      ) : modes.length === 0 ? (
                        <p className="text-center text-text-muted py-8">No modes yet</p>
                      ) : (
                        modes.map((mode) => (
                          <div
                            key={mode.id}
                            className="card px-md py-3 flex items-center gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text-primary truncate">{mode.name}</p>
                              <p className="text-xs text-text-muted">
                                {SCORE_FORMATS.find(f => f.value === mode.score_format)?.label ?? 'Inherits from game'}
                                {mode.score_unit && ` (${mode.score_unit})`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleEditMode(mode)}
                              className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg active:bg-background-elevated"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingMode(mode)}
                              className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-1/2 h-full flex items-center justify-center">
                    <p className="text-text-muted">Select a game to manage modes</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                {/* Game and Mode selectors */}
                <div className="px-md py-3 space-y-2">
                  <select
                    value={detailsGameId || ''}
                    onChange={(e) => {
                      setDetailsGameId(e.target.value || null)
                      setDetailsModeId(null)
                    }}
                    className="w-full h-[48px] px-md bg-background-elevated text-text-primary rounded-lg outline-none"
                  >
                    <option value="">Select a game</option>
                    {games.map(game => (
                      <option key={game.id} value={game.id}>{game.name}</option>
                    ))}
                  </select>

                  {detailsGameId && modes.length > 0 && (
                    <select
                      value={detailsModeId || ''}
                      onChange={(e) => setDetailsModeId(e.target.value || null)}
                      className="w-full h-[48px] px-md bg-background-elevated text-text-primary rounded-lg outline-none"
                    >
                      <option value="">All modes</option>
                      {modes.map(mode => (
                        <option key={mode.id} value={mode.id}>{mode.name}</option>
                      ))}
                    </select>
                  )}

                  {detailsGameId && (
                    <button
                      onClick={handleAddDetail}
                      className="w-full h-[48px] flex items-center justify-center gap-2 bg-category-racing/20 text-category-racing font-medium rounded-xl active:bg-category-racing/30"
                    >
                      <Plus className="w-5 h-5" />
                      Add {getSelectedDetailsGame()?.detail_label || 'Detail'}
                    </button>
                  )}
                </div>

                {/* Details list */}
                <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                  {!detailsGameId ? (
                    <p className="text-center text-text-muted py-8">Select a game to manage details</p>
                  ) : detailsLoading ? (
                    <p className="text-center text-text-muted py-8">Loading...</p>
                  ) : details.length === 0 ? (
                    <p className="text-center text-text-muted py-8">
                      No {getSelectedDetailsGame()?.detail_label?.toLowerCase() || 'detail'}s yet
                    </p>
                  ) : (
                    details.map((detail) => (
                      <div
                        key={detail.id}
                        className="card px-md py-3 flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">{detail.name}</p>
                          <p className="text-xs text-text-muted">
                            {detail.mode_id 
                              ? `${modes.find(m => m.id === detail.mode_id)?.name || 'Specific mode'} only`
                              : 'All modes'
                            }
                            {detail.score_format && ` • ${SCORE_FORMATS.find(f => f.value === detail.score_format)?.label}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditDetail(detail)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-text-primary rounded-lg active:bg-background-elevated"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingDetail(detail)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Scores Tab */}
            {activeTab === 'scores' && (
              <motion.div
                key="scores"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                
              <div className="px-md py-3 flex items-center justify-between">
                  <p className="text-sm text-text-muted">Recent scores — tap to delete</p>
                  <button
                    onClick={() => setShowBulkImport(true)}
                    className="text-sm text-category-golf font-medium active:opacity-70"
                  >
                    Bulk Import
                  </button>
                </div>  

                <div className="flex-1 overflow-y-auto px-md pb-4 space-y-2">
                  {scoresLoading ? (
                    <p className="text-center text-text-muted py-8">Loading...</p>
                  ) : scores.length === 0 ? (
                    <p className="text-center text-text-muted py-8">No scores yet</p>
                  ) : (
                    scores.map((score) => (
                      <div
                        key={score.id}
                        className="card px-md py-3 flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">
                            {score.player_name || 'Unknown'} — {formatScore(score.score, score.score_format, score.score_unit)}
                          </p>
                          <p className="text-xs text-text-muted truncate">
                            {score.game_name}
                            {score.mode_name && ` • ${score.mode_name}`}
                            {score.detail_name && ` • ${score.detail_name}`}
                          </p>
                        </div>
                        <button
                          onClick={() => setDeletingScore(score)}
                          className="w-10 h-10 flex items-center justify-center text-text-muted active:text-red-500 rounded-lg active:bg-background-elevated"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Player Form Modal */}
      {/* Player Form Modal */}
      <AnimatePresence>
        {showPlayerForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md"
            onClick={() => { setShowPlayerForm(false); setPlayerAvatarUrl(null) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-background-card rounded-xl p-lg"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingPlayer ? 'Edit Player' : 'Add Player'}
                </h2>
                <button
                  onClick={() => { setShowPlayerForm(false); setPlayerAvatarUrl(null) }}
                  className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Avatar upload */}
              <div className="flex justify-center mb-4">
                <AvatarUpload
                  currentUrl={playerAvatarUrl}
                  playerName={playerName || 'New Player'}
                  onChange={setPlayerAvatarUrl}
                  playerId={editingPlayer?.id}
                />
              </div>

              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Player name"
                autoFocus
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-4 outline-none focus:ring-2 focus:ring-category-golf"
              />
              <button
                onClick={handleSavePlayer}
                disabled={!playerName.trim()}
                className="w-full h-[56px] bg-category-golf text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {editingPlayer ? 'Save Changes' : 'Add Player'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Form Modal */}
      <AnimatePresence>
        {showGameForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md"
            onClick={() => setShowGameForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-background-card rounded-xl p-lg"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingGame ? 'Edit Game' : 'Add Game'}
                </h2>
                <button
                  onClick={() => setShowGameForm(false)}
                  className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Game name"
                autoFocus
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-darts"
              />
              <input
                type="text"
                value={gamePlatform}
                onChange={(e) => setGamePlatform(e.target.value)}
                placeholder="Platform (optional)"
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-darts"
              />
              <select
                value={gameCategory}
                onChange={(e) => setGameCategory(e.target.value as GameCategory)}
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-4 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <button
                onClick={handleSaveGame}
                disabled={!gameName.trim()}
                className="w-full h-[56px] bg-category-darts text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {editingGame ? 'Save Changes' : 'Add Game'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Form Modal */}
      <AnimatePresence>
        {showModeForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-md overflow-y-auto"
            onClick={() => setShowModeForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-background-card rounded-xl p-lg my-4"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingMode ? 'Edit Mode' : 'Add Mode'}
                </h2>
                <button
                  onClick={() => setShowModeForm(false)}
                  className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={modeName}
                onChange={(e) => setModeName(e.target.value)}
                placeholder="Mode name (e.g. Rainbow Road)"
                autoFocus
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-party"
              />
              <select
                value={modeFormat}
                onChange={(e) => setModeFormat(e.target.value as ScoreFormat)}
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
              >
                {SCORE_FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <select
                value={modeDirection}
                onChange={(e) => setModeDirection(e.target.value as ScoreDirection)}
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
              >
                {SCORE_DIRECTIONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={modeUnit}
                onChange={(e) => setModeUnit(e.target.value)}
                placeholder="Unit (e.g. pts, throws, %)"
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-4 outline-none focus:ring-2 focus:ring-category-party"
              />
              <button
                onClick={handleSaveMode}
                disabled={!modeName.trim()}
                className="w-full h-[56px] bg-category-party text-black font-semibold rounded-lg disabled:opacity-50"
              >
                {editingMode ? 'Save Changes' : 'Add Mode'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Form Modal */}
      <AnimatePresence>
        {showDetailForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-md overflow-y-auto"
            onClick={() => setShowDetailForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] bg-background-card rounded-xl p-lg my-4"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                  {editingDetail ? 'Edit' : 'Add'} {getSelectedDetailsGame()?.detail_label || 'Detail'}
                </h2>
                <button
                  onClick={() => setShowDetailForm(false)}
                  className="w-8 h-8 flex items-center justify-center text-text-muted rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <input
                type="text"
                value={detailName}
                onChange={(e) => setDetailName(e.target.value)}
                placeholder={`${getSelectedDetailsGame()?.detail_label || 'Detail'} name`}
                autoFocus
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-racing"
              />

              <label className="block text-sm text-text-secondary mb-2">Available for</label>
              <select
                value={detailModeScope || ''}
                onChange={(e) => setDetailModeScope(e.target.value || null)}
                className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
              >
                <option value="">All modes in this game</option>
                {modes.map(mode => (
                  <option key={mode.id} value={mode.id}>{mode.name} only</option>
                ))}
              </select>

              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={detailOverrideScore}
                  onChange={(e) => setDetailOverrideScore(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span className="text-text-primary">Override score settings</span>
              </label>

              {detailOverrideScore && (
                <>
                  <select
                    value={detailFormat}
                    onChange={(e) => setDetailFormat(e.target.value as ScoreFormat)}
                    className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
                  >
                    {SCORE_FORMATS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <select
                    value={detailDirection}
                    onChange={(e) => setDetailDirection(e.target.value as ScoreDirection)}
                    className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none"
                  >
                    {SCORE_DIRECTIONS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={detailUnit}
                    onChange={(e) => setDetailUnit(e.target.value)}
                    placeholder="Unit (e.g. pts, throws, %)"
                    className="w-full h-[56px] px-md bg-background-elevated text-text-primary rounded-lg mb-3 outline-none focus:ring-2 focus:ring-category-racing"
                  />
                </>
              )}

              <button
                onClick={handleSaveDetail}
                disabled={!detailName.trim()}
                className="w-full h-[56px] bg-category-racing text-white font-semibold rounded-lg disabled:opacity-50 mt-2"
              >
                {editingDetail ? 'Save Changes' : 'Add'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmations */}
      <ConfirmDialog
        isOpen={!!deletingPlayer}
        onClose={() => setDeletingPlayer(null)}
        onConfirm={handleConfirmDeletePlayer}
        title="Delete Player?"
        message={`This will permanently delete "${deletingPlayer?.name}" and all their scores. This cannot be undone.`}
      />

      <ConfirmDialog
        isOpen={!!deletingGame}
        onClose={() => setDeletingGame(null)}
        onConfirm={handleConfirmDeleteGame}
        title="Delete Game?"
        message={`This will hide "${deletingGame?.name}" and all its modes. Existing scores will be preserved.`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={!!deletingMode}
        onClose={() => setDeletingMode(null)}
        onConfirm={handleConfirmDeleteMode}
        title="Delete Mode?"
        message={`This will hide "${deletingMode?.name}". Existing scores will be preserved.`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={!!deletingDetail}
        onClose={() => setDeletingDetail(null)}
        onConfirm={handleConfirmDeleteDetail}
        title="Delete Detail?"
        message={`This will hide "${deletingDetail?.name}". Existing scores will be preserved.`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={!!deletingScore}
        onClose={() => setDeletingScore(null)}
        onConfirm={handleConfirmDeleteScore}
        title="Delete Score?"
        message={`Delete ${deletingScore?.player_name}'s score of ${deletingScore ? formatScore(deletingScore.score, deletingScore.score_format, deletingScore.score_unit) : ''}?`}
        confirmLabel="Delete"
      />

      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={handlePinClose}
        onSubmit={handlePinSubmit}
        mode={pinMode}
        error={pinError}
      />

            {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={() => {
          fetchScores()
        }}
      />
    </KioskLayout>
  )
}
```

## File: src/pages/ModeSelection.tsx
```tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KioskLayout } from '@/components/layout/KioskLayout'
import { BrowseHeader } from '@/components/layout/BrowseHeader'
import { ModeCard } from '@/components/cards/ModeCard'
import { NewPlayerModal } from '@/components/input'
import { useGameModes } from '@/hooks/useGameModes'
import { useGame } from '@/hooks/useGame'
import { usePlayers } from '@/hooks/usePlayers'
import { useIdleTimer } from '@/hooks/useIdleTimer'

/**
 * ModeSelection - List of game modes for a specific game
 * Route: /browse/:category/:gameId
 * 
 * Navigates to:
 * - DetailSelection if game.has_details is true
 * - LeaderboardView (with /all) if game.has_details is false
 */
export function ModeSelection() {
  const navigate = useNavigate()
  const { category, gameId } = useParams<{ category: string; gameId: string }>()
  const { modes, loading, error } = useGameModes(gameId || null)
  const { game: currentGame } = useGame(gameId || null)
  const { createPlayer } = usePlayers()
  const { isIdle, resetTimer } = useIdleTimer(30000)

  // New Player modal state
  const [showNewPlayerModal, setShowNewPlayerModal] = useState(false)
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false)

  // Return to idle display when idle
  useEffect(() => {
    if (isIdle) {
      navigate('/')
    }
  }, [isIdle, navigate])

  const handleModeClick = (modeId: string) => {
    resetTimer()
    
    // If game has details, go to detail selection
    // Otherwise, skip to leaderboard with "all" as detailId
    if (currentGame?.has_details) {
      navigate(`/browse/${category}/${gameId}/${modeId}`)
    } else {
      navigate(`/browse/${category}/${gameId}/${modeId}/all`)
    }
  }

  const handleBack = () => {
    navigate(`/browse/${category}`)
  }

  const handleAddScore = () => {
    resetTimer()
    navigate('/add-score')
  }

  const handleAddPlayer = () => {
    resetTimer()
    setShowNewPlayerModal(true)
  }

  const handleManage = () => {
    resetTimer()
    navigate('/manage')
  }

  const handleCreatePlayer = async (name: string) => {
    setIsCreatingPlayer(true)
    try {
      await createPlayer(name)
      setShowNewPlayerModal(false)
    } finally {
      setIsCreatingPlayer(false)
    }
  }

  // Get the label for modes from game config
  const modeLabel = currentGame?.mode_label || 'Mode'

  return (
    <KioskLayout>
      <div className="h-full min-h-[480px] flex flex-col">
        {/* Header with action sheet */}
        <BrowseHeader
          backLabel={currentGame?.name || 'Back'}
          onBack={handleBack}
          onAddScore={handleAddScore}
          onAddPlayer={handleAddPlayer}
          onManage={handleManage}
        />

        {/* Game title */}
        <div className="h-[48px] px-md flex items-center gap-3 flex-shrink-0">
          {currentGame?.icon_url && (
            <img
              src={currentGame.icon_url}
              alt=""
              className="w-6 h-6 rounded"
            />
          )}
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {currentGame?.name || 'Game'}
            </h2>
            <p className="text-sm text-text-secondary">
              Select {modeLabel.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Modes list */}
        <div className="flex-1 overflow-y-auto px-md py-2 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-text-secondary">Loading {modeLabel.toLowerCase()}s...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
              <p className="text-red-500 mb-2">Error loading {modeLabel.toLowerCase()}s</p>
              <p className="text-text-muted text-sm text-center">{error.message}</p>
            </div>
          ) : modes.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <p className="text-text-secondary">No {modeLabel.toLowerCase()}s for this game</p>
            </div>
          ) : (
            modes.map((mode, index) => (
              <ModeCard
                key={mode.id}
                mode={mode}
                onClick={() => handleModeClick(mode.id)}
                index={index}
              />
            ))
          )}
        </div>
      </div>

      {/* New Player Modal */}
      <NewPlayerModal
        isOpen={showNewPlayerModal}
        onClose={() => setShowNewPlayerModal(false)}
        onCreate={handleCreatePlayer}
        isCreating={isCreatingPlayer}
      />
    </KioskLayout>
  )
}
```

## File: src/pages/Settings.tsx
```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  Timer, 
  Sparkles,
  Monitor,
  Info,
  Users,
  ChevronRight,
  ShieldCheck,
  ShieldOff,
  Palette,
  RotateCcw,
  Check
} from 'lucide-react'
import { KioskLayout } from '@/components/layout'
import { PinModal } from '@/components/management'
import { useKioskStore } from '@/stores/kioskStore'
import { sounds } from '@/lib/sounds'
import { getThemeList, themes } from '@/lib/themes'

// Cycle speed options
const CYCLE_SPEEDS = [
  { value: 5000, label: '5 seconds' },
  { value: 10000, label: '10 seconds' },
  { value: 15000, label: '15 seconds' },
  { value: 30000, label: '30 seconds' },
]

// Celebration duration options
const CELEBRATION_DURATIONS = [
  { value: 3000, label: '3 seconds' },
  { value: 5000, label: '5 seconds' },
  { value: 7000, label: '7 seconds' },
]

// Preset color options for text customization
const TEXT_COLOR_PRESETS = [
  { value: null, label: 'Theme Default', color: null },
  { value: '#ffffff', label: 'White', color: '#ffffff' },
  { value: '#14fe17', label: 'Pip-Boy Green', color: '#14fe17' },
  { value: '#00f0ff', label: 'Cyan', color: '#00f0ff' },
  { value: '#ff00a0', label: 'Hot Pink', color: '#ff00a0' },
  { value: '#ffd700', label: 'Gold', color: '#ffd700' },
  { value: '#ff6b35', label: 'Orange', color: '#ff6b35' },
]

/**
 * Settings - Configuration panel for kiosk behavior
 * Route: /settings
 */
export function Settings() {
  const navigate = useNavigate()
  
  const soundEnabled = useKioskStore((state) => state.soundEnabled)
  const soundVolume = useKioskStore((state) => state.soundVolume)
  const cycleSpeedMs = useKioskStore((state) => state.cycleSpeedMs)
  const celebrationDurationMs = useKioskStore((state) => state.celebrationDurationMs)
  
  const setSoundEnabled = useKioskStore((state) => state.setSoundEnabled)
  const setSoundVolume = useKioskStore((state) => state.setSoundVolume)
  const setCycleSpeed = useKioskStore((state) => state.setCycleSpeed)
  const setCelebrationDuration = useKioskStore((state) => state.setCelebrationDuration)
  
  // Theme state
  const themeId = useKioskStore((state) => state.themeId)
  const textPrimaryOverride = useKioskStore((state) => state.textPrimaryOverride)
  const setTheme = useKioskStore((state) => state.setTheme)
  const setTextPrimaryOverride = useKioskStore((state) => state.setTextPrimaryOverride)
  const resetThemeCustomizations = useKioskStore((state) => state.resetThemeCustomizations)
  
  // PIN state
  const adminPin = useKioskStore((state) => state.adminPin)
  const setAdminPin = useKioskStore((state) => state.setAdminPin)
  const clearAdminPin = useKioskStore((state) => state.clearAdminPin)
  const verifyPin = useKioskStore((state) => state.verifyPin)
  
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinMode, setPinMode] = useState<'verify' | 'setup' | 'change'>('setup')
  const [pinError, setPinError] = useState<string | null>(null)
  const [pinAction, setPinAction] = useState<'change' | 'clear' | null>(null)

  const handleBack = () => {
    navigate('/')
  }

  const handleToggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    // Play a test sound when enabling
    if (newValue) {
      setTimeout(() => sounds.play('chime'), 100)
    }
  }

  const handleTestSound = () => {
    sounds.play('fanfare')
  }

  // PIN handlers
  const handleSetupPin = () => {
    setPinMode('setup')
    setPinAction(null)
    setPinError(null)
    setShowPinModal(true)
  }

  const handleChangePin = () => {
    setPinMode('verify')
    setPinAction('change')
    setPinError(null)
    setShowPinModal(true)
  }

  const handleClearPin = () => {
    setPinMode('verify')
    setPinAction('clear')
    setPinError(null)
    setShowPinModal(true)
  }

  const handlePinSubmit = (pin: string) => {
    if (pinMode === 'setup' || pinMode === 'change') {
      // Setting new PIN
      setAdminPin(pin)
      setShowPinModal(false)
      setPinError(null)
      setPinAction(null)
    } else if (pinMode === 'verify') {
      // Verifying existing PIN
      if (verifyPin(pin)) {
        if (pinAction === 'change') {
          // Show PIN setup after verification
          setPinMode('change')
          setPinError(null)
        } else if (pinAction === 'clear') {
          // Clear PIN after verification
          clearAdminPin()
          setShowPinModal(false)
          setPinAction(null)
        }
      } else {
        setPinError('Incorrect PIN')
      }
    }
  }

  const handlePinClose = () => {
    setShowPinModal(false)
    setPinError(null)
    setPinAction(null)
  }

  // Theme data
  const themeList = getThemeList()
  const hasCustomizations = textPrimaryOverride !== null

  return (
    <KioskLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-[56px] px-sm flex items-center border-b border-background-elevated/50">
          <button
            onClick={handleBack}
            className="min-h-[48px] px-sm flex items-center gap-1 text-text-secondary active:text-text-primary transition-colors rounded-lg active:bg-background-elevated"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-base">Back</span>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-text-primary pr-[80px]">
            Settings
          </h1>
        </div>

        {/* Settings content */}
        <div className="flex-1 overflow-y-auto px-md py-4 space-y-4">
          {/* Theme Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
              Theme
            </h2>
            <div className="card p-1 space-y-1">
              {/* Theme picker */}
              <div className="px-md py-3">
                <div className="flex items-center gap-3 mb-3">
                  <Palette className="w-5 h-5 text-category-pinball" />
                  <span className="text-base text-text-primary">Color Theme</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {themeList.map((theme) => {
                    const themeColors = themes[theme.id].colors
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`
                          h-[48px] rounded-lg text-sm font-medium transition-all relative overflow-hidden
                          ${themeId === theme.id
                            ? 'ring-2 ring-accent-primary ring-offset-2 ring-offset-background-primary'
                            : 'active:scale-95'
                          }
                        `}
                        style={{
                          backgroundColor: themeColors.bgCard,
                          color: themeColors.textPrimary,
                        }}
                      >
                        {/* Color preview strip */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-1"
                          style={{ backgroundColor: themeColors.accentPrimary }}
                        />
                        <span className="relative z-10">{theme.name}</span>
                        {themeId === theme.id && (
                          <Check className="absolute top-1 right-1 w-4 h-4" style={{ color: themeColors.accentPrimary }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Text color customization */}
              <div className="px-md py-3 border-t border-background-elevated/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-text-secondary">Text Color Override</span>
                  {hasCustomizations && (
                    <button
                      onClick={resetThemeCustomizations}
                      className="flex items-center gap-1 text-xs text-text-muted active:text-text-secondary"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {TEXT_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value || 'default'}
                      onClick={() => setTextPrimaryOverride(preset.value)}
                      className={`
                        h-[36px] px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-2
                        ${textPrimaryOverride === preset.value
                          ? 'ring-2 ring-accent-primary'
                          : 'bg-background-elevated active:scale-95'
                        }
                      `}
                      style={preset.color ? { 
                        backgroundColor: `${preset.color}20`,
                        color: preset.color 
                      } : undefined}
                    >
                      {preset.color && (
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.color }}
                        />
                      )}
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sound Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
              Sound
            </h2>
            <div className="card p-1 space-y-1">
              {/* Sound toggle */}
              <button
                onClick={handleToggleSound}
                className="w-full h-[56px] px-md flex items-center justify-between rounded-lg active:bg-background-elevated transition-colors"
              >
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-category-golf" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-text-muted" />
                  )}
                  <span className="text-base text-text-primary">Sound Effects</span>
                </div>
                <div className={`
                  w-12 h-7 rounded-full transition-colors relative
                  ${soundEnabled ? 'bg-category-golf' : 'bg-background-elevated'}
                `}>
                  <div className={`
                    absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform
                    ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `} />
                </div>
              </button>

              {/* Volume slider */}
              {soundEnabled && (
                <div className="px-md py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Volume</span>
                    <span className="text-sm text-text-muted">{Math.round(soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume * 100}
                    onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
                    className="w-full h-2 bg-background-elevated rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-category-golf
                      [&::-webkit-slider-thumb]:shadow-md
                      [&::-webkit-slider-thumb]:cursor-pointer
                    "
                  />
                </div>
              )}

              {/* Test sound button */}
              {soundEnabled && (
                <button
                  onClick={handleTestSound}
                  className="w-full h-[48px] px-md flex items-center gap-3 rounded-lg active:bg-background-elevated transition-colors"
                >
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="text-base text-text-primary">Test Fanfare</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Display Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
              Display
            </h2>
            <div className="card p-1 space-y-1">
              {/* Cycle speed */}
              <div className="px-md py-3">
                <div className="flex items-center gap-3 mb-3">
                  <Timer className="w-5 h-5 text-category-darts" />
                  <span className="text-base text-text-primary">Carousel Speed</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {CYCLE_SPEEDS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCycleSpeed(option.value)}
                      className={`
                        h-[40px] rounded-lg text-sm font-medium transition-all
                        ${cycleSpeedMs === option.value
                          ? 'bg-category-darts text-white'
                          : 'bg-background-elevated text-text-secondary active:bg-background-primary'
                        }
                      `}
                    >
                      {option.label.replace(' seconds', 's')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Celebration duration */}
              <div className="px-md py-3 border-t border-background-elevated/50">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="text-base text-text-primary">Celebration Duration</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {CELEBRATION_DURATIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCelebrationDuration(option.value)}
                      className={`
                        h-[40px] rounded-lg text-sm font-medium transition-all
                        ${celebrationDurationMs === option.value
                          ? 'bg-yellow-500 text-black'
                          : 'bg-background-elevated text-text-secondary active:bg-background-primary'
                        }
                      `}
                    >
                      {option.label.replace(' seconds', 's')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
              Security
            </h2>
            <div className="card p-1">
              {adminPin === null ? (
                <button
                  onClick={handleSetupPin}
                  className="w-full h-[56px] px-md flex items-center justify-between rounded-lg active:bg-background-elevated transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShieldOff className="w-5 h-5 text-text-muted" />
                    <div>
                      <span className="text-base text-text-primary">Set Up PIN</span>
                      <p className="text-xs text-text-muted">Protect delete actions</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted" />
                </button>
              ) : (
                <>
                  <div className="h-[56px] px-md flex items-center gap-3 border-b border-background-elevated/30">
                    <ShieldCheck className="w-5 h-5 text-category-golf" />
                    <div>
                      <span className="text-base text-text-primary">PIN Protected</span>
                      <p className="text-xs text-text-muted">Delete actions require PIN</p>
                    </div>
                  </div>
                  <div className="flex">
                    <button
                      onClick={handleChangePin}
                      className="flex-1 h-[48px] text-sm text-category-darts font-medium active:bg-background-elevated transition-colors"
                    >
                      Change PIN
                    </button>
                    <div className="w-px bg-background-elevated/30" />
                    <button
                      onClick={handleClearPin}
                      className="flex-1 h-[48px] text-sm text-red-500 font-medium active:bg-background-elevated transition-colors"
                    >
                      Remove PIN
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Management Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
              Management
            </h2>
            <div className="card p-1">
              <button
                onClick={() => navigate('/manage')}
                className="w-full h-[56px] px-md flex items-center justify-between rounded-lg active:bg-background-elevated transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-category-golf" />
                  <span className="text-base text-text-primary">Manage Players, Games & Scores</span>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </button>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2 px-1">
              About
            </h2>
            <div className="card px-md py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-category-racing to-category-darts flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">Game Room Scoreboard</p>
                  <p className="text-sm text-text-muted">Version 1.0.0</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-background-elevated/50">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-text-muted">
                    Tap the carousel to browse games, or use the "+ Add" button to submit scores.
                    Settings are automatically saved.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={handlePinClose}
        onSubmit={handlePinSubmit}
        mode={pinMode}
        error={pinError}
      />
    </KioskLayout>
  )
}
```

## File: src/stores/kioskStore.ts
```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Game, GameMode, Player, GameCategory } from '@/lib/types'
import { sounds } from '@/lib/sounds'

// Settings that persist to localStorage
interface PersistedSettings {
  soundEnabled: boolean
  soundVolume: number
  cycleSpeedMs: number
  celebrationDurationMs: number
  adminPin: string | null
  // Theme settings
  themeId: string
  textPrimaryOverride: string | null
  accentPrimaryOverride: string | null
}

// UI state for the kiosk application
interface KioskState extends PersistedSettings {
  // UI State
  isIdleMode: boolean
  idleTimer: number | null

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
  setSoundVolume: (volume: number) => void
  setCycleSpeed: (ms: number) => void
  setCelebrationDuration: (ms: number) => void

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

  // Admin PIN
  setAdminPin: (pin: string) => void
  clearAdminPin: () => void
  verifyPin: (pin: string) => boolean
  isPinSet: () => boolean

  // Theme actions
  setTheme: (themeId: string) => void
  setTextPrimaryOverride: (color: string | null) => void
  setAccentPrimaryOverride: (color: string | null) => void
  resetThemeCustomizations: () => void
}

export const useKioskStore = create<KioskState>()(
  persist(
    (set, get) => ({
      // Initial state - persisted settings
      soundEnabled: true,
      soundVolume: 0.7,
      cycleSpeedMs: 10000,
      celebrationDurationMs: 5000,
      adminPin: null,
      
      // Theme defaults
      themeId: 'dark',
      textPrimaryOverride: null,
      accentPrimaryOverride: null,

      // Non-persisted state
      isIdleMode: true,
      idleTimer: null,

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
      
      setSoundEnabled: (enabled) => {
        sounds.setEnabled(enabled)
        set({ soundEnabled: enabled })
      },
      
      setSoundVolume: (volume) => {
        sounds.setVolume(volume)
        set({ soundVolume: volume })
      },
      
      setCycleSpeed: (ms) => set({ cycleSpeedMs: ms }),
      setCelebrationDuration: (ms) => set({ celebrationDurationMs: ms }),

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

      // Admin PIN actions
      setAdminPin: (pin) => set({ adminPin: pin }),
      clearAdminPin: () => set({ adminPin: null }),
      verifyPin: (pin): boolean => {
        return get().adminPin === pin
      },
      isPinSet: (): boolean => {
        return get().adminPin !== null
      },

      // Theme actions
      setTheme: (themeId) => set({ themeId }),
      setTextPrimaryOverride: (color) => set({ textPrimaryOverride: color }),
      setAccentPrimaryOverride: (color) => set({ accentPrimaryOverride: color }),
      resetThemeCustomizations: () => set({ 
        textPrimaryOverride: null, 
        accentPrimaryOverride: null 
      }),
    }),
    {
      name: 'kiosk-settings',
      // Only persist these specific fields
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        cycleSpeedMs: state.cycleSpeedMs,
        celebrationDurationMs: state.celebrationDurationMs,
        adminPin: state.adminPin,
        themeId: state.themeId,
        textPrimaryOverride: state.textPrimaryOverride,
        accentPrimaryOverride: state.accentPrimaryOverride,
      }),
      // Sync sound manager on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          sounds.setEnabled(state.soundEnabled)
          sounds.setVolume(state.soundVolume)
        }
      },
    }
  )
)
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

