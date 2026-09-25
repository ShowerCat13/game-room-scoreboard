/**
 * Theme System for Game Room Scoreboard
 * 
 * 7 preset themes + customization options
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
    spooky?: boolean  // Drifting fog, floating ghosts, Boo celebration
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

  spooky: {
    id: 'spooky',
    name: 'Spooky',
    description: 'Haunted purples and ghostly green',
    colors: {
      bgPrimary: '#0b0714',
      bgCard: '#160e26',
      bgElevated: '#241839',
      textPrimary: '#f1ecff',
      textSecondary: '#bba9e0',
      textMuted: '#7d6c9e',
      accentPrimary: '#7dff9b',
      accentSecondary: '#ff8a1f',
      categoryRacing: '#ff8a1f',
      categoryGolf: '#7dff9b',
      categoryParty: '#ffb81f',
      categoryDarts: '#9b6bff',
      categoryPinball: '#c77dff',
      categoryPlatformer: '#ff5e8a',
      categoryRpg: '#5ee7ff',
      categoryOther: '#7d6c9e',
      medalGold: '#ffb81f',
      medalSilver: '#d6dcff',
      medalBronze: '#ff7a1a',
    },
    effects: {
      glow: true,
      spooky: true,
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
  root.classList.remove('theme-scanlines', 'theme-glow', 'theme-noise', 'theme-spooky')
  if (effects?.scanlines) root.classList.add('theme-scanlines')
  if (effects?.glow) root.classList.add('theme-glow')
  if (effects?.noise) root.classList.add('theme-noise')
  if (effects?.spooky) root.classList.add('theme-spooky')
  
  // Set theme ID for CSS targeting
  root.setAttribute('data-theme', theme.id)
}

/**
 * Get list of all available themes for UI
 */
export function getThemeList(): { id: string; name: string; description: string }[] {
  return Object.values(themes).map(({ id, name, description }) => ({ id, name, description }))
}