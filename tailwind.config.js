/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ['selector', '[data-theme="cosmic"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        panel: token('panel'),
        'panel-2': token('panel-2'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        accent: token('accent'),
        'accent-soft': token('accent-soft'),
        'accent-ink': token('accent-ink'),
        gold: token('gold'),
        'gold-soft': token('gold-soft'),
        ok: token('ok'),
        danger: token('danger'),
      },
      fontFamily: {
        display: ['Fraunces', '"Noto Serif Devanagari"', 'Georgia', 'serif'],
        body: ['Manrope', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        deva: ['"Noto Serif Devanagari"', 'Fraunces', 'serif'],
      },
      borderRadius: {
        xl: '10px',
        '2xl': '12px',
        '3xl': '16px',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--shadow) / 0.06), 0 8px 24px -12px rgb(var(--shadow) / 0.18)',
        lift: '0 1px 2px rgb(var(--shadow) / 0.06), 0 8px 20px -12px rgb(var(--shadow) / 0.22)',
      },
      maxWidth: {
        thread: '46rem',
      },
    },
  },
  plugins: [],
};
