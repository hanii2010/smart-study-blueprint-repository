/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070514',
          900: '#0c0a1f',
          800: '#131031',
          700: '#1c1842',
          600: '#27215a',
        },
        neon: {
          purple: '#a855f7',
          violet: '#8b5cf6',
          cyan: '#22d3ee',
          magenta: '#ec4899',
          lime: '#a3e635',
        },
        lavender: {
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
        },
      },
      boxShadow: {
        'neon-purple': '0 0 0 1px rgba(168,85,247,0.5), 0 0 20px rgba(168,85,247,0.35)',
        'neon-cyan': '0 0 0 1px rgba(34,211,238,0.5), 0 0 20px rgba(34,211,238,0.35)',
        'neon-magenta': '0 0 0 1px rgba(236,72,153,0.5), 0 0 20px rgba(236,72,153,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        celebrate: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(10deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        pop: 'pop 0.3s ease-out',
        celebrate: 'celebrate 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
