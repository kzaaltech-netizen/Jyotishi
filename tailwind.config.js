/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="cosmic"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--surface)',
          dim: 'var(--surface-dim)',
          bright: 'var(--surface-bright)',
          lowest: 'var(--surface-container-lowest)',
          low: 'var(--surface-container-low)',
          container: 'var(--surface-container)',
          high: 'var(--surface-container-high)',
          highest: 'var(--surface-container-highest)',
          variant: 'var(--surface-variant)',
        },
        'on-surface': {
          DEFAULT: 'var(--on-surface)',
          variant: 'var(--on-surface-variant)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          dim: 'var(--primary-dim)',
          container: 'var(--primary-container)',
          fixed: 'var(--primary-fixed)',
          'fixed-dim': 'var(--primary-fixed-dim)',
          'on-fixed': 'var(--on-primary)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          dim: 'var(--secondary-dim)',
          container: 'var(--secondary-container)',
          fixed: 'var(--secondary-fixed)',
          'fixed-dim': 'var(--secondary-fixed-dim)',
        },
        tertiary: {
          DEFAULT: 'var(--tertiary)',
          container: 'var(--tertiary-container)',
          fixed: 'var(--tertiary-fixed)',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#fde68a',
          dark: '#92400e',
        },
        saffron: {
          DEFAULT: '#e67e22',
          light: '#fef3c7',
        },
        hairline: {
          DEFAULT: 'var(--hairline)',
          muted: 'var(--hairline-muted)',
        },
        outline: {
          DEFAULT: 'var(--outline)',
          variant: 'var(--outline-variant)',
        }
      },
      fontFamily: {
        headline: ['"Source Serif 4"', '"Noto Serif Devanagari"', 'Georgia', 'serif'],
        display: ['"Source Serif 4"', '"Noto Serif Devanagari"', 'Georgia', 'serif'],
        body: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        devanagari: ['"Noto Serif Devanagari"', '"Source Serif 4"', 'serif'],
      },
      boxShadow: {
        'parchment-sm': '0 2px 8px -2px rgba(44, 24, 16, 0.06)',
        'parchment-md': '0 6px 20px -4px rgba(44, 24, 16, 0.10)',
        'parchment-lg': '0 12px 32px -6px rgba(44, 24, 16, 0.14)',
        'royal-glow': '0 0 24px rgba(127, 48, 30, 0.20)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.25)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
      }
    },
  },
  plugins: [],
}
