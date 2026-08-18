/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          light: '#EEF0FF',
          hover: '#5A52E0',
          dark: '#4B44B8',
        },
        secondary: {
          DEFAULT: '#FF6B6B',
          light: '#FFF0F0',
          hover: '#E85B5B',
        },
        accent: {
          yellow: '#FFD166',
          'yellow-light': '#FFF9E6',
          green: '#06D6A0',
          'green-light': '#E8FFF3',
          emerald: '#059669',
        },
        surface: {
          DEFAULT: '#F8F9FF',
          subtle: '#F0F2FF',
        },
        card: '#FFFFFF',
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          subtle: '#EEF0F2',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sarabun: ['Sarabun', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'input': '10px',
        'pill': '999px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(108, 99, 255, 0.08)',
        'card-hover': '0 8px 30px rgba(108, 99, 255, 0.15)',
        'modal': '0 8px 40px rgba(0, 0, 0, 0.16)',
        'primary-btn': '0 4px 14px rgba(108, 99, 255, 0.35)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
