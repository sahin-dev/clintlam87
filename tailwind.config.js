export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      /**
       * Four weights, one meaning each. The scale is deliberately retuned so
       * the product never renders heavier than it needs to:
       *   400 regular   — body copy and supporting text
       *   500 medium    — secondary headings and prominent UI text
       *   600 semibold  — subheadings, labels and emphasis
       *   700 bold      — page/display headings and headline figures only
       * Nothing above 700 exists, so no surface can drift into black weight.
       */
      fontWeight: {
        thin: '400',
        extralight: '400',
        light: '400',
        normal: '400',
        medium: '500',
        semibold: '500',
        bold: '600',
        extrabold: '700',
        black: '700',
      },
      colors: {
        brand: {
          50: '#FFF4ED',
          100: '#FFE6D5',
          200: '#FFC9AA',
          300: '#FFA474',
          400: '#FF7A3C',
          500: '#F96317',
          600: '#E04E08',
          700: '#B93B0B',
          800: '#93300F',
          900: '#762A10',
        },
        ink: {
          50: '#F4F6F9',
          100: '#E9ECF1',
          200: '#D6DAE1',
          300: '#AEB4BE',
          400: '#838A96',
          500: '#5A616D',
          600: '#3A4049',
          700: '#22262E',
          800: '#16191F',
          900: '#0E1014',
        },
        canvas: '#F6F7F9',
        paper: '#FFFFFF',
        positive: { 50: '#ECFDF3', 100: '#D1FADF', 500: '#12A150', 600: '#0E8A44', 700: '#0A6C36' },
        info: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#2563EB', 600: '#1D4ED8', 700: '#1E40AF' },
        caution: { 50: '#FFFBEB', 100: '#FEF3C7', 500: '#D97706', 600: '#B45309', 700: '#92400E' },
        danger: { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#DC2626', 600: '#B91C1C', 700: '#991B1B' },
        violet: { 50: '#F5F3FF', 100: '#EDE9FE', 500: '#7C3AED', 600: '#6D28D9' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,16,20,0.04), 0 1px 3px rgba(14,16,20,0.06)',
        raised: '0 4px 12px rgba(14,16,20,0.08), 0 1px 2px rgba(14,16,20,0.04)',
        sheet: '0 -8px 32px rgba(14,16,20,0.18)',
        nav: '0 -1px 0 rgba(14,16,20,0.06)',
      },
      /**
       * SM Pro geometry. Construction documents are square-shouldered, so the
       * whole product is retuned to a tight, technical radius scale rather
       * than the soft SaaS-default curves. `rounded-full` is left alone for
       * avatars, spinners and status dots.
       */
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '3px',
        lg: '3px',
        xl: '4px',
        '2xl': '4px',
        '3xl': '6px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      maxWidth: {
        app: '460px',
      },
    },
  },
}
