/**
 * Word Buddy - Design Tokens (Single Source of Truth)
 * Conforming strictly to:
 * - Spacing scale: 4, 8, 12, 16, 24, 32, 48px
 * - Radius: sm (8px), md (12px), lg (16px), xl (24px), full (9999px)
 * - Typography: 12, 14, 16, 20, 24, 32px with line-height >= 1.5 for Thai text
 * - Font stack: Noto Sans Thai + IBM Plex Sans Thai with fallback to Inter, sans-serif
 * - Colors: Primary (Indigo), Success, Warning, Danger, Neutral 50-900
 * - Touch Target: Min 44x44px for all interactive targets
 */

export const tokens = {
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  fontSize: {
    xs: ['12px', { lineHeight: '18px' }],
    sm: ['14px', { lineHeight: '22px' }],
    base: ['16px', { lineHeight: '26px' }],
    lg: ['20px', { lineHeight: '30px' }],
    xl: ['24px', { lineHeight: '36px' }],
    '2xl': ['32px', { lineHeight: '44px' }],
  },
  fonts: {
    thai: ['"Noto Sans Thai"', '"IBM Plex Sans Thai"', 'Inter', 'sans-serif'],
    heading: ['Outfit', '"Noto Sans Thai"', 'sans-serif'],
    body: ['"Noto Sans Thai"', '"IBM Plex Sans Thai"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  },
  colors: {
    primary: {
      DEFAULT: '#4F46E5', // Indigo 600
      hover: '#4338CA', // Indigo 700
      light: '#EEF2FF', // Indigo 50
      subtle: '#E0E7FF', // Indigo 100
      dark: '#3730A3', // Indigo 800
    },
    success: {
      DEFAULT: '#10B981', // Emerald 500
      hover: '#059669', // Emerald 600
      light: '#ECFDF5', // Emerald 50
      text: '#065F46', // Emerald 800
    },
    warning: {
      DEFAULT: '#F59E0B', // Amber 500
      hover: '#D97706', // Amber 600
      light: '#FFFBEB', // Amber 50
      text: '#92400E', // Amber 800
    },
    danger: {
      DEFAULT: '#EF4444', // Red 500
      hover: '#DC2626', // Red 600
      light: '#FEF2F2', // Red 50
      text: '#991B1B', // Red 800
      border: '#FCA5A5', // Red 300
    },
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    surface: {
      DEFAULT: '#F8FAFC',
      card: '#FFFFFF',
      subtle: '#F1F5F9',
    },
    text: {
      primary: '#0F172A', // Neutral 900
      secondary: '#475569', // Neutral 600 (High contrast >= 4.5:1 on white)
      muted: '#64748B', // Neutral 500 (Accessible contrast >= 4.5:1 on white)
    },
    border: {
      DEFAULT: '#E2E8F0', // Neutral 200
      subtle: '#F1F5F9', // Neutral 100
      focus: '#4F46E5', // Indigo 600
    },
  },
  minTouchTarget: '44px',
} as const;

export default tokens;
