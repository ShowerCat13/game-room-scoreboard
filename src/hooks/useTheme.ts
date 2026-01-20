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