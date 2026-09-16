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
          DEFAULT: '#fff8f5',
          dim: '#e7d7cc',
          bright: '#fff8f5',
          lowest: '#ffffff',
          low: '#fff1e7',
          container: '#fbebdf',
          high: '#f5e5da',
          highest: '#efe0d4',
          variant: '#efe0d4',
        },
        'on-surface': {
          DEFAULT: '#221a13',
          variant: '#55423e',
        },
        primary: {
          DEFAULT: '#7f301e', // Blood royal red / deep terracotta
          dim: '#9e4733',
          container: '#9e4733',
          fixed: '#ffdad2',
          'fixed-dim': '#ffb4a3',
          'on-fixed': '#3d0600',
        },
        secondary: {
          DEFAULT: '#7a580a', // Antique gold
          dim: '#a88133',
          container: '#fcce77',
          fixed: '#ffdea6',
          'fixed-dim': '#edc06b',
        },
        tertiary: {
          DEFAULT: '#7c3132', // Deep vermilion / maroon
          container: '#9a4848',
          fixed: '#ffdad8',
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
          DEFAULT: '#e2d5c5',
          muted: '#f0e5d5',
        },
        outline: {
          DEFAULT: '#88726d',
          variant: '#dbc1bb',
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
