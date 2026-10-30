/**
 * Tokens tomados de doc/vistas/css/base.css, para que portar las vistas del
 * prototipo sea una traducción directa de clases.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#0D6B68',
        'accent-dark': '#0A4F4D',
        'accent-soft': '#E3EFEE',
        // Acento claro de la landing, para destacar sobre los verdes oscuros.
        'accent-bright': '#7FD8C4',

        sidebar: '#0F2A2A',
        'sidebar-soft': '#163A39',
        'sidebar-ink': '#B9CFCC',
        'sidebar-muted': '#8FADA9',
        'sidebar-line': 'rgba(255, 255, 255, .12)',

        ground: '#F4F6F6',
        surface: '#FFFFFF',
        'surface-alt': '#F7F9F9',
        'surface-muted': '#EDF1F0',

        ink: '#1F2D33',
        'ink-strong': '#33424A',
        'ink-soft': '#5A6672',
        'ink-muted': '#8A959B',

        border: '#DFE5E4',
        'border-strong': '#C4CFCE',
        line: '#E0E6E5',

        booked: '#1D4ED8',
        'booked-bg': '#EEF2FD',
        confirmed: '#15803D',
        'confirmed-bg': '#E9F5EC',
        attended: '#4A5A62',
        'attended-bg': '#EDF1F0',
        'no-show': '#B54708',
        'no-show-bg': '#FDF1E7',
        cancelled: '#B42318',
        'cancelled-bg': '#FCEBEA',

        danger: '#B42318',
        'danger-bg': '#FCEBEA',
        warning: '#B54708',
        'warning-bg': '#FBF3EC',
        success: '#15803D',
        'success-bg': '#E9F5EC',
        info: '#1D4ED8',
        'info-bg': '#F1F5FD',
      },
      fontFamily: {
        condensed: [
          '"IBM Plex Sans Condensed"',
          '"IBM Plex Sans"',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          '"IBM Plex Sans"',
          '"Segoe UI"',
          'system-ui',
          '-apple-system',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
        mono: ['"IBM Plex Mono"', '"Cascadia Mono"', 'Consolas', 'monospace'],
      },
      maxWidth: {
        shell: '1328px',
      },
      spacing: {
        sidebar: '236px',
      },
      animation: {
        ticker: 'ticker 38s linear infinite',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'rise-in': 'rise-in 300ms cubic-bezier(0.23, 1, 0.32, 1) backwards',
      },
      keyframes: {
        ticker: {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
        },
      },
    },
  },
  plugins: [],
};
