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
          DEFAULT: '#4F46E5', // Indigo
          light: '#EEF2FF',
          hover: '#4338CA',
          dark: '#3730A3',
        },
        secondary: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
          hover: '#DC2626',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
          hover: '#059669',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
          hover: '#D97706',
          dark: '#B45309',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
          hover: '#DC2626',
          dark: '#B91C1C',
        },
        accent: {
          yellow: '#F59E0B',
          'yellow-light': '#FFFBEB',
          green: '#10B981',
          'green-light': '#ECFDF5',
          emerald: '#059669',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          subtle: '#F1F5F9',
        },
        card: '#FFFFFF',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#F1F5F9',
        },
      },
      fontFamily: {
        outfit: ['Outfit', '"Noto Sans Thai"', 'sans-serif'],
        inter: ['Inter', '"Noto Sans Thai"', 'sans-serif'],
        thai: ['"Noto Sans Thai"', '"IBM Plex Sans Thai"', 'Inter', 'sans-serif'],
        sarabun: ['"Noto Sans Thai"', '"IBM Plex Sans Thai"', 'Sarabun', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
        'card': '16px',
        'btn': '12px',
        'input': '12px',
        'pill': '9999px',
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
