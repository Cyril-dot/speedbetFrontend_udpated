/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand red
        brand: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',  // primary
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // Lemon green accent
        accent: {
          50:  '#F7FFE7',
          100: '#EEFFCC',
          200: '#E6FFB3',
          300: '#DDFF99',
          400: '#CCFF00',  // primary
          500: '#B8E600',
          600: '#99CC00',
          700: '#7AB300',
          800: '#5C9900',
          900: '#3D7F00',
        },
        // Legacy aliases mapped onto the new palette
        black: {
          950: '#FFFFFF',
          900: '#FAFAFA',
          800: '#F5F5F5',
          700: '#E5E5E5',
        },
        crimson: {
          400: '#DC2626',
          500: '#B91C1C',
          700: '#991B1B',
        },
        electric: {
          400: '#CCFF00',
          600: '#B8E600',
        },
        white: {
          100: '#000000',
          80:  '#1F2937',
          60:  '#4B5563',
          40:  '#6B7280',
        },
        emerald: { 500: '#CCFF00' },
        red: { 600: '#DC2626' },
        amber: { 400: '#F59E0B' },
      },
      fontFamily: {
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
        body: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"Outfit"', 'system-ui', 'sans-serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wider: '0.1em',
        widest: '0.2em',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-lift': '0 8px 24px rgba(0, 0, 0, 0.10)',
        'brand-glow': '0 8px 24px rgba(220, 38, 38, 0.25)',
        'crimson-glow': '0 8px 24px rgba(220, 38, 38, 0.25)',
        'electric-glow': '0 8px 24px rgba(204, 255, 0, 0.20)',
      },
    },
  },
  plugins: [],
};
