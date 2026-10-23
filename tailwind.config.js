/** @type {import('tailwindcss').Config} */

// Every colour is a CSS variable holding "R G B" channels (see src/index.css), so Tailwind's
// opacity modifiers work (e.g. bg-fg/5) and the light/dark themes swap in one place.
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: c('bg'),
        surface: c('surface'),
        subtle: c('subtle'),
        line: c('line'),
        'line-strong': c('line-strong'),
        fg: c('fg'),
        muted: c('muted'),
        faint: c('faint'),
        ink: c('ink'),
        'ink-fg': c('ink-fg'),
        on: c('on'),
        'on-fg': c('on-fg'),
        pop: c('pop'),
        'pop-fg': c('pop-fg'),
        band: c('band'),
        'band-fg': c('band-fg'),
        good: c('good'),
        danger: c('danger'),
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        soft: 'var(--shadow-sm)',
        lift: 'var(--shadow-md)',
        float: 'var(--shadow-lg)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        page: '1240px',
      },
    },
  },
  plugins: [],
};
