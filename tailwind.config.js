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
