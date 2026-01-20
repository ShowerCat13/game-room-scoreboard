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
        kiosk: '800px',
      },
    },
  },
  plugins: [],
}