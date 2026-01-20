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