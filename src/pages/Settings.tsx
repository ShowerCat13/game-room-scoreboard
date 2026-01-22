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
                  <p className="text-sm text-text-muted">Version 0.9.9</p>
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